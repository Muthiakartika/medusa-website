# Medusa — working guide

Read this first in a new session or on a new machine. `AGENTS.md` next to it is
written by `next dev` and covers the framework; this file covers the project.

---

## 1. What this is

A Next.js 16 rebuild of **medusaautodetailing.co.uk** — a mobile car
valeting/detailing business in London. It is the repo owner's client's own
site, mirrored with permission; there is no third-party copyright question
about copying its text or images.

The clone is **content-identical by design**. Every word, price, phone number
and photograph comes from the live site. What this project changes is the
*layout*, not the *content*.

- **255 routes.** 254 pages in `src/content/pages.json` plus the homepage.
- **Fully static**, served through ISR (§7).
- Stack: App Router, React 19, Tailwind CSS v4, TypeScript. No CMS, no
  database, no runtime API.

---

## 2. Running it on a new machine

```bash
npm install
npm run dev
```

That is the whole setup — the dev server comes up on http://localhost:3000.
Everything the site renders from is committed:

| Path | Size | Committed? | How to recreate |
| --- | --- | --- | --- |
| `src/content/pages.json` | 4 MB | **yes** | `npm run content` |
| `public/assets/**` | 94 MB | **yes** | `npm run content` |
| `.cache/html/**` | 71 MB | **no** (gitignored) | `npm run content:fetch` |

So a fresh clone runs and builds immediately. You only need `.cache/html` if
you intend to **re-extract** content — see §3.

Copy `.env.example` to `.env.local` if you need the webhook or the revalidation
endpoint; nothing there is required for `npm run dev`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server. Pages re-render every request; ISR is inert here. |
| `npm run build` / `npm start` | Production build (~40 s cold) and server. |
| `npm run verify` | Crawls every route on a **running** server and checks it. See §9. |
| `npm run content:fetch` | Re-mirrors the live site into `.cache/html/` (~71 MB, slow, hits the network). |
| `npm run content` | Rebuilds `pages.json` + assets from that mirror. Needs `.cache/html`. |
| `npm run content:classify` | Writes `pages.v2.json`. Nothing renders from it; exploratory. |

---

## 3. The content pipeline

```
live site  --fetch-html-->  .cache/html/*.html
                                  |
                          extract-content  -->  src/content/pages.json
                                  |
                            fetch-assets   -->  public/assets/**
                                  |
                            probe-images   -->  pixel sizes stamped back
                                                 into pages.json
```

`npm run content` runs the last three in order. It **does not** re-fetch HTML —
run `npm run content:fetch` first if the mirror is missing or stale.

- **`scripts/fetch-html.mjs`** — walks the source sitemaps, saves each page.
- **`scripts/extract-content.mjs`** — the one that matters. Turns WPBakery /
  Elementor markup into the block model in §4. Every fix here is a fix to all
  254 pages at once, so prefer fixing it over patching a page by hand.
- **`scripts/fetch-assets.mjs`** — downloads every image the extractor saw,
  rewriting `wp-content/uploads/2021/12/x.webp` to `/assets/2021/12/x.webp`.
- **`scripts/probe-images.mjs`** — fills `w`/`h` on image blocks (next/image
  needs them), drops blocks whose file failed to download, and stamps
  `section.bg.w/h` and `page.ogW/ogH` so `heroImageFor()` can choose between
  them on size.
- **`scripts/paths.mjs`** — every path constant the scripts share.

**Regenerating is not free.** The last regeneration changed 201 of 254 pages.
Diff `pages.json` and spot-check before committing.

---

## 4. The content model

`src/lib/blocks.ts` is the single source of truth for types and page access.

```ts
type Block =
  | heading | paragraph | list | image | button
  | table | faq | embed | video | form | columns
```

A `Page` is `{ slug, title, description, ogImage, h1, sections, … }` and a
`Section` is `{ bg?, blocks[] }`. `columns` blocks nest, so anything that walks
blocks must recurse.

Useful exports:

- `PAGES`, `getPage(slug)`, `ALL_SLUGS`
- `CUSTOM_ROUTES` — slugs that have a hand-built route under `app/` and are
  therefore excluded from the catch-all's `generateStaticParams`. **Add a slug
  here whenever you give a page its own route file**, or the build prerenders
  an unreachable duplicate.
- `getFaq(slug)` — the FAQ pairs a page carries. Hand-built pages read this
  rather than keeping their own transcribed copy.
- `heroImageFor(page)` — picks the wider of the opening row's background and
  the page's OG image.
- `getForms(slug)` / `getForm(slug, i)` — the CF7 forms, re-read server-side so
  a tampered submission cannot bypass required fields.

---

## 5. How a page gets rendered

Three tiers, cheapest first:

1. **Catch-all** — `src/app/[...slug]/page.tsx` renders `Sections` from
   `components/Blocks.tsx`. This is the default and most pages use it.
2. **A frame** — a shared layout for a family of pages that all have the same
   shape:
   - `lib/service-frame.ts` + `components/ServicePage.tsx` — the 41 service
     pages (`SERVICE_SLUGS`). Parses out the opening copy, the entry price, the
     coverage list and the FAQ; everything it does not claim is passed through
     to the ordinary renderer **in document order**.
   - `lib/location-frame.ts` + `components/LocationPage.tsx` — the 146
     location pages (`mobile-car-{valeting,wash,detailing}-in-*` and
     `our-locations/*`).
3. **Its own route** — for a page the extractor mangled badly enough that a
   frame cannot save it (`/headlight-restoration`,
   `/motorcycle-valeting-detailing`, the homepage, and the ten others in
   `CUSTOM_ROUTES`). Copy is transcribed verbatim into a `lib/*.ts` file or
   read back out of `pages.json`.

Prefer tier 1, then 2. Tier 3 is a maintenance cost — each one is a second
place the content lives.

`components/blocks-groups.tsx` is what makes tier 1 look designed: it detects
runs of blocks that mean something together (`PriceGrid`, `AddonCards`,
`Gallery`, `FeatureCards`, `Steps`, `LinkChips`) and renders them as a
component instead of a flat list.

**Tables render twice.** `/valeting` is the only page carrying `table` blocks,
and its package matrix is 7 columns by 58 rows — 1062px wide and 18,633px tall
on a phone. So `lib/table-model.ts` reads the shape out of the block (header
rows, description column, group dividers, the trailing price ladder) and
`components/TableCards.tsx` renders it as one package at a time with the
descriptions behind a disclosure; the real `<table>` still renders wherever the
container is wide enough, which `WIDE_ENOUGH` in `Blocks.tsx` decides from the
column count. Both views are in the DOM and CSS picks one, so there is no
layout shift and nothing is dropped — verified by asserting every 14+ character
fragment of every table cell appears in the narrow view across all its tabs.

---

## 6. Design system

Defined in `src/app/globals.css` under `@theme` and `@layer components`.

- Layout: `.shell` (page gutter), `.shell-article` (narrow prose), `.measure`.
- Surfaces: `.surface`, `.surface-on-gold`, `.bg-gold-wash`, `.livery`.
- Diagonals: `.cut-top` / `.cut-bottom`, driven by `--cut` (3rem, 5rem at lg).
- Buttons: `.btn` plus `.btn-gold` / `.btn-outline` / `.btn-dark`.
- Motion: `.reveal` via `components/Reveal.tsx`.

**Vertical rhythm** — the agreed spec: **100–110 px** between sections on
desktop/laptop, **50–75 px** on small screens. In practice that is
`py-16 lg:py-[104px]` (64 / 104). Match it; do not invent new spacing.

**Gotcha, already paid for once:** `html { overflow-x: clip }` — *not*
`hidden`. `hidden` makes `<html>` a scroll container and silently kills
`position: sticky` for every descendant on the site.

---

## 7. ISR

`export const revalidate = 3600` sits in `src/app/layout.tsx`, so it is the
default for every route beneath it. All 255 pages are prerendered at build and
then held as cache entries with a one-hour TTL; `next build` prints
`Revalidate 1h` against each of them, and the server sends
`Cache-Control: s-maxage=3600, stale-while-revalidate=31532400`.

Development ignores this — `next dev` re-renders every request.

### On-demand flush

`POST /api/revalidate`, guarded by `REVALIDATE_SECRET`. With the variable unset
the route answers 503 to everything rather than defaulting to open.

```bash
curl -X POST https://example.com/api/revalidate -H "Authorization: Bearer $REVALIDATE_SECRET" -H "Content-Type: application/json" -d '{"paths":["/mini-valet","/blog"]}'
```

```bash
curl -X POST https://example.com/api/revalidate -H "Authorization: Bearer $REVALIDATE_SECRET" -H "Content-Type: application/json" -d '{"all":true}'
```

`{"all":true}` goes through the root layout and takes every page with it.
Unknown paths are reported back in `unknown` rather than silently accepted.

### What ISR does and does not buy here

Be clear-eyed about this. `pages.json` is `import`ed, so it is **bundled at
build time**. A regeneration re-renders from the same bundled data and produces
the same HTML. So:

- **Yes**: static delivery, background refresh, correct CDN cache headers, and
  the ability to flush a page without a redeploy.
- **No**: it does *not* pick up edits to `src/content/pages.json`. Changing
  content is still `npm run content`, commit, deploy.

Making time-based revalidation meaningful would mean reading the JSON at
request time. That was considered and rejected: on a serverless host the
filesystem is read-only and per-deployment, so it would add fragility and
change nothing.

**Observed behaviour worth knowing:** on a self-hosted `next start`, a path
that has just been flushed is then served with
`Cache-Control: private, no-cache, no-store` instead of `s-maxage=3600`, so a
CDN in front of it stops caching that page until the next deploy. Paths that
were not flushed are unaffected — verified by flushing `/steam-cleaning` and
watching `/wheeluv` keep its `s-maxage` header.

---

## 8. Rules that are not negotiable

These come from the repo owner and have each been enforced after a mistake:

1. **Do not add information that is not on the original site.** No invented
   ledes, CTAs, proof strips, taglines or FAQ standfirsts. If a section looks
   empty, restructure the source's own copy; do not write new copy to fill it.
2. **Do not change content.** Layout only. Copy, casing and punctuation stay
   verbatim — including `London` in a heading that is otherwise uppercase.
3. **A frame that claims a row must render all of it.** `location-frame.ts`
   has a `covers()` guard for exactly this: silently dropping half a row is
   content loss, and it happened.
4. When in doubt about what the original says, fetch it from
   `https://medusaautodetailing.co.uk/` rather than guessing.

---

## 9. Verifying a change

Run all of these. The last one has caught things the others cannot.

```bash
npx tsc --noEmit
```

```bash
npx eslint src
```

```bash
npm run verify
```

`npm run verify` needs a server running on :3000 (or set `BASE`). It crawls all
255 routes and checks: HTTP 200, an `<h1>`, non-trivial body text, every
internal link resolves, every `/assets` image exists on disk, parseable JSON-LD,
plus the sitemap, robots and 404. It prints `ALL CLEAN` or a list.

**Then look at it.** Load the page in the browser pane. For responsive and
overflow work the reliable technique is a fixed-width `<iframe>` inside the
pane — container and media queries then react to the iframe's width, and you
can read `scrollWidth`, `getBoundingClientRect()` and `naturalWidth` off it.
Beware: `naturalWidth` is divided by the density of the chosen `srcset`
candidate, so compare against the file on disk, not against that number.

**Content conservation check** — after any renderer or frame change, assert
that every text fragment of 14+ characters in `pages.json` still appears in the
rendered `<main>`. Known, pre-existing gaps: `asLinkChips` drops commas and
`asFeatures` drops `:` and `–` label separators.

---

## 10. Known limits

- **Elementor row backgrounds are unrecoverable from the mirror.** The
  extractor's `rowBg()` only reads WPBakery `.wpb_row` backgrounds; Elementor
  keeps its row images in Autoptimize CSS bundles that `fetch-html` does not
  mirror. About half the service pages therefore fall back to their OG image.
- **Three service heroes are narrower than the 1270 px band they fill** —
  `/car-graffiti-removal` (800 px), `/safely-clean-sickness-vomit-from-your-car-interior`
  (980 px), `/car-windscreen-protection` (1152 px). No larger copy exists in
  the mirror; fixing them needs a fresh fetch from the live site.
- **`/blog` renders post titles its own source page does not list** — the
  source paginates at 10, the grid loads 10 at a time from the full set. This
  is the one intentional exception to rule 8.1.
- `src/content/pages.v2.json` is generated by the classifier and unused.

---

## 11. Environment

See `.env.example`. All optional in development.

| Variable | Used by | Unset behaviour |
| --- | --- | --- |
| `CONTACT_WEBHOOK_URL` | `app/actions.ts` | Enquiries logged to the console; a hard error in production. |
| `REVALIDATE_SECRET` | `app/api/revalidate/route.ts` | Endpoint refuses every request (503). |
| `BASE` | `scripts/verify.mjs` | `http://localhost:3000`. |
