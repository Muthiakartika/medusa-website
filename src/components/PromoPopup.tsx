"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { PROMO } from "@/lib/site";

/* The two halves of the coupon each lose a half-circle at the seam, so the
   page shows through a round notch on either side of the perforation. Two
   layers, one per side, each a little over half the width. */
function notched(edge: "top" | "bottom") {
  const y = edge === "top" ? "0" : "100%";
  const side = (x: string, pos: string) =>
    `radial-gradient(circle at ${x} ${y}, transparent 11px, #000 11.5px) ${pos} / 51% 100% no-repeat`;
  const mask = `${side("0", "left")}, ${side("100%", "right")}`;
  return { mask, WebkitMask: mask };
}

/**
 * The first-valet discount: 0.3s after load, in the bottom-right corner, no
 * overlay, as the live homepage ran it — and now on every page, from the root
 * layout (repo owner, 2026-10-23: "muncul di setiap pages ya ketika di
 * load"). Below `sm` it is a smaller card, 264px rather than 320: "untuk di
 * mobile coupunnya juga agak kecilin".
 *
 * The words are the source's; the card is ours. Its own was a flat gold slab
 * of white type at 2.6:1 — "redesign coba biar bagusan", the repo owner,
 * 2026-10-23 — so it is a coupon now: the offer on gold, the code on ink
 * behind a perforation, ink type on the gold the way every other gold
 * surface on the site carries it. It sits above the floating WhatsApp button
 * rather than over it, and the code says it was copied in the card rather
 * than in an `alert()`.
 *
 * Closing it closes it for this page only. The source kept it shut for two
 * days with a cookie; the repo owner, the same day: "muncul lagi di setiap
 * page load, walaupun sudah pernah ditutup". So it comes back on every load
 * and on every navigation — the root layout survives a `<Link>`, so the
 * pathname, not the mount, is what starts it.
 *
 * It renders nothing on the server, so it is no part of the page's HTML, its
 * headings or its text.
 */
export default function PromoPopup() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"off" | "on" | "leaving">("off");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setCopied(false);
      setPhase("on");
    }, 300);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("off"), 250);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "on") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  function close() {
    setPhase("leaving");
  }

  function copy() {
    navigator.clipboard?.writeText(PROMO.code).then(
      () => setCopied(true),
      () => {},
    );
  }

  if (phase === "off") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="promo-title"
      className={`promo-float fixed right-4 bottom-[96px] z-50 w-[264px] drop-shadow-[0_22px_34px_rgba(0,0,0,0.55)] transition-[opacity,translate,bottom] sm:right-6 sm:w-[320px] ${
        phase === "leaving"
          ? "translate-y-2 opacity-0 duration-[250ms]"
          : "duration-500 ease-out starting:opacity-0 motion-safe:starting:translate-y-4"
      }`}
    >
      <div
        className="bg-gold-wash relative rounded-t-[16px] px-5 pt-5 pb-4 sm:rounded-t-[18px] sm:px-7 sm:pt-7 sm:pb-6"
        style={notched("bottom")}
      >
        <p id="promo-title" className="text-ink">
          <span className="block pr-8 font-[family-name:var(--font-display)] text-[34px] leading-[0.95] sm:text-[48px]">
            {PROMO.offer}
          </span>{" "}
          <span className="mt-1.5 block font-[family-name:var(--font-sub)] text-[15px] leading-[19px] font-medium tracking-[0.05em] sm:mt-2.5 sm:text-[19px] sm:leading-[24px]">
            {PROMO.title}
          </span>
        </p>
        <p className="mt-1.5 text-[12.5px] leading-[18px] font-semibold text-ink/70 sm:mt-2.5 sm:text-[14px] sm:leading-[20px]">
          {PROMO.lede}
        </p>

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-ink/10 text-ink transition-colors hover:bg-ink hover:text-gold sm:top-3.5 sm:right-3.5 sm:h-8 sm:w-8"
        >
          <Icon name="close" size={14} />
        </button>
      </div>

      <div
        className="bg-ink-soft relative rounded-b-[16px] px-5 pt-4 pb-4 shadow-[inset_1px_0_0_rgba(255,255,255,0.09),inset_-1px_0_0_rgba(255,255,255,0.09),inset_0_-1px_0_rgba(255,255,255,0.09)] sm:rounded-b-[18px] sm:px-7 sm:pt-6 sm:pb-6"
        style={notched("top")}
      >
        <span aria-hidden className="absolute inset-x-[18px] top-0 border-t-2 border-dashed border-white/20" />

        <button
          type="button"
          onClick={copy}
          className="flex w-full items-center justify-between rounded-xl border-2 border-dashed border-gold/60 bg-gold/[0.07] px-4 py-2.5 text-gold transition-colors hover:border-gold hover:bg-gold/[0.14] sm:px-5 sm:py-3.5"
        >
          <span className="font-[family-name:var(--font-display)] text-[24px] leading-none tracking-[0.14em] sm:text-[30px]">
            {PROMO.code}
          </span>
          <Icon
            name={copied ? "check" : "copy"}
            size={22}
            className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
          />
        </button>
        <p
          aria-live="polite"
          className="mt-1.5 h-4 text-[11px] leading-4 font-semibold text-gold sm:mt-2 sm:text-[12px]"
        >
          {copied ? `${PROMO.copied}${PROMO.code}` : ""}
        </p>

        <p className="mt-1 text-[11.5px] leading-[16px] font-normal text-white/55 sm:mt-1.5 sm:text-[12.5px] sm:leading-[18px]">
          {PROMO.terms}
        </p>
      </div>
    </div>
  );
}
