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

- **305 routes.** 254 in `src/content/pages.json` — the homepage is one of
  them, keyed `""` — plus the two **menu-group hubs**, `/repairs` and
  `/car-interior-cleaning`, and the **49 planned location pages**, all of which
  have no source page and are built out of pages that do (§5).
- **No trailing slashes**, since 2026-09-19. The client asked for it - "I think
  URLs without a trailing dash is better" - so `next.config.ts` leaves
  `trailingSlash` at its default and `/mobile-car-wash/bronze-wash/` 308s to
  `/mobile-car-wash/bronze-wash`. Write every path bare: canonicals, the
  sitemap, `lib/site.ts`, the hrefs inside `pages.json`, **and the 301 table**,
  which Next matches after normalising and so would never fire on a rule that
  kept the slash. The cost is that a legacy WordPress URL takes two hops
  (`/valeting/` → 308 `/valeting` → 308 `/car-valeting`); nothing this site
  renders points at a slashed URL, so nothing internal chains. The API
  endpoints are bare too, and there the slash is a silent failure - see §7.
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
| `npm run purge` | Flushes the live caches - Next's and Cloudflare's. Paths, or everything. See §7. |
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

**Regenerating is not free, and right now it does not round-trip.** The last
regeneration changed 201 of 254 pages. Worse, `extract-content.mjs` takes each
page's slug straight off its mirror filename, and the mirror is the *live*
site — which still publishes the old WordPress URLs (`/correction/`,
`/wheeluv/`, `/valeting/`). The committed `pages.json` is keyed by the **new**
structure, and its internal links are rewritten to match — and since 2026-09-19
they carry **no trailing slash** either, which the extractor does not know
about. That remapping is not in any script in this repo, so `npm run content`
against the current mirror comes back with the old slugs and about 6,000 lines
shorter. `lib/redirects.ts` is the map between the two — every rule there is one
old URL and the new one it became — so re-applying it after a regeneration is
what the missing step would do. `lib/location-moves.ts` is the second half of
that map, for all 127 location pages (§5), and those pairs are 301s too, spread
into the redirect table rather than copied out. Diff `pages.json` and
spot-check before committing anything.

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

### Client corrections

`PAGES` is not `pages.json` verbatim. `src/content/overrides.ts` is applied
over it at import time and holds every change the **client** has asked for that
the live site has not made yet — new prices, two retired wash tiers, a renamed
add-on. It has to sit outside `pages.json` because `npm run content` rewrites
that file wholesale from the mirror.

Each rule is written against the *shape* of the content — "the four price
headings after the TRITON heading" — never against array indices, so a
regeneration cannot silently mis-target one. A rule that finds nothing throws
at build rather than passing quietly.

When the live site catches up, **delete** the rule instead of editing it; the
next `npm run content` brings the same value in from the mirror.

Prices also live in `lib/site.ts`, which the homepage sections read. A price
change usually has to be made in both places.

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
     to the ordinary renderer **in document order**. On the three pages that
     are a location family's hub it closes on `components/LocationIndex.tsx` —
     the A–Z index of that service's location pages, from `hubLocations()`,
     which returns null for the other thirty-eight.
   - `lib/location-frame.ts` + `components/LocationPage.tsx` — the 146
     location pages: `our-locations/*`, and the three service-in-a-place
     families, **all of which now live under their service hub**
     (`/mobile-car-wash/wembley`). The SEO plan moved 75 of them there and left
     the other 52 on the mirror's `mobile-car-{valeting,wash,detailing}-in-*`;
     the client closed that gap on 2026-09-19, sending a crawl of the
     deployment with the remaining 52 pairs on it, so `lib/location-moves.ts`
     is 127 rows and one URL shape. Every old URL 301s, which the first 75 did
     not at first: all 75 were in the WordPress site's own sitemap and all 75
     answered 404. A page counts under the hub only when
     `lib/location-moves.ts` or `lib/planned-locations.ts` names it — otherwise
     the hub's own service pages would read as places. "Our Other Locations"
     lists the whole family — as the A–Z index below, not as the flat row of
     seventy chips it used to be.

   **The A–Z index.** Client, 2026-09-17: "Each of these mains will have a
   navigational widget added at the very bottom of the page, just above the
   footer… We will use the same navigation widget as on
   `https://seoboost.co.id/services/seo`", naming `/car-detailing/`,
   `/mobile-car-wash/` and `/car-valeting/`, each listing "their corresponding
   location child pages"; then, the same day, "terapkan ke yg lain juga yg ada
   lokasi". `components/LocationIndex.tsx` is that control in this site's
   language: a search box, 26 letter keys and a list grouped by initial, inside
   a `.surface`. `LocationIndexSection` in the same file is the band it sits
   in, so the call sites are one element each.

   **199 pages carry it**, always last, above the footer:

   | Page | Lists | Heading |
   | --- | --- | --- |
   | `/mobile-car-wash/` | its 70 places **+ 7 boroughs** | `AREAS WE PROVIDE STANDARD CAR WASH SERVICES IN LONDON:` |
   | 18 borough hubs | siblings **+ its areas row** | `Service Areas` |
   | 163 location pages | the page's siblings | `Our Other Locations` |
   | `/car-valeting/`, `/car-detailing/` | their 74 / 32 places | `Mobile Car Valeting Locations`, `Mobile Car Detailing Locations` |
   | `/our-locations/` | its 19 borough children | `All Locations` |
   | 14 location pages | the page's siblings | their family's title |

   The heading is the source's own wherever the page has one, and the index is
   what fills a row the source left empty or duplicated:

   - **"Our Other Locations"** — 114 mirror pages and all 49 built ones close on
     that heading over a WordPress shortcode that never ran. The index replaced
     the flat row of seventy-odd chips that used to stand in for it.
   - **The coverage row, folded in.** Client, 2026-09-17: "ini double, pake yg
     browser A-Z aja tapi judulnya pake yg areas we provides". Two kinds of page
     carried a list of places *and* the index — `/mobile-car-wash/` with its
     "AREAS WE PROVIDE…" row and the 18 borough hubs with "Service Areas" — so
     `withAreaLinks()` folds the row's links into the index and the index takes
     its heading. It is a merge, not a swap: the row points at borough hubs
     (`/our-locations/camden/`) and the index at the service in a place
     (`/mobile-car-wash/barnet/`), so where a name is in both the index's target
     wins (more specific, and what the heading promises) and the seven names
     with no page in the family — Camden, Haringey, Kensington and Chelsea… —
     join as their own rows. **70 becomes 77 and nothing the source names is
     lost.** No page carries both a coverage row and an "Our Other Locations"
     one, so the fold can never cost a page a heading it had.

     `/mobile-car-wash/`'s row is not a section of its own — that whole source
     page is one WPBakery row — so `takeAreasFromBody()` lifts the heading and
     its paragraph out of the body. Only a page that has an index asks for it,
     which is what keeps the other 38 service pages' coverage rows exactly where
     the source put them.
   - **The list's own title** otherwise. This used to be "Browse A–Z", the
     reference site's label, and the client's verdict was "judulnya aneh"
     (2026-09-17): at display size, alone in a half-empty column, beside a card
     already headed "Mobile Car Detailing Locations", it said nothing and said
     it twice. So the section wears the family title and the card drops it —
     one name for the list, in the one place that has room for it.

   **A per-place directory under it was built and then removed.** On 2026-09-17
   the client asked for "the extra individual sections below that link to each
   page" — the other half of the reference widget, one titled block per place
   over that page's own opening paragraph — first on the three mains, then on
   all 195 location pages. Seeing it, they cut it the next day: "lets delete
   this old version for each page (keep the search bar one above)". So the
   control is the whole of it now.

   Worth keeping in mind if it is ever asked for again: it could not say much.
   The 49 pages built from a service hub all open on that hub's sentence, so 25
   of 32 blocks on `/car-detailing/` fell back to the page's meta description
   and read alike below the place name. **That ratio is the per-place copy the
   client still owes**, and it is the thing to fix before rebuilding the
   directory rather than after.

   **The map, on every location page.** It came off on 2026-09-17 — "hapus map
   jika sudah ada widget browser locationnya", when 110 pages showed a Google
   embed directly above the index — and went back on the next day, against
   `/mobile-car-wash-in-hounslow/`: "bisa gak tambahin map locationnya untuk
   semua location pages saja, tapi sesuain titiknya". So all 195 carry one now,
   in the source's own position: after the questions, before the neighbours.

   **The point is never guessed.** The source's embeds are
   `//maps.google.com/maps?q=<place>&output=embed`, and `mapFor()` fills that
   `q` from three places in order:

   | Source | Pages | |
   | --- | --- | --- |
   | the page's own embed | 121 | used exactly as it stands |
   | a sibling page's, same place | 27 | `/our-locations/barnet/` has none; `/mobile-car-wash/barnet/` does |
   | the place name **and the country** | 47 | the site has never mapped these |

   The country is not decoration. Bare `?q=Reading` or `?q=Surrey` can land in
   Pennsylvania or British Columbia; `, UK` resolves them to 51.455,-0.979 and
   51.262,-0.467 — Berkshire and England. The source disambiguates the same way
   where it had to: nine of its own queries are not just the place name, among
   them "Preston London" (otherwise Lancashire), "Watford Hertfordshire" and
   "Royal Borough of Windsor".

   The heading is "Our Location", which is what the source writes above 110 of
   these maps. The homepage's own map and `/our-locations/`'s are different
   components and are untouched.

   A heading over 30 characters takes the smaller uppercase rank rather than the
   50px section head: `AREAS WE PROVIDE STANDARD CAR WASH SERVICES IN LONDON:`
   is five lines of capitals at display size, which is the same reason
   `ServicePage` sized that heading down when it had its own row.

   Three things it does differently from the reference — its rows are real
   `<Link>`s, because a location here is a page rather than an anchor, which
   makes the index a page's internal linking as much as it is a control; the
   whole list is server-rendered, so filtering only hides rows a crawler has
   already seen; and a letter key scrolls the list's own container, never the
   window (`scrollIntoView` moved the page 92px and left the widget half off
   screen). It writes nothing: every name is `placeName()` off a slug the site
   already publishes, so adding a location page to a family adds a row. A
   family is every page under its hub that `lib/location-moves.ts` or
   `lib/planned-locations.ts` names, so every index lists the mirror's own
   pages and the built ones together.

   **The footer strip.** Client, 2026-09-18: "all the new location pages can be
   in a scroll in the footer, like each being a location word then clicking into
   the location page… like our seo boost one, but a bit better with claude
   help", then "jangan lupa kasih pin point". `components/FooterLocations.tsx`
   is that strip, under the navigation's own label, "Our Locations".

   **It is on 199 pages and carries one family.** The first cut put all four
   families on all 305; shown that, the client scoped it — "is it possible to
   only show the location slider on these 3 pages and then just all the location
   pages", against the three service hubs, and "berdasarkan servicenya ya jangan
   semua ditambahkan". So a location page shows its own family, a service hub
   shows the family it is the hub of, and every other page shows nothing. The
   page itself is left out of its own strip.

   That is why one family is enough now. Four were needed when every page
   carried them all: a place here is up to four pages — Barnet is a borough hub,
   a car wash and a detailing page — so an unlabelled mix would have carried
   "Barnet" three times going three different places. A page that belongs to one
   family has no such ambiguity, and the label still names it.

   `Footer` takes an optional `slug` and only the catch-all passes one, so every
   hand-built route gets no strip by default rather than by remembering to.
   Dropping it from the homepage alone took that page from 661 KB to 258 KB.

   The reference is one drag-to-scroll strip of six country names, each behind a
   spinning globe. Three things are different:

   - **It scrolls itself** and **stops on hover and on focus**, because the
     point is to click a name and a moving name cannot be clicked. The duration
     comes off the strip's length (2.6s a name), so a 32-place strip does not
     race past while a 74-place one crawls.
   - **A touch screen gets no animation at all** — `@media (hover: none)` leaves
     a plain swipe-to-scroll strip, which is the reference's own behaviour and
     the only thing that works where there is no hover to pause with. Reduced
     motion gets the same, and both drop the duplicate half of the track, since
     it only exists to hide the seam in a loop that is no longer running.
   - **The loop is seamless** because the track holds the list twice and
     translates exactly −50%. The second copy is `aria-hidden` and its links
     carry `tabIndex={-1}`, so every page is announced and reachable once.

   The pin before each name is `Icon`'s own `pin`, carried as a CSS `mask` on
   `.loc-chip::before` rather than as an inline SVG per chip. `.loc-chip` itself
   exists for the same reason: the fourteen Tailwind utilities it replaces were
   adding ~250 KB to every page when the strip carried all four families.

3. **Its own route** — for a page the extractor mangled badly enough that a
   frame cannot save it (`/repairs/headlight-restoration`,
   `/vehicles/motorcycle-valeting-detailing`, the homepage, and the ten others
   in `CUSTOM_ROUTES`). Copy is transcribed verbatim into a `lib/*.ts` file or
   read back out of `pages.json`.

   **A fourth kind: the menu-group hubs.** `/repairs` and
   `/car-interior-cleaning` have no source page at all. The client asked for
   them — "a page for /Repairs will need to be created, which will have links
   that go to its childs" (2026-09-15), then "one more master page to create,
   with links on the master page going to its childs" against the Interior
   Cleaning column (2026-09-16) — and rule 8.1 forbids writing copy to fill a
   page, so `lib/hub.ts` reads every name, blurb, price, reason, question,
   region and photograph back out of the pages each group links to and
   `components/HubPage.tsx` lays them out in the shape `/car-detailing` has:
   the header with the group's entry price beside it (`components/PriceCard`,
   shared with `ServicePage` so the two cannot drift), then the reasons, the
   services, the questions and the coverage, gold and ink alternating. Add a
   service to a group and a card and a chip appear on its hub, carrying that
   page's own words. The homepage's `WhyChoose` is deliberately **not** on
   either — the client asked for the service pages' version of that section so
   a hub does not repeat the homepage.

   `lib/hubs.ts` holds one `HubSpec` per hub and both routes are four lines
   over `HubPage`. A third is that spec, an `href` on its NAV group, and the
   slug in two more places: because a hub is not in `pages.json` it is **not**
   in `CUSTOM_ROUTES` — there is no duplicate to exclude — and it has to be
   named in `app/sitemap.ts` and in `scripts/verify.mjs`'s `EXTRA_ROUTES`.

   The questions come from real `faq` blocks where the group has them — the
   interior pages carry twenty-one between three of the nine — and fall back to
   the group's own question-shaped headings where it does not, which is what
   `/repairs` uses.

   **A fifth kind: the 49 planned location pages.** The SEO plan's "Location
   build list" asks for 49 location pages the mirror has no page for — Luton,
   Reading, Surrey, Kent and 45 more. `lib/planned-locations.ts` builds each one
   out of its **service hub's** own content, the way a menu-group hub is built
   out of its children, and hands it to the ordinary location frame. They join
   `PAGES` in `lib/blocks.ts` rather than `pages.json`, because `npm run content`
   rewrites that file wholesale; everything downstream — the sitemap, the link
   checker, the sibling chips — then sees them as ordinary pages. `verify.mjs`
   reads the list out of the TypeScript, the way it already reads the redirects.

   The hub is cut into runs at the headings named in the plan's `cuts`, and only
   the named runs are carried. Two things are left behind on purpose: each hub's
   closing row, which lists the London boroughs the company covers, and the one
   FAQ question per hub that prices the service "in London" — on a Kent page
   both would be a claim about the wrong place. **What remains is the same
   service copy on all 49, differing only in the place name.** That is the limit
   of building a page with nothing written about the place; per-place copy from
   the client replaces it one hub at a time.

Prefer tier 1, then 2. Tier 3 is a maintenance cost — each one is a second
place the content lives.

### Rows into sections

A WordPress row is a unit of editing, not of design, and `Sections` re-partitions
them before rendering (`regroup` in `Blocks.tsx`). Nothing is added, dropped or
reordered — the cuts are made on `group()`'s own boundaries, so a price ladder,
an add-on run, a gallery or a flattened tab set is never split through.

1. **One row per topic** — a quarter of the site ships as a single row per page;
   `/mobile-car-wash` is one row carrying eight h2s. Only under
   `bands="alternate"`: a blog post is one argument and stays whole.
2. **Two statements in one row become two rows** (4 site-wide).
3. **A heading — or a heading and its lede — joins the row below it.** 211 of
   the first kind, `FAQs` among them, and 148 of the second: the source puts
   "Want added protection?…" and its sentence in one row and the four price
   cards it introduces in the next. A lede only joins a row that does not open
   with a heading of its own, which is what keeps two closing statements apart.
4. **A button-only row joins the row above it.**

3 and 4 only where the two rows already share a surface: a heading joining a row
that carries its own photograph would be moved onto that photograph, which is a
design decision rather than a regrouping.

Under `bands="alternate"` the renderer then **owns every row's background**: the
source's own colours do not alternate, so honouring them left long stretches of
one colour. A row with a photograph keeps it and sits outside the rhythm; so does
the page's own header.

A closing statement — a heading, one short paragraph and the call to action they
lead to — is set centred across the full width (`.statement`) instead of in the
narrow article column. Four sections qualify.

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

### The section standard

Set after an Impeccable audit found five vertical rhythms, a non-monotonic type
scale, and the site's most valuable content rendering through an unstyled
fallback. Every section, whoever renders it, now follows this:

- **Rhythm** — one value: `py-16 lg:py-[104px]`. The exceptions are the page
  header and a continuing surface (`py-9 lg:py-12`). The 64 / 72 / 88px variants
  are gone.
- **Heading ranks** — three, and only three. Section title 40px with the gold
  rule (`Sections` grants it to `leadHeading` alone); item title 27px, no rule —
  a second h2 inside a section is an item, not a section; card title 21px. The
  level scale is monotonic: h3 (21px) is now larger than h4 (17px), which it was
  not.
- **Cards** — a `columns` cell that opens with a photograph and carries a
  heading is a card, not a column: `CardRow` in `blocks-groups.tsx` gives it a
  `surface`, a fixed 3:2 photograph, equal height, and `mt-auto` on its actions
  so peers share a baseline. Consecutive rows with the same cell shape merge
  into one grid — otherwise each row sizes off its own cell count and the same
  package is 337px wide in one row and 525px in the next.
- **One primary action per card.** A card's foot carries two buttons — the
  booking link and a link to the package's own page. The booking link keeps
  `btn-gold`; its sibling goes to `btn-outline`. Two gold pills of equal weight
  left the card with no point of entry, and since the second is now named after
  the page it opens (below), one of them repeated the card's own title back at
  it. `Blocks.tsx` decides this from `ctx.actionRow`, which only `CardRow` sets.
  `actionRow` also drops the `mt-7 mx-1.5` a button carries loose in the prose:
  the action row is a flex row with its own gap, so **28px** above it (`pt-7`)
  and **10px** between two buttons (`gap-2.5`) are the whole spacing, and the
  buttons share the card copy's left edge. With the margins left on it was 56 /
  36 and a 6px inset, which is what the client saw — "maybe a little less space
  in between the buttons, and a general clean", 2026-09-14.
- **A link is named after where it goes.** Client, 2026-09-14: "could we name
  these buttons the names of the pages they lead into." `nameReadMoreLinks` in
  `overrides.ts` relabels every "Read More" with its destination page's own
  breadcrumb tail, so nothing is invented and a regeneration keeps the labels in
  step with the page titles.
- **Prices** — one treatment. A lone price is a badge whether the source wrote
  it as a heading or, on nine pages, as a paragraph.

**Vertical rhythm** — the agreed spec: **100–110 px** between sections on
desktop/laptop, **50–75 px** on small screens. In practice that is
`py-16 lg:py-[104px]` (64 / 104). Match it; do not invent new spacing.

**Gotcha, already paid for once:** `html { overflow-x: clip }` — *not*
`hidden`. `hidden` makes `<html>` a scroll container and silently kills
`position: sticky` for every descendant on the site.

---

## 7. Caching

Three caches stand between a render and a visitor, and none of them is flushed
by the same thing as the next:

| Layer | Holds | Cleared by |
| --- | --- | --- |
| Next's prerender cache | the rendered HTML for all 305 routes | a deploy, the hourly TTL, or `revalidatePath` |
| Cloudflare | whatever it was allowed to cache | a purge, or its own TTL |
| the browser | assets, mostly | `max-age` |

### ISR

`export const revalidate = 3600` sits in `src/app/layout.tsx`, so it is the
default for every route beneath it. All 305 pages are prerendered at build and
then held as cache entries with a one-hour TTL; `next build` prints
`Revalidate 1h` against each of them, and a self-hosted `next start` sends
`Cache-Control: s-maxage=3600, stale-while-revalidate=31532400` with them.

**Vercel does not send that.** It owns the ISR cache itself and replaces the
header with `public, max-age=0, must-revalidate`, so that nothing downstream
holds a page it cannot purge. Which is the whole of the next section's problem.

Development ignores all of this — `next dev` re-renders every request.

### Cloudflare, one hop further out

`medusaautodetailing.co.uk` resolves to Cloudflare, which proxies to Vercel.
What each layer was doing, measured 2026-09-18:

| URL | `Cache-Control` reaching Cloudflare | `cf-cache-status` |
| --- | --- | --- |
| `/`, and every other page | `public, max-age=0, must-revalidate` | `DYNAMIC` |
| `/sitemap.xml` | `public, max-age=0, must-revalidate` | `DYNAMIC` |
| `/_next/image/?url=…&w=64&q=75` | `public, max-age=2592000, swr=31536000` | `DYNAMIC` |
| `/robots.txt` | `public, max-age=14400, must-revalidate` | `REVALIDATED` |
| `/assets/…webp` | `public, max-age=2592000, swr=31536000` | `MISS` then `HIT` |
| `/_next/static/…woff2` | `public, max-age=31536000, immutable` | `MISS` then `HIT` |

**`DYNAMIC` means Cloudflare cached nothing.** Two separate holes, with
separate causes:

- **Every one of the 305 pages** was fetched from Vercel on every request. The
  CDN in front of it was a TLS terminator with a nice dashboard.
- **Every optimised image too** — and that one is not about the header, which
  is a perfectly good month. `/_next/image/` has no file extension, and
  Cloudflare's default caching is extension-driven, so it declines to cache a
  response it was explicitly invited to keep. The homepage alone carries **264
  `/_next/image` URLs**, so a single pageview was 264 round trips into a
  *metered* image optimiser. The block at the top of `next.config.ts` records
  what happens when that meter runs out: `402` and 525 blank photographs.

What was fine: `/assets` and `/_next/static`, both cached by extension off
their own long `max-age`, and — by accident — `robots.txt`.

`next.config.ts` now sends an `s-maxage` for `/sitemap.xml` and `/robots.txt`,
and `no-store` for everything under `/api/`. The rest cannot be fixed from
here: the pages' header is Vercel's, not ours, and `/_next/image`'s is already
right. Both need Cloudflare told what to do, which is a zone setting rather
than anything in this repo — three **Cache Rules**, under Caching → Cache
Rules.

The three expressions partition every path between them, so no request matches
two and the order they sit in is presentation, not behaviour.

1. **Bypass the API.**
   `starts_with(http.request.uri.path, "/api/")` → *Bypass cache*.
   Belt and braces over the `no-store` the route already sends. A cached
   `/api/revalidate/` would mean the second flush of a day silently never
   happened, and a cached `/api/build/` would have CI purge the cache it is
   trying to fill.

2. **Cache what already asked to be cached.**
   `starts_with(http.request.uri.path, "/assets/") or starts_with(http.request.uri.path, "/_next/")`
   → *Eligible for cache*, Edge TTL **Use cache-control header**.
   This is the `/_next/image` fix, and the biggest single win of the three:
   `/assets` and `/_next/static` were already cached by extension and lose
   nothing by being named, while `/_next/image` goes from `DYNAMIC` to `HIT`.
   Nothing about their TTL is overridden — the origin's month and year stand.
   Cloudflare's cache key includes the query string, so each `w`/`q` variant is
   its own entry, and Vercel's `&dpl=` deployment id means a deploy retires the
   old ones rather than serving them.

3. **Cache the pages.**
   `not starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/assets/") and not starts_with(http.request.uri.path, "/_next/")`
   → *Eligible for cache*, Edge TTL **Ignore cache-control header and use this
   TTL: 1 day**, Browser TTL **Respect origin** (which is `max-age=0`, so a
   browser still revalidates and a purge is visible immediately).

Two things that look like risks and are not. Cache Rules apply to `GET` and
`HEAD`, so the enquiry forms — server actions, which `POST` to the page's own
URL — are untouched. And the RSC payload a client-side navigation fetches
carries a `?_rsc=<hash>` query, which is part of Cloudflare's default cache
key, so it never collides with the HTML at the same path; Next's CDN guide says
the parameter exists for exactly this reason.

Rules 1 and 2 are safe on their own and can go in first. **Rule 3 is the one
with a day's worth of teeth**, and it is only safe once the purge below is
actually wired — until `REVALIDATE_SECRET` is set, a corrected price would sit
behind it for 24 hours.

### On-demand flush

`POST /api/revalidate/`, guarded by `REVALIDATE_SECRET`. With the variable
unset the route answers 503 to everything rather than defaulting to open.

It flushes **both** caches: `revalidatePath` for Next's, then a Cloudflare
purge — `purge_everything` for `{"all":true}`, purge-by-URL for a path list.
`lib/cloudflare.ts` holds that half and is a no-op that says so when
`CLOUDFLARE_ZONE_ID` / `CLOUDFLARE_API_TOKEN` are unset, so a preview
deployment or a local build is not a failure. A purge that was attempted and
*refused* is a 502, with `revalidated` still reported.

```bash
npm run purge
```

```bash
npm run purge -- /car-valeting/mini-valet /blog
```

`scripts/purge.mjs` reads `REVALIDATE_SECRET` from the shell or `.env.local`
and posts to `BASE`, which defaults to production here rather than to
localhost. The raw form:

```bash
curl -X POST https://medusaautodetailing.co.uk/api/revalidate -H "Authorization: Bearer $REVALIDATE_SECRET" -H "Content-Type: application/json" -d '{"paths":["/car-valeting/mini-valet","/blog"]}'
```

```bash
curl -X POST https://medusaautodetailing.co.uk/api/revalidate -H "Authorization: Bearer $REVALIDATE_SECRET" -H "Content-Type: application/json" -d '{"all":true}'
```

**The absence of a trailing slash is load-bearing**, and since 2026-09-19 it is
load-bearing the other way round. Normalisation is resolved before routing, and
`trailingSlash` is now off, so `/api/revalidate/` answers a 308 — and `curl`
does not follow one unless told to, so the call returns quietly having flushed
nothing. Every command in this file, `scripts/purge.mjs` and the deploy
workflow has been flipped; an older copy of one of these lines will silently
flush nothing.

`{"all":true}` goes through the root layout and takes every page with it.
Unknown paths are reported back in `unknown` rather than silently accepted.

### Auto-purge on deploy

`.github/workflows/purge-on-deploy.yml`, on every push to `main`.

The order is the point. Vercel starts building the moment the push lands, and
purging Cloudflare before that build is serving only refills it with the old
pages — so the job polls `/api/build` until it answers with the pushed
commit's SHA, and only then calls `{"all":true}`. `app/api/build/route.ts` is
the dozen lines that make that possible: `VERCEL_GIT_COMMIT_SHA`, stamped in at
build, served `no-store`.

One secret, `REVALIDATE_SECRET`, matching the deployment's — the Cloudflare
credentials stay in Vercel and are never copied into GitHub. Without it the job
writes a line in the run summary and exits clean rather than failing every
push.

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

It is also why "auto purge when the data updates" is a purge **on deploy**
rather than a diff of `pages.json`: a data update cannot reach a visitor
without a build, and once there is a build, every page is potentially different
anyway.

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
305 routes and checks: HTTP 200, an `<h1>`, non-trivial body text, every
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
- **WPBakery *column* backgrounds are dropped too, and these are recoverable.**
  The extractor reads `data-bg` off `.column-image-bg-wrap`, but the theme puts
  it on the `.column-image-bg` *inside* that wrapper. 37 photographs across 9
  mirrored pages are lost that way. `/car-valeting`'s seven package tiles are
  the ones that mattered — the source sets each tile's photograph behind a gold
  wash, and without it the row extracted as bare headings on a flat band, so
  `overrides.ts` hands those seven back (`restoreTilePhotos`) and the row
  becomes a `CardRow`. The remaining 30 are on `/about-us`, `/car-detailing`
  and the four detailing levels, where they sit behind other content rather
  than heading a card. Fixing the extractor is the real repair, but it means a
  full `npm run content`, which does **not** reproduce the committed
  `pages.json` from the current mirror — see §3 for why — so that regeneration
  has to be vetted on its own before anything rides on it.
- **Three service heroes are narrower than the 1270 px band they fill** —
  `/car-graffiti-removal` (800 px), `/safely-clean-sickness-vomit-from-your-car-interior`
  (980 px), `/car-windscreen-protection` (1152 px). No larger copy exists in
  the mirror; fixing them needs a fresh fetch from the live site.
- **A hub's introduction is borrowed, not written.** Client, 2026-09-16: "the
  data it needs should be on the child pages… just feed it the child pages,
  should be what it needs". It is — a few of these pages open on a paragraph
  about the whole subject rather than about their own service, and `spec.intro`
  names those. `/car-interior-cleaning` takes one from the interior valet page
  ("what's on the inside that counts"); `/repairs` takes two, from the graffiti
  and engine bay pages, which between them say that damage costs a car its
  value and the right work gives it back. Each is one paragraph, whole, and the
  card for that page then shows its *next* paragraph so the same words are not
  on screen twice.

  The same borrowing runs through the rest of a hub, and two spots are worth
  knowing about. `/repairs` has no `faq` block anywhere in its group, so its
  accordion is six of its pages' own question-shaped headings with the prose
  underneath; `/car-interior-cleaning` has twenty-one real ones and uses them.
  And no list in the interior group names no service at all, so its reasons
  mention leather in two of four bodies — the least specific of the nine.
  Written copy from the client replaces either in one line of `lib/hubs.ts`.
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
| `CLOUDFLARE_ZONE_ID` | `lib/cloudflare.ts` | The Cloudflare half of a flush is skipped, and says so. |
| `CLOUDFLARE_API_TOKEN` | `lib/cloudflare.ts` | Same. Needs one permission: Zone · Cache Purge · Purge. |
| `BASE` | `scripts/verify.mjs`, `scripts/purge.mjs` | `http://localhost:3000` for verify; the live origin for purge. |
