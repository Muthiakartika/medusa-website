import type { Metadata } from "next";
import HubPage, { hubMetaPage } from "@/components/HubPage";
import { REPAIRS } from "@/lib/hubs";

/** The Repairs & Restoration hub. Everything is in `components/HubPage`. */
export function generateMetadata(): Metadata {
  const page = hubMetaPage(REPAIRS);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${REPAIRS.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${REPAIRS.slug}`,
    },
  };
}

export default function Page() {
  return <HubPage spec={REPAIRS} />;
}
