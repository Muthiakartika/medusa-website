/**
 * Cloudflare Turnstile, server side.
 *
 * The honeypot in `EnquiryForm` catches a bot that fills every input it finds
 * and nothing else — it costs one hidden field and it stops the cheapest half
 * of the traffic. Turnstile is the other half: a token the browser earns and
 * the server checks, which a script driving a headless browser cannot mint.
 *
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY  the widget's public key, read by
 *                                   `components/Turnstile.tsx` at build time
 *   TURNSTILE_SECRET_KEY            the private half, read here only
 *
 * With the secret unset every token passes and the result says so, the same
 * contract `purgeCloudflare` and `sendEnquiry` have: `npm run dev` on a fresh
 * clone has to submit a form without anybody's credentials. The widget is the
 * mirror of that — no site key, no widget — so the two halves switch on
 * together and neither can be left half-wired.
 *
 * Cloudflare's own dummy keys are the way to exercise the real path locally:
 *
 *   site   1x00000000000000000000AA  always passes   (visible widget)
 *          2x00000000000000000000AB  always fails
 *          3x00000000000000000000FF  forces the interactive challenge
 *   secret 1x0000000000000000000000000000000AA  always passes
 *          2x0000000000000000000000000000000AA  always fails
 *          3x0000000000000000000000000000000AA  "token already spent"
 *
 * They have to be used as a pair — a production secret rejects a dummy token.
 */

const ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { status: "skipped"; reason: string }
  | { status: "ok" }
  /** `message` is written for the visitor; `codes` is for the server log. */
  | { status: "failed"; codes: string[]; message: string };

/**
 * A token is single-use and expires after five minutes, so the two failures a
 * real person actually hits — submitting twice, or leaving the page open over
 * lunch — are told apart from the rest and answered with "try again" rather
 * than with a phone number. The widget resets itself after every submission,
 * so trying again is one click.
 */
const MESSAGES: Record<string, string> = {
  "missing-input-response": "Please complete the verification below and try again.",
  "invalid-input-response": "That verification has expired — please complete it again.",
  "timeout-or-duplicate": "That verification has already been used — please complete it again.",
};

const GENERIC = "We could not verify that you are human. Please try again.";

export async function verifyTurnstile(
  token: string,
  remoteip?: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { status: "skipped", reason: "TURNSTILE_SECRET_KEY not set" };

  if (!token) {
    return {
      status: "failed",
      codes: ["missing-input-response"],
      message: MESSAGES["missing-input-response"],
    };
  }

  type SiteVerify = { success?: boolean; "error-codes"?: string[] };
  let payload: SiteVerify | null = null;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: token, ...(remoteip ? { remoteip } : {}) }),
      signal: AbortSignal.timeout(10_000),
    });
    payload = (await response.json().catch(() => null)) as SiteVerify | null;
  } catch (error) {
    /* Cloudflare unreachable is our outage, not the visitor's. Refusing the
       enquiry would lose a customer to protect against a bot that is not
       there, so the check is skipped and the reason is logged. */
    return { status: "skipped", reason: `siteverify unreachable: ${error}` };
  }

  if (payload?.success) return { status: "ok" };

  const codes = payload?.["error-codes"] ?? ["unknown"];
  return {
    status: "failed",
    codes,
    message: codes.map((c) => MESSAGES[c]).find(Boolean) ?? GENERIC,
  };
}

/**
 * A misconfiguration answers exactly like a bot would, and the difference
 * matters: these two codes mean the deployment's own secret is wrong, so the
 * form is refusing everybody and the server log is the only place that says
 * why.
 */
export const isMisconfigured = (codes: string[]) =>
  codes.includes("missing-input-secret") || codes.includes("invalid-input-secret");
