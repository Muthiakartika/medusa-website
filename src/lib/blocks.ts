export type Block =
  | { type: "heading"; level: number; text: string }
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

/** Every route this site serves, excluding the hand-built homepage. */
export const ALL_SLUGS = Object.keys(PAGES).filter((s) => s !== "");

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
 * Resolves the form a submission claims to come from. The server re-reads the
 * schema from here rather than trusting the posted field list.
 */
export function getForm(slug: string, index: number) {
  return getForms(slug)[index];
}
