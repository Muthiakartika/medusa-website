"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BOOK_URL, CONTACT, NAV, type NavItem } from "@/lib/site";

/** Salient's `data-format=centered-menu` header: transparent over the hero,
 *  solid #1f1f1f once scrolled, 130px tall shrinking to 90px. */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,height,box-shadow] duration-300 ${
        scrolled
          ? "bg-[#1f1f1f] shadow-[0_2px_20px_rgba(0,0,0,0.6)]"
          : "bg-transparent"
      }`}
    >
      <div
        // Same container as the section shell, so the logo lines up with the
        // left edge of every heading below it — as on the live site.
        className={`mx-auto flex max-w-[2000px] items-center justify-between gap-6 px-[6%] transition-[height] duration-300 lg:px-[90px] ${
          scrolled ? "h-[90px]" : "h-[110px] xl:h-[130px]"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="relative z-10 shrink-0" aria-label="Medusa Auto Detailing — home">
          <Image
            src="/assets/2021/12/4-e1639638656209.webp"
            alt="Mobile Car Detailing &amp; Valeting"
            width={618}
            height={400}
            priority
            className={`w-auto transition-[height] duration-300 ${
              scrolled ? "h-[40px]" : "h-[50px]"
            }`}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden xl:block">
          <ul className="flex items-center gap-x-6 2xl:gap-x-7">
            {NAV.map((item) => (
              <DesktopItem key={item.label} item={item} />
            ))}
            <li>
              <a
                href={BOOK_URL}
                className="font-[family-name:var(--font-nav)] text-[14px] uppercase text-white transition-colors hover:text-gold"
              >
                Book Now
              </a>
            </li>
            <li>
              <a
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="-m-2.5 flex p-2.5 text-white transition-colors hover:text-gold"
              >
                <FacebookIcon />
              </a>
            </li>
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-[6px] xl:hidden"
        >
          <span
            className={`block h-[2px] w-[26px] bg-white transition-transform duration-300 ${
              open ? "translate-y-[8px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-[26px] bg-white transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-[26px] bg-white transition-transform duration-300 ${
              open ? "-translate-y-[8px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-y-auto bg-[#0d0d0d] transition-[max-height] duration-500 xl:hidden ${
          open ? "max-h-[calc(100vh-90px)]" : "max-h-0"
        }`}
      >
        <ul className="px-6 pb-10">
          {NAV.map((item) => (
            <li key={item.label} className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <a
                  href={item.href}
                  onClick={() => !item.children && setOpen(false)}
                  className="flex-1 py-4 font-[family-name:var(--font-nav)] text-[14px] uppercase text-white"
                >
                  {item.label}
                </a>
                {item.children && (
                  <button
                    type="button"
                    aria-label={`Toggle ${item.label} submenu`}
                    onClick={() =>
                      setExpanded(expanded === item.label ? null : item.label)
                    }
                    className="p-4 text-gold"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className={`transition-transform duration-300 ${
                        expanded === item.label ? "rotate-45" : ""
                      }`}
                    >
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                )}
              </div>
              {item.children && (
                <ul
                  className={`overflow-hidden transition-[max-height] duration-500 ${
                    expanded === item.label ? "max-h-[900px]" : "max-h-0"
                  }`}
                >
                  {item.children.map((c) => (
                    <li key={c.label}>
                      <a
                        href={c.href}
                        onClick={() => setOpen(false)}
                        className="block py-3 pl-4 font-[family-name:var(--font-nav)] text-[13px] text-[#999] transition-colors hover:text-gold"
                      >
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li className="pt-6">
            <a
              href={BOOK_URL}
              className="btn btn-gold w-full font-[family-name:var(--font-nav)]"
            >
              Book Now
            </a>
          </li>
          <li className="flex gap-4 pt-6">
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="-m-3 flex p-3 text-white transition-colors hover:text-gold"
            >
              <FacebookIcon />
            </a>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="-m-3 flex p-3 text-white transition-colors hover:text-gold"
            >
              <InstagramIcon />
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}

function DesktopItem({ item }: { item: NavItem }) {
  return (
    <li className="group relative">
      <a
        href={item.href}
        className="relative block whitespace-nowrap py-[10px] font-[family-name:var(--font-nav)] text-[14px] uppercase text-white transition-colors hover:text-gold"
      >
        {item.label}
        {/* Salient's animated_underline hover effect */}
        <span className="absolute inset-x-0 -bottom-[2px] h-[2px] origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
      </a>

      {item.children && (
        <ul className="invisible absolute left-1/2 top-full z-50 w-[240px] -translate-x-1/2 translate-y-2 bg-black p-5 opacity-0 shadow-[0_10px_40px_rgba(0,0,0,0.7)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          {item.children.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                className="block p-[6px] font-[family-name:var(--font-nav)] text-[15px] leading-snug text-[#999] transition-colors hover:text-gold"
              >
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 5.68a4.16 4.16 0 1 0 0 8.32 4.16 4.16 0 0 0 0-8.32Zm0 6.86a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Zm5.3-7.02a.97.97 0 1 1-1.94 0 .97.97 0 0 1 1.94 0Z" />
    </svg>
  );
}
