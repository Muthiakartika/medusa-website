import Image from "next/image";
import Reveal from "@/components/Reveal";

/**
 * The site's page header, for the pages that are not services.
 *
 * `components/ServicePage` builds its own because it has a price card to hang
 * beside the title; blog, contact, careers, commercial and the location index
 * all want the same band without one, and were opening on a bare heading
 * against flat black instead. Livery stripes, one gold light source and the
 * diagonal that every other header on the site cuts.
 */
export default function PageHero({
  title,
  lede,
  introHtml,
  children,
  aside,
  image,
}: {
  title: string;
  /** Standfirst, set in the gold condensed face under the title. */
  lede?: string;
  /** Opening paragraphs, as the source wrote them. */
  introHtml?: string[];
  /** Anything that belongs under the copy — a row of links, say. */
  children?: React.ReactNode;
  /** A card or picture beside the copy, on wide screens. */
  aside?: React.ReactNode;
  /** The photograph the source puts behind this header, where it has one. */
  image?: string;
}) {
  /*
    Pages whose source gives the header nothing but a title — /blog, /gift-card,
    /terms-and-conditions — should not hold a 620px band open around one line
    of type. The floor only applies when there is something under the title.
  */
  const roomy = Boolean(lede || introHtml?.length || children || aside);

  return (
    <section
      className={`cut-bottom relative flex w-full items-center overflow-hidden bg-ink-panel pt-[150px] lg:pt-[200px] ${
        roomy
          ? "pb-[calc(var(--cut)+3.5rem)] lg:min-h-[620px]"
          : // Nothing under the title: clear the diagonal and stop.
            "pb-[calc(var(--cut)+1rem)]"
      }`}
    >
      {image ? (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-center" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(78deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.82)_48%,rgba(0,0,0,0.58)_100%)]"
          />
        </>
      ) : (
        <>
          <div aria-hidden className="livery absolute inset-0 opacity-70" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 62% at 80% 36%, rgba(237,179,38,0.18) 0%, rgba(193,146,49,0.05) 46%, transparent 76%)",
            }}
          />
        </>
      )}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),transparent)]"
      />

      <div className="shell relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          <div className={aside ? "lg:col-span-7" : "lg:col-span-9"}>
            <Reveal>
              <span className="hero-rule speed-rule" aria-hidden />
            </Reveal>

            <Reveal delay={1}>
              <h1 className="mt-7 max-w-[20ch] text-[clamp(30px,4.7vw,52px)] leading-[1.02] text-white">
                {title}
              </h1>
            </Reveal>

            {lede && (
              <Reveal delay={2}>
                <p className="mt-6 max-w-[46ch] font-[family-name:var(--font-sub)] text-[17px] leading-[1.35] text-gold uppercase lg:text-[19px]">
                  {lede}
                </p>
              </Reveal>
            )}

            {introHtml?.map((html, i) => (
              <Reveal key={i} delay={3 + i}>
                <p
                  className="mt-5 max-w-[62ch] text-[16px] leading-[27px] font-normal text-white/80 [&_a]:text-gold [&_strong]:font-semibold [&_strong]:text-white lg:text-[16.5px]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </Reveal>
            ))}

            {children && <Reveal delay={5}>{children}</Reveal>}
          </div>

          {aside && (
            <Reveal delay={5} className="lg:col-span-5 lg:justify-self-end">
              {aside}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
