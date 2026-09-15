import Icon from "@/components/Icon";
import { BOOK_URL } from "@/lib/site";

/**
 * The entry price, set beside a page header.
 *
 * Lifted out of `ServicePage`'s own header so `/repairs` can carry the same
 * card: it is a hub with no source page, and a header with nothing beside the
 * title reads as a lesser page than the forty-one service pages it sits above.
 * Same markup, same measurements — the two must not drift.
 */
export default function PriceCard({ label, from }: { label: string; from: string }) {
  return (
    <div className="surface w-full max-w-[420px] p-7 backdrop-blur-sm lg:p-8">
      <p className="font-[family-name:var(--font-ui)] text-[11px] tracking-[0.18em] text-white/55 uppercase">
        {label}
      </p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-[14px] font-normal text-white/60">from</span>
        <span className="font-[family-name:var(--font-display)] text-[44px] leading-none text-gold lg:text-[52px]">
          {from}
        </span>
      </p>
      <span aria-hidden className="my-6 block h-px w-full bg-white/10" />

      {/* "Book Now" is the button these pages already carry under their price
          table; nothing else is added to the card. */}
      <a href={BOOK_URL} className="btn btn-gold w-full rounded-full text-[15px]">
        Book Now
        <Icon name="arrow" size={18} className="ml-2.5" />
      </a>
    </div>
  );
}
