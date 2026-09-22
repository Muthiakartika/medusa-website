"use server";

import { headers } from "next/headers";
import { type FormField, getForm } from "@/lib/blocks";
import { cleanLabel, type EnquiryState } from "@/lib/enquiry";
import { type Attachment, type Enquiry, sendEnquiry } from "@/lib/mail";
import { CONTACT } from "@/lib/site";
import { isMisconfigured, verifyTurnstile } from "@/lib/turnstile";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FALLBACK = `Please call ${CONTACT.phone} or email ${CONTACT.email} and we will pick it up right away.`;

/**
 * Handles every enquiry form on the site. The posted `__slug`/`__form` pair
 * identifies which form it is; the schema is then re-read server-side so a
 * tampered payload can't bypass the required-field rules.
 *
 * Three gates, cheapest first: the honeypot, then Turnstile, then the form's
 * own required-field rules. The order matters — a bot should cost a token
 * check at most, and a person who mistypes an email address should not have
 * spent their Turnstile token on it.
 *
 * Delivery is email through SendGrid, to the inbox the site publishes
 * (`lib/mail.ts`), plus a POST to CONTACT_WEBHOOK_URL if one is configured —
 * the two are independent sinks and an enquiry counts as delivered if either
 * took it. With neither configured the enquiry is logged instead, which is
 * fine in development and a hard error in production, because quietly
 * thanking someone whose message went nowhere is worse than telling them to
 * phone.
 */
export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  // Bots fill every input they find; a real browser leaves this one empty.
  if (formData.get("__company")) return { status: "ok" };

  const slug = String(formData.get("__slug") ?? "");
  const index = Number(formData.get("__form") ?? 0);
  const form = getForm(slug, index);

  if (!form) {
    return { status: "error", message: `We could not process that form. ${FALLBACK}` };
  }

  /* Read the fields before the challenge, so a failed check can hand back
     everything that was typed rather than emptying the form. */
  const errors: Record<string, string> = {};
  const answers: Record<string, string> = {};
  const submitted: Record<string, string> = {};
  const attachments: Attachment[] = [];

  for (const field of form.fields) {
    const raw = formData.get(field.name);
    const label = cleanLabel(field.label);

    if (field.type === "file") {
      // The photograph is usually the point of the enquiry, so it travels
      // with it; the line in the body names it either way, in case it was
      // too large to attach.
      if (raw instanceof File && raw.size > 0) {
        answers[label] = `${raw.name} (${Math.round(raw.size / 1024)} KB)`;
        attachments.push({
          filename: raw.name,
          type: raw.type,
          content: await raw.arrayBuffer(),
        });
      }
      continue;
    }

    /* A textarea posts CRLF. Left in, the carriage returns reach the email
       body and the webhook payload as stray characters between the lines. */
    const value = typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
    if (value) submitted[field.name] = value;

    if (field.required && !value) {
      errors[field.name] = "This field is required.";
      continue;
    }
    if (field.type === "email" && value && !EMAIL.test(value)) {
      errors[field.name] = "Enter a valid email address.";
      continue;
    }
    if (value) answers[label] = value;
  }

  const challenge = await checkTurnstile(formData);
  if (challenge) return { status: "error", message: challenge, values: submitted };

  if (Object.keys(errors).length) {
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      errors,
      values: submitted,
    };
  }

  const enquiry: Enquiry = {
    form: form.id,
    page: `/${slug}`,
    submittedAt: new Date(),
    fields: answers,
    from: contactOf(form.fields, submitted),
    attachments,
  };

  const failure = await deliver(enquiry);
  if (failure) return { status: "error", message: failure, values: submitted };

  return { status: "ok", message: successMessage() };
}

/* ── The challenge ────────────────────────────────────────────────────── */

/** Returns a message to show the visitor, or nothing if they may pass. */
async function checkTurnstile(formData: FormData): Promise<string | undefined> {
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

/* ── Delivery ─────────────────────────────────────────────────────────── */

/** Returns a message to show the visitor, or nothing if it went somewhere. */
async function deliver(enquiry: Enquiry): Promise<string | undefined> {
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

/**
 * Who to answer. The form's own email field is the address, and the first
 * text field whose label mentions a name is the name — every one of the six
 * forms writes it as "Your Name", "Full name" or "fname", so the label is a
 * surer guide than the field's position.
 */
function contactOf(
  fields: FormField[],
  submitted: Record<string, string>,
): Enquiry["from"] {
  const emailField = fields.find((f) => f.type === "email");
  const email = emailField ? submitted[emailField.name] : undefined;
  if (!email) return undefined;

  const nameField = fields.find(
    (f) => f.type === "text" && /name/i.test(`${f.label} ${f.name}`),
  );
  return { email, name: nameField ? submitted[nameField.name] : undefined };
}

const successMessage = () =>
  "Thank you — your message is on its way. We aim to reply within one working day.";
