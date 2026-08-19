import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { BOOK_URL, CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page Not Found – Medusa Auto Detailing",
  robots: { index: false, follow: true },
};

/* Where a lost visitor most likely meant to go. */
const ROUTES = [
  { label: "Mobile Valeting", href: "/car-valeting/", note: "Full deep-clean packages" },
  { label: "Mobile Detailing", href: "/car-detailing/", note: "Paint correction & protection" },
  { label: "Mobile Car Wash", href: "/mobile-car-wash/", note: "Regular wash packages" },
  { label: "Car Lovers Club", href: "/car-lovers-club/", note: "Weekly & monthly plans" },
  { label: "Our Locations", href: "/our-locations/", note: "Areas we cover" },
  { label: "Contact Us", href: "/contact-us/", note: "Talk to the team" },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative w-full pt-[150px] pb-16 lg:pt-[190px] lg:pb-20">
          <div className="shell">
            <span aria-hidden className="block h-[3px] w-[52px] rounded-full bg-gold" />
            <h1 className="mt-6 text-[32px] leading-[1.0] text-white sm:text-[42px] lg:text-[52px]">
              This page has been washed away
            </h1>
            <p className="measure mt-5 text-[16px] leading-[26px] font-normal text-body">
              We could not find the page you were looking for. It may have moved,
              or the link that brought you here may be out of date. Pick a
              service below, or book your slot in under 60 seconds.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={BOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold rounded-full"
              >
                Book Now
                <Icon name="arrow" size={18} className="ml-2.5" />
              </a>
              <Link href="/" className="btn btn-outline rounded-full">
                Back to Home
              </Link>
            </div>

            <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ROUTES.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="surface group flex h-full flex-col p-6 transition-colors hover:bg-[#161616]"
                  >
                    <span className="font-[family-name:var(--font-sub)] text-[19px] text-white transition-colors group-hover:text-gold">
                      {r.label}
                    </span>
                    <span className="mt-1 text-[14px] leading-[22px] font-normal text-white/60">
                      {r.note}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-[15px] leading-[26px] font-normal text-white/60">
              Still stuck? Call{" "}
              <a href={`tel:${CONTACT.phone}`} className="text-gold hover:underline">
                {CONTACT.phone}
              </a>{" "}
              or email{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-gold hover:underline">
                {CONTACT.email}
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
