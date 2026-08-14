import Image from "next/image";
import type { Block } from "@/lib/blocks";

/**
 * The service pages are extracted from WordPress, so genuinely structured
 * content arrives as a flat run of blocks. Two shapes account for most of it:
 *
 *   price table  — icon, class name, example cars, price. Repeated four times,
 *                  once per vehicle class. 2,524 runs across 115 pages.
 *   add-on cards — a columns block whose cells each hold a price, an icon, a
 *                  name and a description. 199 groups across 122 pages.
 *
 * Rendered block-by-block these read as a stack of loose headings and pictures.
 * Recognising them here lets the renderer lay them out as the tables and cards
 * they already are, without touching the extracted content.
 */

const text = (b: Block | undefined) =>
  b?.type === "heading" ? b.text : b?.type === "paragraph" ? b.html : "";

const isPrice = (b: Block | undefined) =>
  b?.type === "heading" && /^\s*(£|from\s*£)\s*[\d,]/i.test(b.text);

const isIcon = (b: Block | undefined) => b?.type === "image" && Boolean(b.icon);

export type PriceItem = {
  icon?: Extract<Block, { type: "image" }>;
  label: string;
  note?: string;
  price: string;
};

export type Grouped =
  | { kind: "block"; block: Block }
  | { kind: "priceGrid"; items: PriceItem[] }
  | { kind: "gallery"; images: Extract<Block, { type: "image" }>[] }
  | { kind: "addonCards"; cards: AddonCard[] };

/**
 * Collapses `icon → h3 → (paragraph) → £heading` runs into one price grid.
 * A run of fewer than two is left alone — a lone trio is not a table.
 */
export function group(blocks: Block[]): Grouped[] {
  const out: Grouped[] = [];
  let i = 0;

  while (i < blocks.length) {
    const items: PriceItem[] = [];
    let j = i;

    for (;;) {
      const icon = blocks[j];
      const label = blocks[j + 1];
      if (!isIcon(icon) || label?.type !== "heading" || label.level !== 3) break;

      // The example-cars line is optional.
      const maybeNote = blocks[j + 2];
      const hasNote = maybeNote?.type === "paragraph" && !isPrice(maybeNote);
      const price = blocks[j + (hasNote ? 3 : 2)];
      if (!isPrice(price)) break;

      items.push({
        icon: icon as Extract<Block, { type: "image" }>,
        label: label.text,
        note: hasNote ? text(maybeNote) : undefined,
        price: text(price),
      });
      j += hasNote ? 4 : 3;
    }

    if (items.length >= 2) {
      out.push({ kind: "priceGrid", items });
      i = j;
      continue;
    }

    /*
      The same add-on shape, but loose in the block stream instead of inside a
      columns block — the thirteenth item that did not fit the source's 4×3
      grid, and every add-on on pages that never used columns at all. Left
      alone it rendered as a price, an icon, a heading and a paragraph stacked
      down the full width of the page.
    */
    const cards: AddonCard[] = [];
    let a = i;
    while (
      isPrice(blocks[a]) &&
      isIcon(blocks[a + 1]) &&
      blocks[a + 2]?.type === "heading"
    ) {
      let end = a + 3;
      while (blocks[end]?.type === "paragraph") end++;
      cards.push({
        price: text(blocks[a]),
        icon: blocks[a + 1] as Extract<Block, { type: "image" }>,
        rest: blocks.slice(a + 2, end),
      });
      a = end;
    }
    if (cards.length) {
      out.push({ kind: "addonCards", cards });
      i = a;
      continue;
    }

    /*
      Consecutive photographs are a gallery, not a column. One page carries
      nine 576px images in a row, which stacked to roughly 3,600px of scroll;
      site-wide there are runs of up to ten.
    */
    let k = i;
    while (blocks[k]?.type === "image" && !(blocks[k] as { icon?: boolean }).icon) k++;
    if (k - i >= 2) {
      out.push({
        kind: "gallery",
        images: blocks.slice(i, k) as Extract<Block, { type: "image" }>[],
      });
      i = k;
      continue;
    }

    out.push({ kind: "block", block: blocks[i] });
    i += 1;
  }

  return out;
}

export type AddonCard = {
  price: string;
  icon?: Extract<Block, { type: "image" }>;
  /** Everything the card chrome did not take, rendered in document order. */
  rest: Block[];
};

/**
 * A columns block whose cells are add-on cards rather than free layout.
 *
 * The price and the icon are lifted into the card's header; every other block
 * is handed back untouched. Picking out a title and some paragraphs instead
 * looked tidier and quietly dropped content — the subscription tiers carry an
 * h4 plan name above their h3, and that name vanished.
 */
export function asAddonCards(
  block: Extract<Block, { type: "columns" }>,
): AddonCard[] | null {
  const cards = block.cols.map((col) => {
    const priceBlock = col.find(isPrice);
    const iconBlock = col.find(isIcon);
    return {
      price: text(priceBlock),
      icon: iconBlock as Extract<Block, { type: "image" }> | undefined,
      rest: col.filter((b) => b !== priceBlock && b !== iconBlock),
      hasTitle: col.some((b) => b.type === "heading" && !isPrice(b)),
    };
  });

  // Only treat it as a card row when the cells genuinely share that shape.
  const solid = cards.filter((c) => c.price && c.hasTitle).length;
  if (solid < 2 || solid < block.cols.length - 1) return null;
  return cards.map(({ price, icon, rest }) => ({ price, icon, rest }));
}

/**
 * A paragraph that is nothing but links separated by commas — the coverage
 * lists at the foot of the service pages, 40 of them across the site. As prose
 * it reads as one long gold sentence with no scanning structure; as chips each
 * area becomes a target you can find and click.
 */
export function asLinkChips(html: string) {
  const links = [...html.matchAll(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi)];
  if (links.length < 4) return null;
  // Everything outside the anchors must be punctuation and whitespace only.
  const between = html.replace(/<a[^>]*>.*?<\/a>/gi, "").replace(/<\/?[a-z][^>]*>/gi, "");
  if (/[^\s,;&·|/–—-]|&(?!amp;|nbsp;)/i.test(between.replace(/&amp;|&nbsp;/gi, " "))) return null;
  return links.map((m) => ({ href: m[1], label: m[2].replace(/<[^>]+>/g, "").trim() }));
}

export function LinkChips({
  chips,
  onGold,
}: {
  chips: { href: string; label: string }[];
  onGold?: boolean;
}) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {chips.map((c) => (
        <li key={c.href + c.label}>
          <a
            href={c.href}
            className={`inline-flex rounded-full px-4 py-2 text-[14px] font-normal transition-colors ${
              onGold
                ? "bg-ink/10 text-ink ring-1 ring-ink/25 hover:bg-ink hover:text-white hover:ring-ink"
                : "bg-white/[0.05] text-white/80 ring-1 ring-white/10 hover:bg-gold hover:text-ink hover:ring-gold"
            }`}
          >
            {c.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Gallery({
  images,
}: {
  images: Extract<Block, { type: "image" }>[];
}) {
  // Pairs read better side by side; longer runs go three up.
  const cols = images.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={`mt-7 grid grid-cols-1 gap-3 ${cols}`}>
      {images.map((img, i) => (
        <li key={i} className="relative aspect-4/3 overflow-hidden rounded-[12px]">
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * The price table is the commercial peak of a service page, and on a run of
 * otherwise black content it is the natural place for the brand gold. Type is
 * ink — white on this gold measures 2.83:1 — and the car icons are knocked to
 * ink to match.
 */
export function PriceGrid({ items }: { items: PriceItem[] }) {
  return (
    <div className="bg-gold-wash mt-9 rounded-[14px] p-2 sm:p-3">
      <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex flex-col items-center px-5 py-7 text-center sm:px-6"
          >
            {it.icon && (
              <Image
                src={it.icon.src}
                alt=""
                width={it.icon.w ?? 339}
                height={it.icon.h ?? 339}
                className="h-[62px] w-auto brightness-0"
              />
            )}
            <h3 className="mt-4 font-[family-name:var(--font-sub)] text-[17px] tracking-[0.04em] text-ink uppercase">
              {it.label}
            </h3>
            {it.note && (
              <p
                className="mt-2 text-[13px] leading-[20px] font-normal text-ink/85"
                dangerouslySetInnerHTML={{ __html: it.note }}
              />
            )}
            <p className="mt-auto pt-5 font-[family-name:var(--font-display)] text-[36px] leading-none text-ink">
              {it.price}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AddonCards({
  cards,
  renderBlocks,
  onGold,
}: {
  cards: AddonCard[];
  /** The ordinary block renderer, passed in to avoid a circular import. */
  renderBlocks: (blocks: Block[]) => React.ReactNode;
  /** Sitting on a gold band — the tile goes solid ink for contrast. */
  onGold?: boolean;
}) {
  return (
    <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <li
          key={i}
          className={`flex flex-col p-6 ${onGold ? "surface-on-gold" : "surface"}`}
        >
          <div className="flex items-start justify-between gap-3">
            {c.icon ? (
              <Image
                src={c.icon.src}
                alt=""
                width={c.icon.w ?? 339}
                height={c.icon.h ?? 339}
                className="h-[46px] w-auto"
              />
            ) : (
              <span />
            )}
            {c.price && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 font-[family-name:var(--font-ui)] text-[13px] font-semibold ${
                  onGold ? "bg-white text-ink" : "bg-gold text-ink"
                }`}
              >
                {c.price}
              </span>
            )}
          </div>

          {/* Tightens the first heading against the card header. */}
          <div className="[&>*:first-child]:mt-4 [&_h3]:text-[16px] [&_h4]:text-[15px]">
            {renderBlocks(c.rest)}
          </div>
        </li>
      ))}
    </ul>
  );
}
