import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Sections } from "@/components/Blocks";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import { ALL_SLUGS, getPage } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[...slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug.join("/"));
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: "/" + slug.join("/") },
    openGraph: {
      title: page.title,
      description: page.description,
      url: "/" + slug.join("/"),
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}

export default async function CatchAllPage({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const page = getPage(slug.join("/"));
  if (!page) notFound();

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        {page.post && <PostHeader page={page} />}
        <Sections sections={page.sections} slug={page.slug} />
      </main>
      <Footer />
    </>
  );
}

function PostHeader({ page }: { page: NonNullable<ReturnType<typeof getPage>> }) {
  const { post } = page;
  const meta = [post?.author && `By ${post.author}`, post?.date].filter(Boolean);

  return (
    <section className="relative w-full pt-[160px] pb-14 lg:pt-[210px]">
      {post?.hero && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.hero})` }}
          />
          <div aria-hidden className="absolute inset-0 bg-black/[0.86]" />
        </>
      )}

      <div className="shell relative">
        <span aria-hidden className="block h-[3px] w-[52px] rounded-full bg-gold" />
        <h1 className="mt-6 max-w-[24ch] text-[30px] leading-[1.06] text-white sm:text-[38px] lg:text-[46px]">
          {page.h1}
        </h1>

        {meta.length > 0 && (
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] font-normal text-white/60">
            {post?.category && (
              <span className="rounded-full bg-white/[0.07] px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-gold uppercase ring-1 ring-white/10">
                {post.category}
              </span>
            )}
            <span>{meta.join(" · ")}</span>
          </p>
        )}

        {post?.hero && (
          <Image
            src={post.hero}
            alt={page.h1}
            width={1200}
            height={630}
            sizes="(min-width: 1024px) 1200px, 100vw"
            className="mt-10 h-auto w-full rounded-[14px]"
            priority
          />
        )}
      </div>
    </section>
  );
}
