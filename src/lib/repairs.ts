/**
 * The model behind `/repairs`.
 *
 * Client, 2026-09-15: "a page for /Repairs will need to be created, which will
 * have links that go to its childs", and "since repairs is a master page, it
 * would follow a similar layout to the other master pages". So this is a hub
 * like `/car-detailing` — a title and one card per service.
 *
 * **Every word on it is read back out of the four pages it links to.** There is
 * no source page for `/repairs` to transcribe and rule 8.1 forbids writing new
 * copy to fill one, so nothing here is authored: the names come from the
 * client's own menu, the blurbs are each page's own opening paragraph, the
 * prices are each page's own price ladder, and the photograph is the one that
 * page already runs behind its header. Add a service to the Repairs &
 * Restoration menu and it appears here with its own copy; change a price on a
 * service page and this page follows.
 *
 * The client also set the pricing rule: "if there are prices on those 4 sub
 * pages, then those prices can go onto the master page /repairs. If there are
 * no prices, then yeah then there would be a contact us or qoute button."
 * Two of the four quote a price and two do not, so `RepairCard.priceFrom` is
 * optional and the card falls back to the quote button.
 */

import { type Block, getPage, heroImageFor, type Page } from "@/lib/blocks";
import { HEADLIGHT } from "@/lib/headlight";
import { NAV, type NavItem } from "@/lib/site";

/**
 * The photograph behind the header.
 *
 * The hub has no picture of its own, so it borrows one from a page it links
 * to: the technician sanding a body panel that `/repairs/paint-overspray-
 * removal` already runs. It is the only landscape file of header size among
 * the four — the graffiti page's is an 800px square Elementor thumbnail and
 * the headlight one is a 1200x1500 portrait — and it is the one that reads as
 * repair work rather than as cleaning.
 */
export const REPAIRS_HERO =
  "/assets/2025/02/polishing-the-surface-repairman-is-working-with-c-2024-02-28-19-11-55-utc-1.webp";

export type RepairCard = {
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

const PRICE_RE = /^\s*(?:from\s*)?£\s*([\d,]+(?:\.\d{2})?)/i;

/**
 * The cheapest price a page quotes, as the source wrote it.
 *
 * Only the headings, and only down to h5, because that is where these pages
 * put a price: engine bay steam cleaning quotes three vehicle sizes as h2s
 * under "From", and headlight restoration quotes a flat £100 as an h5. A page
 * that quotes nothing returns nothing and gets the quote button instead.
 */
function entryPrice(page: Page): string | undefined {
  const amounts: number[] = [];
  for (const b of flatten(page.sections.flatMap((s) => s.blocks))) {
    if (b.type !== "heading" || b.level > 5) continue;
    const m = b.text.match(PRICE_RE);
    if (m) amounts.push(Number(m[1].replace(/,/g, "")));
  }
  if (!amounts.length) return undefined;
  return `£${Math.min(...amounts)}`;
}

/** The "Repairs & Restoration" column of the Services mega-menu. */
function menuGroup(): NavItem[] {
  const services = NAV.find((i) => i.label === "Services")?.children ?? [];
  const group = services.find((c) => c.label === "Repairs & Restoration");
  if (!group?.children?.length) {
    throw new Error("repairs: no Repairs & Restoration group in NAV");
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
export function repairCards(): RepairCard[] {
  return menuGroup().map((item) => {
    const slug = (item.href ?? "").replace(/^\/+|\/+$/g, "");
    const page = slug ? getPage(slug) : undefined;
    if (!page) throw new Error(`repairs: no page for "${item.label}" (${item.href})`);

    const blurbHtml = blurbOf(page);
    if (!blurbHtml) throw new Error(`repairs: no opening paragraph on /${slug}`);

    return {
      slug,
      name: item.label,
      href: item.href!,
      blurbHtml,
      priceFrom: entryPrice(page),
      /* Headlight restoration is a hand-built route, and the photograph it
         actually runs is in `lib/headlight.ts`; its `ogImage` is a 1474x2208
         portrait that `heroImageFor` would pick and a 3:2 card would crop to
         a sliver. Still the page's own picture either way. */
      image: slug === "repairs/headlight-restoration" ? HEADLIGHT.hero.image : heroImageFor(page),
    };
  });
}

/* ── Questions ────────────────────────────────────────────────────────── */

export type RepairQuestion = {
  q: string;
  /** The answer, as the source wrote it: HTML paragraphs or list items. */
  a: string[];
  /** The page it came from, so the reader can go and read the rest. */
  href: string;
  name: string;
};

/**
 * None of the four pages carries an `faq` block — not in `pages.json`, not in
 * the mirror, not on the live site. So there is no FAQ to lift, and rule 8.1
 * forbids writing one.
 *
 * What the four pages do carry is question-shaped headings with the answer
 * written underneath: "Why Trust Professionals for Car Graffiti Removal?",
 * "What to Do If You Have Paint Spillage in Your Car". This names six of them
 * and reads the words back out of `pages.json`, so the accordion is the site's
 * own copy re-laid-out rather than new copy — the same thing `Steps` and
 * `FeatureCards` do to a run of blocks elsewhere.
 *
 * Anchored on the heading's own text, never an index, and a heading that has
 * gone throws at build. If the client would rather have a written FAQ, it
 * replaces this wholesale.
 */
const QUESTIONS: ReadonlyArray<readonly [slug: string, heading: string]> = [
  ["repairs/headlight-restoration", "Why Headlight Restoration Matters"],
  ["repairs/headlight-restoration", "The Headlight Restoration Process"],
  ["repairs/engine-bay-steam-cleaning", "Why Engine Bay Steam Cleaning Matters"],
  ["repairs/car-graffiti-removal", "Why Trust Professionals for Car Graffiti Removal?"],
  ["repairs/paint-overspray-removal", "What to Do If You Have Paint Spillage in Your Car"],
  ["repairs/paint-overspray-removal", "Why Removing Paint from Car Interiors Is Challenging:"],
];

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

export function repairQuestions(): RepairQuestion[] {
  const named = new Map(repairCards().map((c) => [c.slug, c]));

  return QUESTIONS.map(([slug, heading]) => {
    const page = getPage(slug);
    if (!page) throw new Error(`repairs: no page at /${slug}`);
    const blocks = flatten(page.sections.flatMap((s) => s.blocks));

    const at = blocks.findIndex((b) => headingText(b) === heading);
    if (at === -1) throw new Error(`repairs: /${slug} no longer has "${heading}"`);

    const a = answerAfter(blocks, at);
    if (!a.length) throw new Error(`repairs: nothing under "${heading}" on /${slug}`);

    const card = named.get(slug);
    return { q: heading, a, href: card?.href ?? `/${slug}/`, name: card?.name ?? slug };
  });
}
