/**
 * JSON-LD for every page, built to the rules in `medusa-schema/CLAUDE.md`.
 *
 * **One block, one `@graph`, per page.** A node is DEFINED once, on the page
 * that page is about, and REFERENCED from every other page **written out in
 * full** — a bare `{ "@id": … }` resolves only against the same page's graph,
 * and nothing fetches another page to follow a pointer. That is why
 * `businessRef()` exists and is not padding.
 *
 * Every `@id` comes from `medusa-schema/ids.ts`. Never build one by template
 * here: the area ids are not uniform, so a template that looks right on one
 * page is wrong on another.
 *
 * Replaced the Yoast-shaped graph on 2026-10-09. Five defects went with it:
 * `#organization` (collapsed into `#business`), the business node sitting in a
 * second script block where nothing could reference it, its bare-root `@id`,
 * an `openingHours` string holding two ranges and so not parsing, and
 * `areaServed: ["GB"]` on the contact point.
 */
import areaServices from "@schema/data/area-services.json";
import areas from "@schema/data/areas.json";
import business from "@schema/data/business.json";
import categories from "@schema/data/categories.json";
import packages from "@schema/data/packages.json";
import { id } from "@schema/ids";

import type { Page } from "@/lib/blocks";
import { breadcrumbTrail } from "@/lib/breadcrumbs";
import { BUSINESS, SITE } from "@/lib/site";

type Json = Record<string, unknown>;

const abs = (path: string) => (path.startsWith("http") ? path : SITE + path);

/** "" -> "/", "car-valeting/mini-valet" -> "/car-valeting/mini-valet" */
const pathOf = (slug: string) => (slug ? `/${slug}` : "/");

/**
 * A page's Service `@id`, routed through `ids.ts` by shape: one segment is a
 * category hub, two is a package beneath it. Anything else has no category to
 * name, so it falls back to the page's own URL.
 */
function serviceId(slug: string) {
  const parts = slug.split("/").filter(Boolean);
  if (parts.length === 1) return id.categoryService(parts[0]);
  if (parts.length === 2) return id.packageService(parts[0], parts[1]);
  return `${id.webpage(pathOf(slug))}#service`;
}

const logo = (): Json => ({
  "@type": "ImageObject",
  "@id": id.logo(),
  inLanguage: "en-GB",
  url: abs(BUSINESS.logo),
  contentUrl: abs(BUSINESS.logo),
  caption: BUSINESS.name,
});

const website = (): Json => ({
  "@type": "WebSite",
  "@id": id.website(),
  url: `${SITE}/`,
  name: BUSINESS.name,
  description: BUSINESS.tagline,
  publisher: { "@id": id.business() },
  inLanguage: "en-GB",
});

/**
 * The full business node, from `medusa-schema/data/business.json`. Homepage only.
 *
 * The reservations number was the one field this repo and the handover
 * disagreed on — `site.ts` carried `+44-7434649960` and the measurement read
 * `+44-2033556435` off the live site — so it was overridden here while the
 * client decided. They settled it the same week: `site.ts` now carries the
 * number the handover read, the two agree, and the override is gone.
 */
export const businessFull = (): Json => business as Json;

/**
 * The business as a REFERENCE, for the other 382 pages. Thinner than the full
 * node, never contradicting it. Written out, because a bare pointer to
 * `#business` resolves to nothing off the homepage.
 */
export const businessRef = (): Json => ({
  "@type": "AutoWash",
  "@id": id.business(),
  name: BUSINESS.name,
  url: `${SITE}/`,
  telephone: BUSINESS.telephone,
  logo: { "@id": id.logo() },
  image: { "@id": id.logo() },
  sameAs: (business as Json).sameAs,
});

/**
 * Home > … > the page, from `lib/breadcrumbs.ts`. Every rung carries its
 * absolute URL, the page's own included — Google allows the last `item` to be
 * left off, but naming it costs nothing and cannot be misread.
 */
function breadcrumbList(page: Page): Json {
  return {
    "@type": "BreadcrumbList",
    "@id": id.breadcrumb(pathOf(page.slug)),
    itemListElement: breadcrumbTrail(page).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

/**
 * WordPress filed every post under its default category, so all 21 carried
 * `articleSection: ["Uncategorized"]` — a placeholder, not a section, and a
 * false claim rather than a blank. A placeholder passes every presence check,
 * which is how an earlier pass reported this fixed when it was not.
 *
 * The list mirrors `validate.mjs`'s own, so the two cannot disagree. Omit the
 * property until the posts have real sections.
 */
const PLACEHOLDER =
  /^(uncategori[sz]ed|undefined|null|n\/?a|tbd|tba|none|unknown|default|lorem ipsum|untitled|test|example|placeholder|xxx|todo)$/i;

const realSections = (section?: string | string[]) =>
  (Array.isArray(section) ? section : section ? [section] : []).filter(
    (s) => s.trim() && !PLACEHOLDER.test(s.trim()),
  );

/** Blog posts get an Article node on top of the WebPage, as on the source. */
function article(page: Page): Json {
  const pageId = id.webpage(pathOf(page.slug));
  const meta = page.article;
  const image = page.post?.hero ?? page.ogImage;
  return {
    "@type": "Article",
    "@id": id.article(pathOf(page.slug)),
    isPartOf: { "@id": pageId },
    headline: meta?.headline || page.h1,
    description: page.description,
    ...(page.published ? { datePublished: page.published } : {}),
    ...(page.modified ?? page.published
      ? { dateModified: page.modified ?? page.published }
      : {}),
    mainEntityOfPage: { "@id": pageId },
    /* #organization is retired; every publisher points at the business. */
    publisher: { "@id": id.business() },
    ...(meta?.author ? { author: { "@type": "Person", name: meta.author } } : {}),
    ...(realSections(meta?.section).length
      ? { articleSection: realSections(meta?.section) }
      : {}),
    ...(image ? { image: abs(image) } : {}),
    inLanguage: "en-GB",
  };
}

/**
 * A page's own questions.
 *
 * `DO-NOT-EMIT.md` says FAQPage earns no rich result outside government and
 * health sites and is not to be rolled out further. These thirteen pages were
 * built with one before that guidance arrived; keeping them is harmless for
 * entity understanding, so they stay, inside the page's one graph rather than
 * in an island of their own. Do not add a fourteenth without asking.
 *
 * Answers are joined as plain text — the ones that carry markup have it
 * stripped, since `text` is not HTML.
 */
function faqPage(slug: string, items: { q: string; a: string[] }[]): Json {
  return {
    "@type": "FAQPage",
    "@id": `${id.webpage(pathOf(slug))}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a.map((p) => p.replace(/<[^>]+>/g, "")).join(" "),
      },
    })),
  };
}

/* The four path sets below are disjoint — checked against the handover's data,
   no path is in two of them — so a page's node can be chosen by its path alone. */
const CATEGORY = new Map(categories.map((c) => [c.path, c]));
const AREA_SERVICE = new Map(areaServices.map((a) => [a.path, a]));
const AREA = new Map(areas.map((a) => [a.slug, a]));
const PACKAGE = new Map(packages.map((p) => [`${p.category}/${p.slug}`, p]));

/**
 * `/mobile-car-wash` links 8 of its 9 packages — `bronze-wash` has zero inbound
 * links from anywhere on the site — so its catalogue would name a page the body
 * never mentions. Drop this once that link exists.
 */
const NO_CATALOGUE = new Set(["mobile-car-wash"]);

/**
 * A category's `Service`, written out enough to stand alone wherever it is
 * referenced. `isRelatedTo` points up to it; the hierarchy runs **down** through
 * `hasOfferCatalog`. Never `isPartOf` — that is `CreativeWork` in domain and range.
 */
function categoryRef(slug: string): Json | null {
  const c = CATEGORY.get(`/${slug}`);
  if (!c) return null;
  return { "@type": "Service", "@id": id.categoryService(c.slug), name: c.name, url: id.webpage(c.path) };
}

/**
 * An area as a `Place`, or an `AdministrativeArea` where it is one, with the
 * area that contains it named.
 *
 * The six directional slugs — `north-london`, `central-london` and the rest —
 * have no boundary in any gazetteer, so they get a name and nothing else. Do
 * not reach for `GeoShape`.
 */
function areaNode(slug: string): Json | null {
  const a = AREA.get(slug);
  if (!a) return null;
  const node: Json = { "@type": a.type, "@id": id.area(slug), name: a.name };
  const parent = a.parent ? AREA.get(a.parent) : undefined;
  if (parent) {
    node.containedInPlace = {
      "@type": parent.type,
      "@id": id.area(parent.slug),
      name: parent.name,
    };
  }
  return node;
}

/**
 * The node a page gets for being the kind of page it is, where the handover's
 * data already says what that is and no gate stands in the way.
 *
 * A hand-built page that passes its own `service` wins; this only fills the
 * pages nothing else speaks for.
 *
 * **Two things it deliberately does not emit**, both gated on page work rather
 * than on anything here:
 *
 * - `hasOfferCatalog` on a category. `/mobile-car-wash` links 8 of its 9
 *   packages, so the catalogue would name a page the body never mentions.
 * - `ItemList` on a location hub. Not one of the 19 links a single service
 *   page for its own area.
 *
 * Turn either on only once the links exist.
 */
function derivedNode(slug: string): Json | null {
  const path = pathOf(slug);

  const category = CATEGORY.get(path);
  if (category) {
    /* B5: the catalogue is how the hierarchy runs downward. It lists only what
       the page links, which is why `/mobile-car-wash` has none — see NO_CATALOGUE. */
    const catalogue = NO_CATALOGUE.has(category.slug)
      ? null
      : {
          "@type": "OfferCatalog",
          "@id": id.categoryCatalogue(category.slug),
          name: `${category.name} packages`,
          itemListElement: category.packages.map((slug) => {
            const p = PACKAGE.get(`${category.slug}/${slug}`);
            if (!p) throw new Error(`catalogue: no package row for ${category.slug}/${slug}`);
            return {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                "@id": id.packageService(category.slug, slug),
                name: p.name,
              },
            };
          }),
        };
    return {
      "@type": "Service",
      "@id": id.categoryService(category.slug),
      name: category.name,
      serviceType: category.serviceType,
      url: id.webpage(path),
      providerMobility: "dynamic",
      provider: { "@id": id.business() },
      ...(catalogue ? { hasOfferCatalog: catalogue } : {}),
    };
  }

  const areaService = AREA_SERVICE.get(path);
  if (areaService) {
    const where = areaNode(areaService.area);
    const parent = CATEGORY.get(`/${areaService.category}`);
    if (!where || !parent) return null;
    return {
      "@type": "Service",
      "@id": id.areaService(areaService.category, areaService.area),
      /* the page's own H1, which is where this name was read from */
      name: areaService.name,
      serviceType: parent.serviceType,
      url: id.webpage(path),
      providerMobility: "dynamic",
      /* the area in THIS page's URL, nothing wider */
      areaServed: where,
      /* isRelatedTo, never isPartOf: isPartOf is CreativeWork in domain and range */
      isRelatedTo: {
        "@type": "Service",
        "@id": id.categoryService(parent.slug),
        name: parent.name,
        url: id.webpage(parent.path),
      },
      provider: { "@id": id.business() },
    };
  }

  const hub = path.startsWith("/our-locations/") && path.slice("/our-locations/".length);
  if (hub && !hub.includes("/")) return areaNode(hub);

  return null;
}

/**
 * A figure the page states, and what kind of claim it is.
 *
 * **`price` is an exact claim.** Four pages asserted one and then contradicted
 * it in the Offer's own description — prose no parser reads. The figures were
 * right; the claim type was wrong, and nothing here changes a figure.
 *
 * - plain — the page sells this, at this price, on its own.
 * - `from` — "starts from £100. Final pricing can depend on the condition."
 *   The figure is a floor, so it goes in `priceSpecification.minPrice`.
 * - `requires` — an exact price you cannot pay on its own: "+£20, must be
 *   booked with the Triton Interior Valet". The figure stays exact, inside a
 *   `UnitPriceSpecification` that **states the dependency in the markup**
 *   rather than only in prose.
 */
export type PriceInput = {
  price: string;
  currency: string;
  description: string;
  /** the figure is a minimum, not an exact price */
  from?: boolean;
  /** the price cannot be paid on its own; `description` states what it needs */
  requires?: boolean;
};

export type ServiceInput = {
  slug: string;
  name: string;
  serviceType: string;
  description: string;
  image?: string;
  /** One price, where the page states one. */
  offer?: PriceInput;
  /** One Offer per package, where the page sells the service at several levels. */
  offers?: (PriceInput & { name: string })[];
};

/** An Offer whose price claim matches what the page actually promises. */
function offerNode(o: PriceInput, url: string, name?: string): Json {
  if (o.requires) {
    /* An exact figure you cannot pay on its own. It stays exact, in a unit price
       rather than a transaction price, and the condition sits beside it rather
       than in an Offer description no parser reads. */
    return {
      "@type": "Offer",
      ...(name ? { name } : {}),
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: o.price,
        priceCurrency: o.currency,
        description: o.description,
      },
      url,
    };
  }
  return {
    "@type": "Offer",
    ...(name ? { name } : {}),
    ...(o.from
      ? {
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            minPrice: o.price,
            priceCurrency: o.currency,
          },
        }
      : { price: o.price, priceCurrency: o.currency }),
    description: o.description,
    url,
  };
}

/**
 * A Service node for a page that sells one thing.
 *
 * Three properties a schema pass reaches for and this one does not emit:
 *
 * - **`brand`**, to name WHEELUV™ or Autoglym. On a Service it means "the
 *   brand the service is associated with", so it would claim an affiliation
 *   nobody has confirmed. The product name stays copy.
 * - **`areaServed`**. It is inherited through `provider` -> `#business`,
 *   which carries the eight counties. Restating it on 41 service pages passes
 *   every consistency check and adds nothing but fan-out.
 * - **`isPartOf`**, upward to the category. `isPartOf` is CreativeWork only,
 *   in domain and range. The hierarchy runs downward via `hasOfferCatalog`.
 *
 * `providerMobility` goes HERE and never on the business: its `domainIncludes`
 * is `Service` alone, which is exactly why it ends up on the LocalBusiness.
 */
function serviceNode(service: ServiceInput): Json {
  const url = id.webpage(pathOf(service.slug));
  const offers = service.offer
    ? offerNode(service.offer, url)
    : service.offers?.length
      ? service.offers.map((o) => offerNode(o, url, o.name))
      : null;

  /* B4: a package Service points up at its category, written out so it stands
     alone. All 253 area Services already do; these were the only islands. */
  const parts = service.slug.split("/").filter(Boolean);
  const parent = parts.length === 2 ? categoryRef(parts[0]) : null;

  return {
    "@type": "Service",
    "@id": serviceId(service.slug),
    name: service.name,
    serviceType: service.serviceType,
    description: service.description,
    url,
    providerMobility: "dynamic",
    /* A bare pointer, not a written-out copy: `pageSchema` puts the business
       in every page's graph, so this resolves on the page it sits on. Writing
       it out is only required ACROSS pages. */
    provider: { "@id": id.business() },
    ...(parent ? { isRelatedTo: parent } : {}),
    ...(service.image ? { image: abs(service.image) } : {}),
    ...(offers ? { offers } : {}),
  };
}

/**
 * The one graph a page emits.
 *
 * `service` and `faq` are folded in here rather than rendered as their own
 * `<script>` blocks: a node outside the page graph is an island nothing can
 * reference, which is how the business node came to be unreachable.
 */
export function pageSchema(
  page: Page,
  extra: { service?: ServiceInput; faq?: { q: string; a: string[] }[] } = {},
): Json {
  const isHome = !page.slug;
  const pageId = id.webpage(pathOf(page.slug));
  /* What this page is about, as a node. A hand-built page that passes its own
     Service wins; otherwise the handover's data says what the page is, where
     it says anything at all — a Service for a category or a service-in-a-place,
     a Place for a location hub, nothing for the rest. */
  const subject = extra.service
    ? serviceNode(extra.service)
    : isHome
      ? null
      : derivedNode(page.slug);

  const webPage: Json = {
    "@type": "WebPage",
    "@id": pageId,
    url: pageId,
    name: page.title,
    isPartOf: { "@id": id.website() },
    /* The business on the homepage, otherwise whatever the page is about. */
    ...(isHome
      ? { about: { "@id": id.business() } }
      : subject
        ? { about: { "@id": subject["@id"] } }
        : {}),
    description: page.description,
    /* The homepage is the root of every trail, so a list of its own would be
       one item long and say nothing. Yoast emits one; Google ignores it. */
    ...(isHome ? {} : { breadcrumb: { "@id": id.breadcrumb(pathOf(page.slug)) } }),
    ...(page.published ? { datePublished: page.published } : {}),
    ...(page.modified ? { dateModified: page.modified } : {}),
    inLanguage: "en-GB",
    potentialAction: [{ "@type": "ReadAction", target: [pageId] }],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      webPage,
      ...(page.article ? [article(page)] : []),
      ...(isHome ? [] : [breadcrumbList(page)]),
      website(),
      logo(),
      /* Defined in full on the homepage, written out thinner everywhere else. */
      isHome ? businessFull() : businessRef(),
      ...(subject ? [subject] : []),
      ...(extra.faq?.length ? [faqPage(page.slug, extra.faq)] : []),
    ],
  };
}
