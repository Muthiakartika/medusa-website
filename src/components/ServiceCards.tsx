import Image from "next/image";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import type { HubCard } from "@/lib/hub";
import { BOOK_URL } from "@/lib/site";

/**
 * The grid of service cards — a photograph, the menu's own name for the
 * service, its own entry price, its own opening paragraph, and one primary
 * action.
 *
 * It was `components/HubPage`'s, and the two menu-group hubs are still where
 * it mostly runs. It moved here on 2026-09-22, when the client asked for the
 * same thing on four pages that are not hubs — "And in, the same way you did
 * for repairs page" — because a card copied into a second file is a card that
 * drifts from the first. `lib/service-cards.ts` says which services those
 * pages show; `lib/hub.ts` builds the card either way.
 */

/**
 * One card size, however few cards there are.
 *
 * `grid-cols-2` on a two-card row gave each card half the shell — 615px, with
 * a 410px photograph over it — on a page whose every other card row is 301 to
 * 403px. That is the inconsistency §6 of PROJECT.md was written against, so
 * the track is capped instead: `auto-fit` lays out as many 400px cards as fit
 * and a short row simply ends early rather than stretching to fill.
 *
 * A hub passes its own `cols` — it shows a whole menu column, four or nine of
 * them, and has already worked out what that needs.
 */
const FIT =
  "sm:grid-cols-2 lg:[grid-template-columns:repeat(auto-fit,minmax(280px,400px))]";

export function ServiceCards({
  cards,
  cols,
  onGold,
}: {
  cards: HubCard[];
  cols?: string;
  /** Sitting on a gold band — the tile goes solid ink, as every card does. */
  onGold?: boolean;
}) {
  /*
    Four across only from `xl`. At `lg` the shell is 834px wide, so four
    columns are 193px each — narrower than the add-on cards' 220px floor, and
    "Engine Bay Steam Cleaning" came out four lines deep. Two-up until there
    is room for the full row.
  */
  return (
    <ul className={`grid gap-5 ${cols ?? FIT}`}>
      {cards.map((card, i) => (
        <Reveal
          as="li"
          key={card.slug}
          delay={i}
          className={`flex flex-col overflow-hidden ${
            onGold ? "surface-on-gold" : "surface"
          }`}
        >
          {card.image && (
            <div className="relative aspect-3/2 w-full">
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                /* Centred unless the spec says otherwise — one photograph on
                   the site is a poster with text baked into it. */
                style={
                  card.imagePosition ? { objectPosition: card.imagePosition } : undefined
                }
              />
            </div>
          )}

          <div className="flex flex-1 flex-col p-6">
            {/* Title on its own line rather than beside the badge:
                "Engine Bay Steam Cleaning" is three words too long to
                share a 300px card with a price. */}
            <h2 className="text-[19px] leading-[1.12] text-white lg:text-[21px]">
              {card.name}
            </h2>

            {/* The client's rule: a page that quotes a price shows it
                here, a page that does not gets the quote button at the
                foot instead. Same badge the price ladders use. */}
            {card.priceFrom && (
              <p className="mt-3">
                <span className="inline-flex rounded-full bg-gold px-3 py-1 font-[family-name:var(--font-ui)] text-[13px] font-semibold text-ink">
                  From {card.priceFrom}
                </span>
              </p>
            )}

            <p
              className="mt-3.5 text-[14.5px] leading-[23px] font-normal text-white/80 [&_a]:text-gold [&_a:hover]:underline [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: card.blurbHtml }}
            />

            {/* Same shape as every other card on the site: one primary
                action, and the link to the page named after the page
                it opens rather than reading "Read More". */}
            <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
              <a
                href={card.priceFrom ? BOOK_URL : "/contact-us"}
                className="btn btn-gold w-full rounded-full sm:w-auto"
                {...(card.priceFrom
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {card.priceFrom ? "Book Now" : "Get a Free Quote"}
                <Icon name="arrow" size={18} className="ml-2.5" />
              </a>
              <a href={card.href} className="btn btn-outline w-full rounded-full sm:w-auto">
                {card.name}
                <Icon name="arrow" size={18} className="ml-2.5" />
              </a>
            </div>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

/**
 * The same grid as a section of its own, for a page that is not built out of
 * these cards and is only adding a band of them. The hubs keep their own
 * wrapper, because on a hub this band alternates with the ones around it.
 */
export function ServiceCardsSection({
  heading,
  cards,
  onGold,
}: {
  heading: string;
  cards: HubCard[];
  /**
   * Take the gold half of the rhythm. The frame asks `bandAfter` rather than
   * deciding: client, 2026-09-22, "pastikan warna bg tetap selang seling".
   * On `/car-detailing` the answer is ink, which is also where the client
   * pointed ("place it here where its black"); on `/mobile-car-wash` the row
   * above is ink, so this one is gold.
   */
  onGold?: boolean;
}) {
  if (!cards.length) return null;
  return (
    <section
      className={`w-full py-16 lg:py-[104px] ${
        /* A gold band is its own surface and needs no rule; an ink one takes
           the hairline that tells it from the ink row above. */
        onGold ? "bg-gold-wash" : "border-t border-white/[0.07]"
      }`}
    >
      <div className="shell">
        <SectionHead title={heading} className="mb-12" tone={onGold ? "gold" : undefined} />
        <ServiceCards cards={cards} onGold={onGold} />
      </div>
    </section>
  );
}
