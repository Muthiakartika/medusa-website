/**
 * Shared shape for the enquiry-form action result. It lives here rather than
 * beside the action because a "use server" module may only export async
 * functions — a plain constant there is a build error.
 */
export type EnquiryState = {
  status: "idle" | "ok" | "error";
  message?: string;
  /** Field name -> error, so the client can mark the offending inputs. */
  errors?: Record<string, string>;
  /**
   * What was submitted, echoed back on failure only. React resets an
   * uncontrolled form once its action settles, so without this the visitor
   * loses everything they typed the moment one field fails validation.
   */
  values?: Record<string, string>;
};

export const EMPTY_STATE: EnquiryState = { status: "idle" };

/**
 * The source's CF7 captions carry their own required-marker — "Your Name
 * (required)", "Full name*", "Phone:". Stripping it keeps one convention on
 * screen and keeps the delivered payload readable.
 */
export const cleanLabel = (label: string) =>
  label
    .replace(/\s*\(required\)\s*$/i, "")
    .replace(/\s*\*\s*$/, "")
    .replace(/:\s*$/, "")
    .trim();
