import type { Metadata } from "next";
import HubPage, { hubMetaPage } from "@/components/HubPage";
import { VEHICLES } from "@/lib/hubs";

/** The Other Vehicles hub. Everything is in `components/HubPage`. */
export function generateMetadata(): Metadata {
  const page = hubMetaPage(VEHICLES);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${VEHICLES.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${VEHICLES.slug}`,
    },
  };
}

export default function Page() {
  return <HubPage spec={VEHICLES} />;
}
