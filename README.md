# Medusa Auto Detailing — Next.js rebuild

A content-identical rebuild of [medusaautodetailing.co.uk](https://medusaautodetailing.co.uk)
(WordPress + Salient + WPBakery/Elementor) on Next.js 16 App Router, Tailwind v4,
and React 19. 254 routes, all statically generated.

## Getting started

```bash
npm install
npm run dev
```

The site runs at http://localhost:3000.

## How the content works

The homepage is hand-built from typed content in [`src/lib/site.ts`](src/lib/site.ts) —
every price, package, and testimonial is transcribed there so it can be edited
directly. Every other route is data-driven: [`src/content/pages.json`](src/content/pages.json)
holds one entry per page, each a list of sections and typed blocks, rendered by
[`src/components/Blocks.tsx`](src/components/Blocks.tsx) through the
`[...slug]` catch-all.

`pages.json` is **generated, not hand-edited**. Regenerate it with the pipeline
below; anything typed into it directly is lost on the next run.

### Regenerating content

```bash
npm run content:fetch
```

Mirrors every URL in the source sitemaps into `.cache/html/` (~70 MB, gitignored).
Run this first — it is the only step that touches the origin, and it skips files
already downloaded.

```bash
npm run content
```

Runs the three generation steps in order:

| Step | Script | What it does |
| --- | --- | --- |
| 1 | `extract-content.mjs` | Parses the mirrored HTML into `pages.json` — sections, blocks, metadata, breadcrumbs, enquiry-form schemas |
| 2 | `fetch-assets.mjs` | Downloads every referenced image into `public/assets/` |
| 3 | `probe-images.mjs` | Reads real pixel dimensions off disk and fills them into every image block, so `next/image` never guesses |

Step 3 matters: skipping it leaves image blocks with whatever dimensions the
source markup claimed, which is often wrong.

### Verifying

```bash
npm run verify
```

Crawls every route on a running server (`BASE=http://localhost:3000` by default)
and reports: non-200s, missing `<h1>`, thin pages, dead internal links, missing
image files, unparseable structured data, and the SEO surfaces (sitemap, robots,
404). It exits noisily with `ISSUES FOUND` — read the sections above that line.

Links that 404 on the source site too are listed in `DEAD_ON_SOURCE` inside the
script; reproducing them is correct clone behaviour, not a defect.

## SEO

- **Metadata** — per-page title, description, canonical, and Open Graph, from
  the source's own `<head>`.
- **Structured data** — [`src/lib/schema.ts`](src/lib/schema.ts) rebuilds the
  Yoast `@graph`: `WebPage` + `BreadcrumbList` + `WebSite` + `Organization` on
  every page, `Article` on blog posts, and the `AutoWash` LocalBusiness block on
  the homepage. Breadcrumb labels and article authors are copied from the source
  JSON-LD during extraction, because they exist nowhere else in the markup.
- **Sitemap** — `/sitemap.xml`, one entry per route, with `lastmod` taken from
  each source page's `dateModified`.
- **Robots** — `/robots.txt`, pointing at the sitemap.

## Enquiry forms

The five Contact Form 7 forms on the source (`/contact-us`, `/car-lovers-club`,
`/caravan-valeting`, `/careers-franchising`,
`/commercial-valeting-and-detailing`) are extracted as `form` blocks and rendered
by [`src/components/EnquiryForm.tsx`](src/components/EnquiryForm.tsx). Submission
goes through the `submitEnquiry` server action in
[`src/app/actions.ts`](src/app/actions.ts), which re-reads the form's schema
server-side rather than trusting the posted field list.

**Delivery requires one environment variable:**

```
CONTACT_WEBHOOK_URL=https://…
```

The action POSTs a JSON payload (`form`, `page`, `submittedAt`, `fields`) to that
URL — point it at whatever the business uses for leads: a CRM endpoint, an email
relay, a Zapier/Make hook. With no webhook set, enquiries are logged to the
server console in development, and **fail loudly in production** with a
phone/email fallback shown to the visitor, so a missing config can never look
like a delivered lead.

File uploads (`/caravan-valeting`) are reported as filename and size only; the
bytes are not forwarded.

## Deployment notes

- `next.config.ts` carries the one 301 the live site serves: `/ceramic-coating`
  → `/car-ceramic-paint-protection`.
- Bookings go to the external `book.medusaautodetailing.co.uk` app; there is no
  booking flow in this codebase.
- `SITE` in `src/lib/site.ts` is the canonical origin used by metadata, the
  sitemap, and the structured data. Change it if the site is served elsewhere.
