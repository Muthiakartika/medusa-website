/**
 * Classifies the extracted content into semantic sections.
 *
 * `pages.json` stores what WordPress rendered — rows, columns, spans, block
 * types. That is presentation, not meaning: a renderer reading it knows a row
 * is "two columns, 6 and 6", but not that the left one holds four symptoms and
 * the right one a photograph. So every page can only ever be stacked, never
 * laid out.
 *
 * This pass reads the same blocks and answers the other question — what is
 * this run of content *for* — and writes `pages.v2.json` with one entry per
 * semantic section. Nothing renders from it yet; this is the audit that says
 * how much of the site can migrate automatically and what needs a human.
 *
 *   node scripts/classify.mjs                     report
 *   node scripts/classify.mjs --write             also emit src/content/pages.v2.json
 *   node scripts/classify.mjs --page <slug>       dump one page's sections
 *   node scripts/classify.mjs --kind unknown      list every section of one kind
 *   node scripts/classify.mjs --loss <slug>       words that no section carried through
 *
 * It works by pattern, not by heading level. The source uses h2 for section
 * headings on the service pages and h3 on the 127 location pages, and the same
 * "four benefits" idea arrives three different ways — as a <ul> of
 * `<b>Title:</b> body`, as repeated `h3 + paragraph` pairs, and as a columns
 * block of numbered cards. Detecting the repetition catches all three; keying
 * off the heading level catches one.
 *
 * The price/add-on/link-chip heuristics are ports of the ones in
 * `src/components/blocks-groups.tsx`, duplicated so this runs without the TS
 * toolchain. When the renderer reads `kind` instead of guessing, those go away.
 */

import fs from 'node:fs';
import path from 'node:path';
import { CONTENT, PAGES_JSON } from './paths.mjs';

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const ONE = argv.includes('--page') ? argv[argv.indexOf('--page') + 1] : null;
const KIND = argv.includes('--kind') ? argv[argv.indexOf('--kind') + 1] : null;
const LOSS = argv.includes('--loss') ? argv[argv.indexOf('--loss') + 1] : null;
const OUT = path.join(CONTENT, 'pages.v2.json');

const pages = JSON.parse(fs.readFileSync(PAGES_JSON, 'utf8'));

/* ── text ─────────────────────────────────────────────────────────────────
   The extractor kept the theme's tick-mark <path> fragments inside list items.
   They are markup accidents, not content. */

const stripSvg = (s) =>
  String(s ?? '')
    .replace(/<path\b[^>]*>\s*<\/path>/gi, '')
    .replace(/<path\b[^>]*\/?>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '');

const decode = (s) =>
  String(s ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

const plain = (s) => decode(stripSvg(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Inline HTML worth keeping — links and emphasis — with the junk removed. */
const inline = (s) =>
  decode(stripSvg(s).replace(/<(?!\/?(a|strong|b|em|i|br)\b)[^>]*>/gi, ''))
    .replace(/\s+/g, ' ')
    .trim();

const words = (s) => (plain(s).match(/\S+/g) || []).length;

/* ── block predicates ─────────────────────────────────────────────────── */

const isHeading = (b) => b?.type === 'heading';
const isPrice = (b) => b?.type === 'heading' && /^\s*(£|from\s*£)\s*[\d,]/i.test(b.text);
const isIcon = (b) => b?.type === 'image' && Boolean(b.icon);
const isPhoto = (b) => b?.type === 'image' && !b.icon;
const isPara = (b) => b?.type === 'paragraph';
const isMap = (b) => b?.type === 'embed' && /google\.[a-z.]+\/maps|maps\.google/i.test(b.src);
/** The bare "01" / "02." markers the numbered card rows use as their step number. */
const isStepNumber = (b) => isPara(b) && /^\s*0?\d{1,2}\s*[.)]?\s*$/.test(plain(b.html));
const textOf = (b) => (b?.type === 'heading' ? b.text : b?.type === 'paragraph' ? b.html : '');

/** A paragraph that is nothing but links and punctuation — a coverage list. */
function linkChips(html) {
  const links = [...String(html).matchAll(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi)];
  if (links.length < 4) return null;
  const between = String(html)
    .replace(/<a[^>]*>.*?<\/a>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '');
  if (/[^\s,;&·|/–—-]|&(?!amp;|nbsp;)/i.test(between.replace(/&amp;|&nbsp;/gi, ' '))) return null;
  return links.map((m) => ({ href: m[1], label: plain(m[2]) }));
}

/* ── list item shapes ─────────────────────────────────────────────────────
     "<b>Title:</b><br> body"        the symptom / benefit lists
     "<strong>Title:</strong> body"  the process steps
     "Enhanced Safety: body"         the same thing with no markup at all
     "Plain sentence."               the what's-included checklists          */

function titleBody(itemHtml) {
  const s = stripSvg(itemHtml).trim();

  const tagged = s.match(/^\s*<(b|strong)>([\s\S]*?)<\/\1>\s*(?:<br\s*\/?>)?\s*([\s\S]*)$/i);
  if (tagged) {
    const title = plain(tagged[2]).replace(/\s*[:–—-]\s*$/, '');
    const body = inline(tagged[3]);
    if (title && plain(body)) return { title, body };
  }

  const flat = plain(s);
  const colon = flat.match(/^([^:]{3,64}):\s+(\S[\s\S]{12,})$/);
  if (colon && !/^https?/i.test(colon[1])) return { title: colon[1].trim(), body: colon[2].trim() };

  return { title: null, body: inline(s) };
}

/* ── heading vocabulary ───────────────────────────────────────────────────
   Taken from the h2/h3 histogram across all 254 pages, not invented. */

const RE = {
  process: /\b(process|how (it|our|we|the)|step[s]?\b|stages?\b|what happens|our method|services work)/i,
  faq: /\b(faq|faqs|frequently asked|common questions)\b/i,
  areas: /\b(areas?|near you|our location|locations?|we cover|coverage|postcodes?|serving)\b/i,
  cta: /\b(book|get in touch|contact us|call us|enquir|request a quote|schedule)\b/i,
  gallery: /\b(portfolio|gallery|our work|before (and|&) after)\b/i,
};

/* ── flattening ───────────────────────────────────────────────────────────
   Both levels of the source's structure are layout, not meaning:

   A `columns` block is a row's internal split. An image-only column is that
   row's illustration, so it comes out as a `_media` marker; every other cell
   is spliced into the stream, so a pattern the source spread across three
   cells still reads as one repetition.

   A `section` is just a WordPress row. The blog posts put each heading and its
   paragraph in *separate* rows — segmenting row by row left 993 headings with
   no body under them. So the whole page flattens into one stream and the row
   boundaries are dropped along with the column ones. */

/**
 * A paragraph that is nothing but bold text is a heading the author never
 * marked up as one. The older blog posts are written entirely this way — one
 * of them carries ninety paragraphs and not a single <h2> — so without this
 * they arrive as one undifferentiated run.
 */
function asHeading(b) {
  if (!isPara(b)) return null;
  const m = inline(b.html).match(/^<(strong|b)>([^<]{2,90})<\/\1>\s*(?:<br\s*\/?>)?$/i);
  if (!m) return null;
  const text = plain(m[2]).replace(/\s*[:–—-]\s*$/, '');
  return text && words(text) <= 14 ? { type: 'heading', level: 3, text } : null;
}

function flattenBlocks(blocks) {
  const flat = [];

  for (const b of blocks) {
    if (b.type !== 'columns') {
      flat.push(asHeading(b) ?? b);
      continue;
    }

    const cards = addonColumns(b);
    if (cards) {
      flat.push({ type: '_addons', cards });
      continue;
    }

    b.cols.forEach((col, ci) => {
      const photos = col.filter(isPhoto);
      if (photos.length && photos.length === col.length) {
        flat.push({
          type: '_media',
          items: photos.map((p) => ({ src: p.src, alt: plain(p.alt), w: p.w, h: p.h, side: ci === 0 ? 'left' : 'right' })),
        });
        return;
      }
      flat.push(...flattenBlocks(col));
    });
  }

  return flat;
}

const flattenPage = (page) => page.sections.flatMap((s) => flattenBlocks(s.blocks));

/* ── repeating shapes ─────────────────────────────────────────────────────
   Each returns `{ …payload, end }` or null. `end` is the index after the run,
   so the walker can skip what was consumed. */

/** `icon → h3 → (note) → £heading`, ×n. The vehicle-class price table. */
function priceRun(f, i) {
  const items = [];
  let j = i;
  for (;;) {
    const icon = f[j];
    const label = f[j + 1];
    if (!isIcon(icon) || !isHeading(label) || label.level !== 3) break;
    const note = f[j + 2];
    const hasNote = isPara(note) && !isPrice(note);
    const price = f[j + (hasNote ? 3 : 2)];
    if (!isPrice(price)) break;
    items.push({
      icon: icon.src,
      label: plain(label.text),
      note: hasNote ? plain(textOf(note)) : undefined,
      price: plain(textOf(price)),
    });
    j += hasNote ? 4 : 3;
  }
  return items.length >= 2 ? { items, end: j } : null;
}

/** `£heading → icon → title → paragraphs`, ×n. The add-on strip, loose. */
function addonRun(f, i) {
  const cards = [];
  let j = i;
  while (isPrice(f[j]) && isIcon(f[j + 1]) && isHeading(f[j + 2])) {
    let end = j + 3;
    while (isPara(f[end])) end++;
    cards.push({
      price: plain(textOf(f[j])),
      icon: f[j + 1].src,
      title: plain(f[j + 2].text),
      body: f.slice(j + 3, end).map((b) => inline(textOf(b))).filter(Boolean).join(' '),
    });
    j = end;
  }
  return cards.length ? { cards, end: j } : null;
}

/**
 * The same shape already packed into a columns block.
 *
 * A cell often carries four prices, not one — the small/medium/large/XL ladder
 * for that package, each with its own vehicle-class label. Taking `find` gave
 * one price per card and quietly dropped the other three, which was most of
 * the words missing from the twenty location-index pages.
 */
function addonColumns(block) {
  const cards = block.cols.map((col) => {
    const icon = col.find(isIcon);
    const title = col.find((b) => isHeading(b) && !isPrice(b));

    const tiers = [];
    for (let i = 0; i < col.length; i++) {
      if (!isPrice(col[i])) continue;
      // The class label and its example cars sit just above the figure.
      const label = col.slice(0, i).reverse().find((b) => isHeading(b) && !isPrice(b) && b.level === 3);
      const note = col[i - 1];
      tiers.push({
        label: label ? plain(label.text) : undefined,
        note: isPara(note) ? plain(note.html) : undefined,
        price: plain(textOf(col[i])),
      });
    }

    return {
      price: tiers[0]?.price ?? '',
      tiers: tiers.length > 1 ? tiers : undefined,
      icon: icon?.src,
      title: title ? plain(title.text) : '',
      body: col.filter(isPara).map((b) => inline(b.html)).filter(Boolean).join(' '),
    };
  });
  const solid = cards.filter((c) => c.price && c.title).length;
  if (solid < 2 || solid < block.cols.length - 1) return null;
  return cards;
}

/** `paragraph("01") → heading → paragraph+`, ×n. The numbered card rows. */
function numberedRun(f, i) {
  const steps = [];
  let j = i;
  while (isStepNumber(f[j]) && isHeading(f[j + 1])) {
    let end = j + 2;
    while (isPara(f[end]) && !isStepNumber(f[end])) end++;
    steps.push({
      n: steps.length + 1,
      title: plain(f[j + 1].text),
      body: f.slice(j + 2, end).map((b) => inline(b.html)).filter(Boolean).join(' '),
    });
    j = end;
  }
  return steps.length >= 2 ? { steps, end: j } : null;
}

/** `heading("Step 1") → heading(text)`, ×n. The booking walkthrough. */
function stepHeadingRun(f, i) {
  const steps = [];
  let j = i;
  while (isHeading(f[j]) && /^\s*step\s*\d+\s*$/i.test(plain(f[j].text)) && isHeading(f[j + 1])) {
    let end = j + 2;
    while (isPara(f[end])) end++;
    steps.push({
      n: steps.length + 1,
      title: plain(f[j + 1].text),
      body: f.slice(j + 2, end).map((b) => inline(b.html)).filter(Boolean).join(' '),
    });
    j = end;
  }
  return steps.length >= 2 ? { steps, end: j } : null;
}

/** `heading(L) → paragraph+`, ×n at one level. Benefits written as sub-heads. */
function pairRun(f, i) {
  if (!isHeading(f[i]) || isPrice(f[i])) return null;
  const level = f[i].level;
  const items = [];
  let j = i;

  while (isHeading(f[j]) && f[j].level === level && !isPrice(f[j])) {
    let end = j + 1;
    while (isPara(f[end])) end++;
    if (end === j + 1) break; // a heading with no body is not an item
    items.push({
      title: plain(f[j].text),
      body: f.slice(j + 1, end).map((b) => inline(b.html)).filter(Boolean).join(' '),
    });
    j = end;
  }

  return items.length >= 2 ? { items, end: j } : null;
}

/* ── the walker ───────────────────────────────────────────────────────────
   Ordered, first match wins. Structure outranks wording: a run holding a real
   price table is a price table whatever its heading says. */

/** Everything after `i` until the next heading or structural block. */
function body(f, i) {
  let end = i;
  while (f[end] && (isPara(f[end]) || f[end].type === 'button' || isPhoto(f[end]) || f[end].type === 'list')) end++;
  return end;
}

function segment(flat, ctx) {
  const out = [];
  let i = 0;
  /* Illustrations attach to the section they sit beside. A marker before the
     next heading belongs to what follows; anything else to what came before. */
  let pending = [];
  /** Takes one section or several — `fromBody` may split a mixed run. */
  const emit = (s) => {
    for (const one of Array.isArray(s) ? s : [s]) {
      if (pending.length && !one.image && !one.images) {
        one.media = pending;
        // Prose with a photograph beside it is a section type, not a fallback.
        if (one.kind === 'prose') one.kind = 'mediaSplit';
        pending = [];
      }
      out.push(one);
    }
  };

  // The page opening: the h1, the price that trails it, the lead h2 and the
  // intro, all of which the source scattered across four sibling blocks.
  if (isHeading(flat[0]) && flat[0].level === 1) {
    const hero = { kind: 'hero', h1: plain(flat[0].text), intro: [] };
    i = 1;
    while (i < flat.length) {
      const b = flat[i];
      if (isPrice(b)) { hero.price = plain(b.text); i++; continue; }
      if (isHeading(b) && !hero.lead && b.level >= 2) { hero.lead = plain(b.text); i++; continue; }
      if (isPara(b)) { hero.intro.push(inline(b.html)); i++; continue; }
      // A short flat list straight after the intro is the hero's tick row.
      if (b.type === 'list' && hero.intro.length) {
        const items = b.items.map(titleBody);
        if (items.every((it) => !it.title && words(it.body) <= 14)) {
          hero.ticks = items.map((it) => it.body);
          i++;
          continue;
        }
      }
      break;
    }
    if (isPhoto(flat[i])) { hero.image = flat[i].src; i++; }
    emit(hero);
  }

  while (i < flat.length) {
    const b = flat[i];

    /* An illustration waits for whichever section it turns out to belong to. */
    if (b.type === '_media') { pending.push(...b.items); i++; continue; }

    /* Structural runs, recognised wherever they start. Both open on an icon,
       so they have to be tried before the icon-dropping rule below. */
    const price = priceRun(flat, i);
    if (price) { emit({ kind: 'priceTable', items: price.items }); i = price.end; continue; }

    const addons = addonRun(flat, i);
    if (addons) { emit({ kind: 'addons', cards: addons.cards }); i = addons.end; continue; }

    /* Decorative theme icons that no price or add-on run claimed. They are
       chrome, not content, and rendering them as images is what turned the
       source's icon rows into stacks of billboards. */
    if (isIcon(b)) { ctx.dropped.icons++; i++; continue; }

    if (b.type === '_addons') { emit({ kind: 'addons', cards: b.cards }); i++; continue; }

    const numbered = numberedRun(flat, i);
    if (numbered) { emit({ kind: 'steps', steps: numbered.steps }); i = numbered.end; continue; }

    const stepHeads = stepHeadingRun(flat, i);
    if (stepHeads) { emit({ kind: 'steps', steps: stepHeads.steps }); i = stepHeads.end; continue; }

    if (b.type === 'faq') { emit({ kind: 'faq', items: b.items }); i++; continue; }
    if (b.type === 'form') { emit({ kind: 'form', formId: b.id, submitLabel: b.submitLabel, fields: b.fields }); i++; continue; }
    if (b.type === 'video') { emit({ kind: 'video', src: b.src, poster: b.poster }); i++; continue; }
    if (b.type === 'table') { emit({ kind: 'table', rows: b.rows }); i++; continue; }
    if (isMap(b)) { emit({ kind: 'areas', body: [], chips: [], map: b.src }); i++; continue; }
    if (b.type === 'embed') { emit({ kind: 'embed', src: b.src, title: b.title }); i++; continue; }

    /* A heading opens a section. Everything up to the next heading is its body,
       unless the heading is the lead-in to one of the repeating shapes. */
    if (isHeading(b) && !isPrice(b)) {
      const heading = plain(b.text);

      const pairs = pairRun(flat, i + 1);
      if (pairs) { emit({ kind: 'featureGrid', heading, items: pairs.items }); i = pairs.end; continue; }

      const nested = numberedRun(flat, i + 1);
      if (nested) { emit({ kind: 'steps', heading, steps: nested.steps }); i = nested.end; continue; }

      const nestedSteps = stepHeadingRun(flat, i + 1);
      if (nestedSteps) { emit({ kind: 'steps', heading, steps: nestedSteps.steps }); i = nestedSteps.end; continue; }

      // "Prices start from" / "OUR PRICING" with the figure as its own heading.
      if (isPrice(flat[i + 1])) {
        const prices = [];
        let j = i + 1;
        while (isPrice(flat[j])) { prices.push(plain(flat[j].text)); j++; }
        const end = body(flat, j);
        emit({ kind: 'price', heading, prices, body: flat.slice(j, end).filter(isPara).map((p) => inline(p.html)) });
        i = end;
        continue;
      }

      const nestedPrice = priceRun(flat, i + 1);
      if (nestedPrice) { emit({ kind: 'priceTable', heading, items: nestedPrice.items }); i = nestedPrice.end; continue; }

      const nestedAddons = addonRun(flat, i + 1);
      if (nestedAddons) { emit({ kind: 'addons', heading, cards: nestedAddons.cards }); i = nestedAddons.end; continue; }

      const end = body(flat, i + 1);
      emit(fromBody(heading, flat.slice(i + 1, end)));
      i = end === i + 1 ? i + 1 : end;
      continue;
    }

    /* Content with no heading of its own. */
    const end = body(flat, i);
    if (end > i) { emit(fromBody(null, flat.slice(i, end))); i = end; continue; }

    emit({ kind: 'unknown', reason: `stray ${b.type}`, blockType: b.type });
    i++;
  }

  // An illustration that trailed the last section still belongs to it.
  if (pending.length && out.length) {
    const last = out[out.length - 1];
    last.media = [...(last.media ?? []), ...pending];
  }

  return adopt(out);
}

/**
 * The source styles a section's title as its own row, so a heading and the
 * thing it names arrive as siblings: "Our Location" then the map, "VALETING
 * PACKAGES" then the cards. A heading with nothing under it, sitting directly
 * above a section with no heading of its own, is that section's title.
 */
function adopt(sections) {
  const isOrphan = (s) => s?.kind === 'unknown' && s.reason === 'bare heading';
  const out = [];

  for (let i = 0; i < sections.length; i++) {
    if (!isOrphan(sections[i])) {
      out.push(sections[i]);
      continue;
    }

    // The source's service menus are built entirely out of headings — five or
    // six in a row with no body anywhere. Collapse the run so one markup habit
    // does not read as six separate failures.
    let j = i;
    while (isOrphan(sections[j])) j++;
    const run = sections.slice(i, j).map((s) => s.heading);
    const next = sections[j];

    if (next && !next.heading) {
      next.heading = run.pop();
      if (run.length) out.push(headingRun(run));
      out.push(next);
      i = j;
      continue;
    }

    out.push(headingRun(run));
    i = j - 1;
  }

  return out;
}

/* What is left is a heading the source really did leave empty — on the blog
   posts the answer paragraph never made it through extraction, and on the
   location index the whole menu is heading markup. Named so the report can
   separate a classifier gap from a content gap. */
const headingRun = (headings) =>
  headings.length === 1
    ? { kind: 'unknown', reason: 'heading with no body in source', heading: headings[0] }
    : { kind: 'unknown', reason: 'heading-only run in source', heading: headings[0], headings };

/**
 * Classifies a heading plus the loose blocks under it. Returns an array: a run
 * that mixes prose and a list is two sections, not one. Collapsing it into one
 * is how the first cut silently dropped 88 paragraphs off a single blog post —
 * it classified by the list and threw the rest away.
 */
function fromBody(heading, blocks) {
  const h = heading || '';
  const paras = blocks.filter(isPara);
  const lists = blocks.filter((b) => b.type === 'list');
  const photos = blocks.filter(isPhoto);
  const btns = blocks.filter((b) => b.type === 'button');

  if (!blocks.length) {
    // A heading on its own. Real on this site: "Portfolio", and the standalone
    // booking lines that the source styled as a band with nothing under it.
    if (RE.gallery.test(h)) return { kind: 'gallery', heading, images: [] };
    if (RE.cta.test(h)) return { kind: 'cta', heading, body: [], buttons: [] };
    return { kind: 'unknown', reason: 'bare heading', heading };
  }

  /* Coverage: a paragraph that is only links, or an areas heading. */
  const chipPara = paras.find((p) => linkChips(p.html));
  if (chipPara || RE.areas.test(h)) {
    return {
      kind: 'areas',
      heading,
      body: paras.filter((p) => p !== chipPara).map((p) => inline(p.html)),
      chips: chipPara ? linkChips(chipPara.html) : [],
    };
  }

  /* The blog posts write their FAQs as prose rather than as an accordion:
     one paragraph per entry, `<strong>Question?</strong><br>Answer`. Nothing
     was lost extracting those — they just need recognising. */
  const qa = paras.map((p) => {
    const m = inline(p.html).match(/^<(?:strong|b)>\s*([\s\S]{5,200}\?)\s*<\/(?:strong|b)>\s*(?:<br\s*\/?>)?\s*(\S[\s\S]*)$/i);
    return m ? { q: plain(m[1]), a: [inline(m[2])] } : null;
  });
  const asked = qa.filter(Boolean);
  if (asked.length >= 2 && (RE.faq.test(h) || asked.length >= 3) && asked.length >= paras.length - 1) {
    const rest = paras.filter((_, i) => !qa[i]).map((p) => inline(p.html));
    const out = [{ kind: 'faq', heading, items: asked }];
    if (rest.length) out.push({ kind: 'prose', body: rest });
    return out;
  }

  /* An FAQ heading with bare paragraphs under it and no question in sight —
     the source used an accordion whose titles the extractor dropped. Flagged
     rather than silently rendered as prose, because it is a content bug, not
     a layout one. */
  if (RE.faq.test(h) && paras.length >= 3 && !lists.length) {
    return { kind: 'faqAnswers', heading, answers: paras.map((p) => inline(p.html)) };
  }

  /* The upgrade lists on the detailing pages: one paragraph per extra, written
     as `<strong>Name</strong><br><em>£100</em>`. Priced options, not prose. */
  const pricedPairs = paras.map((p) => {
    const m = inline(p.html).match(/^<(?:strong|b)>([\s\S]{2,90}?)<\/(?:strong|b)>\s*(?:<br\s*\/?>)?\s*<?(?:em|i)?>?\s*(£\s?[\d,]+[^<]*)/i);
    return m ? { title: plain(m[1]).replace(/\s*[:–—-]\s*$/, ''), price: plain(m[2]) } : null;
  });
  const priced = pricedPairs.filter(Boolean);
  if (priced.length >= 2 && priced.length >= paras.length - 1) {
    // Whatever prose sat among the priced lines stays — it is usually the
    // "you can also add…" line that explains them.
    const rest = paras.filter((_, i) => !pricedPairs[i]).map((p) => inline(p.html));
    const out = [{ kind: 'addons', heading, cards: priced }];
    if (rest.length) out.push({ kind: 'prose', body: rest });
    return out;
  }

  if (lists.length) {
    const items = lists.flatMap((l) => l.items.map(titleBody));
    const titled = items.filter((it) => it.title).length;
    const ordered = lists.some((l) => l.ordered);

    /* Prose either side of the list stays prose. Only a single paragraph
       immediately above the list is absorbed as its lede. */
    const firstList = blocks.findIndex((b) => b.type === 'list');
    const lastList = blocks.findLastIndex((b) => b.type === 'list');
    const before = blocks.slice(0, firstList).filter(isPara);
    const after = blocks.slice(lastList + 1).filter(isPara);
    const ownLede = before.length === 1 ? inline(before[0].html) : undefined;

    let listed = null;
    if (items.length >= 2 && (ordered || RE.process.test(h)) && titled >= items.length * 0.6) {
      listed = { kind: 'steps', heading, lede: ownLede, steps: items.map((it, n) => ({ n: n + 1, ...it })) };
    } else if (items.length >= 2 && titled >= items.length * 0.6) {
      listed = { kind: 'featureGrid', heading, lede: ownLede, items };
    } else if (items.length >= 2) {
      listed = { kind: 'checklist', heading, lede: ownLede, items: items.map((it) => it.body) };
    } else if (items.length === 1) {
      // A "list" of one is a paragraph the source happened to bullet.
      listed = { kind: 'prose', heading, body: items.map((it) => it.body) };
    }

    if (listed) {
      const out = [];
      if (before.length > 1) {
        // The heading belongs to the prose that opens the run, not to the list.
        out.push({ kind: 'prose', heading, body: before.map((p) => inline(p.html)) });
        delete listed.heading;
      }
      out.push(listed);
      if (after.length) out.push({ kind: 'prose', body: after.map((p) => inline(p.html)) });
      return out;
    }
  }

  if (RE.cta.test(h) && (btns.length || (paras.length <= 3 && words(paras.map((p) => p.html).join(' ')) < 140))) {
    return { kind: 'cta', heading, body: paras.map((p) => inline(p.html)), buttons: btns.map((b) => ({ label: plain(b.label), href: b.href })) };
  }

  if (photos.length >= 2 && !paras.length) {
    return { kind: 'gallery', heading, images: photos.map((p) => ({ src: p.src, alt: plain(p.alt) })) };
  }

  if (paras.length) {
    const out = { kind: 'prose', heading, body: paras.map((p) => inline(p.html)) };
    if (photos.length) out.images = photos.map((p) => ({ src: p.src, alt: plain(p.alt) }));
    if (btns.length) out.buttons = btns.map((b) => ({ label: plain(b.label), href: b.href }));
    // Text with a picture beside it is a real section type, not a fallback.
    if (photos.length) out.kind = 'mediaSplit';
    return out;
  }

  if (photos.length) return { kind: 'gallery', heading, images: photos.map((p) => ({ src: p.src, alt: plain(p.alt) })) };
  if (btns.length) return { kind: 'cta', heading, body: [], buttons: btns.map((b) => ({ label: plain(b.label), href: b.href })) };

  return { kind: 'unknown', reason: 'no renderable body', heading };
}

/* ── content-loss check ───────────────────────────────────────────────────
   A classifier that silently drops copy is worse than no classifier, and
   comparing serialised JSON does not measure that — the source strings carry
   the SVG path data the extractor left behind, so stripping junk reads as
   loss. This compares human words only, as a multiset, and reports what went
   in but did not come out. */

function sourceWords(blocks, bag) {
  for (const b of blocks) {
    if (b.type === 'columns') { b.cols.forEach((c) => sourceWords(c, bag)); continue; }
    if (b.type === 'heading') addWords(b.text, bag);
    else if (b.type === 'paragraph') addWords(b.html, bag);
    else if (b.type === 'list') b.items.forEach((it) => addWords(it, bag));
    else if (b.type === 'button') addWords(b.label, bag);
    else if (b.type === 'faq') b.items.forEach((it) => { addWords(it.q, bag); (it.a ?? []).forEach((a) => addWords(a, bag)); });
    else if (b.type === 'table') (b.rows ?? []).forEach((r) => r.forEach((c) => addWords(c, bag)));
  }
}

/** Every string in the output except the ones that are references, not copy. */
const NOT_COPY = new Set(['src', 'href', 'icon', 'map', 'kind', 'reason', 'formId', 'poster', 'side']);
function outputWords(node, bag, key) {
  if (typeof node === 'string') { if (!NOT_COPY.has(key)) addWords(node, bag); return; }
  if (Array.isArray(node)) { node.forEach((n) => outputWords(n, bag, key)); return; }
  if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) outputWords(v, bag, k);
}

function addWords(s, bag) {
  for (const w of plain(s).toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []) {
    bag.set(w, (bag.get(w) ?? 0) + 1);
  }
}

/* ── archetypes ───────────────────────────────────────────────────────── */

function archetype(slug, sections) {
  if (/^20\d\d\//.test(slug)) return 'post';
  if (slug.startsWith('our-locations')) return 'locationIndex';
  if (/^mobile-car-(valeting|wash|detailing)-in-/.test(slug)) return 'location';
  if (/^(privacy|terms|cancellation)/.test(slug)) return 'legal';
  const kinds = new Set(sections.map((s) => s.kind));
  if (kinds.has('form') && sections.length <= 4) return 'contact';
  // A page that quotes a price per vehicle class is selling one package,
  // whether the ladder arrived as a price table or as tiered cards.
  const tiered = sections.some((s) => s.kind === 'addons' && s.cards?.some((c) => c.tiers));
  if (kinds.has('priceTable') || tiered || sections[0]?.price) return 'package';
  return 'service';
}

/* ── run ──────────────────────────────────────────────────────────────── */

/** Kinds a purpose-built component can lay out. Everything else is fallback. */
const STRUCTURED = new Set([
  'hero', 'featureGrid', 'steps', 'priceTable', 'addons', 'checklist',
  'faq', 'areas', 'cta', 'gallery', 'mediaSplit', 'form', 'video', 'table', 'embed', 'price',
]);
const tier = (k) => (STRUCTURED.has(k) ? 'structured' : k === 'prose' ? 'prose' : 'unknown');

const v2 = {};
const stats = { kinds: {}, tiers: { structured: 0, prose: 0, unknown: 0 }, byArchetype: {}, reasons: {}, total: 0 };
const dropped = { icons: 0 };
const review = [];
const srcBag = new Map();
const outBag = new Map();
const lossy = [];

for (const [slug, page] of Object.entries(pages)) {
  const sections = segment(flattenPage(page), { slug, dropped });
  const kind = archetype(slug, sections);
  v2[slug] = {
    slug,
    archetype: kind,
    title: page.title,
    description: page.description,
    ogImage: page.ogImage,
    modified: page.modified,
    published: page.published,
    breadcrumb: page.breadcrumb,
    article: page.article,
    h1: page.h1,
    post: page.post,
    sections,
  };

  const pageSrc = new Map();
  const pageOut = new Map();
  page.sections.forEach((s) => sourceWords(s.blocks, pageSrc));
  outputWords(sections, pageOut);
  let missing = 0;
  for (const [w, n] of pageSrc) {
    srcBag.set(w, (srcBag.get(w) ?? 0) + n);
    const gap = n - (pageOut.get(w) ?? 0);
    if (gap > 0) missing += gap;
  }
  for (const [w, n] of pageOut) outBag.set(w, (outBag.get(w) ?? 0) + n);
  const pageTotal = [...pageSrc.values()].reduce((a, b) => a + b, 0);
  if (missing) {
    const gone = [...pageSrc].filter(([w, n]) => n > (pageOut.get(w) ?? 0)).map(([w]) => w);
    lossy.push({ slug, missing, total: pageTotal, gone });
  }

  const a = (stats.byArchetype[kind] ??= { pages: 0, sections: 0, structured: 0, clean: 0 });
  a.pages++;
  a.sections += sections.length;
  let weak = 0;
  let open = 0;
  for (const s of sections) {
    stats.total++;
    stats.kinds[s.kind] = (stats.kinds[s.kind] || 0) + 1;
    const t = tier(s.kind);
    stats.tiers[t]++;
    if (t === 'structured') a.structured++;
    else weak++;
    if (t === 'unknown') open++;
    if (s.kind === 'unknown') stats.reasons[s.reason] = (stats.reasons[s.reason] || 0) + 1;
  }
  if (!weak) a.clean++;
  /* Only `unknown` is real work. Prose is the right answer for an article, so
     ranking the queue by fallbacks would put every blog post at the top and
     bury the pages that actually need a decision. */
  if (open) review.push({ slug, kind, open, total: sections.length });
}

if (WRITE) fs.writeFileSync(OUT, JSON.stringify(v2, null, 1));

/* ── report ───────────────────────────────────────────────────────────── */

const line = (t) => console.log('\n' + t + '\n' + '-'.repeat(t.length));
const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—');

if (ONE) {
  const p = v2[ONE];
  if (!p) { console.error(`no page "${ONE}"`); process.exit(1); }
  line(`${ONE} · archetype: ${p.archetype} · ${p.sections.length} sections`);
  p.sections.forEach((s, i) => {
    const label = s.heading ?? s.h1 ?? '';
    const n = s.items?.length ?? s.steps?.length ?? s.cards?.length ?? s.chips?.length ?? s.answers?.length ?? '';
    console.log(`${String(i).padStart(2)}  ${s.kind.padEnd(12)} ${String(n).padStart(3)}  ${label.slice(0, 60)}${s.reason ? `   (${s.reason})` : ''}`);
  });
  process.exit(0);
}

if (LOSS) {
  const p = lossy.find((x) => x.slug === LOSS);
  line(`words in ${LOSS} that no section carried through`);
  if (!p) console.log('  none — every word survived');
  else {
    console.log(`  ${p.missing} of ${p.total}\n`);
    console.log('  ' + p.gone.join(' '));
  }
  process.exit(0);
}

if (KIND) {
  line(`sections of kind "${KIND}"`);
  let n = 0;
  for (const p of Object.values(v2)) {
    for (const s of p.sections) {
      if (s.kind !== KIND) continue;
      if (n++ < 60) console.log(`  ${p.slug.slice(0, 46).padEnd(48)} ${(s.reason ?? '').padEnd(22)} ${(s.heading ?? '').slice(0, 46)}`);
    }
  }
  console.log(`\n  ${n} total`);
  process.exit(0);
}

console.log(`\nclassified ${Object.keys(v2).length} pages into ${stats.total} semantic sections`);

line('section kinds');
Object.entries(stats.kinds)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, n]) => {
    const t = tier(k);
    const flag = t === 'structured' ? '' : t === 'prose' ? '   fallback' : '   NEEDS REVIEW';
    console.log(`  ${k.padEnd(13)} ${String(n).padStart(5)}  ${pct(n, stats.total).padStart(6)}${flag}`);
  });

line('coverage');
console.log(`  laid out by a real component  ${String(stats.tiers.structured).padStart(5)}  ${pct(stats.tiers.structured, stats.total)}`);
console.log(`  falls back to plain prose     ${String(stats.tiers.prose).padStart(5)}  ${pct(stats.tiers.prose, stats.total)}`);
console.log(`  unclassified                  ${String(stats.tiers.unknown).padStart(5)}  ${pct(stats.tiers.unknown, stats.total)}`);
const srcTotal = [...srcBag.values()].reduce((a, b) => a + b, 0);
const lost = lossy.reduce((n, p) => n + p.missing, 0);
console.log(`\n  words in source ${srcTotal}   not carried through ${lost}  (${pct(lost, srcTotal)})  on ${lossy.length} pages`);
lossy
  .sort((a, b) => b.missing - a.missing)
  .slice(0, 5)
  .forEach((p) => console.log(`      ${String(p.missing).padStart(5)} / ${String(p.total).padEnd(6)} ${p.slug}`));

line('by archetype');
console.log('  archetype       pages  sections   structured   pages with 0 fallbacks');
Object.entries(stats.byArchetype)
  .sort((a, b) => b[1].pages - a[1].pages)
  .forEach(([k, a]) =>
    console.log(
      `  ${k.padEnd(14)} ${String(a.pages).padStart(5)} ${String(a.sections).padStart(9)} ${pct(a.structured, a.sections).padStart(12)} ${String(a.clean + '/' + a.pages).padStart(24)}`,
    ),
  );

if (Object.keys(stats.reasons).length) {
  line('why sections stayed unclassified');
  Object.entries(stats.reasons)
    .sort((a, b) => b[1] - a[1])
    .forEach(([r, n]) => console.log(`  ${String(n).padStart(5)}  ${r}`));
}

line(`pages with sections still to decide: ${review.length}`);
review
  .sort((a, b) => b.open - a.open || a.slug.localeCompare(b.slug))
  .slice(0, 20)
  .forEach((r) => console.log(`  ${String(r.open + '/' + r.total).padStart(6)}  ${r.kind.padEnd(14)} ${r.slug}`));
if (review.length > 20) console.log(`  … and ${review.length - 20} more`);

console.log(WRITE ? `\nwrote ${path.relative(process.cwd(), OUT)}` : '\nreport only — pass --write to emit src/content/pages.v2.json');
