"use server";

import { getForm } from "@/lib/blocks";
import { cleanLabel, type EnquiryState } from "@/lib/enquiry";
import { CONTACT } from "@/lib/site";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FALLBACK = `Please call ${CONTACT.phone} or email ${CONTACT.email} and we will pick it up right away.`;

/**
 * Handles every enquiry form on the site. The posted `__slug`/`__form` pair
 * identifies which form it is; the schema is then re-read server-side so a
 * tampered payload can't bypass the required-field rules.
 *
 * Delivery goes to CONTACT_WEBHOOK_URL. With no webhook configured the
 * enquiry is logged instead — fine in development, but a hard error in
 * production, because quietly thanking someone whose message went nowhere is
 * worse than telling them to phone.
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

  const errors: Record<string, string> = {};
  const answers: Record<string, string> = {};
  const submitted: Record<string, string> = {};

  for (const field of form.fields) {
    const raw = formData.get(field.name);
    const label = cleanLabel(field.label);

    if (field.type === "file") {
      // Attachments are noted by name; the webhook receives the metadata only.
      if (raw instanceof File && raw.size > 0) {
        answers[label] = `${raw.name} (${Math.round(raw.size / 1024)} KB)`;
      }
      continue;
    }

    const value = typeof raw === "string" ? raw.trim() : "";
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

  if (Object.keys(errors).length) {
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      errors,
      values: submitted,
    };
  }

  const payload = {
    form: form.id,
    page: `/${slug}`,
    submittedAt: new Date().toISOString(),
    fields: answers,
  };

  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (!webhook) {
    if (process.env.NODE_ENV === "production") {
      console.error("CONTACT_WEBHOOK_URL is not set — enquiry not delivered", payload);
      return {
        status: "error",
        message: `Sorry, we could not send your message just now. ${FALLBACK}`,
        values: submitted,
      };
    }
    console.info("[enquiry] no CONTACT_WEBHOOK_URL set, logging instead:", payload);
    return { status: "ok", message: successMessage() };
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`webhook responded ${res.status}`);
  } catch (e) {
    console.error("enquiry delivery failed", e);
    return {
      status: "error",
      message: `Sorry, we could not send your message just now. ${FALLBACK}`,
      values: submitted,
    };
  }

  return { status: "ok", message: successMessage() };
}

const successMessage = () =>
  "Thank you — your message is on its way. We aim to reply within one working day.";
