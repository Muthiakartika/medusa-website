import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sections } from "@/components/Blocks";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import Portfolio from "@/components/sections/Portfolio";
import Testimonials from "@/components/sections/Testimonials";
import SectionHead from "@/components/SectionHead";
import { type Block, getPage, type Page, type Section } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";

/**
 * The locations index, laid out rather than rendered.
 *
 * The source page repeats its borough directory three times — once under
 * "Mobile Car Wash Popular Services", once under valeting and once under
 * detailing — with the same six zones and the same place names each time, and
 * only the link targets differing (`/mobile-car-wash-in-brent`,
 * `/mobile-car-valeting-in-brent`, `/mobile-car-detailing-in-brent`). Rendered
 * faithfully that is the same forty place names printed three times, ninety
 * links deep in a 378-block page, each list a `<br>`-separated paragraph.
 *
 * Here the three are read off the page and folded into one directory: a row
 * per place, with its three services as separate links. Every place name and
 * every href the source carried is still on the page and still points where it
 * pointed — they are said once instead of three times. The rest of the page is
 * passed through to the ordinary renderer untouched.
 */

const SLUG = "our-locations";

export function generateMetadata(): Metadata {
  const page = getPage(SLUG);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${SLUG}`,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}

/* ── Reading the directory off the page ──────────────────────────────── */

type Place = { name: string; links: { label: string; href: string }[] };
type Zone = { zone: string; places: Place[] };

/** Which service a `/mobile-car-…-in-<place>` href belongs to. */
const SERVICE_OF: [RegExp, string][] = [
  [/^\/mobile-car-wash-in-/, "Wash"],
  [/^\/mobile-car-valeting-in-/, "Valeting"],
  [/^\/mobile-car-detailing-in-/, "Detailing"],
];

const serviceName = (href: string) =>
  SERVICE_OF.find(([re]) => re.test(href))?.[1] ?? "Services";

/** Is this the columns block that follows a "Service Areas" heading? */
function areaGrid(blocks: Block[]): Extract<Block, { type: "columns" }> | null {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === "heading" && /^\s*service areas\s*$/i.test(b.text)) {
      const next = blocks[i + 1];
      if (next?.type === "columns") return next;
    }
    if (b.type === "columns") {
      for (const col of b.cols) {
        const found = areaGrid(col);
        if (found) return found;
      }
    }
  }
  return null;
}

/** Every `<a>` in a cell, as label + href, in document order. */
function links(html: string) {
  return [...html.matchAll(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({
    href: m[1],
    label: m[2].replace(/<[^>]+>/g, "").trim(),
  }));
}

/**
 * Folds the page's three copies of the directory into one.
 *
 * Zones and places keep the order the first copy listed them in; a place that
 * only one of the three copies carries still appears, with only the services
 * that actually link to it.
 */
function directory(page: Page): Zone[] {
  const zones = new Map<string, Map<string, Place>>();

  for (const section of page.sections) {
    const grid = areaGrid(section.blocks);
    if (!grid) continue;

    for (const col of grid.cols) {
      const head = col.find((b) => b.type === "heading");
      const body = col.find((b) => b.type === "paragraph");
      if (head?.type !== "heading" || body?.type !== "paragraph") continue;

      const places = zones.get(head.text) ?? new Map<string, Place>();
      zones.set(head.text, places);

      for (const link of links(body.html)) {
        const place = places.get(link.label) ?? { name: link.label, links: [] };
        places.set(link.label, place);
        if (!place.links.some((l) => l.href === link.href)) {
          place.links.push({ label: serviceName(link.href), href: link.href });
        }
      }
    }
  }

  return [...zones].map(([zone, places]) => ({ zone, places: [...places.values()] }));
}

/** The same section with its "Service Areas" heading and grid removed. */
function withoutAreas(section: Section): Section {
  const grid = areaGrid(section.blocks);
  if (!grid) return section;
  const blocks = section.blocks.filter(
    (b, i) =>
      b !== grid &&
      !(
        b.type === "heading" &&
        /^\s*service areas\s*$/i.test(b.text) &&
        section.blocks[i + 1] === grid
      ),
  );
  return { ...section, blocks };
}

/** Does any top-level heading in this section match? */
function hasHeading(section: Section, re: RegExp) {
  return section.blocks.some((b) => headingsOf(b).some((t) => re.test(t.trim())));
}

/** Every heading text in a block, columns included. */
function headingsOf(block: Block): string[] {
  if (block.type === "heading") return [block.text];
  if (block.type === "columns") return block.cols.flat().flatMap(headingsOf);
  return [];
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function LocationsPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  const zones = directory(page);
  const [hero, ...rest] = page.sections;
  /*
    The last four rows of this page are the homepage's, word for word: the
    three-step booking explainer, a "Portfolio" heading, the four Google
    reviews with their three rating badges, and the Car Lovers Club pitch.
    The reviews and their three rating badges are the same four quotes
    `lib/site.ts` already holds, so that row renders as the homepage's
    `Testimonials`. The "Portfolio" heading has nothing at all under it here —
    the source's gallery is a lazy-loaded carousel that left no images in the
    mirror — so it renders as the homepage's `Portfolio`, which fills it with
    the site's own photographs instead of leaving a heading over a blank.

    The steps and the club pitch are laid out below rather than reused: the
    club copy on this page is not the copy in `lib/site.ts`, and swapping one
    for the other would quietly rewrite the page.
  */
  const REUSED = /^(portfolio|what our clients say)$/i;
  const steps = rest.find((s) => hasHeading(s, /^how it works$/i));
  const club = rest.find((s) => hasHeading(s, /^the car lovers club$/i));
  const body = rest
    .filter((s) => s !== steps && s !== club && !hasHeading(s, REUSED))
    .map(withoutAreas)
    .filter((s) => s.blocks.length > 0);

  const intro = hero.blocks.find((b) => b.type === "paragraph");
  const buttons = hero.blocks.filter((b) => b.type === "button");
  const video = hero.blocks.find((b) => b.type === "video");

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        <section className="cut-bottom relative flex min-h-[620px] w-full items-end overflow-hidden pb-[calc(var(--cut)+3rem)] lg:min-h-[720px]">
          {video?.type === "video" && (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              poster={video.poster}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src={video.src} type="video/mp4" />
            </video>
          )}
          <div aria-hidden className="absolute inset-0 bg-black/[0.72]" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(75deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.55)_48%,transparent_82%)]"
          />

          <div className="relative z-10 w-full pt-[170px] lg:pt-[210px]">
            <div className="shell">
              <Reveal>
                <span className="hero-rule speed-rule" aria-hidden />
              </Reveal>
              <Reveal delay={1}>
                <h1 className="mt-7 max-w-[17ch] text-[clamp(30px,4.9vw,56px)] leading-[1.0] text-white">
                  {page.h1}
                </h1>
              </Reveal>
              {intro?.type === "paragraph" && (
                <Reveal delay={2}>
                  <p className="mt-6 max-w-[60ch] text-[16px] leading-[27px] font-normal text-white/80 lg:text-[17px]">
                    {intro.html.replace(/<[^>]+>/g, "")}
                  </p>
                </Reveal>
              )}
              <Reveal delay={3}>
                <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
                  {buttons.map((b, i) =>
                    b.type === "button" ? (
                      <a
                        key={b.label}
                        href={b.href}
                        className={`btn w-full rounded-full sm:w-auto ${
                          i === 0 ? "btn-gold text-[15px]" : "btn-outline"
                        }`}
                      >
                        {b.label}
                      </a>
                    ) : null,
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <Directory zones={zones} />

        {body.length > 0 && (
          <Sections
            sections={body}
            slug={SLUG}
            pageH1={page.h1}
            h1Taken
            opensPage={false}
          />
        )}

        {steps && <Steps section={steps} />}
        <Portfolio />
        <Testimonials />
        {club && <Club section={club} />}
      </main>
      <Footer />
    </>
  );
}

/* ── Directory ────────────────────────────────────────────────────────────
   Six zones, each a card; a place per row, with its wash, valeting and
   detailing pages as three separate targets rather than three separate
   copies of the same list further down the page. */

function Directory({ zones }: { zones: Zone[] }) {
  if (!zones.length) return null;

  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title="Service Areas" />

        <ul className="mt-12 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {zones.map((zone, i) => (
            <Reveal
              as="li"
              key={zone.zone}
              delay={Math.min(i, 5)}
              className="surface h-full p-7"
            >
              <h3 className="flex items-center gap-2.5 font-[family-name:var(--font-sub)] text-[19px] leading-tight text-white uppercase">
                <Icon name="pin" size={18} className="shrink-0 text-gold" />
                {zone.zone}
              </h3>

              <ul className="mt-5 flex flex-col">
                {zone.places.map((place) => (
                  <li
                    key={place.name}
                    className="border-t border-white/[0.07] py-3.5 first:border-t-0 first:pt-0"
                  >
                    <p className="text-[15px] leading-[22px] font-semibold text-white">
                      {place.name}
                    </p>
                    <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {place.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className="text-[13px] font-normal text-white/55 underline-offset-4 transition-colors hover:text-gold hover:underline"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────────────────
   The source writes its four booking steps as eight headings in a column —
   "Step 1" as an h4, the instruction under it as an h5, four times — on a flat
   gold slab beside an animated phone. Same words, on a rail, with the phone
   kept alongside. */

function Steps({ section }: { section: Section }) {
  const cols = section.blocks.find((b) => b.type === "columns");
  const cells = cols?.type === "columns" ? cols.cols : [section.blocks];
  const copy = cells[0] ?? [];
  const art = cells[1]?.find((b) => b.type === "image");

  const heading = copy.find((b) => b.type === "heading" && b.level <= 2);
  const lede = copy.find((b) => b.type === "heading" && b.level === 5);
  const cta = copy.find((b) => b.type === "button");

  // "Step n" (h4) followed by its instruction (h5), as the source pairs them.
  const steps: { label: string; body: string }[] = [];
  copy.forEach((b, i) => {
    const next = copy[i + 1];
    if (b.type === "heading" && b.level === 4 && next?.type === "heading") {
      steps.push({ label: b.text, body: next.text });
    }
  });

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
              <Reveal as="li" key={step.label} delay={i} className="relative flex gap-5 pb-8 last:pb-0 sm:gap-6">
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
   The page's own subscription pitch. `components/sections/Club` renders the
   homepage's wording for the same offer, which is not this page's, so this
   row keeps its own words and borrows only the treatment. */

function Club({ section }: { section: Section }) {
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
