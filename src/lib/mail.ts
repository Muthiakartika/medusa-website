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

import { BUSINESS, CONTACT, SITE } from "@/lib/site";

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

/**
 * The HTML half, kept to table layout and inline styles because that is what
 * survives a mail client. No colour from the design system: this is read in
 * Gmail and Outlook, not on the site.
 */
function htmlBody(enquiry: Enquiry): string {
  const rows = Object.entries(enquiry.fields)
    .map(
      ([label, value]) => `<tr>
    <td style="padding:10px 16px 10px 0;vertical-align:top;color:#666;font-size:13px;white-space:nowrap">${esc(label)}</td>
    <td style="padding:10px 0;vertical-align:top;color:#111;font-size:15px">${esc(value).replace(/\n/g, "<br>")}</td>
  </tr>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:10px;padding:28px">
  <tr><td>
    <p style="margin:0 0 4px;font-size:18px;font-weight:600;color:#111">${esc(subjectFor(enquiry))}</p>
    <p style="margin:0 0 20px;font-size:13px;color:#666">
      ${esc(enquiry.form)} &middot; ${esc(stamp(enquiry.submittedAt))}<br>
      <a href="${esc(SITE + enquiry.page)}" style="color:#9a7222">${esc(SITE + enquiry.page)}</a>
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e6e6e6">
${rows}
    </table>
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
