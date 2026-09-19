"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";

export type BlogCard = {
  slug: string;
  title: string;
  summary: string;
  cover?: string;
  date?: string;
};

/**
 * The rest of the index, behind a Load More.
 *
 * The source's index is paginated ten to a page, so ten is what this shows to
 * begin with — the lead story plus nine cards — and each press reveals another
 * ten. The posts beyond page one are this site's own articles; without the
 * button they would have no inbound link anywhere, because the source's page
 * two is not part of the mirror.
 */
const PAGE = 10;

export default function BlogGrid({ posts }: { posts: BlogCard[] }) {
  const [shown, setShown] = useState(PAGE - 1);
  const visible = posts.slice(0, shown);
  const left = posts.length - visible.length;

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {visible.map((post, i) => (
          <Card key={post.slug} post={post} delay={Math.min(i % 3, 5)} />
        ))}
      </ul>

      {left > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShown(shown + PAGE)}
            className="btn btn-outline rounded-full"
          >
            Load More
            <Icon name="plus" size={17} className="ml-2.5" />
          </button>
        </div>
      )}
    </>
  );
}

function Card({ post, delay }: { post: BlogCard; delay: number }) {
  return (
    <Reveal as="li" delay={delay} className="h-full">
      <Link
        href={`/${post.slug}`}
        className="group surface flex h-full flex-col overflow-hidden"
      >
        {post.cover && (
          <div className="relative aspect-[3/2] w-full overflow-hidden">
            <Image
              src={post.cover}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-6">
          {post.date && (
            <p className="font-[family-name:var(--font-ui)] text-[11px] tracking-[0.16em] text-white/45 uppercase">
              {post.date}
            </p>
          )}
          <h3 className="mt-3 text-[18px] leading-[1.25] font-semibold text-white transition-colors duration-300 group-hover:text-gold">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-[14.5px] leading-[23px] font-normal text-body">
            {post.summary}
          </p>
          {/* The card's own underline, drawn on hover. `mt-auto` on the
              wrapper keeps it at the foot of a card whose summary is short. */}
          <span aria-hidden className="mt-auto block pt-6">
            <span className="block h-[3px] w-0 bg-gold transition-[width] duration-500 ease-[var(--ease-out-expo)] group-hover:w-full" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
