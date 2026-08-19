export type Block =
  /** `href` when the source's heading was one link and nothing else. */
  | { type: "heading"; level: number; text: string; href?: string }
  | { type: "paragraph"; html: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | {
      type: "image";
      src: string;
      alt: string;
      w?: number;
      h?: number;
      /** One of the theme's decorative icons, sized as a mark not as content. */
      icon?: boolean;
    }
  | { type: "button"; label: string; href: string }
  | { type: "table"; rows: string[][] }
  | { type: "faq"; items: { q: string; a: string[] }[] }
  | { type: "embed"; src: string; title?: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "form"; id: string; submitLabel: string; fields: FormField[] }
  | { type: "columns"; spans: number[]; cols: Block[][] };

/** One control of an enquiry form, transcribed from the source's CF7 markup. */
export type FormField = {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  options?: string[];
};

export type SectionBg = {
  color?: string;
  gradient?: string;
  image?: string;
  /** Pixel size of `image`, stamped by `scripts/probe-images.mjs`. */
  w?: number;
  h?: number;
  overlay?: string;
  overlayOpacity?: number;
};

export type Section = { bg?: SectionBg; blocks: Block[] };

export type PostMeta = {
  category?: string;
  author?: string;
  date?: string;
  hero?: string;
};

/** One rung of the source site's breadcrumb trail; the last has no `href`. */
export type Crumb = { name: string; href?: string };

/** Article facts off the source's JSON-LD — blog posts only. */
export type ArticleMeta = {
  headline: string;
  author?: string;
  section?: string[];
};

export type Page = {
  slug: string;
  title: string;
  description: string;
  ogImage?: string | null;
  /** Pixel size of `ogImage`, stamped by `scripts/probe-images.mjs`. */
  ogW?: number;
  ogH?: number;
  /** Source page's dateModified (YYYY-MM-DD), used for sitemap <lastmod>. */
  modified?: string;
  /** Source page's datePublished (YYYY-MM-DD). */
  published?: string;
  breadcrumb?: Crumb[];
  article?: ArticleMeta;
  h1: string;
  post?: PostMeta;
  sections: Section[];
};

import raw from "@/content/pages.json";

export const PAGES = raw as unknown as Record<string, Page>;

/**
 * Pages that have earned their own hand-built route under `app/`, the way the
 * homepage has. A static segment already outranks the catch-all at request
 * time; excluding these keeps the build from prerendering a second, unreachable
 * copy of the same URL. They stay in `PAGES` so the sitemap and the link
 * checker still see them.
 */
export const CUSTOM_ROUTES = new Set([
  "car-detailing/headlight-restoration",
  "vehicles/motorcycle-valeting-detailing",
  "blog",
  "our-locations",
  "contact-us",
  "careers-franchising",
  "commercial-valeting",
  "terms-and-conditions",
  "gift-card",
  "about-us",
  "car-lovers-club",
  "commercial-valeting/aircraft-cleaning",
]);

/** Every route the catch-all renderer serves. */
export const ALL_SLUGS = Object.keys(PAGES).filter(
  (s) => s !== "" && !CUSTOM_ROUTES.has(s),
);

export function getPage(slug: string): Page | undefined {
  return PAGES[slug];
}

/** Every form block on a page, in document order. */
export function getForms(slug: string): Extract<Block, { type: "form" }>[] {
  const page = PAGES[slug];
  if (!page) return [];
  const out: Extract<Block, { type: "form" }>[] = [];
  const walk = (blocks: Block[]) => {
    for (const b of blocks) {
      if (b.type === "form") out.push(b);
      else if (b.type === "columns") b.cols.forEach(walk);
    }
  };
  page.sections.forEach((s) => walk(s.blocks));
  return out;
}

/**
 * The photograph to run behind a page's header.
 *
 * Two candidates: the background its opening row declares, and the OG image it
 * publishes of itself. Neither is reliably the better one — half the service
 * pages are Elementor-built and have no row background at all, and four of the
 * ones that do declare a 720x720 square that gets stretched 1.76x across the
 * band while a 1650x1275 photograph sits in `ogImage` unused.
 *
 * So it picks on size, which `scripts/probe-images.mjs` records for both. A
 * header photograph is painted about 1270px wide on a desktop; anything much
 * narrower than that is being upscaled, and the wider file wins.
 */
export function heroImageFor(page: Page): string | undefined {
  const bg = page.sections[0]?.bg;
  const candidates: { src: string; w: number }[] = [];
  if (bg?.image) candidates.push({ src: bg.image, w: bg.w ?? 0 });
  if (page.ogImage) candidates.push({ src: page.ogImage, w: page.ogW ?? 0 });
  if (!candidates.length) return undefined;

  // The row's own background wins ties: it is the choice the page made.
  return candidates.reduce((best, c) => (c.w > best.w ? c : best)).src;
}

/**
 * The FAQ pairs a page carries, and the heading and standfirst above them.
 *
 * The hand-built routes used to transcribe these into their own `lib` file,
 * because the extractor had no branch for the `<details class="faq-item">`
 * markup two of these pages use. It has one now, so the questions live in
 * `pages.json` like everyone else's and there is one source of truth again.
 */
export function getFaq(slug: string) {
  const page = PAGES[slug];
  if (!page) return null;

  for (const section of page.sections ?? []) {
    const items = section.blocks.flatMap((b) => (b.type === "faq" ? b.items : []));
    if (!items.length) continue;
    const head = section.blocks[0];
    const lede = section.blocks.find((b) => b.type === "paragraph");
    return {
      heading: head?.type === "heading" ? head.text : "Frequently Asked Questions",
      lede: lede?.type === "paragraph" ? lede.html.replace(/<[^>]+>/g, "").trim() : undefined,
      items,
    };
  }
  return null;
}

/**
 * Resolves the form a submission claims to come from. The server re-reads the
 * schema from here rather than trusting the posted field list.
 */
export function getForm(slug: string, index: number) {
  return getForms(slug)[index];
}
