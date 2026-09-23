/**
 * The breadcrumb trail every page's `BreadcrumbList` is built from.
 *
 * The mirror's own trails cannot be used as they stand. WordPress published
 * every page one level below Home, so 294 of the 313 two-segment URLs came
 * back as `Home > Page` — `/car-detailing/watford` never named `/car-detailing`
 * — and the names are the WordPress titles from before the client renamed and
 * re-parented the pages: `/mobile-car-wash/alloy-wheel-cleaning` was "Wheeluv",
 * `/mobile-car-wash/car-wax-service` "Autoglym", and thirteen carried an HTML
 * entity such as `&#038;`, which JSON-LD does not decode.
 *
 * So the hierarchy is read off the URL, which since 2026-09-15 is the site's
 * real structure, and the names off the client's own menu. Nothing is written:
 *
 *   - **Parent** — the nearest path prefix that is a page. Blog posts are the
 *     one exception: `/2025/07/26/…` has no page at any of its date segments,
 *     and the page that lists them is `/blog`.
 *   - **Name** — the page's label in `NAV`, where the menu names it; otherwise
 *     the tail of the source's own trail with its entities decoded; otherwise
 *     the page's h1. Top-level menu labels are skipped — "About" and
 *     "Commercial & Fleet" name a menu, not a page.
 *
 * `page.breadcrumb` itself is left alone: `nameReadMoreLinks` reads its tail
 * for visible button labels, and the site renders no visible breadcrumb.
 */
import { PAGES, type Page } from "@/lib/blocks";
import { NAV, type NavItem, SITE } from "@/lib/site";
import { decodeEntities } from "@/content/overrides";

export type Trail = { name: string; url: string }[];

/** Menu label per slug, first occurrence in menu order, below the top level. */
const NAV_NAMES = new Map<string, string>();
const walk = (items: NavItem[], depth: number) => {
  for (const item of items) {
    const slug = item.href?.replace(/^\/|\/$/g, "");
    if (depth > 0 && slug && !NAV_NAMES.has(slug)) NAV_NAMES.set(slug, item.label);
    if (item.children) walk(item.children, depth + 1);
  }
};
walk(NAV, 0);

/** A path the site serves: a page, or a menu-group hub, which has no `Page`. */
const exists = (slug: string) => slug in PAGES || NAV_NAMES.has(slug);

const BLOG_POST = /^\d{4}\/\d{2}\/\d{2}\//;

function parentOf(slug: string): string {
  if (BLOG_POST.test(slug)) return "blog";
  const parts = slug.split("/");
  for (let n = parts.length - 1; n > 0; n--) {
    const candidate = parts.slice(0, n).join("/");
    if (exists(candidate)) return candidate;
  }
  return "";
}

function nameOf(slug: string, page?: Page): string {
  if (!slug) return "Home";
  const p = page ?? PAGES[slug];
  const tail = p?.breadcrumb?.[p.breadcrumb.length - 1]?.name;
  const name = NAV_NAMES.get(slug) ?? (tail ? decodeEntities(tail) : p?.h1);
  if (!name?.trim()) throw new Error(`breadcrumbs: no name for "${slug}"`);
  return name.trim();
}

const urlOf = (slug: string) => `${SITE}/${slug}`;

/** Home first, the page itself last, every rung an absolute URL. */
export function breadcrumbTrail(page: Page): Trail {
  const trail: Trail = [{ name: nameOf(page.slug, page), url: urlOf(page.slug) }];
  for (let slug = page.slug; slug; ) {
    slug = parentOf(slug);
    trail.unshift({ name: nameOf(slug), url: urlOf(slug) });
  }
  return trail;
}
