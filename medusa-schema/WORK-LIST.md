# Work list

Re-audited against the live site on **12 October 2026**. Every page fetched, not sampled: 353
of 353 URLs in the sitemap. Statuses below are measured, not reported.

Read `CLAUDE.md` and `DO-NOT-EMIT.md` first. Nothing in this list authorises inventing a value.
Where an item needs a figure or a name that is not in `data/`, it sits in section D and you
should not start it.

## Status at a glance

| | Item | 10 Oct | 12 Oct |
|---|---|---|---|
| A1 | Conditional-price Offers | open | **open** |
| A2 | Phone formatted two ways | open | **open** |
| A3 | `articleSection: "Uncategorized"` | open | **open**, now inside an array |
| A4 | Service name carrying a city | open | **open** |
| B1 | `Service` on the 253 area pages | 0 of 253 | **253 of 253 DONE** |
| B2 | `Place` on the 19 hubs | 0 of 19 | **19 of 19 DONE** |
| B3 | `Service` on the 7 categories | 0 of 7 | **7 of 7 DONE** |
| B4 | `isRelatedTo` on package Services | 0 of 14 | **0 of 14 open** |
| B5 | `hasOfferCatalog` on categories | 0 of 7 | **0 of 7 open** |
| B6 | Borough containment and typing | not raised | **NEW, data fixed here** |
| C1 | `bronze-wash` has no inbound link | open | **open** |
| C2 | Empty H1 on `aircraft-cleaning` | open | **open** |
| C3 | 301 the two moved URLs | open | **DONE** |
| C4 | Slough and Watford hub links | open | **open** |
| C5 | Blog posts have one inbound link | open | **open** |
| C6 | Hub links to its own area pages | 0 of 35 | **0 of 35 open** |
| E1 | The three mirror domains | open | **open, and now cloning 274 Services** |

Service nodes on the site went from 14 to **274**. All 353 pages validate clean apart from the
25 failures in A1 and A3. The 260 new nodes introduced **zero** property-level errors, no
duplicate `@id`s and no dangling pointers.

---

## A. Live and wrong. Fix these first.

### A1. Four pages state a price the page says you cannot pay  ·  OPEN

Unchanged since 10 Oct. A `price` is an exact claim, and these six Offers assert one then
contradict it in their own description, which is prose a parser does not read.

| Page | Asserts | The page's own words |
|---|---|---|
| `/car-interior-cleaning/pet-hair-removal` | `price: "20"` | "cannot be booked as a standalone £20 service" |
| `/mobile-car-wash/car-wax-service` | `price: "40"` | "an add-on and cannot be booked as a standalone £40 mobile service" |
| `/repairs/headlight-restoration` | `price: "100"` | "starts from £100. Final pricing can depend on the condition" |
| `/car-interior-cleaning/odour-removal` | three exact prices | each "must be added to Triton Interior Valet, Zeus Full Valet or Medusa Gold Valet" |

Fix: a "from" price becomes `priceSpecification` with `minPrice`, or an `AggregateOffer` with
`lowPrice`. An add-on that cannot be bought alone either drops the `Offer` or states the
dependency in the markup instead of only in prose.

Do not change the figures. They are correct; the claim type is wrong.

**Done when:** `node validate.mjs` passes "no exact price on a conditional Offer" on all four.

### A2. The same phone number is formatted two ways inside one node  ·  OPEN

Unchanged. In `#business` on every page: `telephone` is `"+442033556435"` and
`contactPoint.telephone` is `"+44-2033556435"`.

Fix: `+442033556435` in both, and in `data/business.json`, which carries the same discrepancy.

**Done when:** `telephone === contactPoint.telephone` on `/`.

### A3. `articleSection: "Uncategorized"` on all 21 posts  ·  OPEN

Still every post, and the value is now wrapped in an array: `["Uncategorized"]`. The wrapping
is why an earlier audit pass reported this as fixed. It was never fixed.

Fix: omit `articleSection` until the posts have real sections. Omitting a property is always
safer than asserting a wrong value.

**Done when:** `validate.mjs` passes "no placeholder published as a value" on all 21.

### A4. One Service name carries the city  ·  OPEN

`/car-interior-cleaning/steam-cleaning` names its Service `"Car Interior Steam Cleaning London"`.
The place belongs in `areaServed`.

This is the only remaining case. The 253 area Services were checked individually: every one
names its own area and **not one** claims London on a non-London area.

**Done when:** no package or category `Service.name` contains a place name.

---

## B. The graph.

B1, B2 and B3 are done. What follows is what is left.

### B1. `Service` on the 253 area pages  ·  DONE

All 253. Quality verified individually:

- `@id` is exactly `id.areaService(cat, area)` on **253 of 253**
- `areaServed` is exactly that page's own area, never wider, on **253 of 253**
- `containedInPlace` carries the gazetteer parent
- the six directional slugs carry a name and no geometry, as specified
- `isRelatedTo` points at the category Service, written out with `name` and `url`
- `providerMobility: "dynamic"` sits on the `Service`, never on the business

`provider` is now a bare `{ "@id": ".../#business" }` rather than the full `businessRef()`.
That is correct and leaner: `#business` is defined on every page, so the pointer resolves
locally. Verified: zero dangling pointers across all 353 pages.

### B2. `Place` node on the 19 hubs  ·  DONE

All 19, typed exactly as `data/areas.json` said at the time. See B6: the data itself was wrong
for six of them.

### B3. `Service` on the 7 category pages  ·  DONE

All 7, with `providerMobility` correctly placed. They are the thinnest nodes on the site at
five properties each (`name`, `serviceType`, `url`, `providerMobility`, `provider`). No
`description`, and no catalogue, which is B5.

### B4. `isRelatedTo` on the 14 package Services  ·  OPEN

Still 0 of 14, and now conspicuous: all 253 area Services carry it and point at the category
Service correctly. The package Services are the only Service nodes on the site that are
islands relative to the service tree.

`packagePage()` already emits it. The target now exists on its own page, so there is nothing
left to wait for.

**Done when:** all 14 carry `isRelatedTo`. Use `isRelatedTo`, never `isPartOf`: `isPartOf` is
`CreativeWork` only in both domain and range.

### B5. `hasOfferCatalog` on 6 of the 7 categories  ·  OPEN

Still 0 of 7. A category page whose Service lists nothing it offers is a category page in name
only.

Pass `{ includeCatalogue: false }` for `/mobile-car-wash` until C1 is fixed, or the catalogue
names a page the body never links. The other six are complete.

**Done when:** 6 categories carry a catalogue and `/mobile-car-wash` either has 8 entries or
waits for C1.

### B6. Six London boroughs asserted no containment  ·  NEW. Data fixed in this repo.

**This was a defect in the handover data, not in your implementation.** You built exactly what
`data/areas.json` said.

Camden, City of London, City of Westminster, Hammersmith and Fulham, Haringey and Kensington
and Chelsea were typed `AdministrativeArea` with `parent: null`, so their hub pages asserted no
containment at all, while fifteen other London boroughs asserted Greater London. The six are
the rows appended from the hub list, where the gazetteer lookup found no entry and fell through
to null.

Two changes are now in `data/areas.json`:

1. all six get `parent: "greater-london"`
2. all **21** boroughs are now typed `AdministrativeArea`, where 15 were `Place`

The second is the wider fix and worth saying plainly: a London borough is a local-government
area, so `AdministrativeArea` is the accurate type and `Place` was only its supertype. Fifteen
rows changing type does alter `areaServed` typing on a large share of the 253 pages, but no
`@id` changes, so nothing that references these breaks. If you disagree with the retyping,
revert that half; the containment fix should stand either way.

**Done when:** the six hub pages assert `containedInPlace` Greater London, and every borough on
the site carries one type.

---

## C. Page and link work. Mostly not schema at all.

### C1. `/mobile-car-wash/bronze-wash` has zero inbound internal links  ·  OPEN

Re-measured across all 353 pages: still **0 inbound**. Not the global nav, not its own category
page, not a sibling. `/mobile-car-wash` links 94 of its children and skips this one. Every
other package is in the nav on all 352 pages.

Still the site's only true orphan, and now the only `/mobile-car-wash` child with no `Service`
node either.

**Done when:** `bronze-wash` has at least one inbound link from `/mobile-car-wash` and appears
in the nav alongside the other seven washes.

### C2. `/commercial-valeting/aircraft-cleaning` has an empty `<h1>`  ·  OPEN

Unchanged. It is also the only page on the site carrying a `FAQPage` with no `Service`.

**Done when:** the page has a non-empty H1.

### C3. 301 the two moved package URLs  ·  DONE

Both now return 301 to the new path, and both are out of the sitemap. `data/packages.json`
still lists the old paths for those two rows; update them when convenient.

### C4. The package pages link the 17 London hubs and skip Slough and Watford  ·  OPEN

Unchanged: Slough and Watford receive 19 inbound links, the other 17 hubs receive 38. The
missing links come from the package pages, which carry a London-only hub list.

**Done when:** all 19 hubs have the same inbound profile from the package pages.

### C5. Nothing links a blog post except `/blog`  ·  OPEN

Unchanged: every post still has exactly **one** inbound link. The 21 posts make 1,308 outbound
links into service pages, so the blog pushes equity out and receives none back.

**Done when:** each post has more than one inbound link, from a page related to its subject.

### C6. No location hub links its own area service pages  ·  OPEN

Still 0 of 35, and there are still zero `ItemList` nodes on the site, which is correct: the
markup is correctly waiting on the links.

**Done when:** the 35 links exist, and only then pass `listServices: true`.

---

## D. Blocked on a client answer. Do not start these.

All five re-checked on 12 October. None has moved. Do not guess any of it.

| # | What | State on 12 Oct |
|---|---|---|
| D1 | 13 all-caps package names | **13 of 41** H1s still all-caps, unchanged: `ENHANCEMENT`, `PERFECTION`, `NEW CAR / PROTECTION`, `BRONZE WASH`, `GOLD WASH`, `SILVER WASH`, `PLATINUM WASH`, `EXTERIOR WASH`, `EXTERIOR PLUS WASH`, `PREMIUM INTERIOR WASH`, `MOBILE MINI VALET IN LONDON`, `SUMMER CAR CARE GLOW VALET`, `CAR WINTER PROTECTION`. Three do not name a service at all |
| D2 | Blog author type | All 21 still `Person` named "Detailing Lifestyle", which is a publication |
| D3 | `about` on the 21 posts | Still **0 of 21**. Cannot be derived; the signals agree on only 6. Omit it |
| D4 | Anything on `/car-lovers-club` | Page still live and selling; still nothing emitted for it, which is correct |
| D5 | Offers on the remaining 26 packages | 26 of 41 packages still have no `Service`. Figures must be read off each page's own table |

---

## E. Not code, but on the critical path

### E1. The three mirror domains still answer  ·  OPEN, and worse

All three still return 200, and the warning in the last revision has now materialised. A mirror
area page serves the **new** work:

```
https://medusaautodetailing.pro/mobile-car-wash/watford
  WebPage, BreadcrumbList, WebSite, ImageObject, AutoWash, Service
  6 of 6 @ids rewritten to the mirror host
  0 mentions of the real domain
```

So the 274 `Service` nodes and 19 `Place` nodes built this week now exist four times over, on
four hostnames, each asserting the same business, the same services and the same 87 places.
Every item completed in section B multiplied by four.

Restricting the Vercel app to the real `Host` breaks all three immediately and needs nobody's
cooperation. It is now the highest-value item on this page.

> **2026-10-19, measured: the `Host` restriction cannot work.** The mirrors are Cloudflare
> Workers that fetch through our own zone under our own hostname, so a URL first fetched through
> a mirror is then a cache `HIT` on the real domain, with the same `x-vercel-id`. The repo now
> sends a `Link: rel="canonical"` header and runs an inline domain guard. What actually blocks
> them is one WAF rule on our zone, `cf.worker.upstream_zone`, made by hand. The evidence and
> the steps are in `PROJECT.md` §14.

### E2. The Google Business Profile title

Must be exactly `Medusa Auto Detailing`, matching `business.json`. No city, no service keywords.

---

## F. Do not add

Swept all 353 pages on 12 October. Zero `Product`, `JobPosting`, `Review`, `AggregateRating`,
`HowTo`, `Event` or `Course` nodes. No `#organization`. No bare-root `@id`. Exactly two
`#business` shapes, the full node on `/` and the six-property reference on the other 352, with
no contradiction between them. The 21 `Article` nodes are untouched and all share one property
set. Keep it that way.

The one standing deviation: `FAQPage` on 15 pages, up from 2. It is inside the page graph, it
is harmless for entity understanding, and it has produced no rich result outside government and
health sites since August 2023. Keep the 15. Do not roll it out further and do not forecast a
SERP feature from it.

---

## Verifying

```
curl -sL https://schema.org/version/latest/schemaorg-current-https.jsonld -o schemaorg.jsonld
node validate.mjs path/to/output.jsonld
```

It checks the envelope first, asserts the walk found nodes at all, resolves every bare pointer
on its own page, validates each `Type.property` against the property's `domainIncludes` through
the type's ancestors, then the project rules.

Compare `@id`s by **equality, never substring**.

Three traps specific to this site, each of which has already cost a wrong answer:

- **Normalise to an array before comparing a value.** `articleSection` is `["Uncategorized"]`,
  and a scalar comparison against it reported the defect as fixed. `offers` has the same shape
  problem: one Offer or an array of them.
- **The sitemap `lastmod` is a content date, not a deploy date.** 260 Service nodes appeared
  between 10 and 12 October while not one `lastmod` moved.
- **A placeholder is not a blank.** `"Uncategorized"` passes every presence check and asserts
  something false. `validate.mjs` now has a check for the class.
