import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { CLUB } from "@/lib/site";

/**
 * The subscription pitch. The photograph is an inset card rather than a
 * full-bleed band, so the page holds one rhythm instead of being interrupted
 * by a second full-width image after the gold.
 *
 * The club's name is the heading and the "looking for something regular?" line
 * reads as the lede beneath it — the source had the question set larger than
 * the thing it was introducing.
 */
export default function Club() {
  // Top padding as well as bottom: without it the card sat straight against
  // the gold testimonial band above, with no seam between the two.
  return (
    <section className="w-full bg-black py-16 lg:py-[104px]">
      <div className="shell">
        <div className="relative isolate overflow-hidden rounded-[14px]">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-cover bg-center"
            style={{ backgroundImage: `url(${CLUB.bg})` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(0,0,0,0.93)_0%,rgba(0,0,0,0.74)_55%,rgba(0,0,0,0.52)_100%)]"
          />

          <div className="grid items-center gap-8 p-9 lg:grid-cols-12 lg:p-16">
            <div className="lg:col-span-8">
              <SectionHead title={CLUB.title} />
              <Reveal delay={2}>
                <p className="mt-4 font-[family-name:var(--font-sub)] text-[16px] tracking-[0.04em] text-gold uppercase">
                  {CLUB.kicker}
                </p>
              </Reveal>
              <Reveal delay={3}>
                <p className="measure mt-5 text-[16px] leading-[27px] font-normal text-white/80">
                  {CLUB.body}
                </p>
              </Reveal>
            </div>

            <Reveal delay={4} className="lg:col-span-4 lg:justify-self-end">
              <a href={CLUB.cta.href} className="btn btn-gold rounded-full">
                {CLUB.cta.label}
                <Icon name="arrow" size={18} className="ml-2.5" />
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
