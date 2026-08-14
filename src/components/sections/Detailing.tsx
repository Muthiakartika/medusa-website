import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import VehicleClassPicker, { ClassPrice } from "@/components/VehicleClass";
import { BOOK_URL, DETAILING, DETAILING_INTRO } from "@/lib/site";

/**
 * The gold band, in ink type for contrast. Detailing levels 1–5 are a genuine
 * escalation, so the row climbs: each panel sits higher than the one before it
 * and its price grows with it. The old layout gave all five identical weight,
 * which hid the one thing the numbering was there to say.
 */
export default function Detailing() {
  return (
    <section className="cut-top bg-gold-wash relative w-full pt-[calc(var(--cut)+5rem)] pb-20 lg:pb-28">
      <div className="shell">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            title={DETAILING_INTRO.heading}
            lede={DETAILING_INTRO.body}
            tone="gold"
            className="lg:max-w-[62%]"
          />
          <Reveal delay={3} className="lg:pb-2">
            <VehicleClassPicker tone="gold" label="Prices below are for" />
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          {DETAILING.map((d, i) => (
            <Reveal
              key={d.title}
              as="li"
              delay={i}
              className="block"
              // Rises left-to-right on the wide layout only.
            >
              <div
                style={{ "--rise": `${(DETAILING.length - 1 - i) * 26}px` } as React.CSSProperties}
                className="flex h-full flex-col bg-ink p-6 transition-transform duration-300 hover:-translate-y-1 lg:mb-[var(--rise)]"
              >
                <span
                  aria-hidden
                  className="mb-5 block h-[5px] w-full bg-gold"
                  style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)" }}
                />

                <a href={d.href} className="group">
                  <h3 className="font-[family-name:var(--font-display)] text-[20px] leading-none text-gold transition-colors group-hover:text-gold-bright">
                    {d.title}
                  </h3>
                  <h4 className="mt-2.5 text-[16px] leading-tight text-white uppercase">
                    {d.subtitle}
                  </h4>
                </a>

                <p className="mt-6 font-[family-name:var(--font-display)] text-[34px] leading-none text-white">
                  <ClassPrice prices={d.prices} />
                </p>

                <div className="mt-auto flex flex-col gap-2 pt-7">
                  <a
                    href={BOOK_URL}
                    className="btn btn-gold w-full justify-center text-[12px]"
                  >
                    Book Now
                  </a>
                  <a
                    href={d.href}
                    className="link-inline"
                  >
                    Learn more
                    <Icon name="arrow" size={15} />
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
