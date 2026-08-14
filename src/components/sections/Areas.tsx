import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { AREAS, AREAS_INTRO } from "@/lib/site";

/**
 * The third gold band — coverage.
 *
 * Each service's area list arrives from the source as one unbroken string,
 * forty-odd districts with the region names buried mid-sentence. The parser
 * below groups them by region without altering a word, so the list can be
 * scanned for your own area. The grouped lists sit on dark tiles; the intro
 * stays on the gold in ink.
 */
const LABEL =
  /(North West London|South West London|South East London|North East London|Central London|Greater London|North London|South London|East London|West London|Hertfordshire)\s*:?\s*/g;

function byRegion(text: string) {
  const matches = [...text.matchAll(LABEL)];
  if (!matches.length) return null;
  return matches.map((m, i) => ({
    region: m[1],
    places: text
      .slice(m.index + m[0].length, i + 1 < matches.length ? matches[i + 1].index : undefined)
      .replace(/[,\s]+$/, "")
      .split(/,\s*/)
      .map((s) => s.trim())
      .filter(Boolean),
  }));
}

export default function Areas() {
  return (
    <section className="bg-gold-wash w-full py-20 lg:py-28">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead title={AREAS_INTRO.heading} tone="gold" />
            {AREAS_INTRO.body.map((b, i) => (
              <Reveal key={i} delay={i + 2}>
                <p className="measure mt-5 text-[15px] leading-[25px] font-normal text-ink/80">
                  {b}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal
            delay={2}
            className="overflow-hidden rounded-[14px] shadow-[0_20px_44px_-26px_rgba(0,0,0,0.5)] ring-1 ring-ink/25 lg:col-span-7"
          >
            <iframe
              src={AREAS_INTRO.map}
              title="Map of the areas we cover across London and Hertfordshire"
              className="h-full min-h-[420px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {AREAS.map((a, i) => {
            const groups = byRegion(a.body);
            return (
              <Reveal key={a.title} delay={i} className="surface-on-gold p-7">
                <h3 className="font-[family-name:var(--font-sub)] text-[19px] text-white uppercase">
                  {a.title}
                </h3>

                {groups ? (
                  <dl className="mt-5 space-y-4">
                    {groups.map((g) => (
                      <div key={g.region}>
                        <dt className="font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
                          {g.region}
                        </dt>
                        <dd className="mt-1 text-[13.5px] leading-[21px] font-normal text-white/65">
                          {g.places.join(", ")}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-5 text-[13.5px] leading-[21px] font-normal text-white/65">
                    {a.body}
                  </p>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
