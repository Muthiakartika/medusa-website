import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { CACHE, CONTENT as OUT, HTML, PAGES_JSON, SITE } from './paths.mjs';

fs.mkdirSync(OUT, { recursive: true });

const imageUrls = new Set();

/* ── helpers ──────────────────────────────────────────────────────────── */

const clean = (s) => (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

/** wp-content/uploads/2021/12/x.webp  ->  /assets/2021/12/x.webp */
function localAsset(u) {
  if (!u) return null;
  if (u.startsWith('data:')) return null;
  const m = u.match(/wp-content\/uploads\/(.+?)(?:\?|$)/);
  if (!m) return null;
  imageUrls.add(SITE + '/wp-content/uploads/' + m[1]);
  return '/assets/' + m[1];
}

/** absolute medusa link -> local route */
function localHref(h) {
  if (!h) return null;
  h = h.trim();
  if (h.startsWith('#') || h.startsWith('tel:') || h.startsWith('mailto:')) return h;
  if (h.startsWith(SITE)) {
    const p = h.slice(SITE.length).split('?')[0].split('#')[0];
    return p === '' || p === '/' ? '/' : '/' + p.replace(/^\/|\/$/g, '');
  }
  return h; // external (booking subdomain, socials, app stores)
}

/** keep a safe subset of inline markup inside paragraphs / list items */
function inlineHtml($, el) {
  const $el = $(el).clone();
  $el.find('script,style,noscript').remove();
  $el.find('*').each((_, n) => {
    const tag = n.tagName?.toLowerCase();
    if (!['a', 'strong', 'b', 'em', 'i', 'br', 'span', 'u', 'sup', 'sub'].includes(tag)) {
      $(n).replaceWith($(n).html() || '');
      return;
    }
    const attrs = { ...n.attribs };
    for (const k of Object.keys(attrs)) delete n.attribs[k];
    if (tag === 'a') {
      const href = localHref(attrs.href);
      if (href) n.attribs.href = href;
      if (href && /^https?:/.test(href)) {
        n.attribs.target = '_blank';
        n.attribs.rel = 'noopener noreferrer';
      }
    }
  });
  return clean($el.html() || '').replace(/<span>|<\/span>/g, '');
}

const BUTTON_SEL =
  'a.nectar-button, a.goldbtn, a.whitebtn, a.nectar_video_lightbox, .nectar-cta a';

const SKIP_SEL = [
  'script', 'style', 'noscript', 'template',
  '.row-bg-wrap', '.column-bg-overlay-wrap', '.video-color-overlay',
  '.pum', '.pum-overlay', '.popmake', '.pum-container',
  '.hustle-ui', '.hustle-popup', '.wph-modal',
  '#header-outer', '#footer-outer', '#slide-out-widget-area',
  '.sbi_header', '.sbi-owl-nav', '.nectar-social', '.sharing-default-minimal',
  '.wpb_raw_code script', '.divider-wrap', '.nectar-scrolling-text',
  // Bare <form> covers the theme's search box; the CF7 wrapper is handled
  // ahead of this check in visit(), so enquiry forms still come through.
  'form', '.forminator-ui',
].join(',');

/* ── Contact Form 7 ───────────────────────────────────────────────────── */

/** Label text for one control: its <label>, minus the control's own markup. */
function labelFor($, $ctl) {
  const $lab = $ctl.closest('label');
  if ($lab.length) {
    const $clone = $lab.clone();
    $clone.find('.wpcf7-form-control-wrap, input, textarea, select, .wpcf7-list-item').remove();
    const text = clean($clone.text());
    if (text) return text;
  }
  // Some forms put the caption in the <p> ahead of the control instead.
  const $p = $ctl.closest('p, .wpcf7-form-control-wrap').parent();
  const own = clean($p.clone().find('input, textarea, select').remove().end().text());
  return own || '';
}

/**
 * Turns a CF7 form into a portable field list. The live forms post to
 * WordPress; the clone re-renders these fields against its own handler.
 */
function extractForm($, $wrap) {
  const $form = $wrap.find('form.wpcf7-form').first();
  if (!$form.length) return null;

  const fields = [];
  const seen = new Set();

  $form.find('input, textarea, select').each((_, el) => {
    const $ctl = $(el);
    const name = $ctl.attr('name');
    const type =
      el.tagName.toLowerCase() === 'textarea'
        ? 'textarea'
        : el.tagName.toLowerCase() === 'select'
          ? 'select'
          : ($ctl.attr('type') || 'text').toLowerCase();

    if (!name || type === 'hidden' || type === 'submit') return;

    // The commercial-valeting form ships two different questions both named
    // `your-phone`, so the source silently loses one on submit. Suffix the
    // repeat instead of dropping the field — same captions, no lost answer.
    let key = name;
    for (let n = 2; seen.has(key); n++) key = `${name}-${n}`;
    seen.add(key);

    const field = {
      name: key,
      type,
      label: labelFor($, $ctl) || name.replace(/[-_]/g, ' '),
      required: $ctl.attr('aria-required') === 'true' || $ctl.is('[required]'),
    };

    const placeholder = clean($ctl.attr('placeholder'));
    if (placeholder) field.placeholder = placeholder;
    if (type === 'textarea') field.rows = Number($ctl.attr('rows')) || 6;
    if (type === 'select') {
      field.options = $ctl
        .find('option')
        .toArray()
        .map((o) => clean($(o).text()))
        .filter(Boolean);
    }
    fields.push(field);
  });

  if (!fields.length) return null;

  return {
    type: 'form',
    id: clean($form.attr('aria-label')) || 'Enquiry form',
    submitLabel: clean($form.find('input[type=submit]').attr('value')) || 'Send',
    fields,
  };
}

/* ── decorative icons ─────────────────────────────────────────────────── */

/**
 * The theme's line-art icon set plus the three review badges — a single batch
 * of square PNG/WebP uploads, and the only decorative images on the site.
 *
 * Marking them here rather than guessing at render time matters because they
 * are 339×339, which is indistinguishable by dimension from the small square
 * photographs on the blog (324×324 and 360×360). Matching the surrounding
 * markup instead was tried and is worse: the icons sit in carousels, but so do
 * genuine photo slides, so the container catches ~166 photographs that then
 * render at icon size.
 *
 * An icon added later that this misses degrades gracefully — the renderer
 * never upscales, so it appears at its own size rather than filling a column.
 */
const ICON_FILE = /car-parts-icon|001-tick|001-facebook|002-google-maps|index1-e16022/i;

function isDecorativeIcon(src) {
  return ICON_FILE.test(src);
}

/* ── block walker ─────────────────────────────────────────────────────── */

function walk($, root) {
  const blocks = [];
  let faqBuf = [];

  const flushFaq = () => {
    if (faqBuf.length) { blocks.push({ type: 'faq', items: faqBuf }); faqBuf = []; }
  };
  const push = (b) => { flushFaq(); blocks.push(b); };

  /** `vc_col-sm-6` -> 6 (twelfths); Elementor uses `elementor-col-50` -> 6 */
  const spanOf = ($c) => {
    const cls = $c.attr('class') || '';
    const vc = cls.match(/vc_col-(?:sm|md|lg)-(\d+)/);
    if (vc) return Number(vc[1]);
    const el = cls.match(/elementor-col-(\d+)/);
    if (el) return Math.max(1, Math.round((Number(el[1]) / 100) * 12));
    return 12;
  };

  const visit = (el) => {
    if (!el || el.type !== 'tag') return;
    const $el = $(el);
    const tag = el.tagName.toLowerCase();

    // Checked before SKIP_SEL so the enquiry forms survive the bare-<form> skip.
    if ($el.hasClass('wpcf7')) {
      const form = extractForm($, $el);
      if (form) push(form);
      return;
    }

    if ($el.is(SKIP_SEL)) return;
    if (($el.attr('style') || '').includes('display:none')) return;

    // Preserve WPBakery / Elementor multi-column layouts as a `columns` block
    // so side-by-side content (Exterior|Interior lists, pricing grids, service
    // cards) keeps its shape instead of collapsing into one stack.
    if (
      $el.hasClass('row_col_wrap_12') ||
      $el.hasClass('row_col_wrap_12_inner') ||
      $el.hasClass('elementor-container')
    ) {
      const cols = $el.children('.wpb_column, .elementor-column').toArray();
      if (cols.length >= 2) {
        const spans = cols.map((c) => spanOf($(c)));
        const colBlocks = cols.map((c) => walk($, c));
        if (colBlocks.filter((b) => b.length).length >= 2) {
          push({ type: 'columns', spans, cols: colBlocks });
          return;
        }
      }
    }

    // Salient FAQ accordion
    if ($el.hasClass('toggle')) {
      const q = clean($el.find('> h3, > h4, .toggle-title').first().text());
      const a = $el.find('> div').last();
      const body = a.find('p').map((_, p) => inlineHtml($, p)).get().filter(Boolean);
      const items = a.find('li').map((_, li) => inlineHtml($, li)).get().filter(Boolean);
      if (q) faqBuf.push({ q, a: body.length ? body : items.length ? items : [clean(a.text())] });
      return;
    }

    if (/^h[1-6]$/.test(tag)) {
      const text = clean($el.text());
      if (text) push({ type: 'heading', level: Number(tag[1]), text });
      return;
    }

    if (tag === 'p') {
      const html = inlineHtml($, el);
      const imgs = $el.find('img');
      if (imgs.length) imgs.each((_, im) => visit(im));
      if (html && html.replace(/<[^>]+>/g, '').trim()) push({ type: 'paragraph', html });
      return;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = $el
        .find('> li')
        .map((_, li) => inlineHtml($, li))
        .get()
        .filter((t) => t && t.replace(/<[^>]+>/g, '').trim());
      if (items.length) push({ type: 'list', ordered: tag === 'ol', items });
      return;
    }

    if (tag === 'img') {
      const src = localAsset($el.attr('data-src') || $el.attr('src'));
      if (src) {
        push({
          type: 'image',
          src,
          alt: clean($el.attr('alt')) || '',
          w: Number($el.attr('width')) || undefined,
          h: Number($el.attr('height')) || undefined,
          ...(isDecorativeIcon(src) ? { icon: true } : {}),
        });
      }
      return;
    }

    if (tag === 'table') {
      // NB: cheerio's .map().get() flattens one level, which would collapse
      // rows-of-cells into a flat string list — use toArray() instead.
      const rows = $el
        .find('tr')
        .toArray()
        .map((tr) =>
          $(tr).find('th,td').toArray().map((td) => clean($(td).text())),
        )
        .filter((r) => r.length);
      if (rows.length) push({ type: 'table', rows });
      return;
    }

    if (tag === 'iframe') {
      const src = $el.attr('src') || $el.attr('data-src');
      if (src && !/trustpilot|facebook\.com\/plugins/.test(src)) {
        push({ type: 'embed', src, title: clean($el.attr('title')) || '' });
      }
      return;
    }

    if (tag === 'video') {
      const src = localAsset($el.attr('src') || $el.find('source').attr('src'));
      if (src) push({ type: 'video', src, poster: localAsset($el.attr('poster')) || undefined });
      return;
    }

    if (tag === 'a' && $el.is(BUTTON_SEL)) {
      const label = clean($el.text());
      const href = localHref($el.attr('href'));
      if (label && href) push({ type: 'button', label, href });
      return;
    }

    // lazy background images used as decorative panels
    const bg = localAsset($el.attr('data-bg'));
    if (bg && ($el.hasClass('column-image-bg-wrap') || $el.hasClass('nectar-cta-bg'))) {
      push({ type: 'image', src: bg, alt: '' });
      return;
    }

    el.children?.forEach(visit);
  };

  root.children?.forEach(visit);
  flushFaq();
  return blocks;
}

/* ── section background ───────────────────────────────────────────────── */

function rowBg($, $row) {
  const out = {};
  const $bg = $row.find('> .row-bg-wrap .row-bg').first();
  const img = localAsset($bg.attr('data-bg') || $bg.attr('data-bg-large'));
  if (img) out.image = img;
  const bgStyle = $bg.attr('style') || '';
  const c = bgStyle.match(/background-color:\s*([^;]+)/);
  if (c) out.color = c[1].trim();

  const ov = $row.find('> .row-bg-wrap .row-bg-overlay').first().attr('style') || '';
  const grad = ov.match(/background:\s*(linear-gradient\([^;]+\))/);
  if (grad) out.gradient = grad[1].trim();
  else {
    const oc = ov.match(/background-color:\s*([^;]+)/);
    if (oc && oc[1].trim() !== 'transparent') {
      out.overlay = oc[1].trim();
      const op = ov.match(/opacity:\s*([\d.]+)/);
      if (op) out.overlayOpacity = Number(op[1]);
    }
  }
  return Object.keys(out).length ? out : undefined;
}

/* ── page extraction ──────────────────────────────────────────────────── */

/**
 * Reads the bits of Yoast's JSON-LD @graph the clone re-emits itself: the edit
 * timestamps (sitemap <lastmod>) and the breadcrumb trail. Breadcrumb labels
 * are WordPress post titles, which appear nowhere else in the markup — copying
 * them is the only way to keep the trail identical to the source.
 */
function yoastMeta($) {
  const out = {};
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    let graph;
    try {
      graph = JSON.parse($(el).text())['@graph'];
    } catch {
      continue;
    }
    if (!Array.isArray(graph)) continue;

    const page = graph.find((n) => n['@type'] === 'WebPage');
    if (page?.dateModified) out.modified = String(page.dateModified).slice(0, 10);
    if (page?.datePublished) out.published = String(page.datePublished).slice(0, 10);

    // Blog posts carry an Article node; its author/section are the only copy
    // of that data for the Elementor-built posts, which have no byline markup.
    const art = graph.find((n) => n['@type'] === 'Article');
    if (art) {
      out.article = {
        headline: clean(art.headline || ''),
        author: clean(art.author?.name || '') || undefined,
        section: [].concat(art.articleSection || []).map(clean).filter(Boolean),
      };
      if (!out.article.section.length) delete out.article.section;
    }

    const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList')?.itemListElement;
    if (Array.isArray(crumbs) && crumbs.length) {
      out.breadcrumb = crumbs
        .map((c) => ({
          name: clean(c.name || ''),
          // Absolute source URL -> local path; the trailing crumb has no item.
          href: c.item ? new URL(c.item).pathname.replace(/\/$/, '') || '/' : undefined,
        }))
        .filter((c) => c.name);
    }
    if (out.modified || out.breadcrumb) break;
  }
  return out;
}

function extract(file) {
  const raw = fs.readFileSync(path.join(HTML, file), 'utf8');
  const $ = cheerio.load(raw);

  const slugPath = file.replace(/\.html$/, '').replace(/__/g, '/');
  const slug = slugPath === 'index' ? '' : slugPath;

  const title = clean($('title').first().text());
  const description = $('meta[name="description"]').attr('content') || '';
  const ogImage = localAsset($('meta[property="og:image"]').attr('content'));

  // Read before the <script> strip below removes the JSON-LD.
  const { modified, published, breadcrumb, article } = yoastMeta($);

  // Blog-post meta (Salient single-post template) — read before stripping chrome.
  const isPost = $('.post-content').length > 0;
  const post = isPost
    ? {
        category: clean($('.blog-title .inner-wrap > a').first().text()) || undefined,
        author: clean($('.meta-author .fn a').first().text()) || undefined,
        date: clean($('.meta-date').first().text()) || undefined,
        hero: localAsset($('.hidden-social-img').attr('src')) || ogImage || undefined,
      }
    : undefined;

  // Drop site chrome, popups and overlays so row detection can't match them.
  $(
    '#header-outer, #footer-outer, #slide-out-widget-area, .pum, .pum-overlay, ' +
      '.popmake, .pum-container, .hustle-ui, .wph-modal, script, style, noscript, ' +
      '#page-header-wrap, .blog-title, #single-below-header, .comments-section, ' +
      '#respond, .related-posts, .sharing-default-minimal',
  ).remove();

  // Top-level content rows. Service pages are built with WPBakery (.wpb_row);
  // blog posts are built with Elementor (section.elementor-section).
  const $wrap = $('#ajax-content-wrap');
  const pickTop = (sel) => {
    const all = $wrap.find(sel).toArray();
    return all.filter((r) => !all.some((o) => o !== r && $(o).find(r).length > 0));
  };

  // Some pages mix builders — e.g. the location pages are Elementor shells
  // with WPBakery shortcodes embedded inside Elementor widgets. Gathering
  // candidates from both and keeping only the outermost picks the real page
  // shell instead of whichever builder we happened to test for first.
  const topRows = isPost
    ? $wrap.find('.post-content').toArray()
    : pickTop('.wpb_row, .elementor-section, .elementor > section, .e-con');

  const sections = [];
  for (const r of topRows) {
    const blocks = walk($, r);
    if (!blocks.length) continue;
    const $r = $(r);
    sections.push({ bg: $r.hasClass('wpb_row') ? rowBg($, $r) : undefined, blocks });
  }

  // Last resort: walk the whole content wrapper as a single section.
  if (!sections.length && $wrap.length) {
    const blocks = walk($, $wrap.get(0));
    if (blocks.length) sections.push({ blocks });
  }

  const h1 =
    sections.flatMap((s) => s.blocks).find((b) => b.type === 'heading' && b.level === 1)?.text ||
    clean($('#page-header-bg h1, .entry-title, h1').first().text()) ||
    title.split('|')[0].split('–')[0].trim();

  return {
    slug, title, description, ogImage,
    modified, published, breadcrumb, article,
    h1, post, sections,
  };
}

/* ── run ──────────────────────────────────────────────────────────────── */

const files = fs.readdirSync(HTML).filter((f) => f.endsWith('.html'));
const pages = {};
let emptyPages = [];

/** counts nested blocks too — `columns` blocks hold sub-arrays */
const deepCount = (blocks) =>
  blocks.reduce(
    (n, b) => n + 1 + (b.type === 'columns' ? b.cols.reduce((m, c) => m + deepCount(c), 0) : 0),
    0,
  );

for (const f of files) {
  try {
    const p = extract(f);
    const blockCount = p.sections.reduce((n, s) => n + deepCount(s.blocks), 0);
    if (blockCount < 5) emptyPages.push(f + ' (' + blockCount + ' blocks)');
    pages[p.slug] = p;
  } catch (e) {
    console.log('FAIL ' + f + ' :: ' + e.message);
  }
}

fs.writeFileSync(PAGES_JSON, JSON.stringify(pages, null, 1), 'utf8');
fs.writeFileSync(path.join(CACHE, 'page-images.txt'), [...imageUrls].join('\n'), 'utf8');

const counts = Object.values(pages).map((p) => p.sections.reduce((n, s) => n + deepCount(s.blocks), 0));
console.log(`pages: ${Object.keys(pages).length}`);
console.log(`blocks: total ${counts.reduce((a, b) => a + b, 0)}, median ${counts.sort((a, b) => a - b)[Math.floor(counts.length / 2)]}`);
console.log(`images referenced: ${imageUrls.size}`);
if (emptyPages.length) console.log(`\nthin pages (${emptyPages.length}):\n` + emptyPages.slice(0, 25).join('\n'));
