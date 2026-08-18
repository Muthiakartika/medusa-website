import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogGrid from "@/components/BlogGrid";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { getPage, type Page, PAGES } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";

/**
 * The blog index, rebuilt from the posts themselves.
 *
 * The extracted page was page one of the source's pagination — ten cards, each
 * a cover photograph, a title and the author's avatar. Every one of those
 * titles is a link on the live site, and the extractor keeps a heading's text
 * but not its href, so the index rendered as ten unclickable pictures: no way
 * into a single post, and the other forty posts had no inbound link anywhere
 * on the site.
 *
 * Nothing here is invented. Title, date, cover and summary all come from each
 * post's own entry in `pages.json` — the same fields the post pages and the
 * sitemap already use.
 *
 * Ten are shown, as on the source's own first page: the lead story and nine
 * cards. The remaining forty are behind Load More rather than dropped, because
 * the source's page two is not in the mirror and without them those posts have
 * no inbound link anywhere on the site.
 */

const SLUG = "blog";

export function generateMetadata(): Metadata {
  const page = getPage(SLUG);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${SLUG}`,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}

/** A dated post slug — "2026/07/29/remove-car-seat-stains". */
const POST_SLUG = /^\d{4}\/\d{2}\/\d{2}\//;

/** An asset filename without its directory, size suffix or extension. */
const stem = (src?: string | null) =>
  (src ?? "")
    .split("/")
    .pop()!
    .replace(/-\d+x\d+(?=\.[a-z]+$)/i, "")
    .replace(/\.(webp|jpe?g|png)$/i, "");

/**
 * The headings the source's own index prints, keyed by the cover photograph.
 *
 * Nine of the ten match the post's `<title>` exactly; one does not — the index
 * calls it "Why Your Car Still Looks Dirty After Washing It" where the title
 * tag adds "| Expert Guide". Reading them off the extracted index means the
 * first ten cards carry the same words the source page does, and the posts
 * beyond it fall back to their own title.
 */
function indexHeadings() {
  const map = new Map<string, string>();
  for (const section of getPage(SLUG)?.sections ?? []) {
    const cover = section.blocks.find((b) => b.type === "image");
    const heading = section.blocks.find((b) => b.type === "heading");
    if (cover?.type === "image" && heading?.type === "heading") {
      map.set(stem(cover.src), heading.text);
    }
  }
  return map;
}

type Post = {
  slug: string;
  title: string;
  summary: string;
  cover?: string;
  date?: string;
  /** Sortable form of the date, for ordering. */
  published: string;
};

function posts(): Post[] {
  const headings = indexHeadings();
  return Object.entries(PAGES)
    .filter(([slug]) => POST_SLUG.test(slug))
    .map(([slug, page]: [string, Page]) => ({
      slug,
      title:
        headings.get(stem(page.post?.hero ?? page.ogImage)) ?? page.title ?? page.h1,
      summary: page.description ?? "",
      cover: page.post?.hero ?? page.ogImage ?? undefined,
      date: page.post?.date,
      published: page.published ?? slug.slice(0, 10).replace(/\//g, "-"),
    }))
    /*
      Newest first, then by slug so the order is stable. Several posts share a
      publication date — four of them fall on 2026-07-29 — and `published` is
      the only date `pages.json` carries, so within a day this is an arbitrary
      but fixed order rather than the source's own.
    */
    .sort(
      (a, b) =>
        b.published.localeCompare(a.published) || b.slug.localeCompare(a.slug),
    );
}

export default function BlogIndex() {
  const page = getPage(SLUG);
  if (!page) notFound();

  const all = posts();
  const [lead, ...rest] = all;

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        {/* The page's own title. Nothing else is written for it. */}
        <PageHero title={page.h1} />

        {lead && <Lead post={lead} />}

        <section className="w-full pb-16 lg:pb-[104px]">
          <div className="shell">
            <BlogGrid posts={rest} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ── Lead story ───────────────────────────────────────────────────────────
   The newest post, given the width its cover photograph deserves. A grid of
   fifty identical cards has no way of saying which one to read first. */

function Lead({ post }: { post: Post }) {
  return (
    <section className="w-full py-12 lg:py-[72px]">
      <div className="shell">
        <Reveal>
          <Link
            href={`/${post.slug}`}
            className="group surface grid overflow-hidden lg:grid-cols-12"
          >
            {post.cover && (
              <div className="relative aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[380px]">
                <Image
                  src={post.cover}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                />
              </div>
            )}
            <div className="flex flex-col justify-center p-7 lg:col-span-5 lg:p-10">
              {post.date && (
                <p className="font-[family-name:var(--font-ui)] text-[11px] tracking-[0.18em] text-gold uppercase">
                  {post.date}
                </p>
              )}
              <h2 className="mt-4 text-[26px] leading-[1.12] text-white transition-colors duration-300 group-hover:text-gold lg:text-[32px]">
                {post.title}
              </h2>
              <p className="mt-4 text-[15.5px] leading-[26px] font-normal text-body">
                {post.summary}
              </p>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
