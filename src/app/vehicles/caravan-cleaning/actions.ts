"use server";

import { PATH } from "@/lib/caravan-cleaning";
import {
  MAX_PHOTOS,
  PHOTO_BUDGET,
  QUOTE_FORM_ID,
  quoteEmail,
  quoteSubject,
  validateQuote,
} from "@/lib/caravan-quote";
import type { EnquiryState } from "@/lib/enquiry";
import { caughtByHoneypot, checkTurnstile, collectPhotos, deliver, FALLBACK } from "@/lib/form-delivery";

/**
 * The caravan & motorhome valeting quote form's action — schema, rules and
 * email in `lib/caravan-quote.ts`, the form in `components/
 * CaravanQuoteForm.tsx`.
 *
 * The same gates as every form on the site (`lib/form-delivery.ts`): the
 * honeypot, the form's own rules — re-run here, so a tampered submission is
 * held to them — the photographs, Turnstile, then delivery to the inbox and
 * the webhook. The email is the brief's "QUOTE FORM BACK-END": its subject
 * line, its list of what to include, every photograph, and the telephone
 * number as a link.
 *
 * Never submit this against `npm run dev` with `.env.local` in place: it
 * holds the live SendGrid key, and a test would email the client.
 */
export async function submitCaravanQuote(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  /* Honeypot, where Turnstile is off. Answer as if it went. */
  if (caughtByHoneypot(formData)) return { status: "ok" };

  try {
    const read = (name: string) => {
      const raw = formData.get(name);
      return typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
    };
    const readAll = (name: string) =>
      formData.getAll(name).flatMap((v) => (typeof v === "string" && v.trim() ? [v.trim()] : []));

    const { errors, answers } = validateQuote(read, readAll);

    /* "Upload Photos* — MAKE THIS MANDATORY. Allow multiple uploads." */
    const photos = await collectPhotos(formData, "photos", {
      max: MAX_PHOTOS,
      budget: PHOTO_BUDGET,
      required: true,
    });
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
  } catch (e) {
    console.error("caravan quote: submission failed", e);
    return { status: "error", message: `Sorry, we could not send your enquiry just now. ${FALLBACK}` };
  }
}
