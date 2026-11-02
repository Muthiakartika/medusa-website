/**
 * What every form's server action shares: the Turnstile gate, the photograph
 * collector, and delivery to the two sinks.
 *
 * These lived in `app/actions.ts` until 2026-10-06, when four of that day's
 * briefs each asked for a dedicated quote form of their own — caravan,
 * graffiti, interior paint spill and flooded car. Each now has its action
 * beside its route (`app/<route>/actions.ts`) and imports the gates from
 * here, so a form is three files of its own and touches nothing shared.
 *
 * Server-only: `checkTurnstile` reads the request's headers and `deliver`
 * sends mail. Import it from a `"use server"` module, never from a component.
 */

import { headers } from "next/headers";
import { HONEYPOT } from "@/lib/honeypot";
import { type Attachment, type Enquiry, sendEnquiry } from "@/lib/mail";
import { CONTACT } from "@/lib/site";
import { isMisconfigured, verifyTurnstile } from "@/lib/turnstile";

export const FALLBACK = `Please call ${CONTACT.phone} or email ${CONTACT.email} and we will pick it up right away.`;

/* ── The honeypot ─────────────────────────────────────────────────────── */

/**
 * Whether a filled honeypot stops this submission. Only where Turnstile is
 * off: with it on, Turnstile tells a person from a bot far better than one
 * hidden input does, and a filled field next to a passed challenge is a
 * browser's autofill, not a bot. A stop is logged, because it is the one
 * gate that otherwise leaves no trace.
 */
export function caughtByHoneypot(formData: FormData): boolean {
  if (!formData.get(HONEYPOT) || process.env.TURNSTILE_SECRET_KEY) return false;
  console.info("[enquiry] honeypot filled and Turnstile off: treated as a bot, not sent");
  return true;
}

/* ── The challenge ────────────────────────────────────────────────────── */

/** Returns a message to show the visitor, or nothing if they may pass. */
export async function checkTurnstile(formData: FormData): Promise<string | undefined> {
  const token = String(formData.get("cf-turnstile-response") ?? "");

  /* Cloudflare wants the visitor's address, not the proxy's. This site sits
     behind Cloudflare and then Vercel, so `x-forwarded-for` is a chain and
     the client is its first entry. */
  const forwarded = (await headers()).get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || undefined;

  const result = await verifyTurnstile(token, ip);

  if (result.status === "skipped") {
    console.info("[enquiry] turnstile check skipped:", result.reason);
    return undefined;
  }
  if (result.status === "failed") {
    if (isMisconfigured(result.codes)) {
      // Every visitor is being turned away and only this line says why.
      console.error("TURNSTILE_SECRET_KEY is wrong — the form is refusing everyone", result.codes);
      return `Sorry, we could not send your message just now. ${FALLBACK}`;
    }
    return result.message;
  }
  return undefined;
}

/* ── Photographs ──────────────────────────────────────────────────────── */

const PHOTO_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;
const PHOTO_TYPE = /^image\/(jpeg|png|webp|heic|heif)$/i;

/** JPG, PNG, WebP or HEIC — by type, or by name when a browser sends none. */
export const isAcceptedPhoto = (file: File) => PHOTO_TYPE.test(file.type) || PHOTO_EXT.test(file.name);

export type CollectedPhotos = {
  attachments: Attachment[];
  /** "photo-1-IMG_0042.jpg (412 KB)", one per photograph, for the email body. */
  named: string[];
  /** A message for the field, when one is due. */
  error?: string;
  /** True when the set is over `budget` — the form should refuse it whole. */
  tooLarge: boolean;
};

/**
 * Every photograph posted under `field`, in the order the customer chose
 * them, named `photo-1-…` so the inbox lists them that way. JPEG, PNG and
 * WebP are shown in the email body as well as attached; a HEIC is attached
 * only, since few mail clients can draw one.
 *
 * `required` adds the "at least one" message; `max` and `budget` (bytes) are
 * the form's own limits — the browser shrinks each photograph first
 * (`lib/photo-shrink.ts`), and the budget sits under the 4 MB a server action
 * accepts.
 */
export async function collectPhotos(
  formData: FormData,
  field: string,
  opts: { max: number; budget: number; required?: boolean },
): Promise<CollectedPhotos> {
  const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  const out: CollectedPhotos = { attachments: [], named: [], tooLarge: false };

  if (!files.length) {
    if (opts.required) out.error = "Please upload at least one photograph.";
    return out;
  }
  if (files.length > opts.max) out.error = `Please send no more than ${opts.max} photographs.`;

  let bytes = 0;
  for (const [i, file] of files.slice(0, opts.max).entries()) {
    if (!isAcceptedPhoto(file)) {
      out.error = "Please send JPG, PNG, HEIC or WebP photographs.";
      continue;
    }
    bytes += file.size;
    /* Some browsers send a HEIC with no type at all; name it from the file. */
    const ext = file.name.match(/\.(\w+)$/)?.[1]?.toLowerCase() ?? "";
    const type = file.type || `image/${ext === "jpg" ? "jpeg" : ext || "heic"}`;
    const filename = `photo-${i + 1}-${file.name}`;
    out.named.push(`${filename} (${Math.round(file.size / 1024)} KB)`);
    out.attachments.push({
      filename,
      type,
      content: await file.arrayBuffer(),
      inline: /^image\/(jpeg|png|webp)$/i.test(type),
    });
  }
  out.tooLarge = bytes > opts.budget;
  return out;
}

/* ── Delivery ─────────────────────────────────────────────────────────── */

/** Returns a message to show the visitor, or nothing if it went somewhere. */
export async function deliver(enquiry: Enquiry): Promise<string | undefined> {
  const mail = await sendEnquiry(enquiry);
  if (mail.status === "failed") console.error("enquiry email failed", mail.error);
  if (mail.status === "skipped") console.info("[enquiry] email skipped:", mail.reason);

  const webhook = await postWebhook(enquiry);

  if (mail.status === "sent" || webhook === "posted") return undefined;

  /* Nothing took it. Log the whole enquiry either way — in production it is
     the only copy that exists, and in development it is the point. */
  const nothingConfigured = mail.status === "skipped" && webhook === "skipped";
  const note = nothingConfigured
    ? "[enquiry] nothing configured to deliver to, logging instead:"
    : "enquiry not delivered";
  console[nothingConfigured ? "info" : "error"](note, {
    page: enquiry.page,
    fields: enquiry.fields,
    mail: mail.status,
    webhook,
  });

  if (nothingConfigured && process.env.NODE_ENV !== "production") return undefined;
  return `Sorry, we could not send your message just now. ${FALLBACK}`;
}

/**
 * The webhook this action delivered to before SendGrid, kept because it is
 * still the cheapest way to put an enquiry somewhere that is not an inbox —
 * a Slack channel, a sheet, a CRM. It is a second sink, not a fallback: both
 * run on every enquiry and either one succeeding is enough.
 */
async function postWebhook(enquiry: Enquiry): Promise<"posted" | "skipped" | "failed"> {
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) return "skipped";
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        form: enquiry.form,
        page: enquiry.page,
        ...(enquiry.source ? { source: enquiry.source } : {}),
        submittedAt: enquiry.submittedAt.toISOString(),
        fields: enquiry.fields,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    return "posted";
  } catch (e) {
    console.error("enquiry webhook delivery failed", e);
    return "failed";
  }
}
