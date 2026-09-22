import Image from "next/image";
import Link from "next/link";
import { bandAfter, Sections } from "@/components/Blocks";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import { LocationIndexSection } from "@/components/LocationIndex";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import type { Page, Section } from "@/lib/blocks";
import {
  foldableAreas,
  mapFor,
  parseLocationPage,
  placeName,
  siblingIndex,
  stepPairs,
  withAreaLinks,
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
  const others = siblingIndex(page.slug);

  /*
    "ini double, pake yg browser A-Z aja tapi judulnya pake yg areas we
    provides" — client, 2026-09-17. On the eighteen borough hubs that carry one,
    the "Service Areas" row is the same seventeen boroughs the index below it
    already lists, so the row's links join the index and the index takes its
    heading. No location page carries both that row and the "Our Other
    Locations" one, so folding can never cost a page a heading it had.
  */
  const folded =
    others && foldableAreas(model.areas)
      ? {
          heading: "Service Areas",
          items: withAreaLinks(others.items, model.areas, page.slug),
        }
      : null;
  const places = folded?.items ?? others?.items ?? [];
  const map = mapFor(page.slug, model.map);

  /*
    "How It works" is a gold band, and on fourteen of the nineteen borough
    hubs the body row above it is gold too — two gold bands together, which is
    the slab the alternation exists to prevent. Client, 2026-09-22: "pastikan
    warna bg tetap selang seling". So it asks the body where the rhythm got to
    instead of assuming.
  */
  const stepsGold = model.body.length > 0 ? bandAfter(model.body) : true;

  return (
    <main className="flex-1">
      <Hero page={page} model={model} />

      {model.areas.length > 0 && !folded && (
        <Chips
          title="Service Areas"
          items={model.areas.map((a) => ({ href: a.href, label: a.label }))}
        />
      )}

      {model.neighbourhoods && (
        <Chips title={model.neighbourhoods.heading} items={model.neighbourhoods.items} />
      )}

      {model.body.length > 0 && (
        <Sections
          sections={model.body}
          slug={page.slug}
          pageH1={page.h1}
          h1Taken
          opensPage={false}
          /*
            Black, gold, black, at the client's request. This used to be
            "none" because the content rule bands any row holding add-on
            cards, which on these pages is the valeting and detailing price
            row that the source renders dark. Alternating does not consult
            the content, so that misfire cannot happen.
          */
          bands="alternate"
        />
      )}

      {model.steps && <Steps section={model.steps} onGold={stepsGold} />}
      {model.club && <Club section={model.club} />}
      {/* Source order on every one of these pages: questions, then the map. */}
      {model.faqSection && <Faq section={model.faqSection} />}

      {/*
        The map, on every location page, in the source's own position — after
        the questions and before the neighbours.

        Taken off on 2026-09-17 ("hapus map jika sudah ada widget browser
        locationnya") and put back on all 195 the next day, against
        `/mobile-car-wash-in-hounslow/`: "bisa gak tambahin map locationnya
        untuk semua location pages saja, tapi sesuain titiknya". `mapFor` is
        where the point comes from — the page's own embed, a sibling's for the
        same place, or the place and the country, in that order.
      */}
      {map && <Map map={map} place={place} />}

      {/*
        The sibling index — the client's navigational widget applied "ke yg
        lain juga yg ada lokasi" (2026-09-17). A family runs to seventy-odd
        places, which as a flat row of chips was a wall you had to read rather
        than a list you could use.

        The heading is the source's own on the 163 pages that carry the dead
        `[page-generator-pro-related-links …]` row — 114 off the mirror and the
        49 built ones, which `lib/planned-locations.ts` gives the same closing
        heading. The other 32 mirror pages never had it, and until now offered
        no way across to a neighbouring place at all; those get the control's
        own label instead of borrowing a heading the page does not have.
      */}
      {others && (
        <LocationIndexSection
          heading={folded?.heading ?? (model.hasRelated ? "Our Other Locations" : undefined)}
          title={others.title}
          locations={places}
        />
      )}

      {/*
        The place's own photographs — the page's last band, under everything
        else and against the footer.

        Client, 2026-09-21, against `/our-locations/buckinghamshire/`: "can
        you please move this top sight section to the bottom of every
        our-locations/* page", then, of a first pass that put it above the
        index: "Section Top Sight harus muncul setelah semua section/konten
        lainnya dan tepat sebelum footer". So it is after the index too — the
        one row that now sits below the navigational widget, which the client
        had asked on 2026-09-17 to keep "at the very bottom of the page".

        It stood third on the eighteen borough hubs that carry one: nine
        museums, palaces and markets between the page's opening sentence and
        every package it sells. Nothing about the row itself changed in the
        move — same photographs, same captions, same grid.
      */}
      {model.sights && <Sights sights={model.sights} />}
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
  /* A photograph is framed like the video: filling the band under the same
     dark wash, so the white type over it keeps its contrast. */
  const photo = !hasVideo ? model.heroImage : undefined;
  const painted = hasVideo || Boolean(photo);

  return (
    <section
      className={`cut-bottom relative flex w-full items-center overflow-hidden pt-[150px] pb-[calc(var(--cut)+3.5rem)] lg:min-h-[620px] lg:pt-[200px] ${
        painted ? "" : "bg-ink-panel"
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
      ) : photo ? (
        <Image
          src={photo.src}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      ) : (
        <div aria-hidden className="livery absolute inset-0 opacity-70" />
      )}

      <div
        aria-hidden
        className={`absolute inset-0 ${painted ? "bg-black/[0.74]" : ""}`}
        style={
          painted
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
    <section className="w-full border-b border-white/[0.07] py-16 lg:py-[104px]">
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
   leaves them that is a 3,000px column of pictures with a line under each.

   The hairline is the one the chips row above used to lend it: closing the
   page it follows the A–Z index, which rules its own top and not its foot. */

function Sights({
  sights,
}: {
  sights: NonNullable<ReturnType<typeof parseLocationPage>["sights"]>;
}) {
  return (
    <section className="w-full border-t border-white/[0.07] py-16 lg:py-[104px]">
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

export function Steps({
  section,
  onGold = true,
}: {
  section: Section;
  /**
   * Gold unless the row above it already is. Client, 2026-09-22: "pastikan
   * warna bg tetap selang seling" — on fourteen of the nineteen borough hubs
   * this row followed a gold body row, and two gold bands together are the
   * slab the alternation exists to prevent.
   */
  onGold?: boolean;
}) {
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
    <section
      className={`w-full py-16 lg:py-[104px] ${
        onGold ? "bg-gold-wash" : "border-t border-white/[0.07]"
      }`}
    >
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          {heading?.type === "heading" && (
            <SectionHead
              title={heading.text}
              lede={lede?.type === "heading" ? lede.text : undefined}
              tone={onGold ? "gold" : undefined}
            />
          )}

          <ol className="relative mt-11">
            <span
              aria-hidden
              className={`absolute top-2 bottom-10 left-[23px] w-px ${
                onGold
                  ? "bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45),rgba(0,0,0,0.08))]"
                  : "bg-[linear-gradient(to_bottom,rgba(193,146,49,0.55),rgba(255,255,255,0.06))]"
              }`}
            />
            {steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.label + i}
                delay={i}
                className="relative flex gap-5 pb-8 last:pb-0 sm:gap-6"
              >
                <span
                  className={`relative z-10 flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-sub)] text-[16px] text-gold ${
                    onGold ? "bg-ink" : "bg-ink-panel ring-1 ring-gold/40"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-2">
                  <p
                    className={`font-[family-name:var(--font-sub)] text-[15px] tracking-[0.06em] uppercase ${
                      onGold ? "text-ink/60" : "text-white/55"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`mt-1 max-w-[46ch] text-[16.5px] leading-[26px] font-semibold ${
                      onGold ? "text-ink" : "text-white"
                    }`}
                  >
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          {cta?.type === "button" && (
            <Reveal delay={4}>
              <a
                href={cta.href}
                className={`btn mt-9 rounded-full text-[15px] ${
                  onGold ? "btn-dark" : "btn-gold"
                }`}
              >
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
    <section className="w-full border-t border-white/[0.07] py-16 lg:py-[104px]">
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

