import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import AppSection from "@/components/sections/AppSection";
import Areas from "@/components/sections/Areas";
import Club from "@/components/sections/Club";
import ExtraServices from "@/components/sections/ExtraServices";
import Faq from "@/components/sections/Faq";
import Gift from "@/components/sections/Gift";
import Hero from "@/components/sections/Hero";
import Portfolio from "@/components/sections/Portfolio";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import WhyChoose from "@/components/sections/WhyChoose";
import { VehicleClassProvider } from "@/components/VehicleClass";
import { getPage } from "@/lib/blocks";
import { localBusinessSchema, pageSchema } from "@/lib/schema";

/* The provider spans the whole page so every price answers to one vehicle-class
   choice. Valeting, detailing and the wash tiers used to be three full-height
   rows here; they are now one `Pricing` section switched by service type. */
export default function Home() {
  const page = getPage("");

  return (
    <>
      {page && <JsonLd data={pageSchema(page)} />}
      <JsonLd data={localBusinessSchema} />
      <Header />
      <VehicleClassProvider>
        <main className="flex-1">
          <Hero />
          <WhyChoose />
          <AppSection />
          <Pricing />
          <ExtraServices />
          <Portfolio />
          <Gift />
          <Testimonials />
          <Club />
          <Areas />
          <Faq />
        </main>
      </VehicleClassProvider>
      <Footer />
    </>
  );
}
