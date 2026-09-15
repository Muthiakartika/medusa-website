import type { Metadata } from "next";
import HubPage, { hubMetaPage } from "@/components/HubPage";
import { INTERIOR } from "@/lib/hubs";

/** The Interior Cleaning hub. Everything is in `components/HubPage`. */
export function generateMetadata(): Metadata {
  const page = hubMetaPage(INTERIOR);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${INTERIOR.slug}/` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${INTERIOR.slug}/`,
    },
  };
}

export default function Page() {
  return <HubPage spec={INTERIOR} />;
}
