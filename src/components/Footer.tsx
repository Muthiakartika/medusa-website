import Image from "next/image";
import { CONTACT, FOOTER } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0d0d0d]">
      <div className="shell py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Image
              src={FOOTER.logo}
              alt="Medusa Auto Detailing"
              width={300}
              height={200}
              className="h-[70px] w-auto"
            />
            <p className="mt-5 text-[14px] leading-[22px] font-normal text-white/70">
              {FOOTER.legalName}
              <br />
              {FOOTER.registration}
            </p>
            <p className="mt-3 text-[13px] leading-[20px] font-normal text-white/50">
              {FOOTER.note}
            </p>
          </div>

          <FooterCol title="Quick Links">
            {FOOTER.quickLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className={linkClass}>
                  {l.label}
                </a>
              </li>
            ))}
          </FooterCol>

          <FooterCol title="Legal Area">
            {FOOTER.legal.map((l) => (
              <li key={l.label}>
                <a href={l.href} className={linkClass}>
                  {l.label}
                </a>
              </li>
            ))}
          </FooterCol>

          <div>
            <FooterHeading>Get Our App</FooterHeading>
            <div className="mt-4 flex flex-col items-start gap-3">
              <a
                href={CONTACT.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src="/assets/2025/03/Download_on_the_App_Store_Badge.svg-1-1.webp"
                  alt="Download on the App Store"
                  width={240}
                  height={80}
                  className="h-[42px] w-auto"
                />
              </a>
              <a
                href={CONTACT.playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src="/assets/2025/03/Google-Play-Store-Button-768x252-1.webp"
                  alt="Get it on Google Play"
                  width={240}
                  height={80}
                  className="h-[42px] w-auto"
                />
              </a>
            </div>
          </div>

          <div>
            <FooterHeading>Contact</FooterHeading>
            <ul className="mt-4 space-y-2">
              <li>
                <a href={`tel:${CONTACT.phone}`} className={linkClass}>
                  Phone: {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className={`${linkClass} break-all`}>
                  Email: {CONTACT.email}
                </a>
              </li>
            </ul>

            <div className="mt-9"><FooterHeading>Our Timings</FooterHeading></div>
            <ul className="mt-4 space-y-1">
              {FOOTER.timings.map((t) => (
                <li
                  key={t}
                  className="text-[14px] leading-[22px] font-normal text-white/70"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-[13px] font-normal text-white/50">
            {FOOTER.copyright}
          </p>
          <div className="flex items-center gap-4">
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="-m-2.5 inline-flex p-2.5 text-white/70 transition-colors hover:text-gold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
              </svg>
            </a>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="-m-2.5 inline-flex p-2.5 text-white/70 transition-colors hover:text-gold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 5.68a4.16 4.16 0 1 0 0 8.32 4.16 4.16 0 0 0 0-8.32Zm0 6.86a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Zm5.3-7.02a.97.97 0 1 1-1.94 0 .97.97 0 0 1 1.94 0Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp button, as on the live site */}
      <a
        href={CONTACT.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:scale-110"
      >
        <Image
          src="/assets/icons/whatsapp.svg"
          alt=""
          width={32}
          height={32}
          className="h-[32px] w-[32px]"
        />
      </a>
    </footer>
  );
}

/* inline-block + vertical padding gives these a comfortable tap area without
   changing where the type sits. */
const linkClass =
  "inline-block py-1.5 text-[14px] leading-[22px] font-normal text-white/70 transition-colors hover:text-gold";

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      <ul className="mt-3">{children}</ul>
    </div>
  );
}

export function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="speed-rule speed-rule-sm" aria-hidden />
      <h4 className="mt-3 text-[17px] tracking-[0.04em] text-white uppercase">
        {children}
      </h4>
    </>
  );
}
