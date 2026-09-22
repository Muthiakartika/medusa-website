/**
 * Delivering an enquiry as email, through SendGrid's v3 API.
 *
 * Every enquiry form on the site ends up here. The business reads them in the
 * inbox the site already publishes — `CONTACT.email`, which is
 * info@medusaautodetailing.co.uk — so that is the default recipient and
 * nothing has to be configured for the address to be right.
 *
 * Raw `fetch` against the REST endpoint rather than `@sendgrid/mail`: this is
 * one POST with a JSON body, the SDK is 1.3 MB of dependency to build that
 * body, and `lib/cloudflare.ts` already talks to an HTTP API the same way.
 *
 *   SENDGRID_API_KEY  a key with one permission, Mail Send · Full Access
 *   MAIL_TO           who receives an enquiry (default: CONTACT.email)
 *   MAIL_CC           copied in, comma-separated (empty by default)
 *   MAIL_FROM         the envelope sender (default: CONTACT.email)
 *   MAIL_FROM_NAME    its display name (default: the business name)
 *
 * With the key unset this is a no-op that says so rather than a failure, the
 * same contract `purgeCloudflare` has — a local build and a preview
 * deployment both have to work without production credentials. `app/actions.ts`
 * decides what an undelivered enquiry means, and in production it means an
 * error shown to the visitor rather than a thank-you.
 *
 * **`MAIL_FROM` has to be a sender SendGrid has verified** — a Single Sender,
 * or any address on an authenticated domain. It is deliberately not the
 * visitor's address: sending as somebody else's domain is what DMARC exists to
 * stop, and the mail would be rejected or filed as spam. The visitor's address
 * goes in `reply_to` instead, so hitting Reply in the inbox answers them.
 *
 * On an account with EU data residency the host is api.eu.sendgrid.com and the
 * global endpoint below answers 401; that is the one line to change.
 */

import { BUSINESS, CONTACT, FOOTER, SITE } from "@/lib/site";

const ENDPOINT = "https://api.sendgrid.com/v3/mail/send";

/**
 * SendGrid accepts 30 MB of attachments, Vercel's function request body caps
 * at 4.5 MB, and `serverActions.bodySizeLimit` in `next.config.ts` is set to
 * 4 MB beneath that. So this is never the binding limit — it is the backstop
 * that keeps a base64 body (a third larger than the file) from being built at
 * all if the other two ever move.
 */
const ATTACHMENT_BUDGET = 4 * 1024 * 1024;

export type Attachment = {
  filename: string;
  /** MIME type, as the browser reported it. */
  type: string;
  content: ArrayBuffer;
};

export type Enquiry = {
  /** The CF7 form's own id, as `pages.json` records it. */
  form: string;
  /** Site-absolute path of the page it was submitted from. */
  page: string;
  submittedAt: Date;
  /** Cleaned field label -> what was typed, in the form's own order. */
  fields: Record<string, string>;
  /** The visitor, for `reply_to`. Absent if the form has no email field. */
  from?: { email: string; name?: string };
  attachments?: Attachment[];
};

export type MailResult =
  | { status: "skipped"; reason: string }
  | { status: "sent"; to: string[]; cc: string[] }
  | { status: "failed"; error: string };

export async function sendEnquiry(enquiry: Enquiry): Promise<MailResult> {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return { status: "skipped", reason: "SENDGRID_API_KEY not set" };

  const to = addresses(process.env.MAIL_TO, [CONTACT.email]);
  if (!to.length) return { status: "skipped", reason: "MAIL_TO is empty" };

  /* SendGrid rejects the whole message with a 400 if one address appears
     twice across to/cc/bcc, so a MAIL_CC that repeats a recipient is dropped
     rather than allowed to fail the send. */
  const seen = new Set(to.map((a) => a.toLowerCase()));
  const cc = addresses(process.env.MAIL_CC).filter((a) => {
    const at = a.toLowerCase();
    if (seen.has(at)) return false;
    seen.add(at);
    return true;
  });

  const body = {
    personalizations: [
      { to: to.map(named), ...(cc.length ? { cc: cc.map(named) } : {}) },
    ],
    from: {
      email: process.env.MAIL_FROM || CONTACT.email,
      name: process.env.MAIL_FROM_NAME || BUSINESS.name,
    },
    ...(enquiry.from
      ? { reply_to: { email: enquiry.from.email, ...(enquiry.from.name ? { name: enquiry.from.name } : {}) } }
      : {}),
    subject: subjectFor(enquiry),
    content: [
      { type: "text/plain", value: textBody(enquiry) },
      { type: "text/html", value: htmlBody(enquiry) },
    ],
    ...attachmentsFor(enquiry),
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    /* A queued message is 202 and has no body; anything else carries a JSON
       `errors` array that is the only useful thing in the server log. */
    if (response.status !== 202) {
      const detail = (await response.json().catch(() => null)) as {
        errors?: { message?: string; field?: string | null }[];
      } | null;
      return {
        status: "failed",
        error:
          detail?.errors
            ?.map((e) => [e.field, e.message].filter(Boolean).join(": "))
            .filter(Boolean)
            .join("; ") || `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return { status: "failed", error: String(error) };
  }

  return { status: "sent", to, cc };
}

/* ── Recipients ───────────────────────────────────────────────────────── */

/** A comma-separated env var as a list, with the blanks and duplicates gone. */
function addresses(value: string | undefined, fallback: string[] = []): string[] {
  const list = (value ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  if (!list.length) return fallback;
  return [...new Map(list.map((a) => [a.toLowerCase(), a])).values()];
}

const named = (email: string) => ({ email });

/* ── The message ──────────────────────────────────────────────────────── */

/**
 * Whoever opens the inbox is triaging, so the subject carries the two things
 * that decide what to do with it: who wrote, and which page they were on.
 *
 * Newlines are stripped because a header cannot hold one — a name field is
 * free text and this is the only place it reaches a header.
 */
function subjectFor(enquiry: Enquiry): string {
  const who = enquiry.from?.name?.trim();
  const where = enquiry.page;
  return oneLine(who ? `Website enquiry from ${who} — ${where}` : `Website enquiry — ${where}`);
}

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 180);

/** "22 September 2026 at 14:03" — the business is in London, so it reads in London. */
const stamp = (at: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "long",
    timeStyle: "short",
  }).format(at);

function textBody(enquiry: Enquiry): string {
  const lines = [
    `Page:     ${SITE}${enquiry.page}`,
    `Form:     ${enquiry.form}`,
    `Received: ${stamp(enquiry.submittedAt)}`,
    "",
  ];
  for (const [label, value] of Object.entries(enquiry.fields)) {
    lines.push(`${label}`, ...value.split("\n").map((l) => `  ${l}`), "");
  }
  return lines.join("\n");
}

/* ── The HTML half ────────────────────────────────────────────────────── */

/**
 * The site's own palette, since this is the business reading its own post.
 * Same values as `globals.css`, written out because an email cannot reach a
 * stylesheet — every rule here has to be inline on the element it styles.
 */
const INK = "#0d0d0d";
const GOLD = "#c19231";
const GOLD_BRIGHT = "#edb326";
const PAGE = "#f4f4f5";
const TEXT = "#141414";
const MUTED = "#6f6f6f";
const HAIRLINE = "#e6e6e6";

/** Arial and Helvetica, because a mail client will not load a web font. */
const FONT = "Helvetica,Arial,sans-serif";

/**
 * The logo is `FOOTER.logo`, not the header's — the header's is a `.webp`,
 * which Outlook renders as a broken image, and this one is the same mark as a
 * PNG. It is white and gold on transparency, so it is only legible on the ink
 * band it sits in; with images blocked, the `alt` text stands in as a gold
 * wordmark rather than as a grey box.
 */
const LOGO = `${SITE}${FOOTER.logo}`;

/**
 * Table layout and inline styles throughout, which is what survives Gmail,
 * Outlook and Apple Mail. Two structural choices worth knowing:
 *
 * - **Each field stacks its label over its value** rather than sitting in a
 *   label column. A two-column table needs `white-space:nowrap` on the label
 *   to stay readable, and "Please upload photos of your vehicle (optional)"
 *   then forces the value column down to nothing on a phone.
 * - **The preheader** is the grey line Gmail prints beside the subject in the
 *   inbox list. Left alone it takes whatever text comes first — here, the
 *   logo's `alt`. Given one, the list row says who wrote and from where.
 */
function htmlBody(enquiry: Enquiry): string {
  const who = enquiry.from?.name?.trim() || enquiry.from?.email || "Website visitor";
  const url = SITE + enquiry.page;

  const fields = Object.entries(enquiry.fields)
    .map(
      ([label, value], i) => `
              <tr><td style="padding:${i ? "18px" : "0"} 0 0;">
                <div style="font:600 11px/1.4 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${GOLD};">${esc(label)}</div>
                <div style="margin-top:6px;font:400 16px/1.55 ${FONT};color:${TEXT};">${esc(value).replace(/\n/g, "<br>")}</div>
              </td></tr>
              <tr><td style="padding-top:18px;"><div style="height:1px;background:${HAIRLINE};line-height:1px;font-size:0;">&nbsp;</div></td></tr>`,
    )
    .join("");

  /* A real button, so answering is one tap from the phone the enquiry is read
     on. Only when the form actually carried an email field. */
  const reply = enquiry.from
    ? `
              <tr><td style="padding-top:28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="background:${GOLD};border-radius:999px;">
                    <a href="mailto:${esc(enquiry.from.email)}" style="display:inline-block;padding:14px 30px;font:700 14px/1 ${FONT};letter-spacing:.06em;text-transform:uppercase;color:${INK};text-decoration:none;">Reply to ${esc(who)}</a>
                  </td>
                </tr></table>
              </td></tr>`
    : "";

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(subjectFor(enquiry))}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(who)} &middot; ${esc(enquiry.page)} &middot; ${esc(stamp(enquiry.submittedAt))}</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAGE};">
  <tr><td align="center" style="padding:28px 16px;">

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-radius:14px;overflow:hidden;background:#ffffff;">

      <!--
        Ink band: the mark, on the only background it reads on. Nothing is set
        beside it — the badge already carries the wordmark and the
        "Enhance · Protect · Maintain" line inside the artwork, so a caption
        under it would print the same words twice. 124px is the size at which
        that inner line is legible; below about 100 it silts up.
      -->
      <tr><td align="center" style="background:${INK};padding:36px 24px 34px;">
        <img src="${LOGO}" width="124" height="124" alt="Medusa Auto Detailing" style="display:block;border:0;width:124px;height:124px;color:${GOLD};font:700 17px/124px ${FONT};letter-spacing:.12em;text-align:center;">
      </td></tr>

      <!-- Gold rule, the site's own seam between an ink band and what follows. -->
      <tr><td style="background:${GOLD};height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

      <!-- Who, and where from. -->
      <tr><td style="padding:34px 32px 0;">
        <div style="font:700 11px/1.4 ${FONT};letter-spacing:.2em;text-transform:uppercase;color:${GOLD};">New website enquiry</div>
        <div style="margin-top:10px;font:700 26px/1.25 ${FONT};color:${TEXT};">${esc(who)}</div>
        <div style="margin-top:10px;font:400 13px/1.6 ${FONT};color:${MUTED};">
          ${esc(stamp(enquiry.submittedAt))}<br>
          <a href="${esc(url)}" style="color:${MUTED};text-decoration:underline;">${esc(url)}</a>
        </div>
      </td></tr>

      <tr><td style="padding:26px 32px 0;">
        <div style="height:1px;background:${HAIRLINE};line-height:1px;font-size:0;">&nbsp;</div>
      </td></tr>

      <!-- What they wrote. -->
      <tr><td style="padding:26px 32px 34px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${fields}${reply}
        </table>
      </td></tr>

      <!-- Ink foot: how to reach them the other way. -->
      <tr><td style="background:${INK};padding:26px 32px;" align="center">
        <div style="font:400 13px/1.7 ${FONT};color:#b4b4b4;">
          <a href="tel:${esc(CONTACT.phone)}" style="color:${GOLD_BRIGHT};text-decoration:none;font-weight:700;">${esc(CONTACT.phone)}</a>
          &nbsp;&middot;&nbsp;
          <a href="mailto:${esc(CONTACT.email)}" style="color:${GOLD_BRIGHT};text-decoration:none;">${esc(CONTACT.email)}</a>
        </div>
        <div style="margin-top:10px;font:400 11px/1.6 ${FONT};color:#6a6a6a;">
          ${esc(FOOTER.legalName)} &middot; ${esc(FOOTER.registration)}
        </div>
      </td></tr>

    </table>

    <div style="margin-top:18px;font:400 11px/1.5 ${FONT};color:#9a9a9a;">
      Sent by the enquiry form on ${esc(SITE.replace(/^https?:\/\//, ""))}
    </div>

  </td></tr>
</table>
</body></html>`;
}

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* ── Attachments ──────────────────────────────────────────────────────── */

/**
 * One form — the caravan page's — has a file field, and the photograph a
 * visitor puts in it is the point of the enquiry. Anything past the budget is
 * left off; the field's own line in the body still names the file, so the
 * business can see that something was sent and ask for it.
 */
function attachmentsFor(enquiry: Enquiry) {
  const files = enquiry.attachments ?? [];
  if (!files.length) return {};

  const out: { content: string; filename: string; type: string; disposition: "attachment" }[] = [];
  let used = 0;
  for (const file of files) {
    if (used + file.content.byteLength > ATTACHMENT_BUDGET) continue;
    used += file.content.byteLength;
    out.push({
      content: Buffer.from(file.content).toString("base64"),
      filename: file.filename,
      type: file.type || "application/octet-stream",
      disposition: "attachment",
    });
  }
  return out.length ? { attachments: out } : {};
}
