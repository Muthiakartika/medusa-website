/**
 * Every URL the old WordPress site published that the new structure moves, from
 * the "301 redirects" tab of the Menu update workbook - 75 rules, one per row,
 * written with the trailing slashes the sheet insists on. No source appears
 * twice and no destination is itself a source, so none of these can chain.
 *
 * `next.config.ts` turns these into permanent redirects. The sitemap and the
 * blog index read the same list so that neither ever advertises a URL that
 * only redirects - drop a rule here and the page returns to both on its own.
 */
export const REDIRECTS: ReadonlyArray<readonly [from: string, to: string]> = [
  /* Nav parents the new structure retires. */
  ["/detailing/", "/car-detailing/"],
  ["/standard-car-wash/", "/mobile-car-wash/"],
  ["/valeting/", "/car-valeting/"],

  /* A duplicate of a retired page - straight to the new URL, never via /detailing/. */
  ["/detailing-2/", "/car-detailing/"],

  /* The wash tiers, now children of the Car Wash hub. */
  ["/bronze-wash/", "/mobile-car-wash/bronze-wash/"],
  ["/gold-wash/", "/mobile-car-wash/gold-wash/"],
  ["/platinum-wash/", "/mobile-car-wash/platinum-wash/"],
  ["/silver-wash/", "/mobile-car-wash/silver-wash/"],

  /* Service pages that moved under a hub. */
  ["/aircraft-cleaning/", "/commercial-valeting/aircraft-cleaning/"],
  ["/autoglymwax/", "/mobile-car-wash/car-wax-service/"],
  ["/car-ceramic-paint-protection/", "/ceramic-coating/"],
  ["/car-flooding-and-water-damage-repair/", "/car-interior-cleaning/flooded-car-cleaning/"],
  ["/car-graffiti-removal/", "/car-detailing/car-graffiti-removal/"],
  ["/car-leather-seats-cleaning-conditioning-and-protection/", "/car-interior-cleaning/leather-cleaning/"],
  ["/car-machine-polish/", "/ceramic-coating/machine-polish/"],
  ["/car-paint-spillage-removal-service/", "/car-detailing/paint-overspray-removal/"],
  ["/car-van-stickers-removal/", "/commercial-valeting/car-van-stickers-removal/"],
  ["/car-windscreen-protection/", "/ceramic-coating/windscreen-protection/"],
  ["/caravan-valeting/", "/vehicles/caravan-cleaning/"],
  ["/commercial-valeting-and-detailing/", "/commercial-valeting/"],
  ["/correction/", "/ceramic-coating/paint-correction/"],
  ["/deep-clean-full-valet/", "/car-valeting/deep-clean-full-valet/"],
  ["/engine-bay-steam-cleaning/", "/car-detailing/engine-bay-steam-cleaning/"],
  ["/enhancement/", "/ceramic-coating/enhancement-detail/"],
  ["/exterior-plus-wash/", "/mobile-car-wash/exterior-plus-wash/"],
  ["/exterior-wash/", "/mobile-car-wash/exterior-wash/"],
  ["/headlight-restoration/", "/car-detailing/headlight-restoration/"],
  ["/mini-car-detail-in-london/", "/car-detailing/mini-detail/"],
  ["/mini-valet/", "/car-valeting/mini-valet/"],
  ["/mobile-truck-cleaning/", "/commercial-valeting/mobile-truck-cleaning/"],
  ["/motorcycle-valeting-detailing/", "/vehicles/motorcycle-valeting-detailing/"],
  ["/mould-sanitisation-sterilisation-service/", "/car-interior-cleaning/mould-removal/"],
  ["/new-car-protection/", "/ceramic-coating/new-car-protection/"],
  ["/ozone-odour-removal-disinfection/", "/car-interior-cleaning/odour-removal/"],
  ["/perfection/", "/ceramic-coating/perfection-detail/"],
  ["/pet-hair-removal/", "/car-interior-cleaning/pet-hair-removal/"],
  ["/premium-interior-wash/", "/car-interior-cleaning/premium-interior-wash/"],
  ["/safely-clean-sickness-vomit-from-your-car-interior/", "/car-interior-cleaning/vomit-cleaning/"],
  ["/soft-top-reproofing/", "/car-valeting/convertible-roof-cleaning/"],
  ["/steam-cleaning/", "/car-interior-cleaning/steam-cleaning/"],
  ["/summer-glow-valet/", "/car-valeting/summer-glow-valet/"],
  ["/triton-premium-interior-valet/", "/car-interior-cleaning/interior-valet/"],
  ["/ultimate-pre-sale-valet/", "/car-valeting/pre-sale-valet/"],
  ["/wheeluv/", "/mobile-car-wash/alloy-wheel-cleaning/"],
  ["/winter-protection/", "/car-valeting/winter-protection/"],
  ["/zeus-full-valet/", "/car-valeting/premium-full-valet/"],

  /* Pages whose content the plan folds into another page. */
  ["/2020/10/17/why-local-car-washes-do-more-harm-than-good-to-your-car/", "/2024/04/28/car-wash-vs-valeting-vs-detailing-whats-the-difference/"],
  ["/2022/01/12/what-is-the-difference-between-car-valeting-and-car-detailing/", "/2024/04/28/car-wash-vs-valeting-vs-detailing-whats-the-difference/"],
  ["/2022/01/15/hand-car-washing-vs-valeting-whats-the-difference-medusa-auto-detailing/", "/2024/04/28/car-wash-vs-valeting-vs-detailing-whats-the-difference/"],
  ["/2022/01/15/the-5-step-guide-to-detailing-an-engine-bay-medusa-auto-detailing/", "/car-detailing/engine-bay-steam-cleaning/"],
  ["/2022/01/15/the-step-by-step-guide-to-removing-mould-from-your-car-medusa-auto-detailing/", "/car-interior-cleaning/mould-removal/"],
  ["/2022/03/01/6-ways-to-remove-pet-hair-and-dog-hair-from-your-car-medusa-auto-detailing/", "/car-interior-cleaning/pet-hair-removal/"],
  ["/2022/03/10/the-basics-of-paint-correction-and-if-you-need-it-medusa-auto-detailing/", "/ceramic-coating/paint-correction/"],
  ["/2022/11/25/winter-car-care-everything-you-need-to-know-and-can-do/", "/car-valeting/winter-protection/"],
  ["/2024/02/19/experience-luxury-on-wheels-the-best-mobile-valeting-and-detailing-service-in-london/", "/2024/02/08/top-5-benefits-of-professional-car-valeting-detailing-london-why-medusa-auto-detailing-is-worth-every-penny/"],
  ["/2024/03/02/the-key-to-maintaining-a-pristine-car-mobile-valeting/", "/2024/02/08/top-5-benefits-of-professional-car-valeting-detailing-london-why-medusa-auto-detailing-is-worth-every-penny/"],
  ["/2024/03/24/mobile-valeting-london-the-ultimate-guide-to-mobile-car-care/", "/2024/02/08/top-5-benefits-of-professional-car-valeting-detailing-london-why-medusa-auto-detailing-is-worth-every-penny/"],
  ["/2024/04/02/valeting-is-it-worth-getting-car-valeted/", "/2024/02/08/top-5-benefits-of-professional-car-valeting-detailing-london-why-medusa-auto-detailing-is-worth-every-penny/"],
  ["/2024/12/18/is-a-mouldy-car-salvageable/", "/car-interior-cleaning/mould-removal/"],
  ["/2025/01/23/are-manual-or-automatic-car-washes-better/", "/2024/04/28/car-wash-vs-valeting-vs-detailing-whats-the-difference/"],
  ["/2025/03/26/how-to-make-a-convertible-roof-look-new/", "/car-valeting/convertible-roof-cleaning/"],
  ["/2025/06/30/mobile-valeting-london-car-detailing-benefits/", "/2024/02/08/top-5-benefits-of-professional-car-valeting-detailing-london-why-medusa-auto-detailing-is-worth-every-penny/"],
  ["/2025/07/12/mobile-car-valeting-london/", "/2024/02/08/top-5-benefits-of-professional-car-valeting-detailing-london-why-medusa-auto-detailing-is-worth-every-penny/"],
  ["/2025/07/26/ceramic-coating-london/", "/ceramic-coating/"],
  ["/2025/08/09/paint-correction-london/", "/ceramic-coating/paint-correction/"],
  ["/2025/09/06/motorcycle-detailing-london/", "/vehicles/motorcycle-valeting-detailing/"],
  ["/2025/09/27/mobile-car-valeting-london-guide/", "/2024/02/08/top-5-benefits-of-professional-car-valeting-detailing-london-why-medusa-auto-detailing-is-worth-every-penny/"],
  ["/2025/11/05/ceramic-coating-london-2/", "/ceramic-coating/"],
  ["/2025/11/23/winter-protection-valet-london/", "/car-valeting/winter-protection/"],
  ["/2025/12/21/headlight-restoration-london/", "/car-detailing/headlight-restoration/"],
  ["/2026/02/21/how-to-remove-mould-from-a-car-interior-london-guide/", "/car-interior-cleaning/mould-removal/"],
  ["/2026/05/06/deep-clean-vs-valet/", "/2024/04/28/car-wash-vs-valeting-vs-detailing-whats-the-difference/"],
  ["/2026/05/09/cheap-car-valet-london/", "/2024/02/08/top-5-benefits-of-professional-car-valeting-detailing-london-why-medusa-auto-detailing-is-worth-every-penny/"],
  ["/2026/05/24/mobile-valeting-vs-car-wash/", "/2024/04/28/car-wash-vs-valeting-vs-detailing-whats-the-difference/"],
  ["/2026/06/17/ceramic-coating-vs-wax/", "/ceramic-coating/"],
];

/** The redirected paths as bare slugs, the form `PAGES` is keyed by. */
export const REDIRECTED_SLUGS = new Set(REDIRECTS.map(([from]) => from.slice(1, -1)));
