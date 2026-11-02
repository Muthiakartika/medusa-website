import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { CONTACT } from "@/lib/site";

/**
 * Where book.medusaautodetailing.co.uk sends a customer once a booking is
 * made. Client, 2026-10-31: "the confirmation page that we create in next.js
 * should say: Your booking has been confirmed, and add some customer support
 * details to it" — the booking platform links here, and the conversion gtag
 * moves onto this page so a completed booking is counted on our own domain.
 *
 * Not a page anyone should land on from search: `noindex`, not in the
 * sitemap, linked from nothing on the site. Its URL is the one the booking
 * platform is configured with, so do not move it without changing that too.
 */

export const metadata: Metadata = {
  title: "Booking Confirmed – Medusa Auto Detailing",
  alternates: { canonical: "/booking-confirmed" },
  robots: { index: false, follow: true },
};

/* `BUSINESS.openingHours`, written out for people. */
const HOURS = [
  { days: "Monday – Friday", time: "7:00am – 6:00pm" },
  { days: "Saturday – Sunday", time: "9:00am – 5:00pm" },
];

const SUPPORT = [
  {
    icon: "phone",
    label: "Call us",
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone}`,
  },
  {
    icon: "whatsapp",
    label: "WhatsApp",
    value: "Message the team",
    href: CONTACT.whatsapp,
    external: true,
  },
  {
    icon: "mail",
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
  },
] as const;

export default function BookingConfirmedPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative w-full pt-[150px] pb-16 lg:pt-[190px] lg:pb-[104px]">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 0%, rgba(193,146,49,0.16) 0%, transparent 62%)",
            }}
          />
          <div className="shell relative text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-ink">
              <Icon name="check" size={30} />
            </span>
            <h1 className="mt-7 text-[32px] leading-[1.0] text-white sm:text-[42px] lg:text-[52px]">
              Your booking has been confirmed
            </h1>
            <p className="measure mx-auto mt-5 text-[16px] leading-[26px] font-normal text-body">
              Thank you for booking with Medusa Auto Detailing. If you need to
              change your booking or have a question, our customer support team
              is here to help.
            </p>

            <ul className="mx-auto mt-12 grid max-w-[960px] grid-cols-1 gap-4 text-left lg:grid-cols-3">
              {SUPPORT.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    {...("external" in s
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="surface group flex h-full flex-col items-start gap-4 p-6 transition-colors hover:bg-[#161616]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/[0.12] text-gold">
                      <Icon name={s.icon} size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-[family-name:var(--font-sub)] text-[19px] text-white transition-colors group-hover:text-gold">
                        {s.label}
                      </span>
                      <span className="mt-1 block break-words text-[14px] leading-[22px] font-normal text-white/60">
                        {s.value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="surface mx-auto mt-4 flex max-w-[960px] flex-col gap-3 p-6 text-left sm:flex-row sm:items-center sm:gap-8">
              <span className="flex items-center gap-3 font-[family-name:var(--font-sub)] text-[17px] text-white">
                <Icon name="clock" size={20} className="text-gold" />
                Opening hours
              </span>
              {HOURS.map((h) => (
                <span key={h.days} className="text-[14.5px] leading-[22px] font-normal text-white/60">
                  <span className="text-white/85">{h.days}</span> · {h.time}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/" className="btn btn-gold rounded-full">
                Back to Home
                <Icon name="arrow" size={18} className="ml-2.5" />
              </Link>
              <Link href="/contact-us" className="btn btn-outline rounded-full">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
