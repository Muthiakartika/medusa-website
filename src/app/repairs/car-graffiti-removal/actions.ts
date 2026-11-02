"use server";

import type { EnquiryState } from "@/lib/enquiry";
import { caughtByHoneypot, checkTurnstile, collectPhotos, deliver } from "@/lib/form-delivery";
import { MAX_PHOTOS, PHOTO_BUDGET, QUOTE_FORM_ID, quoteEmail, quoteSubject, validateQuote } from "@/lib/graffiti-quote";
import { PATH } from "@/lib/graffiti-removal";

/**
 * The car graffiti removal quote form on /repairs/car-graffiti-removal.
 *
 * Its own action for its own schema (`lib/graffiti-quote.ts`): multi-select
 * groups, questions asked only after a "Yes", up to ten photographs in one
 * field — "Photos should be mandatory" — and an email the brief writes out
 * line by line: its subject, its order, and a telephone number that can be
 * tapped. The same gates, in the same order, as the signage removal quote
 * form: the honeypot, the answers and the photographs, Turnstile, then
 * `deliver`.
 *
 * The photographs travel in the form's order, named `photo-1-…` so the inbox
 * lists them the way the customer chose them; those every mail client can
 * draw are shown in the body as well ("ALL uploaded photographs"), and a HEIC
 * is attached only.
 */
export async function submitGraffitiQuote(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
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
  if (photos.tooLarge) {
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

  const photoLine = `${photos.named.length} attached:\n${photos.named.join("\n")}`;
  const { fields, links } = quoteEmail(answers, photoLine);

  const failure = await deliver({
    form: QUOTE_FORM_ID,
    page: PATH,
    submittedAt: new Date(),
    fields,
    links,
    from: { email: answers.email, name: answers.fullName || undefined },
    attachments: photos.attachments,
    subject: quoteSubject(answers),
  });
  if (failure) return { status: "error", message: failure };

  return { status: "ok" };
}
