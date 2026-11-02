"use server";

import { type FormField, getForm } from "@/lib/blocks";
import { cleanLabel, type EnquiryState } from "@/lib/enquiry";
import { caughtByHoneypot, checkTurnstile, deliver, FALLBACK } from "@/lib/form-delivery";
import type { Attachment, Enquiry } from "@/lib/mail";
import { PATH as WHEEL_PAGE } from "@/lib/alloy-wheel-protection";
import { PATH as SIGNAGE_PAGE } from "@/lib/signage-removal";
import {
  isAcceptedPhoto,
  LEAD_SOURCE,
  MAX_PHOTOS,
  PHOTO_BUDGET as QUOTE_PHOTO_BUDGET,
  QUOTE_FORM_ID,
  quoteEmail,
  quoteSubject,
  validateQuote,
} from "@/lib/signage-quote";
import {
  answerLabel,
  PHOTO_BUDGET,
  validateWheelCheck,
  WHEEL_FIELDS,
  WHEEL_FORM_ID,
  wheelCheckSubject,
} from "@/lib/wheel-check";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  // The honeypot, where Turnstile is off (`caughtByHoneypot`).
  if (caughtByHoneypot(formData)) return { status: "ok" };

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

/**
 * The WHEELUV™ suitability & booking form, /car-detailing/alloy-wheel-protection.
 *
 * Its own action because its own schema: radio groups, acknowledgements, a
 * pair of questions asked only after a "Yes", four photographs and a subject
 * line the brief spells out (`lib/wheel-check.ts`). The gates are the same
 * three in the same order as `submitEnquiry`, and delivery is the same
 * `deliver` — so it lands in the same inbox, through the same two sinks.
 *
 * Nothing is booked or charged here. "If the wheels clearly require manual
 * assessment, send the submission for approval rather than taking immediate
 * payment" — every submission is that: an email for a person to read.
 */
export async function submitWheelCheck(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  if (caughtByHoneypot(formData)) return { status: "ok" };

  const read = (name: string) => {
    const raw = formData.get(name);
    return typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
  };

  const { errors, answers } = validateWheelCheck(read);

  /* The photographs travel as attachments, in the form's order, and each is
     named in the body too in case it was too large to attach. */
  const attachments: Attachment[] = [];
  const photoLines: Record<string, string> = {};
  let bytes = 0;
  for (const field of WHEEL_FIELDS) {
    if (field.kind !== "photo") continue;
    const raw = formData.get(field.name);
    if (!(raw instanceof File) || raw.size === 0) continue;
    if (!raw.type.startsWith("image/")) {
      errors[field.name] = "Please choose a photograph.";
      continue;
    }
    bytes += raw.size;
    photoLines[field.name] = `${raw.name} (${Math.round(raw.size / 1024)} KB)`;
    attachments.push({ filename: raw.name, type: raw.type, content: await raw.arrayBuffer() });
  }
  if (bytes > PHOTO_BUDGET) {
    return {
      status: "error",
      message: "Those photographs are too large to send together. Please choose smaller ones, or fewer.",
    };
  }

  const challenge = await checkTurnstile(formData);
  if (challenge) return { status: "error", message: challenge };

  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the highlighted fields and try again.", errors };
  }

  /* Back into the form's order, photographs in their place. */
  const fields: Record<string, string> = {};
  for (const field of WHEEL_FIELDS) {
    if (field.kind === "photo") {
      if (photoLines[field.name]) fields[answerLabel(field)] = photoLines[field.name];
    } else if (answers[field.label]) {
      fields[field.label] = answers[field.label];
    }
  }

  const failure = await deliver({
    form: WHEEL_FORM_ID,
    page: WHEEL_PAGE,
    submittedAt: new Date(),
    fields,
    from: { email: read("email"), name: read("fullName") || undefined },
    attachments,
    subject: wheelCheckSubject(read),
  });
  if (failure) return { status: "error", message: failure };

  return { status: "ok", message: successMessage() };
}

/**
 * The vehicle signage removal quote form,
 * /commercial-valeting/car-van-stickers-removal.
 *
 * Its own action for its own schema (`lib/signage-quote.ts`): multi-select
 * groups, questions asked only after a "Yes", up to ten photographs in one
 * field, and an email the brief writes out line by line — its subject, its
 * order, a telephone number that can be tapped, and the lead source. Same
 * three gates in the same order as `submitEnquiry`, and the same `deliver`.
 *
 * The photographs travel in the form's order, named `photo-1-…` so the inbox
 * lists them the way the customer chose them. Those every mail client can
 * draw are shown in the body as well; a HEIC is attached only.
 */
export async function submitSignageQuote(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  if (caughtByHoneypot(formData)) return { status: "ok" };

  const read = (name: string) => {
    const raw = formData.get(name);
    return typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
  };
  const readAll = (name: string) =>
    formData.getAll(name).flatMap((v) => (typeof v === "string" && v.trim() ? [v.trim()] : []));

  const { errors, answers } = validateQuote(read, readAll);

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) errors.photos = "Please upload at least one photograph.";
  else if (files.length > MAX_PHOTOS) errors.photos = `Please send no more than ${MAX_PHOTOS} photographs.`;

  const attachments: Attachment[] = [];
  const named: string[] = [];
  let bytes = 0;
  for (const [i, file] of files.slice(0, MAX_PHOTOS).entries()) {
    if (!isAcceptedPhoto(file)) {
      errors.photos = "Please send JPG, PNG, HEIC or WebP photographs.";
      continue;
    }
    bytes += file.size;
    /* Some browsers send a HEIC with no type at all; name it from the file. */
    const ext = file.name.match(/\.(\w+)$/)?.[1]?.toLowerCase() ?? "";
    const type = file.type || `image/${ext === "jpg" ? "jpeg" : ext || "heic"}`;
    const filename = `photo-${i + 1}-${file.name}`;
    named.push(`${filename} (${Math.round(file.size / 1024)} KB)`);
    attachments.push({
      filename,
      type,
      content: await file.arrayBuffer(),
      inline: /^image\/(jpeg|png|webp)$/i.test(type),
    });
  }
  if (bytes > QUOTE_PHOTO_BUDGET) {
    return {
      status: "error",
      message: "Those photographs are too large to send together. Please choose smaller ones, or fewer.",
    };
  }

  const challenge = await checkTurnstile(formData);
  if (challenge) return { status: "error", message: challenge };

  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the highlighted fields and try again.", errors };
  }

  const photoLine = `${named.length} attached:\n${named.join("\n")}`;
  const { fields, links } = quoteEmail(answers, photoLine);

  const failure = await deliver({
    form: QUOTE_FORM_ID,
    page: SIGNAGE_PAGE,
    source: LEAD_SOURCE,
    submittedAt: new Date(),
    fields,
    links,
    from: { email: answers.email, name: answers.fullName || undefined },
    attachments,
    subject: quoteSubject(answers),
  });
  if (failure) return { status: "error", message: failure };

  return { status: "ok" };
}

/* The challenge and delivery — Turnstile, SendGrid and the webhook — live in
   `lib/form-delivery.ts`, shared with the quote forms whose actions sit
   beside their own routes. */

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
