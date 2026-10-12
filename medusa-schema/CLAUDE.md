# Schema build rules

Read this before writing any JSON-LD for medusaautodetailing.co.uk.

## The work list is `WORK-LIST.md`. Start there.

It is ordered and every item says how to prove it is done. Section A is live and wrong,
B is the missing graph, C is page and link work, D is blocked on a client answer and must
not be started, E is outside the repo but on the critical path.

Two things in it override the obvious instinct:

- **Do E1 before B1.** Three mirror domains re-serve this site on their own hostnames with
  every URL rewritten, so each item you add to the graph is also added to three competing
  business entities. Restricting the app to the real `Host` is a prerequisite, not a chore.
- **Do C1 before marking up `/mobile-car-wash/bronze-wash`.** It has zero inbound internal
  links from anywhere on the site. Markup on a page nothing links to is markup on an orphan.

## Construct every @id through `ids.ts`

Never build an identifier by template in a route. Area ids are **not uniform**: 12 areas have
their own page, 75 do not, and the id is the same either way. A template that looks right on
one page is wrong on another.

An `@id` is a reconciliation key, **not a URL that has to resolve**. Area ids deliberately name
`/our-locations/<area>` pages that don't exist yet. That is correct. Do not "fix" it.

## Write references out in full

A node is DEFINED once, on the page that page is about, and REFERENCED elsewhere **written out
in full**. A bare `{ "@id": "..." }` resolves only if that node is on the **same page**.

So `businessRef()` is not optional padding. `#business` is defined on `/` and written out,
thinner, on the other 352 pages. A thinner copy is fine; a **contradicting** copy is a defect.

## Three things you will be tempted to get wrong

These are not style preferences. The first two were in an earlier draft of this spec, both
would have validated as JSON, and both were wrong.

1. **`providerMobility` goes on `Service`, never on the business.** `domainIncludes` is
   `Service` only. It is the obvious property for a mobile operator, which is exactly why it
   ends up on the `LocalBusiness`.
2. **`isPartOf` is `CreativeWork` only**, in domain and range. `Service isPartOf Service` is
   invalid. Use `isRelatedTo` upward; the hierarchy goes **downward** via `hasOfferCatalog`.
   `WebPage isPartOf WebSite` is correct — leave it.
3. **`#organization` is retired.** It was collapsed into `#business`. Every `publisher`
   reference, including the 21 `Article.publisher`, points at `id.business()`. If you see
   `#organization` anywhere, it is a leftover.

## Do not invent a value. Ever.

If a value is not in `data/`, **stop and ask**. Do not infer a plausible price, name or topic.
The data marks what is unknown on purpose:

- `packages.json` → `nameConfirmed: false` on 13 rows. The name there is a *reading*, not an
  instruction. Three of them (`ENHANCEMENT`, `PERFECTION`, `NEW CAR / PROTECTION`) do not name
  a service at all.
- `packages.json` → `offer.TODO`. 31 pages state a price. Read the figures off **each page's own
  table**. A scraped or guessed price is the single worst thing you could ship here.
- `blog.json` → `TODO` on 15 of 21. `about` cannot be derived: the links a post makes and its
  headline agree on only 6. Omit `about` rather than picking one.

`build.ts` omits these properties rather than guessing. Keep that behaviour.

## Two page problems that gate markup

- **No location hub links its own area pages.** `areaHubPage()` defaults `listServices` to off.
  Do not turn it on until the links exist, or the `ItemList` names pages the page never mentions.
- **`/mobile-car-wash` does not link `bronze-wash`** (8 of 9). Pass
  `{ includeCatalogue: false }` or link it first.

## Read `DO-NOT-EMIT.md` before adding anything

21 entries. Most are things a schema pass adds because they feel like best practice:
`AggregateRating` and `Review` on the business, `HowTo` on the how-to blog posts, `FAQPage`
rollout, `Product` for anything, `brand` to name a consumable the service uses, `JobPosting` on
a careers page with no vacancy. Each entry says why.

## Before you claim it works

Run `node validate.mjs <file.jsonld>` on your output. It checks, in this order:

1. The **envelope** first: `@context` exactly `https://schema.org`, `@graph` a non-empty array,
   no other top-level keys. A bare array parses and resolves nothing while every node-level
   check passes.
2. That the walk **found nodes at all**. A pass that inspected nothing looks identical to a
   clean one.
3. Every bare pointer resolves on its own page.
4. Every `Type.property` against the property's `domainIncludes`, resolved through the type's
   ancestors.
5. No `#organization`, no bare-root `@id`, no invented price.

Compare `@id`s by **equality, never substring**. A substring test once reported two nodes as
linked when nothing was, because the old business `@id` was the bare root and so a substring of
another node's `url`.
