import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { type Block, getPage } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";

/**
 * Terms and conditions, laid out rather than rendered.
 *
 * The extracted page is one section of thirty-two blocks: nine numbered
 * clauses as h4s, and under them twenty-three paragraphs and two lists, run
 * top to bottom in a single column with nothing to navigate by. Clause 7 alone
 * is ten consecutive paragraphs.
 *
 * Not a word of it changes here. The clauses are split on their own numbering,
 * each gets an anchor, and the numbering becomes a contents list that stays on
 * screen while you read — which is the whole of what a legal page's design has
 * to do.
 */

const SLUG = "terms-and-conditions";

export function generateMetadata(): Metadata {
  const page = getPage(SLUG);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}/` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${SLUG}/`,
    },
  };
}

/** "1. Engagement of Services" — the shape every clause heading has. */
const CLAUSE = /^\s*(\d+)\.\s*(.+)$/;

type Clause = { n: string; title: string; id: string; blocks: Block[] };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Splits the page's flat run of blocks at each numbered heading. */
function clauses(blocks: Block[]) {
  const out: Clause[] = [];
  /** Anything before the first numbered heading — the page title, in practice. */
  const preamble: Block[] = [];

  for (const b of blocks) {
    const m = b.type === "heading" ? b.text.match(CLAUSE) : null;
    if (m) {
      out.push({ n: m[1], title: m[2].trim(), id: slugify(m[2]), blocks: [] });
      continue;
    }
    if (b.type === "heading" && b.level <= 1) continue; // the h1, set by the header
    (out.at(-1)?.blocks ?? preamble).push(b);
  }

  return out;
}

export default function TermsPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  const list = clauses(page.sections.flatMap((s) => s.blocks));

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        <PageHero title={page.h1} />

        <section className="w-full py-16 lg:py-[104px]">
          <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Contents — sticky on desktop, a plain list on a phone. */}
            <nav aria-label="Contents" className="lg:col-span-4">
              <div className="lg:sticky lg:top-[130px]">
                <Reveal>
                  <p className="font-[family-name:var(--font-ui)] text-[11px] tracking-[0.18em] text-white/50 uppercase">
                    Contents
                  </p>
                </Reveal>
                <ol className="mt-5 flex flex-col">
                  {list.map((c, i) => (
                    <Reveal as="li" key={c.id} delay={Math.min(i, 5)}>
                      <a
                        href={`#${c.id}`}
                        className="flex gap-3 border-t border-white/[0.07] py-3 text-[15px] leading-[22px] font-normal text-white/70 transition-colors hover:text-gold"
                      >
                        <span className="font-[family-name:var(--font-sub)] text-gold tabular-nums">
                          {c.n.padStart(2, "0")}
                        </span>
                        {c.title}
                      </a>
                    </Reveal>
                  ))}
                </ol>
              </div>
            </nav>

            <div className="lg:col-span-8">
              {list.map((c, i) => (
                <Reveal
                  key={c.id}
                  as="section"
                  delay={Math.min(i, 3)}
                  className="scroll-mt-[120px] border-t border-white/[0.07] pt-9 first:border-t-0 first:pt-0 [&+*]:mt-12"
                >
                  <span id={c.id} className="block scroll-mt-[120px]" />
                  {/*
                    The number is the source's own — "1." not "01." — and the
                    explicit space after it keeps the heading's text content
                    reading "1. Engagement of Services" the way it was written.
                    Flex `gap` moves the pixels; it does not put a space in the
                    string a screen reader announces.
                  */}
                  <h2 className="text-[22px] leading-tight text-white lg:text-[26px]">
                    <span className="mr-2 font-[family-name:var(--font-sub)] text-[18px] text-gold tabular-nums lg:text-[20px]">
                      {c.n}.
                    </span>{" "}
                    {c.title}
                  </h2>
                  <div className="mt-5">
                    {c.blocks.map((b, j) => (
                      <Clause key={j} block={b} />
                    ))}
                  </div>
                </Reveal>
              ))}

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/** One block inside a clause. Only prose and lists occur on this page. */
function Clause({ block }: { block: Block }) {
  if (block.type === "paragraph") {
    return (
      <p
        className="mt-4 max-w-[70ch] text-[15.5px] leading-[27px] font-normal text-body first:mt-0 [&_a]:text-gold [&_a:hover]:underline [&_strong]:text-white"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    );
  }

  if (block.type === "list") {
    return (
      <ul className="mt-4 flex flex-col gap-2.5">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden className="mt-[10px] h-[5px] w-[5px] shrink-0 rounded-full bg-gold" />
            <span
              className="max-w-[70ch] text-[15.5px] leading-[27px] font-normal text-body [&_a]:text-gold"
              dangerouslySetInnerHTML={{ __html: item }}
            />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "heading") {
    return (
      <h3 className="mt-7 text-[17px] leading-snug font-semibold text-white">
        {block.text}
      </h3>
    );
  }

  return null;
}
