import Image from "next/image";
import Link from "next/link";
import { Sections } from "@/components/Blocks";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import type { Page, Section } from "@/lib/blocks";
import {
  parseLocationPage,
  placeName,
  siblings,
  stepPairs,
} from "@/lib/location-frame";

/**
 * The frame the 146 location pages share.
 *
 * Layout only. Every word on these pages is the page's own — the frame writes
 * no headings, no ledes and no calls to action of its own, because the source
 * pages carry none beyond what is already in `pages.json`.
 *
 * The one thing it puts on the page that the mirror does not hold is the list
 * under "Our Other Locations": on the live site that heading is followed by an
 * unrendered `[page-generator-pro-related-links …]` shortcode, so the links it
 * was meant to print are missing. They are links to pages of this same site,
 * not new copy.
 *
 * `lib/location-frame.ts` decides what the frame takes and what the body
 * keeps; no copy is rewritten either side of that line.
 */
export default function LocationPage({ page }: { page: Page }) {
  const model = parseLocationPage(page);
  const place = placeName(page.slug);
  const others = siblings(page.slug);

  return (
    <main className="flex-1">
      <Hero page={page} model={model} />

      {model.areas.length > 0 && (
        <Chips
          title="Service Areas"
          items={model.areas.map((a) => ({ href: a.href, label: a.label }))}
        />
      )}

      {model.neighbourhoods && (
        <Chips title={model.neighbourhoods.heading} items={model.neighbourhoods.items} />
      )}

      {model.sights && <Sights sights={model.sights} />}

      {model.body.length > 0 && (
        <Sections
          sections={model.body}
          slug={page.slug}
          pageH1={page.h1}
          h1Taken
          opensPage={false}
          /*
            No gold bands. The block renderer marks any row holding add-on
            cards, which on these pages is the valeting and detailing price
            row — and the source renders those dark. The bands are a service-
            page device; a location page never had one.
          */
          bands="none"
        />
      )}

      {model.steps && <Steps section={model.steps} />}
      {model.club && <Club section={model.club} />}
      {/* Source order on every one of these pages: questions, then the map. */}
      {model.faqSection && <Faq section={model.faqSection} />}
      {model.map && <Map map={model.map} place={place} />}

      {model.hasRelated && others.length > 0 && <Others others={others} />}
    </main>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────
   The borough hubs open on a background video; the service-in-a-place pages
   open on flat black. Both get the livery band, the gold light source and the
   diagonal every other header on the site cuts. */

function Hero({
  page,
  model,
}: {
  page: Page;
  model: ReturnType<typeof parseLocationPage>;
}) {
  const hasVideo = Boolean(model.video);

  return (
    <section
      className={`cut-bottom relative flex w-full items-center overflow-hidden pt-[150px] pb-[calc(var(--cut)+3.5rem)] lg:min-h-[620px] lg:pt-[200px] ${
        hasVideo ? "" : "bg-ink-panel"
      }`}
    >
      {model.video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          poster={model.video.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src={model.video.src} type="video/mp4" />
        </video>
      ) : (
        <div aria-hidden className="livery absolute inset-0 opacity-70" />
      )}

      <div
        aria-hidden
        className={`absolute inset-0 ${hasVideo ? "bg-black/[0.74]" : ""}`}
        style={
          hasVideo
            ? undefined
            : {
                background:
                  "radial-gradient(70% 62% at 80% 36%, rgba(237,179,38,0.18) 0%, rgba(193,146,49,0.05) 46%, transparent 76%)",
              }
        }
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),transparent)]"
      />

      <div className="shell relative z-10">
        <Reveal>
          <span className="hero-rule speed-rule" aria-hidden />
        </Reveal>

        <Reveal delay={1}>
          <h1 className="mt-7 max-w-[18ch] text-[clamp(30px,4.7vw,52px)] leading-[1.02] text-white">
            {page.h1}
          </h1>
        </Reveal>

        {model.introHtml.map((html, i) => (
          <Reveal key={i} delay={2 + i}>
            <p
              className="mt-5 max-w-[64ch] text-[16px] leading-[27px] font-normal text-white/80 [&_a]:text-gold [&_strong]:font-semibold [&_strong]:text-white lg:text-[16.5px]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </Reveal>
        ))}

        {model.ticks.length > 0 && (
          <Reveal delay={4}>
            <ul className="mt-8 grid max-w-[900px] gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {model.ticks.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2.5 text-[14.5px] leading-[22px] font-semibold text-white"
                >
                  <Icon
                    name="check"
                    size={17}
                    strokeWidth={2.4}
                    className="mt-[2px] shrink-0 text-gold"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {/* The page's own buttons only — these pages carry four, or none. */}
        {model.buttons.length > 0 && (
          <Reveal delay={5}>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
              {model.buttons.map((b, i) => (
                <a
                  key={b.label + i}
                  href={b.href}
                  className={`btn w-full rounded-full sm:w-auto ${
                    i === 0 ? "btn-gold text-[15px]" : "btn-outline"
                  }`}
                >
                  {b.label}
                </a>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ── Place lists ──────────────────────────────────────────────────────────
   Coverage and neighbourhoods arrive as `<br>`-joined links and one long
   comma-separated line. Both are lists; as chips they can be scanned. */

function Chips({
  title,
  items,
}: {
  title: string;
  items: { href?: string; label: string }[];
}) {
  return (
    <section className="w-full border-b border-white/[0.07] py-12 lg:py-16">
      <div className="shell grid gap-6 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <Reveal>
            <span aria-hidden className="speed-rule speed-rule-sm" />
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight text-white uppercase lg:text-[23px]">
              {title}
            </h2>
          </Reveal>
        </div>
        <div className="lg:col-span-8">
          <Reveal delay={1}>
            <ul className="flex flex-wrap gap-2">
              {items.map((c, i) => (
                <li key={c.label + i}>
                  {c.href ? (
                    /* The neighbourhood chips point at Google Maps, so an
                       off-site href gets a plain anchor and a new tab. */
                    c.href.startsWith("http") ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-full bg-white/[0.05] px-4 py-2 text-[14px] font-normal text-white/80 ring-1 ring-white/10 transition-colors hover:bg-gold hover:text-ink hover:ring-gold"
                      >
                        {c.label}
                      </a>
                    ) : (
                      <Link
                        href={c.href}
                        className="inline-flex rounded-full bg-white/[0.05] px-4 py-2 text-[14px] font-normal text-white/80 ring-1 ring-white/10 transition-colors hover:bg-gold hover:text-ink hover:ring-gold"
                      >
                        {c.label}
                      </Link>
                    )
                  ) : (
                    <span className="inline-flex rounded-full px-4 py-2 text-[14px] font-normal text-white/70 ring-1 ring-white/10">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Top sights ───────────────────────────────────────────────────────────
   Nine 324px photographs, each followed by its caption. Stacked as the source
   leaves them that is a 3,000px column of pictures with a line under each. */

function Sights({
  sights,
}: {
  sights: NonNullable<ReturnType<typeof parseLocationPage>["sights"]>;
}) {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={sights.heading} />
        <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sights.items.map((s, i) => (
            <Reveal
              as="li"
              key={(s.caption ?? s.src) + i}
              delay={Math.min(i, 5)}
              className="group surface relative overflow-hidden"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,rgba(0,0,0,0.9),transparent)]"
                />
              </div>
              {s.caption && (
                <p className="absolute inset-x-0 bottom-0 p-5 text-[15.5px] leading-[22px] font-semibold text-white">
                  {s.caption}
                </p>
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────────────────
   Four "Step n" headings and their instructions, on a rail. */

export function Steps({ section }: { section: Section }) {
  const cols = section.blocks.find((b) => b.type === "columns");
  const cells = cols?.type === "columns" ? cols.cols : [section.blocks];
  const copy = cells[0] ?? [];
  const art = cells[1]?.find((b) => b.type === "image");

  const heading = copy.find((b) => b.type === "heading" && b.level <= 2);
  const lede = copy.find((b) => b.type === "heading" && b.level === 5);
  const cta = copy.find((b) => b.type === "button");

  const steps = stepPairs(section);
  if (!steps.length) return null;

  return (
    <section className="bg-gold-wash w-full py-16 lg:py-[104px]">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          {heading?.type === "heading" && (
            <SectionHead
              title={heading.text}
              lede={lede?.type === "heading" ? lede.text : undefined}
              tone="gold"
            />
          )}

          <ol className="relative mt-11">
            <span
              aria-hidden
              className="absolute top-2 bottom-10 left-[23px] w-px bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45),rgba(0,0,0,0.08))]"
            />
            {steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.label + i}
                delay={i}
                className="relative flex gap-5 pb-8 last:pb-0 sm:gap-6"
              >
                <span className="relative z-10 flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-full bg-ink font-[family-name:var(--font-sub)] text-[16px] text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-2">
                  <p className="font-[family-name:var(--font-sub)] text-[15px] tracking-[0.06em] text-ink/60 uppercase">
                    {step.label}
                  </p>
                  <p className="mt-1 max-w-[46ch] text-[16.5px] leading-[26px] font-semibold text-ink">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          {cta?.type === "button" && (
            <Reveal delay={4}>
              <a href={cta.href} className="btn btn-dark mt-9 rounded-full text-[15px]">
                {cta.label}
                <Icon name="arrow" size={18} className="ml-2.5" />
              </a>
            </Reveal>
          )}
        </div>

        {art?.type === "image" && (
          <Reveal delay={2} className="lg:col-span-5 lg:justify-self-end">
            <Image
              src={art.src}
              alt={art.alt}
              width={art.w ?? 600}
              height={art.h ?? 600}
              unoptimized
              sizes="(min-width: 1024px) 420px, 70vw"
              className="mx-auto h-auto w-full max-w-[380px]"
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ── The club ─────────────────────────────────────────────────────────────
   The page's own subscription pitch. `components/sections/Club` carries the
   homepage's wording for the same offer, which is not this page's. */

export function Club({ section }: { section: Section }) {
  const title = section.blocks.find((b) => b.type === "heading" && b.level <= 2);
  const kicker = section.blocks.find((b) => b.type === "heading" && b.level === 3);
  const body = section.blocks.find((b) => b.type === "paragraph");
  const cta = section.blocks.find((b) => b.type === "button");

  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-[104px]">
      {section.bg?.image && (
        <Image src={section.bg.image} alt="" fill sizes="100vw" className="object-cover" />
      )}
      <div aria-hidden className="absolute inset-0 bg-black/[0.82]" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 80% at 78% 50%, rgba(193,146,49,0.20) 0%, transparent 70%)",
        }}
      />

      <div className="shell relative grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          {title?.type === "heading" && <SectionHead title={title.text} />}
        </div>
        <div className="lg:col-span-7">
          {kicker?.type === "heading" && (
            <Reveal>
              <p className="font-[family-name:var(--font-sub)] text-[19px] leading-[1.3] text-gold uppercase lg:text-[21px]">
                {kicker.text}
              </p>
            </Reveal>
          )}
          {body?.type === "paragraph" && (
            <Reveal delay={1}>
              <p
                className="mt-6 max-w-[70ch] text-[16px] leading-[28px] font-normal text-body"
                dangerouslySetInnerHTML={{ __html: body.html }}
              />
            </Reveal>
          )}
          {cta?.type === "button" && (
            <Reveal delay={2}>
              <Link href={cta.href} className="btn btn-gold mt-9 rounded-full text-[15px]">
                {cta.label}
                <Icon name="arrow" size={18} className="ml-2.5" />
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Map ──────────────────────────────────────────────────────────────── */

function Map({
  map,
  place,
}: {
  map: NonNullable<ReturnType<typeof parseLocationPage>["map"]>;
  place: string;
}) {
  return (
    <section className="w-full border-t border-white/[0.07] py-14 lg:py-[88px]">
      <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <SectionHead title={map.heading} />
        </div>
        <Reveal delay={1} className="lg:col-span-8">
          <div className="overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
            <iframe
              src={map.embed.src}
              title={map.embed.title || place}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-full min-h-[340px] w-full border-0 lg:min-h-[420px]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Questions ────────────────────────────────────────────────────────────
   An accordion when the pairs survived extraction, and the answers as the
   page holds them when they did not — dropping them would be worse. */

function Faq({ section }: { section: Section }) {
  const items = section.blocks.flatMap((b) => (b.type === "faq" ? b.items : []));
  const heading = section.blocks[0];
  /*
    Everything the accordion did not take. On the pages whose question text
    the extractor dropped, the answers are loose paragraphs — and on the
    detailing pages one of them is a list of durations. Both have to render,
    or the frame quietly eats them.
  */
  const loose = section.blocks.filter(
    (b, i) => !(i === 0 && b.type === "heading") && b.type !== "faq",
  );

  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHead
            title={heading?.type === "heading" ? heading.text : "Frequently Asked Questions"}
          />
        </div>
        <div className="lg:col-span-7">
          {items.length > 0 ? (
            <FaqAccordion items={items} />
          ) : (
            <ul className="flex flex-col gap-3">
              {loose.map((b, i) => (
                <Reveal
                  as="li"
                  key={i}
                  delay={Math.min(i, 5)}
                  className="surface p-5 text-[15px] leading-[25px] font-normal text-body"
                >
                  {b.type === "paragraph" && (
                    <span dangerouslySetInnerHTML={{ __html: b.html }} />
                  )}
                  {b.type === "list" && (
                    <ul className="flex flex-col gap-2">
                      {b.items.map((item, j) => (
                        <li key={j} className="flex gap-2.5">
                          <Icon
                            name="check"
                            size={15}
                            strokeWidth={2.4}
                            className="mt-[5px] shrink-0 text-gold"
                          />
                          <span dangerouslySetInnerHTML={{ __html: item }} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {b.type === "heading" && (
                    <span className="font-semibold text-white">{b.text}</span>
                  )}
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Siblings ─────────────────────────────────────────────────────────────
   What "Our Other Locations" was meant to print. On the live site that
   heading is followed by a WordPress shortcode that never ran. */

function Others({ others }: { others: { slug: string; name: string }[] }) {
  return (
    <section className="w-full border-t border-white/[0.07] py-14 lg:py-[88px]">
      <div className="shell grid gap-6 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <Reveal>
            <span aria-hidden className="speed-rule speed-rule-sm" />
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight text-white uppercase lg:text-[23px]">
              Our Other Locations
            </h2>
          </Reveal>
        </div>
        <div className="lg:col-span-8">
          <Reveal delay={1}>
            <ul className="flex flex-wrap gap-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/${o.slug}`}
                    className="inline-flex rounded-full bg-white/[0.05] px-4 py-2 text-[14px] font-normal text-white/80 ring-1 ring-white/10 transition-colors hover:bg-gold hover:text-ink hover:ring-gold"
                  >
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
