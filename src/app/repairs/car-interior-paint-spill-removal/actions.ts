"use server";

import type { EnquiryState } from "@/lib/enquiry";
import { caughtByHoneypot, checkTurnstile, type CollectedPhotos, collectPhotos, deliver } from "@/lib/form-delivery";
import { PATH } from "@/lib/paint-spill";
import {
  MAX_PHOTOS,
  PHOTO_BUDGET,
  QUOTE_FORM_ID,
  quoteEmail,
  quoteSubject,
  validateQuote,
} from "@/lib/paint-spill-quote";

/**
 * The car interior paint spill removal quote form's action — schema, labels
 * and the email in `lib/paint-spill-quote.ts`, the form in
 * `components/PaintSpillQuoteForm.tsx`.
 *
 * The same three gates as every form on the site, cheapest first: the
 * honeypot, then Turnstile, then the form's own rules — which are the ones
 * the browser has already run, re-run here so a tampered submission cannot
 * skip a required answer or the photographs ("Photos should be mandatory").
 *
 * Two photo fields: `photos`, the brief's PHOTO 1–5, and `labelPhoto`, the
 * paint label, read only when the customer says they still have the tin.
 * Both go into the email — JPEG, PNG and WebP shown in its body, a HEIC
 * attached as it came ("Test HEIC uploads from iPhones if supported") — and
 * the label is named `paint-label-…` so it stands apart from the others.
 */
export async function submitPaintSpillQuote(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  if (caughtByHoneypot(formData)) return { status: "ok" };

  const read = (name: string) => {
    const raw = formData.get(name);
    return typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
  };
  const readAll = (name: string) =>
    formData.getAll(name).flatMap((v) => (typeof v === "string" && v.trim() ? [v.trim()] : []));

  const { errors, answers } = validateQuote(read, readAll);

  const photos = await collectPhotos(formData, "photos", { max: MAX_PHOTOS, budget: PHOTO_BUDGET, required: true });
  if (photos.error) errors.photos = photos.error;

  const none: CollectedPhotos = { attachments: [], named: [], tooLarge: false };
  const label = answers.tin === "Yes" ? await collectPhotos(formData, "labelPhoto", { max: 1, budget: PHOTO_BUDGET }) : none;
  if (label.error) errors.labelPhoto = label.error;
  const rename = (name: string) => name.replace(/^photo-1-/, "paint-label-");
  const labelFiles = label.attachments.map((a) => ({ ...a, filename: rename(a.filename) }));
  const labelNamed = label.named.map(rename);

  const attachments = [...photos.attachments, ...labelFiles];
  if (attachments.reduce((sum, a) => sum + a.content.byteLength, 0) > PHOTO_BUDGET) {
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

  const { fields, links } = quoteEmail(answers, photos.named, labelNamed);

  const failure = await deliver({
    form: QUOTE_FORM_ID,
    page: PATH,
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
