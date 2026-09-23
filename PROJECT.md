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

- **383 routes.** 254 in `src/content/pages.json` — the homepage is one of
  them, keyed `""` — plus the three **menu-group hubs**, `/repairs`,
  `/car-interior-cleaning` and `/vehicles`, and the **126 built location
  pages**, all of which have no source page and are built out of pages that do
  (§5).
- **No trailing slashes**, since 2026-09-19. The client asked for it - "I think
  URLs without a trailing dash is better" - so `next.config.ts` leaves
  `trailingSlash` at its default and `/mobile-car-wash/bronze-wash/` 308s to
  `/mobile-car-wash/bronze-wash`. Write every path bare: canonicals, the
  sitemap, `lib/site.ts`, the hrefs inside `pages.json`, **and the 301 table**,
  which Next matches after normalising and so would never fire on a rule that
  kept the slash. The cost is that a legacy WordPress URL takes two hops
  (`/valeting/` → 308 `/valeting` → 308 `/car-valeting`), and it is not
  theoretical: **211 of the 262 rows on the client's redirect sheet take two**,
  because WordPress published every one of them with a slash. Nothing this site
  renders points at a slashed URL, so nothing internal chains, and a crawler
  follows two hops without complaint. Collapsing them to one would mean either
  `skipTrailingSlashRedirect` and a proxy — a function in front of 305 static
  pages — or a Cloudflare **Bulk Redirect**, which is where a legacy map of this
  size belongs and which is a zone setting, like the Cache Rules in §7. The API
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

**The client's "Medusa redirect list" sheet is the authority for that table**,
and since 2026-09-19 it is written against the real domain rather than the
`*.vercel.app` preview. Its 262 rows were reconciled against the repo one by
one: 211 genuine redirects, all present with the same destination, and 51 rows
that name a page which still exists and differ only by the trailing slash the
sheet's left column carries. The only rules the sheet does not mention are the
eleven this clone made for itself on 2026-09-15 — `/ceramic-coating/*` and
`/car-detailing/*` → `/repairs/*` — which never existed on WordPress and so
could not be on a sheet about it.

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
- `page.breadcrumb` is the **mirror's** trail, flat and in pre-rename
  WordPress names ("Wheeluv", "Autoglym", `&#038;`), and is kept only because
  `nameReadMoreLinks` reads its tail for button labels. The `BreadcrumbList`
  in every page's JSON-LD comes from `lib/breadcrumbs.ts` instead: parent off
  the URL (a blog post's is `/blog`), name off `NAV` where the menu has one,
  every rung an absolute URL, none on the homepage. The site shows no visible
  breadcrumb. `npm run verify` checks all of it.
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

The other kind of correction the client asks for is a cut. `/car-detailing`
carried its LEVEL 1–5 packages three times over — as priced cards, as named
descriptions, and as a bare row of five `LEVEL n` links with nothing else in
them — and on 2026-09-22 the third of those went: "remove the level 1 2 3 4 5,
its a duplicate". `dropBareLevelRow` matches that row on shape, a cell of
exactly an h3 reading "LEVEL n" and an h4, so the priced row cannot match it;
and the page loses **no text at all** by it, which the content-conservation
check in §9 confirms — every word was already on the page twice. It also
carried a source error the other two rows do not: its LEVEL 2 was labelled
ENHANCEMENT, which is LEVEL 3's name.

One of those two retired tiers lost its last foothold on 2026-09-22: "Remove
bronze wash from menu". `/mobile-car-wash/bronze-wash` still renders and still
answers its 301 — the client asked for the menu entry to go, not the URL, as
they did when Car Wax Service changed column — but nothing on the site links
to it now. Exterior Wash is the other retired tier and is **not** in the same
position: it is still sold, and since 2026-09-22 it has a card of its own on
`/mobile-car-wash` (§5).

**A third kind arrived 2026-09-22: three plain errors the mirror ships**, which
the repo owner asked for corrected after the location audit turned them up.
None is a client request and none invents anything; each is matched on exact
source text and throws on a miss, like every other rule here.

| Where | The mirror says | Now | Reaches |
| --- | --- | --- | --- |
| `/car-detailing` | "**four** distinct detailing packages" | "five" | the hub + 72 built detailing pages |
| `/mobile-car-wash` | "we bring that **experience and experience** to every job" | "that experience" | the hub + 27 built wash pages |
| 4 borough hubs | "All areas we cover **in London** are highlighted on the map, if **you're** location isn't covered" | the page's own place, and "your" | `/our-locations/{watford,slough,buckinghamshire,hertfordshire}` |

The package count was right until Mini Car Detail was added as LEVEL 2 and the
sentence over the row was not updated; the hub's own FAQ still names the
original four, which is where the number came from. The doubled word is in
`.cache/html` as well as live, so it is the client's rather than the
extractor's — and the fix is to drop the repeat rather than to guess at
"expertise".

The caption is on all nineteen `/our-locations/*` hubs and the homepage, and is
**correct on the other fifteen**: the map on a Camden page is of London. Only
the four outside it were touched, and only the sentence — the heading above it
says "IN LONDON & SURROUNDING AREAS", which is true everywhere. The other
fifteen keep the `you're` typo, which is a separate call.

They live where the shape of each one belongs: the two hub errors in `RULES` in
this file, the four captions in `MIRROR_EDITS` in `lib/local-mirror.ts` under
`MIRROR_FIXES`, a set that takes `applyMirrorEdits` and none of the audit's
other passes — a borough hub already has its own heading ranks and its own
areas row. **One coupling worth knowing:** `HUB_LINES.wash` matches the wash
sentence *after* this correction, because overrides run before
`buildPlannedLocations`. Move one and the other throws.

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

   **199 pages carry it**, above the footer and last on all but eighteen —
   the borough hubs whose top-sight row now closes the page below it (below):

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

   **The top sights, last band on the page.** Client, 2026-09-21, against
   `/our-locations/buckinghamshire/`: "can you please move this top sight
   section to the bottom of every our-locations/* page", and then, of a first
   pass that put it above the A–Z index: "Section Top Sight harus muncul
   setelah semua section/konten lainnya dan tepat sebelum footer". So it is
   below the index too, and it is the one row that is — **this supersedes the
   2026-09-17 instruction** that put the navigational widget "at the very
   bottom of the page, just above the footer", on these eighteen pages only.

   The 18 borough hubs that carry a "<Place>'s Top Sight" row are the only
   pages on the site that have one, and it stood third on them — nine museums,
   palaces and markets between the page's opening sentence and every package
   it sells, so the page led on the borough rather than on the service. The
   foot of a borough hub now reads questions, map, index, sights.

   Nothing about the row itself changed: same photographs, same captions, same
   grid, same `Sights` component. It takes one hairline of its own in the move
   — the one the chips row above it used to lend — and the footer's own
   `#0d0d0d` band closes it below, so there is no double rule at the seam.

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

   `lib/hubs.ts` holds one `HubSpec` per hub and each route is four lines over
   `HubPage`. A new one is that spec, an `href` on its NAV group, and the slug
   in two more places: because a hub is not in `pages.json` it is **not** in
   `CUSTOM_ROUTES` — there is no duplicate to exclude — and it has to be named
   in `app/sitemap.ts` (in `HUBS`) and in `scripts/verify.mjs`'s
   `EXTRA_ROUTES`.

   **`/vehicles` is the third**, added 2026-09-22: "We need to create a page for
   Other Vehicles as well, which will include the children". It is the smallest
   group — a caravan page and a motorcycle page, neither quoting a price, so
   both cards carry the quote button — and it needed two things the first two
   did not:

   - **`runTogether` in `hubReasons`.** The caravan page is the group's only
     one with a "Why Choose Medusa Auto Detailing?" row and it writes its four
     reasons as bold labels and sentences inside a **single `<br>`-joined
     paragraph** rather than as a list. Splitting on the breaks and handing the
     fragments to the same parser reads them as written. Two of the four name
     caravans in their labels, which is this group's version of the leather
     problem on `/car-interior-cleaning` (§10).
   - **`servicesHeading`.** "Our " + "Other Vehicles" + " Services" is two
     determiners deep and reads like a typo, so this hub says "Our Services for
     Other Vehicles". The other two keep the pattern.

   Its questions are all from the motorcycle page, the only one in the group
   with a real `faq` block — so the accordion says nothing about caravans. Its
   coverage chips come from the caravan page's "Mobile Caravan Valeting Near
   You" paragraph, the only one the group points a region at. Both are the
   ordinary limit of building a page out of two children, and both take one
   line of `lib/hubs.ts` to replace when the client writes copy.

   `cardImages` names both photographs, because the two pages share an OG image
   and neither card could be photographed by rule without printing the same
   picture twice. The motorcycle one also carries a crop point, which is why
   `cardImages` takes `{ src, position }` as well as a bare string: the site's
   one motorcycle picture is a 1024x1536 poster with its title baked across the
   top third and a services list across the bottom, and a 3:2 card centred on
   it shows the bike **and** "OUR MOTORCYCLE VALETING & DETAILING SER-" clipped
   mid-word along its foot. At `50% 30%` the crop is the bike and nothing else.

   The questions come from real `faq` blocks where the group has them — the
   interior pages carry twenty-one between three of the nine — and fall back to
   the group's own question-shaped headings where it does not, which is what
   `/repairs` uses.

   **The card grid is no longer only a hub's.** Client, 2026-09-22, listing
   URLs under four headings — "On /mobile-car-wash — add these 3 services:",
   the same for `/car-detailing`, `/car-valeting` and `/commercial-valeting` —
   and then, over a screenshot of `/repairs`: "And in, the same way you did for
   repairs page". So `components/ServiceCards.tsx` is that grid, lifted out of
   `HubPage` unchanged, and `lib/hub.ts`'s card builder is `cardsFrom()`, which
   a hub and a service page now both call. A card copied into a second file is
   a card that drifts from the first.

   `lib/service-cards.ts` says which services each page shows. **Each list is
   exactly what that page was missing**, checked against the rendered pages on
   the day: `/mobile-car-wash` linked silver, gold, platinum and exterior-plus
   and nothing else — bronze and exterior wash being the two tiers
   `overrides.ts` retires from its price row — `/car-valeting` linked five of
   its seven, `/car-detailing` five of its eight, and `/commercial-valeting`
   none of its three. So a card never repeats a package the page already sells;
   the band closes the gap between a menu column and the page under it.
   `/car-valeting` is no longer in that file — see below — so three pages have
   a band and the fourth has two more tiles in a row it already had.

   Its `navItemFor()` searches the **whole** menu rather than one column,
   because a service is not always in the column of the page that shows it:
   Car Wax Service has sat in Car Valeting since 2026-09-08 and its page is
   under `/mobile-car-wash/`, which is where the client wants its card. It
   throws when a slug is not in the menu, so no card can carry a name this
   repo invented.

   **Where it sits: last of the page's own bands, above the closing one** —
   after the fleet list and before the enquiry form on `/commercial-valeting`,
   so the page still closes on the way to ask a price. That is the default
   because two of these pages carry their FAQ row inside the source body, and
   "above the questions", which is where a hub puts its grid, would mean
   cutting the body in two.

   **Two of the four ask for exactly that cut**, so `ServiceGroup.after`
   exists: name a heading and the frame renders the body in two `Sections`
   calls with the band between them. `/car-detailing` first — "on cardetailing,
   place it here where its black", the slot its duplicate LEVEL 1–5 row left
   when the same message had it dropped (§4) — and then `/mobile-car-wash`,
   "add in here", an arrow drawn on the seam above its gold "A Mobile Car Wash
   Near You" band. Both cuts fall after the "Why Choose Medusa Auto Detailing?"
   run, which is a coincidence of where the client pointed rather than a rule.

   **`splitAfter` cuts blocks, not sections**, because those two pages are not
   built the same way: `/car-detailing` writes its eight rows as eight sections
   and `/mobile-car-wash` writes its ten as **one** (§5, "Rows into sections").
   The cut falls immediately before the next top-level heading — a boundary
   `group()` would have cut on anyway, so both halves regroup into the bands
   the whole body did. The heading is matched, never an index, and a heading
   that is no longer there throws rather than quietly putting the band back at
   the foot of the page.
   The second half simply starts gold, which is what a fresh `alternate` call
   does anyway — the band between the halves is an ink row, so whatever colour
   the first half ended on, the row after the band wants the gold. A
   `startGold` prop was written for this and thrown away: it could only ever
   have been passed `true`.

   Both of those pages say **"Other**", not "Our" — "Instead of 'Our', add in
   'Other' on this /car-deatiling page", then the same for the car wash band an
   hour later. It is the two pages whose band sits among their own packages
   rather than after them, and "Other" is what tells a reader these are not the
   levels or tiers above. `/commercial-valeting` still says "Our", because
   nothing on that page precedes it.

   **`/car-valeting` has no band at all.** "for car valeting page, add the to
   the existing area here", against the gold "MORE VALETING PACKAGES" row — so
   its two services are two more tiles *in* that row, added by
   `content/overrides.ts` in the shape its seven already have (`h2`, `h5`, Read
   More, Book Now), which is what lets `asCardRow` merge all nine into one grid
   at one card size. Nothing is written there either: the title is the client's
   own menu label in the capitals the row is written in, the sentence is the
   page's own opening paragraph, the Read More label is filled in by
   `nameReadMoreLinks`, and the photograph is named in `VALETING_TILES` beside
   the other seven. Both pages share an OG image and a header background, so
   neither photograph could be picked by rule.

   The grid caps its track at 400px (`auto-fit`) instead of dividing the shell,
   because a two-card row at `grid-cols-2` was 615px a card on a page whose
   every other card row is 301–403px — the §6 inconsistency exactly. A short
   row now ends early rather than stretching. The hubs pass their own column
   count and are untouched.

   **A fifth kind: the 126 built location pages.** The SEO plan's "Location
   build list" asked for 49 of them, for places the mirror has no page for — Luton,
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
   both would be a claim about the wrong place. **What those runs are is the
   same service copy on all 49, differing only in the place name** — the price
   ladder, the add-ons and the questions, which are the same service wherever it
   is sold.

   Around them the page is its own. `lib/local-copy.ts` supplies the header
   paragraph, an H2 and a band beside the hub's service description, a second
   band above the questions, a coverage question inside them, and the districts
   row that closes the copy — per *(place × service)* since 2026-09-22, so a
   place that carries all three services gets three different pages rather than
   one page three times (§10). Written copy from the client replaces any of it
   one entry at a time.

   **And the hub's own sentences about London are rewritten to name the page's
   place.** Client, 2026-09-22, on `/car-detailing/watford`: "the write up here
   needs to be customized to suit the area, im on the watford page, and its
   mentioning london and hertfordshire". They were reading the hub's opener to
   its price ladder — "four distinct detailing packages to our customers in
   London and Hertfordshire" — which every page of that family carried
   verbatim. **Eight sentences across the three hubs put a London claim on 118
   of the 126 pages**; `HUB_LINES` in `lib/local-copy.ts` is the rewrite of each
   one and `localiseHubLines()` in `planned-locations.ts` applies them.

   A rewrite moves the geography and nothing else: every claim the source makes
   — the twenty years, the 100% satisfaction rating, the standing, the four
   packages — survives with its scope intact. Where a sentence dates the
   business *by* London ("across London for more than 20 years") the duration is
   kept unqualified and the place named as somewhere the work is done, because
   re-scoping it would claim twenty years in Watford, which is a fact about the
   business no page supports (§8, rule 1). The wash rule's needle is the
   sentence **as `overrides.ts` leaves it** — that file corrects a word the
   mirror doubled, and it runs first (§4).

   **Every rule must fire on every page of its family**, or the build throws. A
   hub is regenerated wholesale by `npm run content`, so a sentence that has
   moved or been reworded would otherwise go quiet and put "London" back on 118
   pages. Audited across all 126: **0 pages naming a place they are not about.**

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
`Gallery`, `FeatureCards`, `Steps`, `LinkChips`, `ReviewBadges`) and renders
them as a component instead of a flat list.

**The review row is the newest of those, and the narrowest.** Client,
2026-09-21, of the 18 borough hubs on a phone: "tampilan ini aneh di mobile".
The three review sources are a `columns` row whose every cell is a 128px mark
over "5/5 Stars", and the generic columns renderer stacks below `lg` — which
is right for a cell carrying a heading and prose and wrong for this: three
140px blocks of logo over caption, 484px of column with the width beside them
empty, adrift on the gold band. `asReviewBadges()` claims a row only when
**every** cell is exactly a mark plus a caption of 24 characters or less, a
shape that occurs once on the site, and `ReviewBadges` sets them as the tiles
`components/sections/Testimonials` already gives the same three on the
homepage — the mark at 38px and the label, on one line. A tile is 70px instead
of 140, so the section is 1324px on a phone rather than 1574.

**Without the homepage's stars.** That tile ends on five gold ones; the client
saw them here and said "bintangnya hapus aja" (2026-09-21), so this row has
the mark and the label and nothing else. They were decoration of the label
rather than anything the cell said, so the tile lost nothing the source wrote
— which is also why the homepage keeps its own.

Layout only, as ever: the words are the cell's own, and the mark keeps the
source's own `alt` — "Google Pin", and two that are the upload's filename —
rather than the homepage's empty one, because the ordinary image renderer
keeps it. `/our-locations/` and the homepage carry the same three badges
through their own routes and are untouched.

**A numbered ladder is a ladder, not a layout.** Client, 2026-09-22, over a
screenshot of `/car-detailing`'s LEVEL 1–5 explanations: "bagian ini bisa di
redesign ulang gk?". The source writes them as five columns of bare
`LEVEL n: NAME` and a paragraph, and the ordinary columns renderer set them as
five stacks of prose on a flat band — 435 characters under the first and 279
under the third, so the row ended ragged and the ranks read as five unrelated
blocks rather than as a progression.

`asRungCards` claims that shape and hands it to `FeatureCards numbered`, which
the site already uses for a set that reads as a progression: the ghosted
`01…05` numeral in the display face, a `surface` card, equal heights, and the
gold underline that draws in on hover. Five cards of 406px on desktop, which
is the width every other card row on that page runs at, and one column on a
phone.

Three things keep it honest. The **rank moves into the numeral** and the card
is titled with what follows the colon — the same split `asFeatures` makes on
every "Label: text" list item on the site, so nothing is reworded and the
paragraph is untouched. It is claimed **only when the numbers run 1…n in
order**, because `FeatureCards` numbers by position: a row labelled 2, 4, 5
would be numbered 01, 02, 03 and each card would lie about its own rank. And
**one word for all of them** — five cells that each name a different thing are
a set, not a ladder. Site-wide the shape matches two pages, one of which
(`/detailing-2`) has 301'd away since 2026-09-15, so it renders on one.

The conservation check (§9) reports one fragment for this: the joined string
"LEVEL 1: NEW CAR/PROTECTION". Both halves are still on the page — the card is
titled "NEW CAR/PROTECTION" under an `01`, and the priced row above still
writes "LEVEL 1" — so no word is lost, only the label-and-colon form, which is
the gap §9 already records against `asFeatures`.

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

**No two bands of the same colour touch.** Client, 2026-09-22: "pastikan warna
bg tetap selang seling". `alternating` has always done this for the rows a
page's *body* renders, but a frame that adds a band of its own used to
hard-code its colour, and three did:

| Where | Was | Now |
| --- | --- | --- |
| `LocationPage`'s "How It works" | always gold — and on **14 of the 19** borough hubs the body row above it was gold too | asks `bandAfter(model.body)` |
| The services band (§5) | always ink — which landed under an ink row on `/mobile-car-wash` | asks `bandAfter(cut.before)` |
| `/our-locations` | five gold bands in a row: two service rows, the explainer, the portfolio, the reviews | its explainer and `Testimonials` take ink; Portfolio keeps the gold the client gave it |

`bandAfter(sections, startGold?)` in `components/Blocks.tsx` is what they ask.
It regroups the sections the way `Sections` will and reports the colour the
next row wants — the regrouping has to happen there, because `Sections` is
what merges rows, so a frame counting its own sections would count the wrong
ones. The half of a split body that follows such a band is told where to pick
up, with `startGold`.

Each of those components grew an `onGold` prop rather than a second copy, so
one band is one component in two tones. `Testimonials` is the homepage's and
**stays gold there** — the homepage already alternates, and it is only
`/our-locations` that runs it against another gold band.

Audited across all 256 rendered pages: **0 adjacent gold bands**. Two things
the audit deliberately does not count. A *continuing surface* — one band
written as two rows, `py-9 lg:py-12` at the seam — is one band, and
`/our-locations` has the site's only one. And a run of **ink** at the foot of
a page is by design: the questions, the map and the A–Z index are the frame's
own closing bands and have been ink on all ~300 pages since they were built.

**The card blurb reads from the opening run.** Fixing the bands turned up a
card that described the wrong thing: `/mobile-car-wash`'s Exterior Wash card
quoted the congestion-zone surcharge. `blurbOf` took the first paragraph of 90
characters or more anywhere on the page, and that page's own opener — "Bring
your car's exterior back to life…" — is **85**, five short, so the search ran
past it into the add-ons. It now searches the run above the first section
heading on a floor of 60 and only falls back to the whole page on a floor of
90. Two of the site's 24 cards changed, both to their page's real opening
sentence.

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
   TTL: 1 day**, Browser TTL **Override origin: 2 hours**.

   Browser TTL was *Respect origin* until 2026-09-21, and what it respected was
   Vercel's `public, max-age=0, must-revalidate` — which cannot be changed from
   this repo. `headers()` in `next.config.ts` reaches `/sitemap.xml` and
   `/robots.txt`, because those are route handlers; it does not reach a
   prerendered page, whose header Vercel owns so that nothing downstream holds a
   page it cannot purge. So every repeat document load fetched the whole page
   again, and since Vercel sends **no `ETag` and no `Last-Modified`** with an ISR
   page, that revalidation could never come back as an empty 304. It was 27 KB
   of homepage on the wire every time, on a `cf-cache-status: HIT`.

   The override now sends `public, max-age=7200, must-revalidate`, and **the
   `must-revalidate` is not the part that mattered** — it only forbids serving a
   response that is already stale. Under `max-age=0` every response was stale on
   arrival, so it applied to every request; at 7200 it does nothing until the two
   hours are up. 2 hours is the floor of the dropdown in this dashboard.

   The cost is printed on the setting itself: **a purge does not reach a
   browser.** `npm run purge` and the deploy workflow still clear the edge
   instantly, but a visitor who loaded a page in the last two hours keeps their
   copy — the client among them, checking the site after a change they asked
   for. A Transform Rule is the way below the dropdown's floor if that becomes a
   problem: Rules → Modify Response Header → set `Cache-Control` to
   `public, max-age=300, stale-while-revalidate=3600` on this rule's expression,
   with Browser TTL back on *Respect origin*.

   `/sitemap.xml` and `/robots.txt` match this rule too, so the `s-maxage` set
   for them above is overridden at the browser. A crawler keeps no browser
   cache, so it costs nothing.

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

   **One exception, granted 2026-09-22: `src/lib/local-copy.ts`.** The client
   asked for the last item on the SEO plan — "all service + location pages…
   need to be more localized, in the copy, some location pages only mention the
   location in the h1… Each service + location page needs to be somewhat
   original" — and the repo owner lifted the rule for that one file: "aturan
   8.1 bisa diabaikan, kendali penuh atas isi konten akan diberikan, website
   ini adalah milikku".

   It is one file so that every written sentence on the site is in one place to
   review. What it may hold is **geography** — which county a town is in, which
   road reaches it, which districts sit beside it — and **restatements of what
   the business already says about itself** on every other page: that the
   service is mobile and comes to a home, a workplace or a car park. What it
   must never hold is a fact about the *business* that no page supports: no
   response times, no customer counts, no years in a place, no prices, no
   awards. Those are claims the client has to answer for.

   **A second file joined it later the same day: `src/lib/local-mirror.ts`**,
   for the 75 mirror location pages on the client's Ahrefs-verified list. Its
   scope is narrower again — see rule 2 — and the same guardrail applies to
   every word in it. The two files together are the whole of the written word
   on this site; nothing else anywhere may grow a sentence.

   **`HUB_LINES`, at the foot of `local-copy.ts`, is the third thing that file
   holds** and the only one that rewrites the mirror's own words rather than
   adding to them: eight sentences a service hub writes about London, in the
   version that names the page's own place (§5). The repo owner chose that on
   2026-09-22 over dropping the sentences, after the client read one of them on
   `/car-detailing/watford`. A rewrite moves the geography and nothing else —
   every claim the source makes keeps the scope the source gave it, which is
   what keeps this inside the guardrail above rather than a way around it.

   The rule stands everywhere else. A section that looks empty is still
   restructured, not filled.
2. **Do not change content.** Layout only. Copy, casing and punctuation stay
   verbatim — including `London` in a heading that is otherwise uppercase.

   **Narrowed once, 2026-09-22, for the location audit**: on the 75 mirror
   location pages named in `MIRROR_AUDIT`, a **heading** may be rewritten and a
   **typo may be corrected**, and nothing else. Asked how far to go, the repo
   owner chose "Headings + typos only" over rewriting generic paragraphs. So
   the 188 renames in `lib/local-mirror.ts` are headings, the 169 text rules
   are repairs to machine-spun English the mirror shipped with ("scrapes and
   swirls on the lorry's surface area"), and **not one source paragraph was
   rewritten** — 2,973 of 3,285 text fragments are byte-identical and the other
   312 are exactly the ones those tables name.

   Heading *levels* are a separate matter and are layout: `promoteSections`
   moves 136 section titles from `h3`/`h4` to `h2` and changes no words at all.
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
  source paginates at 10 and this index does not paginate at all. It used to
  show nine cards under the lead and reveal ten more per press of a Load More;
  the client asked for the button to go on 2026-09-22 — "On blog, load all
  blogs at once, remove (load more button)" — so `components/BlogGrid.tsx` is
  a server component again and every post is in the served HTML. This is the
  one intentional exception to rule 8.1. It also means WordPress's
  `/blog/page/2…5` have no counterpart here, and neither does
  `/category/uncategorized`, the default category every post was filed under.
  All nine were indexed and all nine 404'd until the client's sheet surfaced
  them on 2026-09-19; they redirect to `/blog` now.
- **A second round of 77 built pages, 2026-09-22.** From "Medusa ads keywords,
  Ahrefs verified.xlsx", the "By area" sheet: 75 areas ranked by verified
  search demand, three service columns, and a **pink cell** wherever an area
  has no page for that service. 101 cells were pink; 24 of them this repo had
  already built in round one, so 77 were real. They are in the sheet's own
  demand order within each service, so the areas worth the most were built
  first: 47 detailing, 17 wash, 13 valeting, across 61 areas.

  `PLANNED_LOCATIONS` is 126 rows now and `lib/local-copy.ts` covers 76 places
  — every one of them, and since later the same day every *(place × service)*
  pair too. Nothing else changed — the same builder, the same frame, the same
  audit. The build list and the copy are two files, and adding to either
  without the other throws at build rather than shipping a page of hub copy
  under a place name.
- **The built location pages are local at the top and shared below it.**
  Before 2026-09-22 they shared **100%** of their eight-word sequences with a
  sibling and **48 of the 49** never named their own place below the h1.
  `lib/local-copy.ts` now gives every place two written paragraphs and a row of
  real neighbouring districts, so **126 of 126** name their place, every meta
  description differs, and each page opens on copy about its own town.

  **`services` is the second pass**, later the same day, against the 124 URLs
  on the client's Ahrefs-verified list. The first pass was per *place*, which
  left Brentwood's three pages — a wash, a valet and a detail — carrying the
  same 75 written words as each other; `LocalService` is per *(place ×
  service)*.

  It adds three things to a page: an **H2 over the opening band**, which until
  then was the only run on the page that no heading introduced; a **second band
  of its own copy** above the questions, so the page reads local, then the
  service, then local again; and the **coverage question** the hub's accordion
  cannot answer, since the hub's own is the one `dropQuestions` removes for
  being about London. `addQuestion` and `insertBeforeFaq` both match the `faq`
  block rather than an index, and both throw when it is not there.

  **It covers all 126 since later the same day.** It went out optional, so the
  77 round-two pages not on the client's list built as they had — and that is
  what the client was looking at when they said "its good, just need some h2
  here" of `/car-detailing/watford`, a round-two page. Its opening band had no
  heading because that place had no `services` entry. All 126 have one now:
  **126 entries across 72 places, 252 written headings, all distinct.**

  The measured effect on round two: the median page's overlap with its closest
  sibling falls from **93% to 75%** — below round one's own 78%, since these
  were written against a QA pass that round one predates. What remains shared
  is the price ladder, the add-on catalogue and the FAQ, which are the same
  service wherever it is sold; the worst pages left are the valeting ones,
  where the add-ons run alone is 706 words. Going lower means more written copy
  per place or carrying fewer of the hub's runs, and the second removes
  content, so it stays the client's call.

  `services` is no longer optional in practice but is still typed that way, so
  a place added to `PLANNED_LOCATIONS` without one does not throw. The check
  that catches it is the audit, not the build: every built page's second `<h2>`
  should be its own, never `Our Mobile Car Detailing Packages`, `A Quick Clean,
  Inside and Out` or `OUR PACKAGES`.

  The header carries one of those paragraphs and no more: all three stacked was
  165 words of header, a screen and a half on a phone, against the 34–73 words
  the mirror's own location pages run to. The second paragraph and the hub's
  service description are the band below it, **with a photograph beside them** —
  client, 2026-09-22, of `/car-detailing/watford`: "coba tambahkan gambar di
  bagian ini, agar tidak keliatan sepi". It was text in the left 45% of a gold
  row and nothing in the rest.

  `PHOTOS` in `lib/planned-locations.ts` holds six per service, **rotated by the
  page's position in the build list**, so neighbouring places do not open on the
  same picture. Every one is already on that service's own pages; nothing was
  added to `public/assets` for it. The cell shape is what `Blocks.tsx` reads as
  a media split — two cells, one of them nothing but a picture — so it centres
  the pair and lets the photograph stick while the copy scrolls, and stacks on a
  phone. `/our-locations/city-of-westminster` carries one for the same reason.

  **The header carries one too**, from the same pool half a turn ahead, so no
  page shows the same picture twice. Client, same day: "ini bannernya gk ada
  gambar" — and none did: of the 146 mirror location pages, 18 open on a video
  and **128 on the livery pattern alone**. `LocationPage`'s header now frames a
  photograph the way it already frames that video, under the same
  `bg-black/[0.74]` wash, so white type keeps its contrast. It reads the picture
  off the section's own `bg`, so the 128 mirror pages are untouched — they have
  no `bg.image` and still get the livery.

  The shingle figure only moved to **96%**, and that is honest rather than
  disappointing: what remains shared is the price ladder, the add-on catalogue
  and the FAQ, which are the same service wherever it is sold. On
  `/car-valeting/kent` the add-ons run alone is 706 words against 155 of local
  copy. Two levers remain if the client wants the number lower — more written
  copy per place, or carrying fewer of the hub's runs on these pages — and the
  second removes content, so it is the client's call rather than ours.
- **The mirror location pages were structurally wrong, not thin.** The other 75
  pages on the client's list come off the mirror, and an audit on 2026-09-22
  found their prose in much better shape than expected: every one of them names
  its place below the h1, a median of thirteen times, and the median overlap
  with a sibling is **35%**. Watford's body names Cassiobury, Croxley Park,
  Clarendon Road and Nascot Wood. There was nothing to rewrite.

  What was wrong was the markup and a decade-old spinner:

  - **136 section titles on 47 pages were written as `h3` or `h4`** — "How Our
    Services Work?" on 41 of them, "Why Medusa Auto Detailing?" on nine,
    "Enhancing Vehicle Longevity in …" on fourteen — so a row's title sat at
    the same rank as the items inside it and below the rank of the row above
    it. `promoteSections` puts them back at `h2` and moves the 159 headings
    under them down by the same amount, floored at 3, because promoting a title
    without its items only trades an `h2→h3→h3` for an `h2→h4`. **No words
    change.**
  - **150 of 339 source H2s never named their page's place.** 188 of them are
    renamed, at most three per page and only where that row's own body already
    talks about the town — a page whose every heading names it reads like spam.
  - **Machine-spun English**, live on the client's site since WordPress: "how
    do you manage scrapes and swirls on the lorry's surface area" on nine
    pages, "Just how usually should I have my car valeted" on nine, "Say
    goodbye to Waiting … Your Hectic Way Of Life" on seven, "Mobile Car Wash
    **sERVICES**" on one. 169 corrections, each matched on the exact source
    string. `pattern()` tolerates the `&nbsp;` the extractor keeps mid-sentence
    on four of these pages, because a literal `includes()` misses it and a
    missed patch throws.

    **Two rules can shadow each other, and the throw is the only warning.**
    Headings are applied before text and text rules in order, all against the
    same mutating page — so a rule whose target an earlier rule has already
    rewritten matches nothing and takes the build down. It happened twice:
    once where a text rule aimed at a heading that was also being renamed, and
    once on `/mobile-car-wash/wimbledon`, where one rule covered sentences 2-3
    of a paragraph and a later one sentences 1-2, overlapping without either
    containing the other. Checking each rule against the *pristine* page misses
    both. The corrections are written one **sentence** at a time for that
    reason, and the check that matters is a replay of `applyMirrorEdits` in
    order against a copy.

    **It happened a third time on 2026-09-22, and the lesson is narrower than
    "replay it".** The round-two work added a whole-sentence rule for a spun
    FAQ question to four pages that were *already* repairing the same sentence
    through shorter fragments — "Exactly how do you", "scrapes and swirls on
    the lorry". The new rule ran first, rewrote the sentence, and the existing
    fragments then matched nothing. A replay of only the **new** entries passes
    cleanly; it is the pages you are not editing that break. So the replay has
    to cover the whole of `MIRROR_EDITS`, and the cheap standing check is
    simpler still: within one page's `text` list, **no `from` may contain
    another `from`**. Site-wide that number is 0, and it is 0 because two of
    those four pages ended up with a small trailing fragment each
    (`"the lorry's surface area?"`, `"surface area?"`) appended **last**, so it
    runs on what the rules above it leave behind rather than racing them.
  - **No districts row**, where the 126 built pages and the 19 borough hubs all
    have one. All 75 get `<Place>’s Neighborhoods` out of `LOCAL_PLACES`, which
    is the shape `location-frame.ts` already renders as the chips under the
    header. Edgware, Golders Green and Harrow had no entry in `local-copy.ts`
    and were written for this.

    The guard is keyed to **the page's own place name**, not to the word: ten
    of these pages head a row of ordinary prose "At-Home Car Cleaning in
    Kingston’s Neighbourhoods", and a length-bounded pattern let some through
    and turned others away — which is how Barnet, Kingston and Wembley each
    went a round without the row they were supposed to get.

  **Left alone, and worth a decision: 21 of these pages end a section on a bare
  `Portfolio` heading with nothing under it** — a dead WordPress row, like the
  `[page-generator-pro-related-links]` shortcode. Asked, the repo owner chose to
  keep it and have it flagged rather than have `promoteSections` drop it, so
  `NOT_A_TITLE` turns it away and it renders exactly as the mirror has it.

  **The 52 mirror location pages not on the client's list got the same
  treatment later the same day**, once the client widened the ask to "all
  location pages". `MIRROR_REST` is that set — kept separate from
  `MIRROR_AUDIT` rather than merged into it, because the provenance differs:
  one list is the client's and the other is ours. Both take the same three
  passes, and the same rule 2 narrowing.

  | | Before | After |
  | --- | --- | --- |
  | section titles still at `h3`/`h4` | 44 of 52 | **0** |
  | pages with no districts row | 41 of 52 | **0** |
  | `h2`s that name their own place | 160 of 378 (42%) | **222 of 404 (55%)** |
  | machine-spun English, across all 146 mirror location pages | 12 pages | **0** |

  138 heading renames and 78 text corrections, against the first pass's 188
  and 194. The districts rows needed **11 new `LOCAL_PLACES` entries** —
  Belgravia, Brent, Colindale, Earls Court, Eastcote, Friern Barnet, Hendon,
  Hillingdon, Mill Hill, Stratford and West Brompton, none of which had one,
  because that file was written for pages with no source at all.

  `promoteSections` alone closed the first row of that table and **changed not
  one word**; it only ever needed the 52 adding to the loop.

  **Two things this second pass turned up in the first one.** Two spun FAQ
  sentences its detector never looked for — "our team gets here completely
  geared up", "The moment varies relying on the package" — sit byte-identical
  on eleven pages, nine of them already audited; and a re-sweep of all 146
  found five more pages still carrying "surface area", "lorry" or "radiates
  without". Both are fixed, with the wording the first pass had already
  settled on for the same sentences elsewhere.

  **And one live hazard, checked and found not to bite.** `location-frame.ts`
  claims whole rows by matching their heading — `STEPS_RE = /^how it works$/i`
  and seven others — so renaming one silently hands the row to a different
  renderer. Eight pages in the first pass renamed "How It Works". It cost
  nothing: the frame also requires `stepPairs(section).length >= 2`, and all
  ten pages carrying that heading write the row as four `paragraph+paragraph`
  cells with no step pairs at all, so it was never claimed either way. The
  check is worth keeping anyway — it is silent when it does bite.
- **`/our-locations/city-of-westminster` was a three-word page** until
  2026-09-22: its entry in `pages.json` is a single block, an h1 reading "Our
  Locations", and the mirror has nothing else for it. `content/overrides.ts`
  builds it from `lib/local-copy.ts` like the 49. The rule throws if the stub
  ever gains content of its own, so a regeneration cannot leave both in place.

  `scripts/verify.mjs` had reported `thin pages: 0` throughout, because it
  measured the whole document against 1,200 characters and every document
  carries a navigation, a footer, a location strip and an A–Z index. It now
  measures non-link prose inside `<main>` against 500, which is what found this
  one; `/blog`, `/contact-us` and `/gift-card` are short by design and named in
  `THIN_BY_DESIGN`.
- `src/content/pages.v2.json` is generated by the classifier and unused.

---

## 11. The enquiry forms

Six Contact Form 7 forms survive the mirror, on five pages — `/contact-us`,
`/commercial-valeting`, `/car-lovers-club`, `/vehicles/caravan-cleaning` and
`/careers-franchising`, which carries the same one twice. All six render
through `components/EnquiryForm.tsx` and post to the one server action in
`app/actions.ts`, which re-reads the form's schema out of `pages.json` by its
`__slug`/`__form` pair, so a tampered payload cannot bypass a required field.

**Three gates, cheapest first.** The honeypot — one hidden input a person
leaves empty and a bot fills. Then Turnstile. Then the form's own required
and email rules. The order is deliberate: a bot costs at most a token check,
and a person who mistypes an address has not spent their token on it. A
failed gate hands back everything that was typed, because React empties an
uncontrolled form the moment its action settles.

**Delivery is email, through SendGrid** (`lib/mail.ts`) — one POST to the v3
REST API rather than `@sendgrid/mail`, the way `lib/cloudflare.ts` talks to
Cloudflare. It goes to `MAIL_TO`, defaulting to the address the site already
publishes, with `MAIL_CC` copied in. The visitor is the `reply_to`, never the
`from`: `MAIL_FROM` has to be a sender SendGrid has verified, and sending as
somebody else's domain is what DMARC exists to stop.

`CONTACT_WEBHOOK_URL` is still read, and is now a **second, independent sink**
rather than the only one. Both run on every enquiry and either one succeeding
counts as delivered; with neither configured the enquiry is logged, which is
fine in development and an error shown to the visitor in production.

**Turnstile** (`lib/turnstile.ts`, `components/Turnstile.tsx`) is on all six.
Three things about it are load-bearing:

- **It is rendered explicitly, not by `class="cf-turnstile"`.** Two widgets
  share `/careers-franchising`, and `turnstile.reset()` with no argument
  resets the last one rendered — the wrong one, half the time.
- **The widget is reset after every submission.** A token is single-use, so a
  visitor who trips validation, corrects the field and resubmits would post
  the spent token and be told to try again forever. `EnquiryForm` passes the
  action's own state object as the signal: `useActionState` gives it a new
  identity once per settled submission and the stable `EMPTY_STATE` otherwise.
- **The widget is taken out of flow, and scaled.** It is a fixed 300px box
  that does not reflow. `.shell` is 88% of the viewport and the form card
  adds 24px each side, so a 375px phone offers 282 and a 320px one offers
  234 — *every* phone is short. Left in flow its 300px became the min-content
  width of the grid column it sits in, whose `min-width: auto` then refused
  to shrink, and the page overflowed by 47px while the wrapper measured
  itself as having all the room it needed. Absolutely positioned, the wrapper
  measures the column and a `transform: scale` fits the widget to it. Both
  dimensions are measured rather than written down — Cloudflare documents the
  widget as 300x65 and renders it at 73.

  *Watch out when testing this in the browser pane:* `ResizeObserver` does
  not deliver to a page that is not being rendered, so in a hidden tab the
  scale never applies and the widget looks broken. Take a screenshot first —
  that makes the tab render, the observer fires, and the measurement lands.

**Both halves of each credential switch on together.** No site key, no
widget; no secret, no check. Same contract `purgeCloudflare` has, and for the
same reason: a fresh clone, a preview deployment and a local build all have
to be able to submit a form without anybody's production credentials.
Cloudflare's dummy key pairs exercise the real path — they are listed at the
top of `lib/turnstile.ts` and one of them is in `.env.example`.

**One fix came with this.** `/vehicles/caravan-cleaning` has a file field, and
a server action's request body is capped at 1 MB by default — under every
phone photograph — so that form failed outright before the action was even
reached, taking the name, address and message with it. `next.config.ts` now
sets 4 MB, which is under Vercel's own 4.5 MB function limit, and the
photograph is attached to the email rather than only named in it.

---

## 12. Environment

See `.env.example`. All optional in development.

| Variable | Used by | Unset behaviour |
| --- | --- | --- |
| `SENDGRID_API_KEY` | `lib/mail.ts` | No email is sent, and it says so. With no other sink either: logged in development, an error shown to the visitor in production. |
| `MAIL_TO` | `lib/mail.ts` | `CONTACT.email` — info@medusaautodetailing.co.uk. |
| `MAIL_CC` | `lib/mail.ts` | Nobody is copied. |
| `MAIL_FROM` / `MAIL_FROM_NAME` | `lib/mail.ts` | `CONTACT.email` and the business name. Must be a **verified** SendGrid sender. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `components/Turnstile.tsx` | No widget renders. |
| `TURNSTILE_SECRET_KEY` | `lib/turnstile.ts` | The challenge is skipped, and says so. |
| `CONTACT_WEBHOOK_URL` | `app/actions.ts` | The second delivery sink is skipped. |
| `REVALIDATE_SECRET` | `app/api/revalidate/route.ts` | Endpoint refuses every request (503). |
| `CLOUDFLARE_ZONE_ID` | `lib/cloudflare.ts` | The Cloudflare half of a flush is skipped, and says so. |
| `CLOUDFLARE_API_TOKEN` | `lib/cloudflare.ts` | Same. Needs one permission: Zone · Cache Purge · Purge. |
| `BASE` | `scripts/verify.mjs`, `scripts/purge.mjs` | `http://localhost:3000` for verify; the live origin for purge. |
