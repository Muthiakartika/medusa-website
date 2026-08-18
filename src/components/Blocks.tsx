import Image from "next/image";
import {
  AddonCards,
  asAddonCards,
  asFeatures,
  asInlineTicks,
  asLinkChips,
  asTicks,
  clean,
  FeatureCards,
  Gallery,
  group,
  hasContent,
  isSequence,
  LinkChips,
  PriceGrid,
  Steps,
  unbullet,
} from "@/components/blocks-groups";
import EnquiryForm from "@/components/EnquiryForm";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import TableCards from "@/components/TableCards";
import { type Block, getForms, type Section } from "@/lib/blocks";
import { BOOK_URL } from "@/lib/site";
import { parseTable } from "@/lib/table-model";

/**
 * The container width at which a table stops needing to be re-read, by how
 * many packages it compares. Written out rather than computed because these
 * class names have to survive Tailwind's scanner.
 *
 * The numbers are the table's own: roughly 200px for the feature name, 240px
 * for its description and 110px per verdict column. Below that the columns
 * start colliding, and a `<table>` answers a squeeze with a scrollbar.
 */
const WIDE_ENOUGH: Record<number, { table: string; cards: string }> = {
  1: { table: "hidden @min-[560px]:block", cards: "@min-[560px]:hidden" },
  2: { table: "hidden @min-[720px]:block", cards: "@min-[720px]:hidden" },
  3: { table: "hidden @min-[820px]:block", cards: "@min-[820px]:hidden" },
  4: { table: "hidden @min-[820px]:block", cards: "@min-[820px]:hidden" },
};

/**
 * A block that is only a card flag — "MOST POPULAR" over a package name.
 *
 * 107 pages carry one, and the source is inconsistent about it: 60 write it as
 * an `<h3>` above the package's own `<h3>`, 39 as a paragraph, the rest as a
 * paragraph over a list. Rendered literally it is a heading with nothing under
 * it, which is how it read on the location and valeting pages — a shouty line
 * of its own above the card title instead of a flag on the card.
 *
 * Nothing but this one label qualifies: a short, fully capitalised phrase that
 * says popular. Anything longer is a real heading.
 */
const BADGE = /^\s*(most\s+popular|popular|best\s+seller|bestseller)\s*$/i;

const isBadge = (text: string) => {
  const t = text.replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
  return Boolean(t) && t === t.toUpperCase() && BADGE.test(t);
};

function Badge({ text, onGold }: { text: string; onGold?: boolean }) {
  return (
    <p className="mt-6 first:mt-0">
      <span
        className={`inline-flex rounded-full px-3 py-1.5 font-[family-name:var(--font-ui)] text-[10px] font-semibold tracking-[0.14em] uppercase ${
          onGold ? "bg-ink text-gold" : "bg-gold text-ink"
        }`}
      >
        {text.replace(/&nbsp;/gi, " ").trim()}
      </span>
    </p>
  );
}

/**
 * A paragraph that is really a heading.
 *
 * Eleven blog posts and a handful of service pages are written as one long run
 * of paragraphs with their section titles typed inside them — bold on their
 * own line ("Comprehensive Detailing on the Go"), numbered ("1. Why London
 * Winters Damage Your Car"), or flagged with the author's own bullet ("• Road
 * Salt & Grit", "✔ Full Decontamination"). The live site prints them as body
 * copy too, which is why those posts scroll for four thousand characters with
 * a single heading in them.
 *
 * Nothing is moved or reworded — the line is set as the heading it already is.
 * The three tests are deliberately narrow: short, no sentence-ending
 * punctuation, and a marker the author put there on purpose. 103 all-bold
 * lines across 33 pages match, and every one of them is a section title.
 */
const NUMBERED = /^\d{1,2}\.\s+\S/;
/** An emoji or a keycap digit, which is how four of the posts flag a title. */
const PICTOGRAPH = /^(?:\p{Extended_Pictographic}|\d️?⃣)/u;
const FLAGGED = /^[•✔✓]\s*\S/u;
const ALL_BOLD = /^\s*<(?:strong|b)>[\s\S]*<\/(?:strong|b)>\s*$/i;

function asLeadIn(html: string): { text: string; flagged?: boolean } | null {
  const text = clean(html)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (!text || /[.!?]$/.test(text)) return null;

  if (ALL_BOLD.test(clean(html)) && text.length >= 6 && text.length <= 90) return { text };
  if (NUMBERED.test(text) && text.length <= 90) return { text };
  if (PICTOGRAPH.test(text) && text.length <= 90) return { text };
  if (FLAGGED.test(text) && text.length <= 70) {
    return { text: text.replace(FLAGGED, (m) => m.replace(/^[•✔✓]\s*/u, "")), flagged: true };
  }
  return null;
}

function LeadIn({
  text,
  flagged,
  light,
}: {
  text: string;
  flagged?: boolean;
  light?: boolean;
}) {
  return (
    <p
      className={`mt-9 flex items-start gap-2.5 text-[18px] leading-snug font-semibold first:mt-0 lg:text-[19px] ${
        light ? "text-ink" : "text-white"
      }`}
    >
      {flagged && (
        <Icon name="check" size={18} strokeWidth={2.4} className="mt-[3px] shrink-0 text-gold" />
      )}
      {text}
    </p>
  );
}

/* Shared inline-link styling for any HTML we inject from the source site. */
/*
  `break-words` because nine posts paste a bare URL as the link text —
  "https://medusaautodetailing.co.uk/detailing/" is 44 characters with nothing
  to break on, so on a phone it ran past the edge of its column.
*/
const PROSE =
  "break-words [&_a]:text-gold [&_a:hover]:underline [&_strong]:text-white";

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
  /**
   * Text of the nearest heading above the block being rendered. A list of
   * labelled items is a grid of cards under "Signs Your Headlights Need
   * Restoration" and a numbered sequence under "The Restoration Process" —
   * same markup, different thing, and only the heading says which.
   */
  heading?: string;
  /** Headings that repeat the page title and should not render at all. */
  drop?: Set<Block>;
  /** Extra `<h1>`s, rendered as the section headings they actually are. */
  demote?: Set<Block>;
  /**
   * Paragraphs that are section titles the author typed into the prose.
   * Decided in `Sections`, where the following block can be looked at — a
   * marker alone is not enough, because the same "✅ …" opens a list item.
   */
  leadIn?: Set<Block>;
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

/** Every block on the page in document order, columns flattened into place. */
function inOrder(blocks: Block[], into: Block[]) {
  for (const b of blocks) {
    if (b.type === "columns") b.cols.forEach((c) => inOrder(c, into));
    else into.push(b);
  }
  return into;
}

const sameText = (a: string, b: string) =>
  a.replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase() ===
  b.replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();

export function Sections({
  sections,
  slug,
  bands = "content",
  pageH1,
  h1Taken = false,
  opensPage = true,
  panel,
}: {
  sections: Section[];
  slug: string;
  /**
   * `content` puts gold where the page has a moment worth marking.
   * `alternate` bands every other eligible section — a louder rhythm, used by
   * the editorial preview.
   * `none` leaves every row alone, for callers whose sections are not the
   * source's own — the location frame cuts five borough pages into rows
   * itself, and banding rows we invented would invent a design decision too.
   */
  bands?: "content" | "alternate" | "none";
  /** The page's own title, for spotting a content heading that repeats it. */
  pageH1?: string;
  /** The page has already rendered an h1 of its own — the post header does. */
  h1Taken?: boolean;
  /**
   * These sections open the page. False when a hand-built header sits above
   * them — the valeting frame does — so the first row is a body row and does
   * not take the 190px header padding or the opening light source.
   */
  opensPage?: boolean;
  /**
   * Sections to set inside a panel rather than flat on the page — used for
   * the merged price-and-extras row, which has to be findable at a glance.
   */
  panel?: Set<Section>;
}) {
  /*
    Some source posts mark every section heading as an <h1>: one carries
    thirteen, and the first of them repeats the post title the header has
    already set. Rendered faithfully that is thirteen 52px display headings
    down one article, and the title twice in a row at the top.

    So the first h1 stands and the rest step down to h2 — except one that is
    simply the page title again, which is dropped. Nothing else moves; these
    are section headings that were tagged wrong, and treating them as such is
    both the better outline and the better page.
  */
  const drop = new Set<Block>();
  const demote = new Set<Block>();
  const ordered = sections.reduce<Block[]>((acc, s) => inOrder(s.blocks, acc), []);
  const headings = ordered.filter((b) => b.type === "heading");

  // The post header has already printed the title; a copy of it opening the
  // article is the same words twice. Two posts lead with it as an h1 and again
  // as an h2, so this takes both.
  if (h1Taken && pageH1) {
    for (const h of headings.slice(0, 2)) {
      if (h.type === "heading" && sameText(h.text, pageH1)) drop.add(h);
      else break;
    }
  }

  // A heading with nothing under it but the same heading again. Four of these
  // across the site — /aircraft-cleaning prints "Disinfection Services" twice
  // in a row. The second one owns the content, so the first goes.
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i];
    const b = ordered[i + 1];
    if (a.type === "heading" && b.type === "heading" && sameText(a.text, b.text)) drop.add(a);
  }

  // Extra <h1>s render as the section headings they actually are.
  headings.forEach((b) => {
    if (b.type !== "heading" || b.level !== 1 || drop.has(b)) return;
    const first = headings.find((h) => h.type === "heading" && h.level === 1 && !drop.has(h));
    if (h1Taken || b !== first) demote.add(b);
  });

  /*
    A typed section title is a marker *and* a paragraph of real prose under it.
    Without the second half, "✅ The difference between valeting and detailing"
    — one of four bulleted lines in a row on the valeting guide — would be set
    as a heading over the next bullet.
  */
  const leadIn = new Set<Block>();
  ordered.forEach((b, i) => {
    if (b.type !== "paragraph" || !asLeadIn(b.html)) return;
    const next = ordered[i + 1];
    if (next?.type !== "paragraph" || asLeadIn(next.html)) return;
    // 40 characters is enough: the test that matters is the line above —
    // the next block must be prose, not another marker line.
    if (clean(next.html).replace(/<[^>]+>/g, "").trim().length >= 40) leadIn.add(b);
  });

  const ctx: Ctx = { slug, forms: getForms(slug), drop, demote, leadIn };
  const gold =
    bands === "none"
      ? sections.map(() => false)
      : bands === "alternate"
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
          first={opensPage && i === 0}
          panel={panel?.has(s)}
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
  panel,
  ctx,
}: {
  section: Section;
  first: boolean;
  /** Set the row inside a bordered panel with a gold edge along its top. */
  panel?: boolean;
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

  if (panel) {
    /*
      A panel, not a band. The row holds the price table — which is itself
      gold — so banding it would put gold on gold; the frame and the gold rule
      along its top do the work of marking it instead.
    */
    return (
      <section className="w-full py-12 lg:py-[72px]">
        <div className="shell">
          <div className="surface overflow-hidden border-t-[3px] border-gold px-6 py-10 lg:px-12 lg:py-14">
            <BlockList
              blocks={section.blocks}
              ctx={{ ...ctx, ruleOn: leadHeading(section.blocks) }}
            />
          </div>
        </div>
      </section>
    );
  }

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

      {/* Most service pages open on flat black because the source row carried
          no photograph. One light source behind the headline gives the page
          somewhere to start without inventing imagery it does not have. */}
      {first && !hasImage && !gold && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 12% 22%, rgba(193,146,49,0.15) 0%, rgba(193,146,49,0.05) 38%, transparent 70%)",
          }}
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
  const groups = group(blocks);

  // The heading in force at each position, resolved up front — a list needs to
  // know what it sits under, and threading it through the map body would mean
  // mutating during render.
  const headings: (string | undefined)[] = [];
  let current = ctx.heading;
  for (const g of groups) {
    if (g.kind === "block" && g.block.type === "heading") current = g.block.text;
    headings.push(current);
  }

  return (
    <>
      {groups.map((g, i) => {
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
        return <BlockView key={i} block={g.block} ctx={{ ...ctx, heading: headings[i] }} />;
      })}
    </>
  );
}

function BlockView({ block, ctx }: { block: Block; ctx: Ctx }) {
  switch (block.type) {
    case "heading":
      if (ctx.drop?.has(block)) return null;
      if (isBadge(block.text)) return <Badge text={block.text} onGold={ctx.onGold} />;
      return (
        <Heading
          level={ctx.demote?.has(block) ? 2 : block.level}
          text={block.text}
          href={block.href}
          rule={ctx.ruleOn === block}
          light={ctx.light}
        />
      );

    case "paragraph": {
      /*
        88 paragraphs across 11 pages hold nothing but `&nbsp;` — spacer rows
        the page builder left behind. Each rendered as an empty <p> with a
        16px top margin, so they showed up as gaps in the middle of a passage.
      */
      if (!hasContent(block.html)) return null;

      // The card flag, wherever the source chose to put it.
      const flat = block.html.replace(/<[^>]+>/g, "");
      if (isBadge(flat)) return <Badge text={flat} onGold={ctx.onGold} />;

      // A paragraph that is only links and commas is a list, not prose.
      const chips = asLinkChips(block.html);
      if (chips) return <LinkChips chips={chips} onGold={ctx.onGold} />;

      // A section title the author typed into a paragraph.
      if (ctx.leadIn?.has(block)) {
        const lead = asLeadIn(block.html);
        if (lead) return <LeadIn text={lead.text} flagged={lead.flagged} light={ctx.light} />;
      }

      // …and one with ticks scattered through it is a checklist typed flat.
      const inline = asInlineTicks(block.html);
      if (inline) {
        return (
          <ul className="mt-6 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {inline.map((t, i) => (
              <li
                key={i}
                className={`flex gap-3 text-[16px] leading-[25px] font-normal ${
                  ctx.light ? "text-ink/85" : "text-body"
                } ${PROSE}`}
              >
                <Icon
                  name="check"
                  size={16}
                  strokeWidth={2.4}
                  className={`mt-[4px] shrink-0 ${ctx.light ? "text-ink" : "text-gold"}`}
                />
                <span dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p
          className={`mt-4 max-w-[76ch] text-[16.5px] leading-[28px] font-normal ${
            ctx.light ? "text-ink/80" : "text-body"
          } ${PROSE}`}
          dangerouslySetInnerHTML={{ __html: clean(block.html) }}
        />
      );
    }

    case "list": {
      // Blank bullets, six of them across the location pages.
      const items = block.items.filter(hasContent);
      if (!items.length) return null;
      const list = items.length === block.items.length ? block : { ...block, items };

      /*
        Most of these are not lists. An item of the form "Label: explanation"
        is a card, and a run of them under a process heading is a sequence.
        Left as bullets they were the flattest thing on every service page —
        four paragraphs of grey with a tick in front of each.
      */
      const features = asFeatures(list);
      if (features) {
        return isSequence(list, ctx.heading) ? (
          <Steps items={features} light={ctx.light} />
        ) : (
          <FeatureCards items={features} onGold={ctx.onGold} />
        );
      }

      // One- and two-word items belong on a row, not a column.
      const ticks = asTicks(list);
      if (ticks) {
        return (
          <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-2.5">
            {ticks.map((t, i) => (
              <li
                key={i}
                className={`flex items-center gap-2.5 text-[15.5px] leading-[24px] font-semibold ${
                  ctx.light ? "text-ink" : "text-white"
                } ${PROSE}`}
              >
                <Icon
                  name="check"
                  size={17}
                  strokeWidth={2.4}
                  className={`shrink-0 ${ctx.light ? "text-ink" : "text-gold"}`}
                />
                <span dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        );
      }

      // What is left really is a list: the what's-included checklists.
      const Tag = list.ordered ? "ol" : "ul";
      const panel = list.items.length >= 6;
      return (
        /*
          The second column is asked for against the panel's own width, not the
          window's. `sm:grid-cols-2` split the list in two whenever the browser
          was wider than 640px — including inside the four package columns on
          /standard-car-wash, where it left 97px cells with "Hybrid Ceramic Wax
          – SiO2 Paint Protection" running out of them.
        */
        <div className={`@container ${panel ? "mt-6" : ""}`}>
        <Tag
          className={`${panel ? "" : "mt-6"} ${
            panel
              ? `grid gap-x-8 gap-y-3.5 p-6 @min-[520px]:grid-cols-2 @min-[520px]:p-7 ${
                  ctx.onGold ? "surface-on-gold" : "surface"
                }`
              : "max-w-[76ch] space-y-2.5"
          }`}
        >
          {list.items.map((it, i) => (
            <li
              key={i}
              className={`flex gap-3 text-[16px] leading-[25px] font-normal ${
                // A checklist sits inside its own dark panel, so its copy stays
                // light even where the section around it is gold.
                ctx.light && list.items.length < 6 ? "text-ink/85" : "text-body"
              } ${PROSE}`}
            >
              {list.ordered ? (
                <span
                  className={`mt-[1px] shrink-0 font-[family-name:var(--font-sub)] text-[15px] tabular-nums ${
                    ctx.light && list.items.length < 6 ? "text-ink" : "text-gold"
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
                  className={`mt-[4px] shrink-0 ${
                    ctx.light && list.items.length < 6 ? "text-ink" : "text-gold"
                  }`}
                />
              )}
              {/* The source's own "✔" would sit next to the one drawn above. */}
              <span dangerouslySetInnerHTML={{ __html: unbullet(clean(it)) }} />
            </li>
          ))}
        </Tag>
        </div>
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

    case "button": {
      /*
        Three "Book Now" buttons carry `href="#"` — on the source they opened
        a popup this clone does not have, so they landed here as a gold call
        to action that goes nowhere. Only a booking label is redirected, and
        only to the booking URL every other Book Now on the site already uses.
      */
      const dead = !block.href || block.href === "#";
      const href = dead && /\bbook\b/i.test(block.label) ? BOOK_URL : block.href;
      if (!href || href === "#") return null;

      /*
        Full width on a phone, content width from `sm` up. A page's buttons
        arrive as a run of separate blocks, so on a narrow screen they stack —
        and stacked, four labels of four lengths read as four sizes of button
        rather than four choices. The same reason the hero row does it.
      */
      return (
        <a
          href={href}
          className="btn btn-gold mt-7 mr-3 w-full rounded-full sm:w-auto"
          {...(/^https?:/.test(href)
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {block.label}
          <Icon name="arrow" size={18} className="ml-2.5" />
        </a>
      );
    }

    case "table": {
      // Defensive: a malformed row must not take down the whole prerender.
      const rows = (block.rows ?? []).filter(Array.isArray);
      if (!rows.length) return null;

      /*
        A table is the right shape for this content and the wrong one for a
        phone: /valeting's package matrix is 1062px wide and 18,633px tall at
        375px, which is two axes of scrolling and about fifty screens of it.
        So the table renders wherever its container can hold it, and
        `TableCards` renders the same rows wherever it cannot — see
        `lib/table-model.ts`. A table this cannot read keeps the old
        behaviour rather than being guessed at.
      */
      const model = parseTable(rows);
      const view = model ? WIDE_ENOUGH[Math.min(model.valueCount, 4)] : null;

      return (
        <div className={`surface mt-7 overflow-hidden ${model ? "@container" : ""}`}>
          <div className={`w-full overflow-x-auto ${view ? view.table : ""}`}>
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
          {model && view && (
            <div className={view.cards}>
              <TableCards model={model} />
            </div>
          )}
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

      /*
        A two-cell row where one cell is nothing but pictures is a media
        split, not a layout. Aligning the two centrally and letting the
        picture stick while the copy scrolls is the difference between a
        photograph parked above a wall of text and a section.
      */
      const imageCol = block.cols.findIndex(
        (col) => col.length > 0 && col.every((b) => b.type === "image" && !b.icon),
      );
      const split = block.cols.length === 2 && imageCol !== -1;

      return (
        <div
          className={`mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-12 ${
            split ? "lg:items-center" : ""
          }`}
        >
          {block.cols.map((col, i) => (
            <div
              key={i}
              className={`${SPAN[block.spans[i]] ?? "lg:col-span-12"} ${
                split && i === imageCol ? "lg:sticky lg:top-[120px] [&_img]:ring-1 [&_img]:ring-white/[0.08]" : ""
              }`}
            >
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
  href,
  rule,
  light,
}: {
  level: number;
  text: string;
  /** Set when the source's heading was one link and nothing else. */
  href?: string;
  rule?: boolean;
  light?: boolean;
}) {
  const head = light ? "text-ink" : "text-white";
  const accent = light ? "text-ink" : "text-gold";

  /*
    A heading that was a link stays one. These are the package ladders — "LEVEL
    1" through "LEVEL 5", each pointing at the page it names — and the calls to
    action inside the blog posts.
  */
  const label = href ? (
    <a href={href} className="underline-offset-[6px] transition-colors hover:text-gold hover:underline">
      {text}
    </a>
  ) : (
    text
  );

  /*
    132 of the h5s on this site run past 90 characters — `car-lovers-club`
    has one of 188. Those are paragraphs the page builder happened to mark as
    a heading, and set at heading weight they shout a whole sentence. The tag
    stays, so the document outline is unchanged; only the type steps back.
  */
  const prose = level >= 4 && text.length > 90;
  const body = `max-w-[76ch] text-[16.5px] leading-[28px] font-normal ${
    light ? "text-ink/80" : "text-body"
  }`;

  /*
    A heading that is only a price is not a heading. The service pages carry
    one directly under the h1 — "£ 100" set as an h5 — where it read as a
    stray line of type between the title and the first paragraph. As a badge
    it becomes the thing a visitor is looking for.

    Price *tables* never reach here: `group()` collapses those runs first.
  */
  if (/^\s*(from\s*)?£\s*[\d,]/i.test(text)) {
    // The figure verbatim. Whether it is a fixed price or a starting one is
    // the source's to say — several of these pages quote an exact price, and
    // captioning them all "from" would be inventing a commercial claim.
    return (
      <p className="mt-6 first:mt-0">
        <span
          className={`inline-flex items-baseline rounded-full px-4 py-2 font-[family-name:var(--font-display)] text-[22px] leading-none ${
            light ? "bg-ink text-white" : "bg-gold/12 text-gold ring-1 ring-gold/35"
          }`}
        >
          {text.replace(/\s+/g, " ").trim()}
        </span>
      </p>
    );
  }

  switch (level) {
    case 1:
      return (
        <h1 className={`text-[32px] leading-[0.99] sm:text-[40px] lg:text-[52px] ${head}`}>
          {label}
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
            {label}
          </h2>
        </div>
      );
    case 3:
      return (
        <h3 className={`mt-8 text-[18px] font-semibold lg:text-[20px] ${head}`}>
          {label}
        </h3>
      );
    case 4:
      return <h4 className={`mt-5 ${prose ? body : `text-[20px] lg:text-[22px] ${accent}`}`}>{label}</h4>;
    case 5:
      return <h5 className={`mt-4 ${prose ? body : `text-[17px] font-semibold ${head}`}`}>{label}</h5>;
    default:
      return <h6 className={`mt-4 ${prose ? body : `text-[15px] font-semibold ${accent}`}`}>{label}</h6>;
  }
}
