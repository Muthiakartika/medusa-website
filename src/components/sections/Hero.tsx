"use client";

import { useState } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { HERO } from "@/lib/site";

/**
 * The site's one authored motion moment.
 *
 * The footage is already on screen when the page paints; what animates is the
 * black scrim retracting from 92% to 62% while the headline is wiped in along
 * the system slant. The car emerging from under the cover is the service
 * itself, so the entrance says what the business does before the copy does.
 */
export default function Hero() {
  const [lightbox, setLightbox] = useState(false);

  return (
    <section className="cut-bottom relative flex min-h-[760px] w-full items-end overflow-hidden pb-[calc(var(--cut)+3rem)] lg:min-h-[900px]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        poster={HERO.poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={HERO.video} type="video/mp4" />
      </video>

      {/* Retracting scrim. Starts at 0.62 so a no-JS render is still legible. */}
      <div className="hero-scrim absolute inset-0 bg-black opacity-[0.62]" />
      {/* Weights the lower-left corner where the copy sits. */}
      <div className="absolute inset-0 bg-[linear-gradient(75deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.5)_45%,transparent_78%)]" />

      <div className="relative z-10 w-full pt-[190px]">
        <div className="shell">
          <span className="hero-rule speed-rule" aria-hidden />

          <h1 className="mt-7 max-w-[15ch] text-[clamp(34px,6.4vw,68px)] leading-[0.96] text-white">
            {HERO.titleLines.map((line, i) => (
              <span
                key={line}
                className="hero-wipe block"
                style={{ "--i": i } as React.CSSProperties}
              >
                {line}
                {i < HERO.titleLines.length - 1 && " "}
              </span>
            ))}
          </h1>

          <div
            className="hero-wipe mt-8 max-w-[62ch]"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <p className="text-[16px] leading-[27px] font-normal text-white/85 lg:text-[17px]">
              {HERO.intro}
            </p>
          </div>

          <ul
            className="hero-wipe mt-7 flex flex-col gap-x-8 gap-y-2 sm:flex-row sm:flex-wrap"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            {HERO.ticks.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2.5 text-[14px] leading-[22px] font-semibold text-white"
              >
                <Icon name="check" size={17} className="shrink-0 text-gold" strokeWidth={2.4} />
                {t}
              </li>
            ))}
          </ul>

          {/*
            One column on a phone, one row from `sm` up. Stacked, the four
            buttons take the column's full width, which is the only way four
            labels of different lengths — "BOOK NOW" against "COMPARE OUR
            PACKAGES" — read as one set of choices rather than four sizes of
            button. Above `sm` they go back to sitting on their own content.
          */}
          <div
            className="hero-wipe mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            style={{ "--i": 5 } as React.CSSProperties}
          >
            <a
              href={HERO.buttons[0].href}
              className="btn btn-gold w-full text-[15px] sm:w-auto"
            >
              {HERO.buttons[0].label}
              <Icon name="arrow" size={18} className="ml-2.5" />
            </a>
            {HERO.buttons.slice(1).map((b) => (
              <a key={b.label} href={b.href} className="btn btn-outline w-full sm:w-auto">
                {b.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="group inline-flex items-center justify-center gap-3 text-white transition-colors hover:text-gold sm:ml-1 sm:justify-start"
            >
              <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full ring-2 ring-white/45 transition-all duration-300 group-hover:bg-gold group-hover:ring-gold">
                <Icon name="play" size={16} className="ml-[3px]" variant="solid" />
              </span>
              <span className="font-[family-name:var(--font-ui)] text-[13px] tracking-[0.08em] uppercase">
                Watch the film
              </span>
            </button>
          </div>

          {/* Proof, placed after the ask rather than above the headline. */}
          <ul
            className="hero-wipe mt-14 flex flex-col gap-x-10 gap-y-3 border-t border-white/15 pt-6 sm:flex-row sm:flex-wrap sm:items-center"
            style={{ "--i": 6 } as React.CSSProperties}
          >
            <li className="flex items-center gap-2.5">
              <span className="flex gap-[2px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="flex h-[18px] w-[18px] items-center justify-center bg-[#00b67a]"
                  >
                    <Icon name="star" size={12} className="text-white" variant="solid" />
                  </span>
                ))}
              </span>
              <span className="text-[13px] font-semibold text-white">
                Excellent on Trustpilot
              </span>
            </li>
            {HERO.proof.map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-2.5 text-[13px] font-normal text-white/70"
              >
                <Icon name={p.icon as IconName} size={16} className="shrink-0 text-gold" />
                {p.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Promotional video"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close video"
            className="absolute top-6 right-6 text-white transition-colors hover:text-gold"
          >
            <Icon name="close" size={30} />
          </button>
          <div
            className="aspect-video w-full max-w-[1000px]"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/aLaoqoHtoCE?autoplay=1"
              title="Medusa Auto Detailing"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
