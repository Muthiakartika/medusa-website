"use client";

import Image from "next/image";
import { useState } from "react";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { CONTACT, PORTFOLIO } from "@/lib/site";

/**
 * The work runs edge to edge, breaking the container. This is the one place on
 * the page where the photographs deserve the whole screen rather than a column
 * of it.
 */
export default function Portfolio() {
  const [expanded, setExpanded] = useState(false);
  const items = expanded ? PORTFOLIO : PORTFOLIO.slice(0, 8);

  return (
    <section className="w-full bg-black py-16 lg:py-[104px]">
      <div className="shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHead title="Portfolio" />
          <Reveal delay={2}>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="link-inline"
            >
              See more on Instagram
              <Icon name="arrow" size={16} />
            </a>
          </Reveal>
        </div>
      </div>

      {/*
        Inside the page grid, not edge to edge. The source images are 400px
        square; run full-bleed at four across they were painted at ~470px and
        visibly soft. Held to the shell and stepped to five columns on a wide
        screen, each tile lands under 300px and stays sharp.
      */}
      <div className="shell mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((src, i) => (
          <Reveal
            key={src}
            delay={i % 4}
            className="group relative aspect-square overflow-hidden rounded-[12px]"
          >
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              aria-label="View this work on Instagram"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 46vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
              />
              <span className="absolute inset-0 bg-gold/0 transition-colors duration-300 group-hover:bg-gold/20" />
            </a>
          </Reveal>
        ))}
      </div>

      {!expanded && PORTFOLIO.length > 8 && (
        <div className="shell mt-8">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="btn btn-outline rounded-full"
          >
            Show all {PORTFOLIO.length}
            <Icon name="plus" size={17} className="ml-2.5" />
          </button>
        </div>
      )}
    </section>
  );
}
