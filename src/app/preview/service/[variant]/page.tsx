import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Sections } from "@/components/Blocks";
import ServicePreview from "@/components/ServicePreview";
import { getPage } from "@/lib/blocks";

export const metadata: Metadata = {
  title: "Service page — design preview",
  robots: { index: false, follow: false },
};

const VARIANTS = ["current", "conversion", "editorial"] as const;
type Variant = (typeof VARIANTS)[number];

export function generateStaticParams() {
  return VARIANTS.map((variant) => ({ variant }));
}

export const dynamicParams = false;

/** Preview the alternatives on a real service page. */
const DEFAULT_SLUG = "car-valeting/mini-valet";

export default async function ServiceDesignPreview({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { variant } = await params;
  const { page: slug } = await searchParams;
  if (!VARIANTS.includes(variant as Variant)) notFound();

  const page = getPage(slug || DEFAULT_SLUG) ?? getPage(DEFAULT_SLUG);
  if (!page) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        {variant === "current" ? (
          <Sections sections={page.sections} slug={page.slug} />
        ) : (
          <ServicePreview page={page} variant={variant as "conversion" | "editorial"} />
        )}
      </main>
      <Footer />
      <Switcher current={variant as Variant} slug={page.slug} />
    </>
  );
}

function Switcher({ current, slug }: { current: Variant; slug: string }) {
  const label: Record<Variant, string> = {
    current: "Current",
    conversion: "A · Conversion",
    editorial: "B · Editorial",
  };
  return (
    <div className="fixed bottom-24 left-6 z-50 flex items-center gap-1 rounded-full bg-ink/95 p-1 ring-1 ring-white/15 backdrop-blur">
      <span className="px-3 font-[family-name:var(--font-ui)] text-[10px] tracking-[0.14em] text-white/60 uppercase">
        Design
      </span>
      {VARIANTS.map((v) => (
        <Link
          key={v}
          href={`/preview/service/${v}?page=${slug}`}
          aria-current={v === current}
          className={`rounded-full px-3.5 py-2 font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors ${
            v === current ? "bg-gold text-ink" : "text-white/70 hover:bg-white/10"
          }`}
        >
          {label[v]}
        </Link>
      ))}
    </div>
  );
}
