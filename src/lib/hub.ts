/**
 * The model behind a **menu-group hub** — a page for one column of the Services
 * mega-menu, listing the services under it.
 *
 * Two of these exist: `/repairs` and `/car-interior-cleaning`. Neither has an
 * entry in `pages.json`, because neither exists on the live site; the client
 * asked for them — "a page for /Repairs will need to be created, which will
 * have links that go to its childs… since repairs is a master page, it would
 * follow a similar layout to the other master pages" (2026-09-15), then "one
 * more master page to create, with links on the master page going to its
 * childs" against the Interior Cleaning column (2026-09-16).
 *
 * **Almost every word on one is read back out of the pages it links to.** Rule
 * 8.1 forbids writing copy to fill a page, so nothing here is authored: the
 * names come from the client's own menu, the blurbs are each page's own opening
 * paragraph, the prices are each page's own price ladder, the reasons and the
 * questions are sections those pages already carry, and the photographs are
 * the ones they already run. Add a service to a menu group and it appears on
 * that group's hub with its own copy; change a price on a service page and the
 * hub follows.
 *
 * The client also set the pricing rule: "if there are prices on those 4 sub
 * pages, then those prices can go onto the master page /repairs. If there are
 * no prices, then yeah then there would be a contact us or qoute button."
 * `HubCard.priceFrom` is therefore optional and the card falls back to the
 * quote button — two of the four repairs quote nothing, and four of the nine
 * interior services.
 *
 * `lib/hubs.ts` holds the two specs; this file is the machinery.
 */

import { asFeatures, type Feature } from "@/components/blocks-groups";
import { type Block, getPage, heroImageFor, type Page } from "@/lib/blocks";
import { entryPrice } from "@/lib/service-frame";
import { NAV, type NavItem } from "@/lib/site";

/** What one hub needs to know about itself. `lib/hubs.ts` writes these. */
export type HubSpec = {
  /** Route, without slashes either side. */
  slug: string;
  /** The h1, and the name the section heads are built from. */
  title: string;
  /** The Services mega-menu column this hub is the head of. */
  menuLabel: string;
  /** The photograph behind the header, borrowed from a page it links to. */
  heroImage: string;
  /** The photograph beside the reasons, likewise. */
  whyImage: string;
  /**
   * Where the "Why Choose Medusa Auto Detailing?" reasons come from. Every one
   * of these pages opens that list with a claim about its own service — "Your
   * Local Spray Paint Removal Experts" — which on a hub covering the whole
   * group would be wrong, so `dropLead` skips it. Nothing else is touched.
   */
  why: { slug: string; heading: string; dropLead: number };
  /**
   * Questions to fall back on when no page in the group carries an `faq` block
   * at all: a slug and one of that page's own question-shaped headings, whose
   * answer is the prose written under it. `/repairs` needs this; the interior
   * group has real FAQs and ignores it.
   */
  questionHeadings?: ReadonlyArray<readonly [slug: string, heading: string]>;
  /** A card photograph the page's own metadata does not give up. */
  cardImages?: Readonly<Record<string, string>>;
  /** Grid classes for the card row — a group of four wants different ones
   *  from a group of nine. */
  cardCols: string;
};

export type HubCard = {
  /** The page's slug, without slashes either side. */
  slug: string;
  /** Its menu label — the name the client gives it. */
  name: string;
  href: string;
  /** Its own opening paragraph, as HTML. */
  blurbHtml: string;
  /** Its entry price, where the page quotes one at all. */
  priceFrom?: string;
  image?: string;
};

/** Every block on a page, columns recursed into, in document order. */
function flatten(blocks: Block[], into: Block[] = []): Block[] {
  for (const b of blocks) {
    if (b.type === "columns") b.cols.forEach((c) => flatten(c, into));
    else into.push(b);
  }
  return into;
}

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

/**
 * The paragraph that introduces a page.
 *
 * Not simply the first one. `/repairs/paint-overspray-removal` opens on a
 * single line of phone number — "If you have paint spillage in your car, call
 * us immediately at +442033556435" — which is a call to action, not a
 * description, and as a card blurb it told the reader nothing about the
 * service. So: the first paragraph long enough to be prose and not built
 * around a `tel:` link. That lands on the right one for all four.
 */
function blurbOf(page: Page): string | undefined {
  for (const b of flatten(page.sections.flatMap((s) => s.blocks))) {
    if (b.type !== "paragraph") continue;
    if (/href="tel:/i.test(b.html)) continue;
    if (plain(b.html).length < 90) continue;
    return b.html;
  }
  return undefined;
}

/**
 * The price a card leads with.
 *
 * `entryPrice` rather than the cheapest number on the page: it takes the
 * minimum of the *first* section that quotes two or more prices — the package
 * ladder — and stops at the add-ons heading. Taking the page-wide minimum
 * instead advertised `/car-interior-cleaning/premium-interior-wash` from £15,
 * which is the price of an add-on, not of the wash. Whitespace is normalised
 * because one page writes its as "£ 100"; the figure is untouched.
 */
const priceOf = (page: Page) => entryPrice(page.sections)?.replace(/\s+/g, "");

/** One column of the Services mega-menu. */
function menuGroup(spec: HubSpec): NavItem[] {
  const services = NAV.find((i) => i.label === "Services")?.children ?? [];
  const group = services.find((c) => c.label === spec.menuLabel);
  if (!group?.children?.length) {
    throw new Error(`${spec.slug}: no "${spec.menuLabel}" group in NAV`);
  }
  return group.children;
}

/**
 * One card per service in the menu group, in the menu's order.
 *
 * Throws rather than skipping: a child in the menu with no page behind it is
 * a link this hub would advertise and the site would 404 on, and that is worth
 * failing the build for.
 */
export function hubCards(spec: HubSpec): HubCard[] {
  return menuGroup(spec).map((item) => {
    const slug = (item.href ?? "").replace(/^\/+|\/+$/g, "");
    const page = slug ? getPage(slug) : undefined;
    if (!page) throw new Error(`${spec.slug}: no page for "${item.label}" (${item.href})`);

    const blurbHtml = blurbOf(page);
    if (!blurbHtml) throw new Error(`${spec.slug}: no opening paragraph on /${slug}`);

    return {
      slug,
      name: item.label,
      href: item.href!,
      blurbHtml,
      priceFrom: priceOf(page),
      image: spec.cardImages?.[slug] ?? heroImageFor(page),
    };
  });
}

/* ── Questions ────────────────────────────────────────────────────────── */

export type HubQuestion = {
  q: string;
  /** The answer, as the source wrote it: HTML paragraphs or list items. */
  a: string[];
  /** The page it came from, so the reader can go and read the rest. */
  href: string;
  name: string;
};

/** Heading text with the source's entities decoded, for comparison. */
const headingText = (b: Block) =>
  b.type === "heading"
    ? b.text
        .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ")
        .trim()
    : "";

/**
 * The run of prose under a heading: every paragraph and list item up to the
 * next heading. Stops at six so one long answer — the graffiti page lists six
 * removal methods — cannot fill the whole accordion.
 */
function answerAfter(blocks: Block[], at: number): string[] {
  const out: string[] = [];
  for (let i = at + 1; i < blocks.length && out.length < 6; i++) {
    const b = blocks[i];
    if (b.type === "heading") break;
    if (b.type === "paragraph") out.push(b.html);
    else if (b.type === "list") out.push(...b.items);
    else break;
  }
  return out;
}

/** How many questions a hub shows, and how many any one page may contribute. */
const MAX_QUESTIONS = 8;
const MAX_PER_PAGE = 3;

/**
 * The questions the group's own pages already answer.
 *
 * Real `faq` blocks first, where the group has them: the interior pages carry
 * twenty-one between `interior-valet`, `premium-interior-wash` and
 * `mould-removal`, and those are questions the site wrote as questions. Capped
 * per page so one long FAQ cannot fill the accordion on its own, and taken in
 * the menu's order so the spread follows the cards above.
 *
 * `/repairs` has none — not in `pages.json`, not in the mirror, not on the live
 * site — so it falls back to `questionHeadings`: its pages' own question-shaped
 * headings with the prose written under them. Either way the accordion is the
 * site's own copy re-laid-out, never new copy, which is the same thing `Steps`
 * and `FeatureCards` do to a run of blocks elsewhere. A written FAQ from the
 * client replaces whichever of the two a hub is using.
 */
export function hubQuestions(spec: HubSpec): HubQuestion[] {
  const cards = hubCards(spec);
  const named = new Map(cards.map((c) => [c.slug, c]));
  const of = (slug: string) => named.get(slug);

  const out: HubQuestion[] = [];
  for (const card of cards) {
    if (out.length >= MAX_QUESTIONS) break;
    const page = getPage(card.slug);
    if (!page) continue;
    const items = flatten(page.sections.flatMap((s) => s.blocks))
      .filter((b) => b.type === "faq")
      .flatMap((b) => b.items)
      .slice(0, MAX_PER_PAGE);
    for (const item of items) {
      if (out.length >= MAX_QUESTIONS) break;
      out.push({ q: item.q, a: item.a, href: card.href, name: card.name });
    }
  }
  if (out.length) return out;

  return (spec.questionHeadings ?? []).map(([slug, heading]) => {
    const page = getPage(slug);
    if (!page) throw new Error(`${spec.slug}: no page at /${slug}`);
    const blocks = flatten(page.sections.flatMap((s) => s.blocks));

    const at = blocks.findIndex((b) => headingText(b) === heading);
    if (at === -1) throw new Error(`${spec.slug}: /${slug} no longer has "${heading}"`);

    const a = answerAfter(blocks, at);
    if (!a.length) throw new Error(`${spec.slug}: nothing under "${heading}" on /${slug}`);

    const card = of(slug);
    return { q: heading, a, href: card?.href ?? `/${slug}/`, name: card?.name ?? slug };
  });
}

/* ── Why choose us ────────────────────────────────────────────────────── */

/**
 * Nearly every service page closes on the same section — "Why Choose Medusa
 * Auto Detailing?" over a labelled list — and `spec.why` names the one this
 * hub borrows. Its lead item always claims one service ("Your Local Spray
 * Paint Removal Experts") and is skipped; nothing else is touched.
 *
 * Not the homepage's `WHY`, which is what `components/sections/WhyChoose`
 * renders: the client asked for this section specifically so that a hub would
 * not repeat the homepage.
 */
export function hubReasons(spec: HubSpec): { heading: string; items: Feature[] } {
  const page = getPage(spec.why.slug);
  if (!page) throw new Error(`${spec.slug}: no page at /${spec.why.slug}`);
  const blocks = flatten(page.sections.flatMap((s) => s.blocks));

  const at = blocks.findIndex((b) => headingText(b) === spec.why.heading);
  if (at === -1) {
    throw new Error(`${spec.slug}: /${spec.why.slug} no longer has "${spec.why.heading}"`);
  }

  const list = blocks.slice(at + 1, at + 5).find((b) => b.type === "list");
  if (list?.type !== "list") throw new Error(`${spec.slug}: no reasons under "${spec.why.heading}"`);

  const items = asFeatures(list)?.slice(spec.why.dropLead);
  if (!items?.length) throw new Error(`${spec.slug}: the reasons no longer parse as label + text`);
  return { heading: spec.why.heading, items };
}

/* ── Coverage ─────────────────────────────────────────────────────────── */

/** The regions named in a "… Near You" paragraph, in the order written. */
const REGION =
  /North West London|South West London|South East London|North East London|Central London|Greater London|North London|South London|East London|West London|Hertfordshire/g;

/**
 * Where the group's services are offered.
 *
 * These pages close on a "… Near You" paragraph naming the same regions, so a
 * hub can state the coverage without picking a side. The regions are read out
 * of those paragraphs rather than listed here, and they are shown as plain
 * chips: the source names regions, not the districts the wash and valeting
 * pages link to, so there is nothing to link them to that the source itself
 * points at.
 */
export function hubAreas(spec: HubSpec): string[] {
  const seen = new Set<string>();
  for (const { slug } of hubCards(spec)) {
    const page = getPage(slug);
    if (!page) continue;
    const blocks = flatten(page.sections.flatMap((s) => s.blocks));
    const at = blocks.findIndex((b) => /near you\s*$/i.test(headingText(b)));
    if (at === -1) continue;
    const p = blocks[at + 1];
    if (p?.type !== "paragraph") continue;
    for (const m of p.html.matchAll(REGION)) seen.add(m[0]);
  }
  if (seen.size < 4) {
    throw new Error(`${spec.slug}: only ${seen.size} regions found across the group`);
  }
  return [...seen];
}
