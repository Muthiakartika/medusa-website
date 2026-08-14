import Reveal from "@/components/Reveal";

/**
 * Every section opens the same way: a short gold rule, the heading, then an
 * optional lede held to a readable measure. The rule does the job an eyebrow
 * label used to — it marks the start without putting a second, competing line
 * of text above the heading.
 *
 * `tone="gold"` switches the type to ink for the gold bands, where white would
 * measure 2.83:1 against 7.42:1 for ink.
 */
export default function SectionHead({
  title,
  lede,
  tone = "dark",
  align = "start",
  className = "",
}: {
  title: string;
  lede?: string;
  tone?: "dark" | "gold";
  align?: "start" | "center";
  className?: string;
}) {
  const onGold = tone === "gold";
  const centered = align === "center";

  return (
    <div className={`${centered ? "flex flex-col items-center text-center" : ""} ${className}`}>
      <Reveal>
        <span
          aria-hidden
          className={`block h-[3px] w-[52px] rounded-full ${onGold ? "bg-ink" : "bg-gold"}`}
        />
      </Reveal>

      <Reveal delay={1}>
        <h2
          className={`mt-6 text-[30px] leading-[1.02] sm:text-[40px] lg:text-[50px] ${
            onGold ? "text-ink" : "text-white"
          }`}
        >
          {title}
        </h2>
      </Reveal>

      {lede && (
        <Reveal delay={2}>
          <p
            className={`measure mt-5 text-[16px] leading-[27px] font-normal ${
              centered ? "mx-auto" : ""
            } ${onGold ? "text-ink/80" : "text-white/65"}`}
          >
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}
