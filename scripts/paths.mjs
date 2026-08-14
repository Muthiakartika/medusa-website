import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Project root, derived from this file so nothing depends on the cwd. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Mirrored source HTML + sitemap URL lists (gitignored, ~70MB). */
export const CACHE = path.join(ROOT, '.cache');
export const HTML = path.join(CACHE, 'html');

/** Generated content consumed by the app. */
export const CONTENT = path.join(ROOT, 'src/content');
export const PAGES_JSON = path.join(CONTENT, 'pages.json');

/** Mirrored media, served from /assets/... */
export const PUBLIC = path.join(ROOT, 'public');
export const ASSETS = path.join(PUBLIC, 'assets');

export const SITE = 'https://medusaautodetailing.co.uk';
export const UPLOADS = SITE + '/wp-content/uploads/';
export const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
