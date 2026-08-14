import Image from "next/image";
import {
  AddonCards,
  asAddonCards,
  asLinkChips,
  Gallery,
  group,
  LinkChips,
  PriceGrid,
} from "@/components/blocks-groups";
import EnquiryForm from "@/components/EnquiryForm";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import { type Block, getForms, type Section } from "@/lib/blocks";

/* Shared inline-link styling for any HTML we inject from the source site. */
const PROSE = "[&_a]:text-gold [&_a:hover]:underline [&_strong]:text-white";

/**
 * Forms need to know which page and which form-on-that-page they are, so the
 * server action can re-read their schema. `forms` holds the page's form blocks
 * in document order; identity lookup against it gives each one its index.
 */
type Ctx = {
  slug: string;
  forms: Block[];
  /** The one heading per section that carries the speed rule. */
  ruleOn?: Block;
  /** The section's own background is light, so copy has to be ink. */
  light?: boolean;
  /** Rendering on a gold band — cards and chips invert. */
  onGold?: boolean;
};

/**
 * Some extracted sections carry their own background colour, and 86 of them
 * across 20 pages are the brand gold. White copy on that gold measures 2.83:1,
 * so those sections flip to ink.
 *
 * Cards keep their own dark surface and white text either way — this only
 * governs copy sitting directly on the section.
 */
function isLightBackground(bg: Section["bg"]): boolean {
  if (!bg || bg.image) return false;
  const hex =
    (bg.color?.match(/#[0-9a-f]{3,8}/i) ?? bg.gradient?.match(/#[0-9a-f]{3,8}/i))?.[0];
  if (!hex) return false;

  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const channel = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance > 0.18;
}

/** First level-2 heading in a section, columns included. */
function leadHeading(blocks: Block[]): Block | undefined {
  for (const b of blocks) {
    if (b.type === "heading" && b.level === 2) return b;
    if (b.type === "columns") {
      for (const col of b.cols) {
        const found = leadHeading(col);
        if (found) return found;
      }
    }
  }
  return undefined;
}

/**
 * What the eye reads as one surface. Sections are WordPress rows, not visual
 * sections: most pages are a run of rows that all sit on the same black, and
 * padding each one top and bottom put ~200px of nothing between paragraphs
 * that belong together.
 */
const surfaceOf = (bg: Section["bg"]) =>
  bg?.image ?? bg?.gradient ?? bg?.color ?? "none";

/**
 * Which sections carry the brand gold.
 *
 * The homepage punctuates a dark scroll with three gold bands; a service page
 * that is black end to end reads as a different site. Rather than painting
 * every other row — which lands gold wherever the source happened to split a
 * paragraph — the band goes to the two sections that are actually a moment:
 * the add-on cards and the coverage list. With the gold price panel that gives
 * three gold beats per page, the same rhythm as the homepage.
 *
 * Sections that already carry their own background keep it.
 */
function goldBands(sections: Section[]): boolean[] {
  return sections.map((s, i) => {
    // A photograph or a genuinely light background is a design decision worth
    // keeping. A black gradient is not — most of these rows carry one, and
    // preserving it would mean no service page ever gets a band.
    if (i === 0 || s.bg?.image || isLightBackground(s.bg)) return false;
    // Add-ons arrive either loose in the stream or inside a columns block.
    const groups = group(s.blocks);
    const hasAddons =
      groups.some((g) => g.kind === "addonCards") ||
      s.blocks.some((b) => b.type === "columns" && asAddonCards(b) !== null);
    const hasChips = s.blocks.some(
      (b) => b.type === "paragraph" && asLinkChips(b.html) !== null,
    );
    return hasAddons || hasChips;
  });
}

export function Sections({
  sections,
  slug,
  bands = "content",
}: {
  sections: Section[];
  slug: string;
  /**
   * `content` puts gold where the page has a moment worth marking.
   * `alternate` bands every other eligible section — a louder rhythm, used by
   * the editorial preview.
   */
  bands?: "content" | "alternate";
}) {
  const ctx: Ctx = { slug, forms: getForms(slug) };
  const gold =
    bands === "alternate"
      ? sections.map((s, i) => i > 0 && i % 2 === 0 && !s.bg?.image && !isLightBackground(s.bg))
      : goldBands(sections);
  // A gold band is its own surface, so the seam either side keeps full padding.
  const surface = (i: number) => (gold[i] ? "gold" : surfaceOf(sections[i].bg));

  return (
    <>
      {sections.map((s, i) => (
        <SectionBlock
          key={i}
          section={s}
          first={i === 0}
          gold={gold[i]}
          // Generous padding only where the surface actually changes.
          openSurface={i > 0 && surface(i - 1) === surface(i)}
          closeSurface={i < sections.length - 1 && surface(i + 1) === surface(i)}
          ctx={ctx}
        />
      ))}
    </>
  );
}

function SectionBlock({
  section,
  first,
  gold,
  openSurface,
  closeSurface,
  ctx,
}: {
  section: Section;
  first: boolean;
  /** Render this section as a gold band. */
  gold?: boolean;
  /** Previous section shares this background — do not re-pad the seam. */
  openSurface?: boolean;
  /** Next section shares this background. */
  closeSurface?: boolean;
  ctx: Ctx;
}) {
  const bg = section.bg;
  const style: React.CSSProperties = {};
  if (bg?.gradient) style.background = bg.gradient;
  else if (bg?.color) style.backgroundColor = bg.color;

  const hasImage = Boolean(bg?.image);
  // The opening section of a service page is its header. Given a photograph it
  // gets hero treatment — more height and a directional scrim — rather than the
  // flat 80% wash every other backgrounded row uses.
  const isHero = first && hasImage;

  /*
    Three tiers rather than one. A continuing surface barely breaks; a change
    of surface gets a real but not cavernous break; only the header keeps the
    generous opening. Padding every row 96px top and bottom put ~220px of
    nothing between paragraphs that read as one passage.
  */
  const padTop = isHero
    ? "pt-[190px] lg:pt-[250px]"
    : first
      ? "pt-[150px] lg:pt-[190px]"
      : openSurface
        ? "pt-7 lg:pt-9"
        : "pt-12 lg:pt-16";

  const padBottom = closeSurface
    ? "pb-7 lg:pb-9"
    : isHero
      ? "pb-14 lg:pb-20"
      : "pb-12 lg:pb-16";

  return (
    <section
      className={`relative w-full ${padTop} ${padBottom} ${gold ? "bg-gold-wash" : ""}`}
      style={gold ? undefined : style}
    >
      {hasImage && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bg!.image})` }}
          />
          {isHero ? (
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(78deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.78)_46%,rgba(0,0,0,0.55)_100%)]"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundColor: bg!.overlay ?? "#000000",
                opacity: bg!.overlayOpacity ?? 0.8,
              }}
            />
          )}
        </>
      )}
      {!hasImage && bg?.overlay && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: bg.overlay, opacity: bg.overlayOpacity ?? 1 }}
        />
      )}

      <Reveal className="shell-article relative">
        <BlockList
          blocks={section.blocks}
          ctx={{
            ...ctx,
            ruleOn: leadHeading(section.blocks),
            light: gold || isLightBackground(bg),
            onGold: gold || isLightBackground(bg),
          }}
        />
      </Reveal>
    </section>
  );
}

export function BlockList({ blocks, ctx }: { blocks: Block[]; ctx: Ctx }) {
  // Repeating price runs collapse into a single grid before rendering.
  return (
    <>
      {group(blocks).map((g, i) => {
        if (g.kind === "priceGrid") return <PriceGrid key={i} items={g.items} />;
        if (g.kind === "gallery") return <Gallery key={i} images={g.images} />;
        if (g.kind === "addonCards") {
          return (
            <AddonCards
              key={i}
              cards={g.cards}
              onGold={ctx.onGold}
              renderBlocks={(rest) => (
                <BlockList
                  blocks={rest}
                  ctx={{ ...ctx, light: false, onGold: false }}
                />
              )}
            />
          );
        }
        return <BlockView key={i} block={g.block} ctx={ctx} />;
      })}
    </>
  );
}

function BlockView({ block, ctx }: { block: Block; ctx: Ctx }) {
  switch (block.type) {
    case "heading":
      return (
        <Heading
          level={block.level}
          text={block.text}
          rule={ctx.ruleOn === block}
          light={ctx.light}
        />
      );

    case "paragraph": {
      // A paragraph that is only links and commas is a list, not prose.
      const chips = asLinkChips(block.html);
      if (chips) return <LinkChips chips={chips} onGold={ctx.onGold} />;

      return (
        <p
          className={`mt-4 max-w-[76ch] text-[16.5px] leading-[28px] font-normal ${
            ctx.light ? "text-ink/80" : "text-body"
          } ${PROSE}`}
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    }

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`mt-6 ${
            block.items.length >= 6
              ? "surface grid gap-x-8 gap-y-3 p-6 sm:grid-cols-2 sm:p-7"
              : "max-w-[76ch] space-y-2.5"
          }`}
        >
          {block.items.map((it, i) => (
            <li
              key={i}
              className={`flex gap-3 text-[16px] leading-[25px] font-normal ${
                ctx.light ? "text-ink/85" : "text-body"
              } ${PROSE}`}
            >
              {block.ordered ? (
                <span
                  className={`mt-[1px] shrink-0 font-[family-name:var(--font-sub)] text-[15px] tabular-nums ${
                    ctx.light ? "text-ink" : "text-gold"
                  }`}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              ) : (
                <Icon
                  name="check"
                  size={16}
                  strokeWidth={2.4}
                  className={`mt-[4px] shrink-0 ${ctx.light ? "text-ink" : "text-gold"}`}
                />
              )}
              <span dangerouslySetInnerHTML={{ __html: it }} />
            </li>
          ))}
        </Tag>
      );
    }

    case "image": {
      const w = block.w ?? 800;
      const h = block.h ?? 600;
      /*
        The theme's decorative icons, flagged during extraction. The source
        showed them inside a carousel at a fraction of their file size; pulled
        out of it they are ordinary image blocks, and a 339px icon rendered as
        content filled the whole 1710px column. Capping them and letting them
        flow inline rebuilds something close to the original row instead of a
        stack of billboards.
      */
      if (block.icon) {
        return (
          <Image
            src={block.src}
            alt={block.alt}
            width={w}
            height={h}
            className="mt-5 mr-5 inline-block h-[76px] w-auto align-middle"
          />
        );
      }

      return (
        <Image
          src={block.src}
          alt={block.alt}
          width={w}
          height={h}
          sizes="(min-width: 1024px) 1000px, 100vw"
          // Never enlarge past the source asset — upscaling an extracted
          // 400px image to a 1710px column only makes it soft.
          style={{ maxWidth: w }}
          className="mt-7 h-auto w-full rounded-[12px]"
        />
      );
    }

    case "button":
      return (
        <a
          href={block.href}
          className="btn btn-gold mt-7 mr-3 rounded-full"
          {...(/^https?:/.test(block.href)
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {block.label}
          <Icon name="arrow" size={18} className="ml-2.5" />
        </a>
      );

    case "table": {
      // Defensive: a malformed row must not take down the whole prerender.
      const rows = (block.rows ?? []).filter(Array.isArray);
      if (!rows.length) return null;
      return (
        <div className="surface mt-7 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={
                      i === 0
                        ? "bg-gold text-ink"
                        : "border-t border-white/[0.07] transition-colors hover:bg-white/[0.03]"
                    }
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="px-5 py-3.5 text-[15px] font-normal first:font-semibold"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case "faq":
      return <FaqAccordion items={block.items} />;

    case "form":
      return (
        <EnquiryForm
          slug={ctx.slug}
          index={Math.max(0, ctx.forms.indexOf(block))}
          submitLabel={block.submitLabel}
          fields={block.fields}
        />
      );

    case "embed":
      return (
        <div className="mt-7 overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
          <iframe
            src={block.src}
            title={block.title || "Embedded content"}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="aspect-video h-full min-h-[360px] w-full border-0"
          />
        </div>
      );

    case "video":
      return (
        <video
          className="mt-7 h-auto w-full rounded-[12px]"
          controls
          playsInline
          poster={block.poster}
          preload="metadata"
        >
          <source src={block.src} />
        </video>
      );

    case "columns": {
      // Cells that are all price + icon + name + copy are an add-on row, not
      // a free-form layout, so they render as cards instead of four stacks.
      const cards = asAddonCards(block);
      if (cards) {
        return (
          <AddonCards
            cards={cards}
            onGold={ctx.onGold}
            // The card is always a dark surface, even on a gold section, so
            // its contents go back to light-on-dark regardless of the band.
            renderBlocks={(rest) => (
              <BlockList
                blocks={rest}
                ctx={{ ...ctx, light: false, onGold: false }}
              />
            )}
          />
        );
      }

      return (
        <div className="mt-8 grid gap-x-8 gap-y-8 lg:grid-cols-12">
          {block.cols.map((col, i) => (
            <div key={i} className={SPAN[block.spans[i]] ?? "lg:col-span-12"}>
              <BlockList blocks={col} ctx={ctx} />
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}

/* Tailwind needs these spelled out to generate the classes. */
const SPAN: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

function Heading({
  level,
  text,
  rule,
  light,
}: {
  level: number;
  text: string;
  rule?: boolean;
  light?: boolean;
}) {
  const head = light ? "text-ink" : "text-white";
  const accent = light ? "text-ink" : "text-gold";
  switch (level) {
    case 1:
      return (
        <h1 className={`text-[32px] leading-[0.99] sm:text-[40px] lg:text-[52px] ${head}`}>
          {text}
        </h1>
      );
    case 2:
      // Only the section's lead h2 gets the rule. Some pages carry seventy of
      // these headings; marking every one would turn the motif into wallpaper.
      return (
        <div className="mt-12 first:mt-0">
          {rule && (
            <span
              aria-hidden
              className={`block h-[3px] w-[52px] rounded-full ${light ? "bg-ink" : "bg-gold"}`}
            />
          )}
          <h2
            className={`text-[26px] leading-[1.04] sm:text-[32px] lg:text-[40px] ${head} ${
              rule ? "mt-6" : ""
            }`}
          >
            {text}
          </h2>
        </div>
      );
    case 3:
      return (
        <h3 className={`mt-8 text-[18px] font-semibold lg:text-[20px] ${head}`}>
          {text}
        </h3>
      );
    case 4:
      return <h4 className={`mt-5 text-[20px] lg:text-[22px] ${accent}`}>{text}</h4>;
    case 5:
      return <h5 className={`mt-4 text-[17px] font-semibold ${head}`}>{text}</h5>;
    default:
      return <h6 className={`mt-4 text-[15px] font-semibold ${accent}`}>{text}</h6>;
  }
}
