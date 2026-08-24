import Icon from "@/components/Icon";
import TablePrices from "@/components/TablePrices";
import {
  DEFAULT_ACCENT,
  isTick,
  parseLadder,
  shortLabel,
  TIER_ACCENT,
  type TableModel,
  type TableRow,
} from "@/lib/table-model";

/**
 * A comparison table, narrow enough to read on a phone.
 *
 * `components/Blocks.tsx` renders the real `<table>` wherever the container is
 * wide enough for it and this wherever it is not. The two are the same
 * content: every feature row, in source order, with its group dividers and its
 * trailing price ladder.
 *
 * Two shapes, because the source carries two:
 *
 * - **A comparison** (`/car-valeting`'s five packages) keeps all its columns.
 *   The feature name takes the full width on its own line and the verdicts sit
 *   in a row beneath it, aligned to a sticky header — the only way five
 *   columns fit across 330px without either truncating the names or handing
 *   the reader a second axis of scrolling. Comparing is the whole point of the
 *   table, and the tabbed version this replaced could not do it: seeing what
 *   Zeus adds over Pandora meant flipping between two screens 3,500px apart.
 *
 *   Nothing here folds shut. Every one of the 52 rows separates at least two
 *   of the five packages — not one is a row they all share — so there is no
 *   filler to hide behind a disclosure, and a comparison a reader has to
 *   unpack before it compares anything is one they scroll straight past. It
 *   costs about four screens. The source's own answer below 690px is to
 *   delete the section outright (`vc_hidden-xs`), which costs the reader all
 *   of it.
 * - **A checklist** (one value column — the five per-package tables further
 *   down the same page) stays a list, since there is nothing to line up.
 *
 * In both, a feature's explanation is a disclosure rather than inline prose:
 * fifty-six rows of it is what made the source table eighteen thousand pixels
 * tall.
 */
export default function TableCards({ model }: { model: TableModel }) {
  return model.valueCount > 1 ? (
    <Comparison model={model} />
  ) : (
    <Checklist model={model} />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Comparison — every package at once
   ───────────────────────────────────────────────────────────────────── */

type FeatureRow = Extract<TableRow, { kind: "feature" }>;

/**
 * The features under each of the source's own dividers.
 *
 * A table that opens on a feature rather than a divider gets a leading group
 * with no label, which renders unfolded — there is no heading to fold it
 * under, and inventing one is not on the table.
 */
function byGroup(rows: TableRow[]) {
  const groups: { label?: string; rows: FeatureRow[] }[] = [];
  for (const row of rows) {
    if (row.kind === "note") continue;
    if (row.kind === "group") {
      groups.push({ label: row.label, rows: [] });
      continue;
    }
    if (!groups.length) groups.push({ rows: [] });
    groups[groups.length - 1].rows.push(row);
  }
  return groups;
}

function Comparison({ model }: { model: TableModel }) {
  const names = model.headers[0] ?? [];
  const subs = model.headers[1] ?? [];
  const notes = model.rows.filter((r) => r.kind === "note");
  const groups = byGroup(model.rows);
  const grid = {
    gridTemplateColumns: `repeat(${model.valueCount}, minmax(0, 1fr))`,
  };

  const features = (rows: FeatureRow[]) => (
    <ul>
      {rows.map((row, i) => (
        <li key={i} className="border-t border-white/[0.07]">
          <Feature label={row.label} desc={row.desc} />
          <div className="grid bg-white/[0.02]" style={grid}>
            {row.values.map((value, j) => {
              const included = isTick(value);
              return (
                <span
                  key={j}
                  role="img"
                  aria-label={`${shortLabel(names[j] ?? "")}: ${
                    included ? "included" : "not included"
                  }`}
                  className="flex h-6 items-center justify-center border-l border-white/[0.07] first:border-l-0"
                >
                  <Icon
                    name={included ? "check" : "minus"}
                    size={15}
                    className={included ? "text-gold" : "text-white/20"}
                  />
                </span>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      {/*
        The header sticks below the site's own fixed bar, because a column of
        ticks means nothing once the name at the top of it has scrolled away.
        `top` is the scrolled header height; the surface around this is
        `overflow-clip`, not `hidden`, so the stick survives — see the note in
        `components/Blocks.tsx`.
      */}
      {names.length > 0 && (
        <div
          className="sticky top-[90px] z-20 grid border-b border-gold/35 bg-ink-panel"
          style={grid}
        >
          {names.map((full, i) => {
            /*
              Five of "Pandora – BRONZE Interior & Exterior" at 66px each
              wrapped the name alone to four lines, on top of a wrapped
              subtitle — a 105px-tall header a reader had to parse before
              reaching a single tick. `shortLabel` is the same trim
              `PackageTabs` puts on its own chips for the same reason; the
              panel this table sits beside prints the name verbatim, so
              nothing here is the only copy of it. `title` keeps the full
              name one hover away for a mouse.

              The tier color is the header's own version of that same fix:
              five identical gold labels read as one undifferentiated row
              until a reader stops to parse the text, which is what "make it
              bolder" actually meant here. The bar reuses the gold rule
              `Blocks.tsx` already draws above a section's lead heading — the
              same short, colored stroke, just full-width and per-column.
            */
            const accent = TIER_ACCENT[shortLabel(full)] ?? DEFAULT_ACCENT;
            return (
              <div
                key={full + i}
                title={full}
                className="relative border-l border-white/[0.07] px-1 pt-3.5 pb-2.5 text-center first:border-l-0"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accent} 22%, var(--color-ink-panel))`,
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ backgroundColor: accent }}
                />
                <p
                  className="font-[family-name:var(--font-sub)] text-[12px] leading-[14px] tracking-[0.01em] uppercase"
                  style={{ color: accent }}
                >
                  {shortLabel(full)}
                </p>
                {subs[i] && (
                  <p className="mt-1.5 font-[family-name:var(--font-ui)] text-[7.5px] leading-[10px] font-semibold tracking-[0.05em] text-white/45 uppercase">
                    {subs[i]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {groups.map((group, i) => (
        <div key={i}>
          {group.label && (
            <p className="border-t border-white/[0.07] bg-white/[0.04] px-3.5 py-2 font-[family-name:var(--font-sub)] text-[11.5px] tracking-[0.16em] text-gold/85 uppercase">
              {group.label}
            </p>
          )}
          {features(group.rows)}
        </div>
      ))}

      {/*
        The last row of the source table is each package's four-class price
        ladder in one cell — 270 characters of it, five times over. Seven
        hundred pixels of prose the packages further down this page already
        lay out properly, so it opens on demand.

        It sits in a footer of its own, muted and under a gold rule, because
        the first pass gave these the same gold row treatment as the feature
        groups and the card became seven identical bars that read as one kind
        of thing while meaning two.
      */}
      {notes.map((note, n) => {
        /*
          Every cell of the price row is a vehicle-class ladder plus a BOOK NOW
          button, run together into one string by the extractor. Read it back
          and the footer becomes what the source meant: pick your car once, see
          what all five packages cost it, and book the one you want.

          A cell that will not parse keeps its prose — an unreadable price is
          better than a guessed one.
        */
        const priced = note.values
          .map((value, j) => ({
            name: shortLabel(names[j] ?? ""),
            ladder: parseLadder(value),
            value,
          }))
          .filter((p) => p.value);

        const ladders = priced.filter((p) => p.ladder);

        return (
          <div key={n} className="border-t-2 border-gold/30 bg-white/[0.02]">
            {ladders.length === priced.length && ladders.length > 0 ? (
              <TablePrices
                packages={ladders.map((p) => ({
                  name: p.name,
                  ladder: p.ladder!,
                }))}
              />
            ) : (
              priced.map((p, j) => (
                <details
                  key={j}
                  className="border-t border-white/[0.06] first:border-t-0"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1 font-[family-name:var(--font-ui)] text-[10.5px] font-semibold tracking-[0.12em] text-white/45 uppercase">
                      {p.name}
                    </span>
                    <Mark />
                  </summary>
                  <p className="disclosure px-3.5 pb-3 text-[13px] leading-[20px] font-normal text-body/75">
                    {p.value}
                  </p>
                </details>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * A feature name, and its explanation behind a tap when it has one.
 *
 * The name owns a full-width line rather than a column of its own: they run to
 * 131 characters here, and squeezed beside five verdicts they would wrap to
 * eight lines each.
 */
function Feature({ label, desc }: { label: string; desc?: string }) {
  const name = (
    <span className="min-w-0 flex-1 text-[13px] leading-[17.5px] font-medium text-white">
      {label}
    </span>
  );

  // A feature with nothing to explain must not look like it opens.
  if (!desc) {
    return <p className="px-3.5 pt-2 pb-1">{name}</p>;
  }

  return (
    <details>
      <summary className="flex cursor-pointer list-none items-start gap-2 px-3.5 pt-2 pb-1 [&::-webkit-details-marker]:hidden">
        {name}
        <Mark size={12} />
      </summary>
      <p className="disclosure px-3.5 pb-2.5 text-[13px] leading-[20px] font-normal text-body/75">
        {desc}
      </p>
    </details>
  );
}

/**
 * The ± that says a row opens, and which state it is in.
 *
 * `size` because the comparison stacks fifty-two of these down one edge: at
 * the full 15px they stop reading as an affordance on each row and start
 * reading as a column of decoration.
 */
function Mark({ size = 15 }: { size?: number }) {
  return (
    <span className="disclosure-mark mt-px shrink-0 text-white/25">
      <span data-when="closed">
        <Icon name="plus" size={size} />
      </span>
      <span data-when="open">
        <Icon name="minus" size={size} />
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Checklist — one column, so nothing to line up
   ───────────────────────────────────────────────────────────────────── */

function Checklist({ model }: { model: TableModel }) {
  const title = model.headers[0]?.[0];
  const subtitle = model.headers[1]?.[0];
  const notes = model.rows.filter((r) => r.kind === "note");

  return (
    <div>
      {title && (
        <div className="px-3.5 pt-4 pb-3">
          <p className="font-[family-name:var(--font-sub)] text-[17px] leading-tight tracking-[0.02em] text-gold uppercase">
            {title}
          </p>
          {subtitle && (
            <p className="mt-1 font-[family-name:var(--font-ui)] text-[11.5px] tracking-[0.14em] text-white/55 uppercase">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <ul>
        {model.rows.map((row, i) => {
          if (row.kind === "note") return null;

          if (row.kind === "group") {
            return (
              <li
                key={i}
                className="border-t border-white/[0.07] bg-white/[0.04] px-3.5 py-1.5 font-[family-name:var(--font-sub)] text-[11.5px] tracking-[0.16em] text-gold/85 uppercase first:border-t-0"
              >
                {row.label}
              </li>
            );
          }

          const included = isTick(row.values[0] ?? "");

          return (
            <li key={i} className="border-t border-white/[0.07]">
              <Row label={row.label} included={included} />
            </li>
          );
        })}
      </ul>

      {notes.map((note, i) => (
        <p
          key={i}
          className="border-t-2 border-gold/30 bg-white/[0.02] px-3.5 py-3 text-[13px] leading-[20px] font-normal text-white/55"
        >
          {note.values[0]}
        </p>
      ))}
    </div>
  );
}

/**
 * One feature of a single package. Name, verdict, nothing to open.
 *
 * The comparison above puts each feature's explanation behind a `+`, and there
 * that is worth it: it is the one place on the page a reader is weighing the
 * packages against each other, so the jargon has to be answerable. Repeating
 * it here meant 46 disclosures per panel, five panels deep, on rows that are
 * mostly the same rows — a column of affordances nobody was going to spend a
 * tap on, and the reason the panel read as an accordion rather than a list.
 *
 * Nothing is lost by dropping them. The source treats these as hover tooltips
 * in a 40px column (`help-tip`), so they are secondary by its own design; 182
 * of the 184 instances are verbatim repeats of the comparison's; and the real
 * `<table>` this stands in for is `display: none` on a phone rather than
 * absent, so every description is still in the page — the same both-in-the-DOM
 * arrangement PROJECT.md §5 describes.
 */
function Row({ label, included }: { label: string; included: boolean }) {
  return (
    <p className="flex items-start gap-2.5 px-3.5 py-2.5">
      <span className="mt-px shrink-0" aria-hidden>
        <Icon
          name={included ? "check" : "minus"}
          size={15}
          className={included ? "text-gold" : "text-white/20"}
        />
      </span>
      <span
        className={`min-w-0 flex-1 text-[13px] leading-[17.5px] ${
          included ? "font-medium text-white" : "font-normal text-white/45"
        }`}
      >
        {label}
      </span>
      <span className="sr-only">{included ? "Included" : "Not included"}</span>
    </p>
  );
}
