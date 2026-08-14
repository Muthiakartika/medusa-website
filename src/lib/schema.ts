/**
 * JSON-LD graphs mirroring what Yoast emits on the live site: an Organization
 * and WebSite that every page points at by @id, a per-page WebPage +
 * BreadcrumbList, an Article for blog posts, and the AutoWash (LocalBusiness)
 * block that only the homepage carries.
 */
import type { Page } from "@/lib/blocks";
import { BUSINESS, CONTACT, SITE } from "@/lib/site";

const ORG_ID = `${SITE}/#organization`;
const SITE_ID = `${SITE}/#website`;
const LOGO_ID = `${SITE}/#/schema/logo/image/`;

const abs = (path: string) => (path.startsWith("http") ? path : SITE + path);

/** "" -> "https://…/", "mini-valet" -> "https://…/mini-valet/" */
const url = (slug: string) => `${SITE}/${slug ? `${slug}/` : ""}`;

const organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: BUSINESS.name,
  url: `${SITE}/`,
  logo: {
    "@type": "ImageObject",
    inLanguage: "en-GB",
    "@id": LOGO_ID,
    url: abs(BUSINESS.logo),
    contentUrl: abs(BUSINESS.logo),
    caption: BUSINESS.name,
  },
  image: { "@id": LOGO_ID },
  sameAs: [CONTACT.facebook, CONTACT.instagram],
};

const website = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: `${SITE}/`,
  name: BUSINESS.name,
  description: BUSINESS.tagline,
  publisher: { "@id": ORG_ID },
  inLanguage: "en-GB",
};

/** The AutoWash block, homepage only — same as the live site. */
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "AutoWash",
  "@id": SITE,
  name: BUSINESS.name,
  url: SITE,
  image: abs(BUSINESS.image),
  logo: abs(BUSINESS.logo),
  description: BUSINESS.description,
  priceRange: BUSINESS.priceRange,
  telephone: BUSINESS.telephone,
  openingHours: BUSINESS.openingHours,
  additionalType:
    "http://www.productontology.org/doc/Auto_detailing http://www.productontology.org/doc/Car_wash",
  geo: { "@type": "GeoCoordinates", ...BUSINESS.geo },
  address: { "@type": "PostalAddress", ...BUSINESS.address },
  sameAs: [CONTACT.instagram, CONTACT.facebook],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: BUSINESS.reservationsPhone,
    contactType: "reservations",
    email: CONTACT.email,
    areaServed: ["GB"],
    availableLanguage: ["English"],
  },
};

function breadcrumbList(page: Page) {
  const crumbs = page.breadcrumb ?? [{ name: "Home" }];
  return {
    "@type": "BreadcrumbList",
    "@id": `${url(page.slug)}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      // The trailing crumb is the current page, so it carries no item link.
      ...(c.href ? { item: c.href === "/" ? `${SITE}/` : `${SITE}${c.href}/` } : {}),
    })),
  };
}

/** Blog posts get an Article node on top of the WebPage, as on the source. */
function article(page: Page) {
  const id = url(page.slug);
  const meta = page.article;
  const image = page.post?.hero ?? page.ogImage;
  return {
    "@type": "Article",
    "@id": `${id}#article`,
    isPartOf: { "@id": id },
    headline: meta?.headline || page.h1,
    description: page.description,
    ...(page.published ? { datePublished: page.published } : {}),
    ...(page.modified ?? page.published
      ? { dateModified: page.modified ?? page.published }
      : {}),
    mainEntityOfPage: { "@id": id },
    publisher: { "@id": ORG_ID },
    ...(meta?.author ? { author: { "@type": "Person", name: meta.author } } : {}),
    ...(meta?.section?.length ? { articleSection: meta.section } : {}),
    ...(image ? { image: abs(image) } : {}),
    inLanguage: "en-GB",
  };
}

/** The @graph every page emits. */
export function pageSchema(page: Page) {
  const id = url(page.slug);
  const webPage = {
    "@type": "WebPage",
    "@id": id,
    url: id,
    name: page.title,
    isPartOf: { "@id": SITE_ID },
    ...(page.slug ? {} : { about: { "@id": ORG_ID } }),
    description: page.description,
    breadcrumb: { "@id": `${id}#breadcrumb` },
    ...(page.published ? { datePublished: page.published } : {}),
    ...(page.modified ? { dateModified: page.modified } : {}),
    inLanguage: "en-GB",
    potentialAction: [{ "@type": "ReadAction", target: [id] }],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      webPage,
      ...(page.article ? [article(page)] : []),
      breadcrumbList(page),
      website,
      organization,
    ],
  };
}
