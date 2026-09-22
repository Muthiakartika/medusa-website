"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The Turnstile widget, one per enquiry form.
 *
 * Explicit rendering rather than the `class="cf-turnstile"` shorthand, for two
 * reasons this site actually has. `/careers-franchising` carries the same form
 * twice, so there are two widgets on one page and every call has to name which
 * one it means — `turnstile.reset()` with no argument resets the last one
 * rendered, which would be the wrong one half the time. And the widget has to
 * be reset after **every** submission: a token is single-use, so a visitor who
 * trips server-side validation and corrects a field would otherwise post the
 * spent token again and be told to try again forever.
 *
 * It writes its own `<input type="hidden" name="cf-turnstile-response">` into
 * the surrounding form, which is what `app/actions.ts` reads.
 *
 * With `NEXT_PUBLIC_TURNSTILE_SITE_KEY` unset this renders nothing at all, and
 * `lib/turnstile.ts` skips the check for the same reason — the two halves are
 * configured together or not at all, so a fresh clone can still submit a form.
 */

/* Inlined at build time, so it has to be the whole literal rather than a
   lookup — Next replaces the exact text `process.env.NEXT_PUBLIC_…`. */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** What Cloudflare's widget measures, and what it refuses to reflow below. */
const WIDTH = 300;
/** Only until the real one is measured — see the note on `size` below. */
const FALLBACK_HEIGHT = 65;

type Turnstile = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      action?: string;
      theme?: "auto" | "light" | "dark";
      size?: "normal" | "compact" | "flexible";
      "error-callback"?: (code: string) => void;
    },
  ) => string | undefined;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

/** One script for the page, however many widgets ask for it. */
let loading: Promise<void> | undefined;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      /* Let a later mount try again — an ad blocker is permanent but a flaky
         network is not, and a widget that never appears is a form nobody can
         send. */
      loading = undefined;
      reject(new Error("turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * `resetOn` is watched by identity alone, never read: whatever the caller
 * passes, a new value means the last token has been spent.
 */
export default function Turnstile({ resetOn }: { resetOn: unknown }) {
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const id = useRef<string | undefined>(undefined);

  /*
    Two measurements, because neither dimension can be assumed.

    **Width.** The widget is a fixed 300px box and nothing inside it reflows.
    `.shell` is 88% of the viewport and the form card adds 24px of padding
    each side, so a 320px phone offers 234px — 66 short. Every phone is
    short, in fact: 88% of 375px less 48 is 282. The scale is the ordinary
    case, not an edge case for one old handset, and the factor is measured
    rather than guessed at a breakpoint, because the form sits in a
    different column on each of the five pages that carry one.

    **Height.** Cloudflare documents the normal widget as 300x65 and renders
    it at 73, and an interactive challenge is taller again — so the height is
    taken from the widget rather than written down here.
  */
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(FALLBACK_HEIGHT);

  useEffect(() => {
    const outer = wrap.current;
    const inner = host.current;
    if (!outer || !inner || !SITE_KEY || typeof ResizeObserver === "undefined") return;
    /* One observer for both boxes: the wrapper's width is set by the column
       and the host's height by Cloudflare, and neither is affected by what
       this writes back, so there is no loop. */
    const observer = new ResizeObserver(() => {
      const width = outer.clientWidth;
      /* A width of 0 is a tab that is not being rendered, not a column with
         no room in it — leave the scale alone rather than shrinking to the
         floor behind the visitor's back. */
      if (width) setScale(width >= WIDTH ? 1 : Math.max(width / WIDTH, 0.5));
      if (inner.offsetHeight) setHeight(inner.offsetHeight);
    });
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el || !SITE_KEY) return;

    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || id.current !== undefined) return;
        id.current = window.turnstile?.render(el, {
          sitekey: SITE_KEY,
          action: "enquiry",
          theme: "dark",
          size: "normal",
        });
      })
      .catch(() => {
        /* Nothing to show the visitor: the server fails the submission open
           when Cloudflare cannot be reached, and a red box beside a form
           they have not filled in yet only stops them filling it in. */
      });

    return () => {
      cancelled = true;
      if (id.current !== undefined) {
        window.turnstile?.remove(id.current);
        id.current = undefined;
      }
    };
  }, []);

  /* Every settled submission spends the token; the next one needs a new one.
     This runs on mount too, where `id.current` is still undefined — the
     widget is rendered from a promise, so it cannot exist yet — and a reset
     of nothing is nothing. */
  useEffect(() => {
    if (id.current !== undefined) window.turnstile?.reset(id.current);
  }, [resetOn]);

  if (!SITE_KEY) return null;

  /*
    The host is taken out of flow, which is what makes the measurement above
    mean anything. Left in, its 300px is the min-content width of everything
    it sits inside, and a grid item's `min-width: auto` refuses to go below
    that — so the form's column widened to 300, the 281px shell overflowed by
    47, and the wrapper measured 300 and concluded it had all the room it
    needed. (The same trap the contact page's left column already documents,
    from the other side.) Out of flow, the wrapper is the column's width and
    the widget is measured against the space it actually has.

    Which is why the height is always explicit: an absolute child gives its
    parent none.
  */
  return (
    <div
      ref={wrap}
      className="relative mt-6 overflow-hidden"
      style={{ height: Math.ceil(height * scale) }}
    >
      <div
        ref={host}
        className="absolute top-0 left-0"
        style={{
          width: WIDTH,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "left top",
        }}
      />
    </div>
  );
}
