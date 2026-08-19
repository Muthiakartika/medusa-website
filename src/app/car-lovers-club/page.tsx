import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { type Block, getForms, getPage, heroImageFor, type Section } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";

/**
 * The Car Lovers Club, laid out rather than rendered.
 *
 * This is the only subscription page on the site and the densest one: two
 * products, three billing cadences each, and a four-rung vehicle-class ladder
 * inside every one of those six tiers — 138 blocks, all of it flat. Through
 * the ordinary renderer each tier came out as a heading, a subheading, five
 * loose paragraphs and then a price picker crammed into a 253px column, with
 * "Subscription Packages" printed twice and the product name demoted to an h4
 * above it.
 *
 * Every word and every price below is read from `pages.json` at build time —
 * nothing is transcribed, so nothing can drift. What the layout adds is the
 * structure the content already had: what is included, then what it costs, per
 * product, with each plan's ladder inside its own card.
 */

const SLUG = "car-lovers-club";

export function generateMetadata(): Metadata {
  const page = getPage(SLUG);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}/` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${SLUG}/`,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}

/* ── Reading the page ─────────────────────────────────────────────────── */

/** The source pads several cells with a zero-width space. */
const clean = (html: string) => html.replace(/​/g, "").trim();

/**
 * Plain text for somewhere React will escape it again. The entities have to go
 * here or they reach the page verbatim — one plan is priced "from £54 /
 * &nbsp;month".
 */
const text = (html: string) =>
  clean(html.replace(/<[^>]+>/g, " "))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#8217;|&rsquo;/gi, "’")
    .replace(/&#8211;|&ndash;/gi, "–")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
const hasText = (html: string) => text(html).length > 0;

const isIcon = (b: Block | undefined) => b?.type === "image" && Boolean(b.icon);
const isPrice = (b: Block | undefined) =>
  b?.type === "heading" && /^\s*£\s*[\d,]/.test(b.text);

type Rung = { label: string; note?: string; price: string };

type Tier = {
  name: string;
  cadence?: string;
  from?: string;
  billing?: string;
  features: string[];
  rungs: Rung[];
};

/** One "Whats included" group: a title, its list, and the photograph beside it. */
type Group = { title: string; items: string[]; image?: Extract<Block, { type: "image" }> };

type Product = {
  name: string;
  lede?: string;
  groups: Group[];
  tiers: Tier[];
  /**
   * The heading the source puts over the plans — "The Full Maintenance
   * Detail". It names the same product as `name` with a definite article, and
   * dropping it as a duplicate would lose a line the page actually carries.
   */
  tiersLabel?: string;
};

/**
 * One subscription column: the plan header, then the vehicle-class ladder.
 *
 * The two are told apart by the first decorative icon — everything before it
 * describes the plan, everything after is `icon → class → example cars →
 * price`, repeated four times.
 */
function tierOf(col: Block[]): Tier | null {
  const head = col.find((b) => b.type === "heading" && b.level === 4);
  if (head?.type !== "heading") return null;

  const ladder = col.findIndex(isIcon);
  const top = ladder === -1 ? col : col.slice(0, ladder);

  const cadence = top.find((b) => b.type === "heading" && b.level === 3);
  const paras = top.filter((b) => b.type === "paragraph" && hasText(b.html));

  const from = paras.find((b) => b.type === "paragraph" && /^\s*from\b/i.test(text(b.html)));
  const billing = paras.find((b) => b.type === "paragraph" && /billed/i.test(text(b.html)));

  const rungs: Rung[] = [];
  for (let i = ladder === -1 ? col.length : ladder; i < col.length; i++) {
    if (!isIcon(col[i])) continue;
    const label = col[i + 1];
    if (label?.type !== "heading") continue;
    const maybeNote = col[i + 2];
    const hasNote = maybeNote?.type === "paragraph" && !isPrice(maybeNote);
    const price = col[i + (hasNote ? 3 : 2)];
    if (!isPrice(price) || price.type !== "heading") continue;
    rungs.push({
      label: label.text,
      note: hasNote && maybeNote.type === "paragraph" ? text(maybeNote.html) : undefined,
      price: price.text.trim(),
    });
  }

  return {
    name: head.text,
    cadence: cadence?.type === "heading" ? cadence.text : undefined,
    from: from?.type === "paragraph" ? text(from.html) : undefined,
    billing: billing?.type === "paragraph" ? text(billing.html) : undefined,
    features: paras
      .filter((b) => b !== from && b !== billing)
      .map((b) => (b.type === "paragraph" ? clean(b.html) : ""))
      .filter(Boolean),
    rungs,
  };
}

/** A 6/6 row whose left cell is a heading and a list, and right cell a photo. */
function groupOf(block: Block): Group | null {
  if (block.type !== "columns") return null;
  const [left, right] = block.cols;
  const title = left?.find((b) => b.type === "heading");
  const list = left?.find((b) => b.type === "list");
  if (title?.type !== "heading" || list?.type !== "list") return null;
  const image = right?.find((b) => b.type === "image");
  return {
    title: clean(title.text),
    items: list.items.map((i) => clean(i)).filter(Boolean),
    image: image?.type === "image" ? image : undefined,
  };
}

/**
 * Pairs each product's "Whats included" section with the plans section that
 * follows it. The source alternates the two — includes, then packages — once
 * for the full detail and once for the exterior-only one.
 */
function products(sections: Section[]): Product[] {
  const out: Product[] = [];

  for (const section of sections) {
    const [first, second] = section.blocks;
    if (first?.type !== "heading" || first.level !== 4) continue;

    // A plans section: the product name, then "Subscription Packages".
    if (second?.type === "heading" && /subscription/i.test(second.text)) {
      const cols = section.blocks.find((b) => b.type === "columns");
      const tiers =
        cols?.type === "columns"
          ? cols.cols.map(tierOf).filter((t): t is Tier => Boolean(t))
          : [];
      // Attach to the product opened just above, or open one.
      const open = out.at(-1);
      if (open && !open.tiers.length) {
        open.tiers = tiers;
        open.tiersLabel = first.text;
      } else {
        out.push({ name: first.text, groups: [], tiers, tiersLabel: first.text });
      }
      continue;
    }

    // An includes section: the product name, a standfirst, then the groups.
    const groups = section.blocks.map(groupOf).filter((g): g is Group => Boolean(g));
    if (groups.length) {
      out.push({
        name: first.text,
        lede: second?.type === "heading" ? second.text : undefined,
        groups,
        tiers: [],
      });
    }
  }

  return out.filter((p) => p.groups.length || p.tiers.length);
}

/** The gold eligibility band — a title, a lead-in, and `<br>`-joined rules. */
function eligibility(sections: Section[]) {
  for (const section of sections) {
    const [title, lead] = section.blocks;
    if (title?.type !== "heading" || !/eligibility/i.test(title.text)) continue;
    const body = section.blocks.find((b) => b.type === "paragraph" && hasText(b.html));
    return {
      title: title.text,
      lead: lead?.type === "heading" ? lead.text : undefined,
      items:
        body?.type === "paragraph"
          ? body.html
              .split(/<br\s*\/?>/i)
              .map(text)
              .filter(Boolean)
          : [],
    };
  }
  return null;
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function ClubPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  const intro = page.sections[0].blocks
    .filter((b) => b.type === "paragraph" && hasText(b.html))
    .map((b) => (b.type === "paragraph" ? b.html : ""));

  const list = products(page.sections);
  const rules = eligibility(page.sections);
  const form = getForms(SLUG)[0];

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        <PageHero
          title={page.h1}
          introHtml={intro}
          image={heroImageFor(page)}
        />

        {list.map((product, i) => (
          <Product key={product.name + i} product={product} index={i} />
        ))}

        {rules && <Eligibility rules={rules} />}

        {form && (
          <section
            id="join"
            className="cut-top relative w-full overflow-hidden bg-ink-panel pt-[calc(var(--cut)+3.5rem)] pb-16 lg:pb-[104px]"
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 100% at 50% 0%, rgba(193,146,49,0.16) 0%, transparent 62%)",
              }}
            />
            {/* The source puts this form on the page under no heading of its
                own, so it gets none — one centred column rather than a
                two-column row with nothing in the other half. */}
            <div className="shell relative mx-auto max-w-[760px]">
              <span aria-hidden className="speed-rule mx-auto" />
              <div className="mt-8">
                <EnquiryForm
                  slug={SLUG}
                  index={0}
                  submitLabel={form.submitLabel}
                  fields={form.fields}
                />
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

/* ── One product ──────────────────────────────────────────────────────────
   What is included, then what it costs. The source runs those two apart, with
   the eligibility band and a second product between them on the full detail. */

function Product({ product, index }: { product: Product; index: number }) {
  return (
    <section className={`w-full py-16 lg:py-[104px] ${index % 2 ? "" : "bg-black"}`}>
      <div className="shell">
        <SectionHead title={product.name} lede={product.lede} />

        {product.groups.length > 0 && (
          <ul className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6">
            {product.groups.map((g, i) => (
              <Reveal as="li" key={g.title + i} delay={i} className="surface h-full overflow-hidden">
                {g.image && (
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={g.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(13,13,13,0.95),transparent)]"
                    />
                  </div>
                )}
                <div className="p-7">
                  <h3 className="font-[family-name:var(--font-sub)] text-[19px] leading-tight text-white uppercase">
                    {g.title}
                  </h3>
                  <ul className="mt-5 flex flex-col gap-3">
                    {g.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex gap-3 text-[15px] leading-[23px] font-normal text-body"
                      >
                        <Icon
                          name="check"
                          size={16}
                          strokeWidth={2.4}
                          className="mt-[3px] shrink-0 text-gold"
                        />
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ul>
        )}

        {product.tiers.length > 0 && (
          <>
            <Reveal>
              <div className="mt-16">
                {product.tiersLabel && (
                  <p className="font-[family-name:var(--font-ui)] text-[11px] tracking-[0.18em] text-gold uppercase">
                    {product.tiersLabel}
                  </p>
                )}
                <h3 className="mt-3 font-[family-name:var(--font-sub)] text-[20px] leading-tight text-white uppercase lg:text-[23px]">
                  Subscription Packages
                </h3>
              </div>
            </Reveal>
            <ul className="mt-7 grid items-start gap-5 lg:grid-cols-3 lg:gap-6">
              {product.tiers.map((tier, i) => (
                <TierCard key={tier.name + i} tier={tier} featured={i === 1} delay={i} />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

/**
 * One plan.
 *
 * The middle tier carries the gold. The source flags no favourite, but a
 * three-card row with nothing chosen reads as three prices to compare rather
 * than a recommendation — and fortnightly is the one that carries a gift card
 * without doubling the price.
 */
function TierCard({
  tier,
  featured,
  delay,
}: {
  tier: Tier;
  featured?: boolean;
  delay: number;
}) {
  return (
    <Reveal
      as="li"
      delay={delay}
      className={`flex h-full flex-col overflow-hidden rounded-[14px] ${
        featured
          ? "bg-gold-wash text-ink shadow-[0_28px_60px_-30px_rgba(193,146,49,0.75)] lg:-mt-4"
          : "surface"
      }`}
    >
      <div className="p-7 lg:p-8">
        <h4
          className={`font-[family-name:var(--font-sub)] text-[22px] leading-tight uppercase ${
            featured ? "text-ink" : "text-white"
          }`}
        >
          {tier.name}
        </h4>
        {tier.cadence && (
          <p
            className={`mt-1.5 text-[14px] leading-[21px] font-normal ${
              featured ? "text-ink/70" : "text-white/55"
            }`}
          >
            {tier.cadence}
          </p>
        )}

        {tier.from && (
          <p
            className={`mt-6 font-[family-name:var(--font-display)] text-[30px] leading-none lg:text-[34px] ${
              featured ? "text-ink" : "text-gold"
            }`}
          >
            {tier.from}
          </p>
        )}
        {tier.billing && (
          <p
            className={`mt-2.5 text-[13px] font-normal ${
              featured ? "text-ink/65" : "text-white/50"
            }`}
          >
            {tier.billing}
          </p>
        )}

        {tier.features.length > 0 && (
          <ul className="mt-6 flex flex-col gap-2.5">
            {tier.features.map((f, i) => (
              <li
                key={i}
                className={`flex gap-3 text-[14.5px] leading-[22px] font-normal ${
                  featured ? "text-ink/85" : "text-body"
                }`}
              >
                <Icon
                  name="check"
                  size={16}
                  strokeWidth={2.4}
                  className={`mt-[3px] shrink-0 ${featured ? "text-ink" : "text-gold"}`}
                />
                <span dangerouslySetInnerHTML={{ __html: f }} />
              </li>
            ))}
          </ul>
        )}

      </div>

      {tier.rungs.length > 0 && (
        <>
          <span
            aria-hidden
            className={`block h-px w-full ${featured ? "bg-ink/15" : "bg-white/10"}`}
          />
          {/*
            The ladder as rows rather than the four-across picker the generic
            renderer reaches for: this card is a third of a column, and four
            cells in it left 56px each for "MEDIUM CAR" and its price.
          */}
          <ul className="flex flex-col p-7 pt-5 lg:p-8 lg:pt-6">
            {tier.rungs.map((r, i) => (
              <li
                key={r.label + i}
                className={`flex items-baseline justify-between gap-4 border-t py-3 first:border-t-0 first:pt-0 ${
                  featured ? "border-ink/12" : "border-white/[0.07]"
                }`}
              >
                {/* The example cars stay on the page rather than hiding in a
                    tooltip — they are how a visitor picks their own row. */}
                <span className="min-w-0">
                  <span
                    className={`block text-[14.5px] leading-[21px] font-semibold ${
                      featured ? "text-ink" : "text-white"
                    }`}
                  >
                    {r.label}
                  </span>
                  {r.note && (
                    <span
                      className={`mt-0.5 block text-[12px] leading-[17px] font-normal ${
                        featured ? "text-ink/60" : "text-white/45"
                      }`}
                    >
                      {r.note}
                    </span>
                  )}
                </span>
                <span
                  className={`font-[family-name:var(--font-sub)] text-[16px] whitespace-nowrap tabular-nums ${
                    featured ? "text-ink" : "text-gold"
                  }`}
                >
                  {r.price}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Reveal>
  );
}

/* ── Eligibility ──────────────────────────────────────────────────────────
   The source's gold band. Three rules typed as one `<br>`-joined paragraph;
   split at the author's own breaks, they are three rules. */

function Eligibility({
  rules,
}: {
  rules: { title: string; lead?: string; items: string[] };
}) {
  return (
    <section className="bg-gold-wash w-full py-14 lg:py-[88px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHead title={rules.title} lede={rules.lead} tone="gold" />
        </div>
        <ul className="lg:col-span-7 lg:self-center">
          {rules.items.map((item, i) => (
            <Reveal
              as="li"
              key={i}
              delay={i}
              className="flex gap-3.5 border-t border-ink/15 py-4 first:border-t-0 first:pt-0"
            >
              <Icon name="check" size={19} strokeWidth={2.4} className="mt-[3px] shrink-0 text-ink" />
              <span className="text-[16px] leading-[25px] font-medium text-ink">{item}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
