/**
 * The 75 location pages the SEO plan re-parents under their service hub.
 *
 * From the "Location build list" tab of Medusa_SEO_Plan, `New URL` against
 * `Redirects from (old URL)` — every row whose Kind is `Move`. The sheet's own
 * rule is that only the path shape changes: Preston stays `/preston/` rather
 * than becoming `/preston-wembley/`, so that a ranking drop can be pinned on
 * the move and not on a rename.
 *
 * The tab's other 49 rows are new builds with no old URL, so there is nothing
 * here to move; and the 52 location pages the tab does not mention keep the
 * `mobile-car-…-in-…` shape. `LOCATION_FAMILIES` in `lib/location-frame.ts`
 * therefore has to recognise both, and it reads the destinations below to tell
 * a moved location page from a service page that has always lived under the
 * same hub — `/mobile-car-wash/wembley/` is one, `/mobile-car-wash/gold-wash/`
 * is not.
 *
 * The `from` column does two jobs. It is the map back for `npm run content`,
 * which keys `pages.json` off the mirror and the mirror still publishes the
 * old URLs (PROJECT.md §3). And since 2026-09-18 it is also a 301: this table
 * is spread into `lib/redirects.ts`, so every old URL sends a visitor and a
 * crawler to the page that replaced it.
 *
 * It did not, at first. The sheet asked for the URLs to change and the old
 * ones to go, and they went — 404, no forwarding address, on 75 URLs that were
 * all in the WordPress site's own sitemap and therefore all indexed. Adding
 * the redirects was the client's call on being shown that.
 */
export const LOCATION_MOVES: ReadonlyArray<readonly [from: string, to: string]> = [

  /* Mobile Car Wash — 45 pages. */
  ["mobile-car-wash-in-barnet", "mobile-car-wash/barnet"],
  ["mobile-car-wash-in-borehamwood", "mobile-car-wash/borehamwood"],
  ["mobile-car-wash-in-central-london", "mobile-car-wash/central-london"],
  ["mobile-car-wash-in-chelsea", "mobile-car-wash/chelsea"],
  ["mobile-car-wash-in-chingford", "mobile-car-wash/chingford"],
  ["mobile-car-wash-in-chiswick", "mobile-car-wash/chiswick"],
  ["mobile-car-wash-in-croydon", "mobile-car-wash/croydon"],
  ["mobile-car-wash-in-ealing", "mobile-car-wash/ealing"],
  ["mobile-car-wash-in-edgware", "mobile-car-wash/edgware"],
  ["mobile-car-wash-in-enfield", "mobile-car-wash/enfield"],
  ["mobile-car-wash-in-finchley", "mobile-car-wash/finchley"],
  ["mobile-car-wash-in-fulham", "mobile-car-wash/fulham"],
  ["mobile-car-wash-in-golders-green", "mobile-car-wash/golders-green"],
  ["mobile-car-wash-in-hammersmith", "mobile-car-wash/hammersmith"],
  ["mobile-car-wash-in-harrow", "mobile-car-wash/harrow"],
  ["mobile-car-wash-in-hayes", "mobile-car-wash/hayes"],
  ["mobile-car-wash-in-hounslow", "mobile-car-wash/hounslow"],
  ["mobile-car-wash-in-ilford", "mobile-car-wash/ilford"],
  ["mobile-car-wash-in-islington", "mobile-car-wash/islington"],
  ["mobile-car-wash-in-kensington", "mobile-car-wash/kensington"],
  ["mobile-car-wash-in-kingston", "mobile-car-wash/kingston"],
  ["mobile-car-wash-in-knightsbridge", "mobile-car-wash/knightsbridge"],
  ["mobile-car-wash-in-north-london", "mobile-car-wash/north-london"],
  ["mobile-car-wash-in-north-west-london", "mobile-car-wash/north-west-london"],
  ["mobile-car-wash-in-northwood", "mobile-car-wash/northwood"],
  ["mobile-car-wash-in-notting-hill", "mobile-car-wash/notting-hill"],
  ["mobile-car-wash-in-park-royal", "mobile-car-wash/park-royal"],
  ["mobile-car-wash-in-pinner", "mobile-car-wash/pinner"],
  ["mobile-car-wash-in-preston", "mobile-car-wash/preston"],
  ["mobile-car-wash-in-richmond-upon-thames", "mobile-car-wash/richmond-upon-thames"],
  ["mobile-car-wash-in-ruislip", "mobile-car-wash/ruislip"],
  ["mobile-car-wash-in-slough", "mobile-car-wash/slough"],
  ["mobile-car-wash-in-st-albans", "mobile-car-wash/st-albans"],
  ["mobile-car-wash-in-stanmore", "mobile-car-wash/stanmore"],
  ["mobile-car-wash-in-streatham", "mobile-car-wash/streatham"],
  ["mobile-car-wash-in-sudbury", "mobile-car-wash/sudbury"],
  ["mobile-car-wash-in-twickenham", "mobile-car-wash/twickenham"],
  ["mobile-car-wash-in-uxbridge", "mobile-car-wash/uxbridge"],
  ["mobile-car-wash-in-walthamstow", "mobile-car-wash/walthamstow"],
  ["mobile-car-wash-in-wandsworth", "mobile-car-wash/wandsworth"],
  ["mobile-car-wash-in-watford", "mobile-car-wash/watford"],
  ["mobile-car-wash-in-wembley", "mobile-car-wash/wembley"],
  ["mobile-car-wash-in-west-london", "mobile-car-wash/west-london"],
  ["mobile-car-wash-in-wimbledon", "mobile-car-wash/wimbledon"],
  ["mobile-car-wash-in-windsor", "mobile-car-wash/windsor"],

  /* Car Valeting — 29 pages. */
  ["mobile-car-valeting-in-barnet", "car-valeting/barnet"],
  ["mobile-car-valeting-in-borehamwood", "car-valeting/borehamwood"],
  ["mobile-car-valeting-in-central-london", "car-valeting/central-london"],
  ["mobile-car-valeting-in-chiswick", "car-valeting/chiswick"],
  ["mobile-car-valeting-in-croydon", "car-valeting/croydon"],
  ["mobile-car-valeting-in-edgware", "car-valeting/edgware"],
  ["mobile-car-valeting-in-enfield", "car-valeting/enfield"],
  ["mobile-car-valeting-in-finchley", "car-valeting/finchley"],
  ["mobile-car-valeting-in-harrow", "car-valeting/harrow"],
  ["mobile-car-valeting-in-hertfordshire", "car-valeting/hertfordshire"],
  ["mobile-car-valeting-in-ilford", "car-valeting/ilford"],
  ["mobile-car-valeting-in-islington", "car-valeting/islington"],
  ["mobile-car-valeting-in-kensington", "car-valeting/kensington"],
  ["mobile-car-valeting-in-north-london", "car-valeting/north-london"],
  ["mobile-car-valeting-in-northwood", "car-valeting/northwood"],
  ["mobile-car-valeting-in-park-royal", "car-valeting/park-royal"],
  ["mobile-car-valeting-in-pinner", "car-valeting/pinner"],
  ["mobile-car-valeting-in-preston", "car-valeting/preston"],
  ["mobile-car-valeting-in-putney", "car-valeting/putney"],
  ["mobile-car-valeting-in-ruislip", "car-valeting/ruislip"],
  ["mobile-car-valeting-in-slough", "car-valeting/slough"],
  ["mobile-car-valeting-in-st-albans", "car-valeting/st-albans"],
  ["mobile-car-valeting-in-stanmore", "car-valeting/stanmore"],
  ["mobile-car-valeting-in-uxbridge", "car-valeting/uxbridge"],
  ["mobile-car-valeting-in-wandsworth", "car-valeting/wandsworth"],
  ["mobile-car-valeting-in-watford", "car-valeting/watford"],
  ["mobile-car-valeting-in-west-london", "car-valeting/west-london"],
  ["mobile-car-valeting-in-westminster", "car-valeting/westminster"],
  ["mobile-car-valeting-in-windsor", "car-valeting/windsor"],

  /* Car Detailing — 1 page. */
  ["mobile-car-detailing-in-harrow", "car-detailing/harrow"],
];

/** The slugs the moves land on — the location pages that now sit under a hub. */
export const MOVED_LOCATIONS = new Set(LOCATION_MOVES.map(([, to]) => to));
