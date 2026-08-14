/**
 * The site's icon set. One 24px grid, one 1.75 stroke weight, round caps and
 * joins throughout, so marks read as a family rather than as found glyphs.
 * Everything inherits `currentColor`.
 */

export type IconName =
  | "check"
  | "arrow"
  | "play"
  | "chevron-left"
  | "chevron-right"
  | "close"
  | "phone"
  | "mail"
  | "clock"
  | "shield"
  | "star"
  | "gauge"
  | "spark"
  | "pin"
  | "plus"
  | "minus";

const PATHS: Record<IconName, React.ReactNode> = {
  check: <path d="m4 12.5 5 5L20 6.5" />,
  arrow: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  play: <path d="M7 4.5v15l13-7.5-13-7.5Z" strokeLinejoin="round" />,
  "chevron-left": <path d="m15 4-8 8 8 8" />,
  "chevron-right": <path d="m9 4 8 8-8 8" />,
  close: (
    <>
      <path d="m5 5 14 14" />
      <path d="m19 5-14 14" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  shield: <path d="M12 3.5 5 6.2v5.4c0 4.2 2.8 7.4 7 8.9 4.2-1.5 7-4.7 7-8.9V6.2l-7-2.7Z" />,
  star: (
    <path
      d="m12 4 2.5 5.2 5.5.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.5-.8L12 4Z"
      strokeLinejoin="round"
    />
  ),
  gauge: (
    <>
      <path d="M4 17a9 9 0 1 1 16 0" />
      <path d="m12 13 4-3.5" />
      <circle cx="12" cy="14.5" r="1.6" />
    </>
  ),
  spark: (
    <path
      d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7-1.7 5.5-1.7-5.5-5.5-1.7L10.3 9 12 3.5Z"
      strokeLinejoin="round"
    />
  ),
  pin: (
    <>
      <path d="M19 10.5c0 5-7 10-7 10s-7-5-7-10a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10.3" r="2.6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
};

export default function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.75,
  variant = "outline",
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** `solid` fills the mark instead of stroking it — for play and star. */
  variant?: "outline" | "solid";
}) {
  const solid = variant === "solid";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? "currentColor" : "none"}
      stroke={solid ? "none" : "currentColor"}
      strokeWidth={solid ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
