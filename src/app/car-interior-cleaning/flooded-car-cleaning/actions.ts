"use server";

import type { EnquiryState } from "@/lib/enquiry";
import {
  FLOOD_FORM_ID,
  floodEmail,
  floodSubject,
  MAX_PHOTOS,
  PHOTO_BUDGET,
  validateFlood,
} from "@/lib/flooded-assessment";
import { PATH } from "@/lib/flooded-car";
import { caughtByHoneypot, checkTurnstile, collectPhotos, deliver, FALLBACK } from "@/lib/form-delivery";

/**
 * The flooded car assessment form's action — schema, rules and email in
 * `lib/flooded-assessment.ts`, the form in `components/FloodedAssessmentForm`.
 *
 * The site's three gates, in the order the signage quote form keeps them:
 * the honeypot, then Turnstile, then the form's own rules. The browser has
 * already run `validateFlood` before anything is sent, so the field errors
 * here are for a submission that skipped it.
 *
 * "Upload Photos* — MANDATORY": `collectPhotos` is asked for at least one.
 */
export async function submitFloodedAssessment(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  if (caughtByHoneypot(formData)) return { status: "ok" };

  try {
    const read = (name: string) => {
      const raw = formData.get(name);
      return typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
    };
    const readAll = (name: string) =>
      formData.getAll(name).flatMap((v) => (typeof v === "string" && v.trim() ? [v.trim()] : []));

    const { errors, answers } = validateFlood(read, readAll);

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

    const { fields, links } = floodEmail(answers, `${photos.named.length} attached:\n${photos.named.join("\n")}`);

    const failure = await deliver({
      form: FLOOD_FORM_ID,
      page: PATH,
      submittedAt: new Date(),
      fields,
      links,
      from: { email: answers.email, name: answers.fullName || undefined },
      attachments: photos.attachments,
      subject: floodSubject(answers),
    });
    if (failure) return { status: "error", message: failure };

    return { status: "ok" };
  } catch (e) {
    console.error("flooded car assessment failed", e);
    return { status: "error", message: `Sorry, we could not send your enquiry just now. ${FALLBACK}` };
  }
}
