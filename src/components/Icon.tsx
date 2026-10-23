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
  | "copy"
  | "phone"
  | "mail"
  | "clock"
  | "shield"
  | "star"
  | "gauge"
  | "spark"
  | "pin"
  | "plus"
  | "minus"
  | "info"
  | "camera"
  | "van"
  | "droplet"
  | "layers"
  | "calendar"
  | "whatsapp"
  | "sign"
  | "sticker"
  | "decal"
  | "type"
  | "tag"
  | "refresh"
  | "key"
  | "search"
  | "eye"
  | "target"
  | "vacuum"
  | "brush"
  | "seat"
  | "seat-edge"
  | "carpet"
  | "mat"
  | "footwell"
  | "boot"
  | "paw"
  | "smoke"
  | "cup"
  | "wind"
  | "ozone"
  | "filter"
  | "warning"
  | "mould";

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
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 5.5V5A1.5 1.5 0 0 0 14 3.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h.5" />
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
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.2" />
      <path d="M12 7.8v.1" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5a2 2 0 0 1 2-2h1.8l1.4-2h5.6l1.4 2H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5Z" />
      <circle cx="12" cy="12.6" r="3.4" />
    </>
  ),
  van: (
    <>
      <path d="M4.6 16.5H3.5V7.3c0-.7.6-1.3 1.3-1.3H14v10.5" />
      <path d="M14 9h3.6l3 3.4v4.1h-1.1" />
      <path d="M9.4 16.5h5.2" />
      <circle cx="7" cy="16.8" r="2.1" />
      <circle cx="17" cy="16.8" r="2.1" />
    </>
  ),
  droplet: <path d="M12 3.8s6 6.4 6 10.4a6 6 0 0 1-12 0c0-4 6-10.4 6-10.4Z" />,
  layers: (
    <>
      <path d="m12 4 8.5 4.3-8.5 4.3-8.5-4.3L12 4Z" />
      <path d="m3.5 12.2 8.5 4.3 8.5-4.3" />
      <path d="m3.5 16 8.5 4.3 8.5-4.3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
    </>
  ),
  /* A speech bubble round a handset — WhatsApp's own mark reduced to the
     set's single stroke, for the buttons that open it. */
  whatsapp: (
    <>
      <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3.8 20.2l1.4-4.1a8.2 8.2 0 1 1 15-4.4Z" />
      <path d="M9.4 8.3c.3-.4.8-.4 1 .1l.6 1.4c.1.3 0 .6-.2.8l-.5.5a5.2 5.2 0 0 0 2.6 2.6l.5-.5c.2-.2.5-.3.8-.2l1.4.6c.5.2.5.7.1 1-.8.7-1.9.9-2.9.5a7.6 7.6 0 0 1-3.9-3.9c-.4-1-.2-2.1.5-2.9Z" />
    </>
  ),
  /* The signage removal page's set (2026-10-06): what comes off a vehicle,
     and why it comes off. */
  sign: (
    <>
      <rect x="3.5" y="4" width="17" height="11" rx="1.5" />
      <path d="M7 8h10" />
      <path d="M7 11h6" />
      <path d="M8 15v5.5" />
      <path d="M16 15v5.5" />
    </>
  ),
  sticker: (
    <>
      <path d="M14.5 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5h12A2.5 2.5 0 0 1 20.5 6v8.5l-6 6Z" />
      <path d="M14.5 20.5V17a2.5 2.5 0 0 1 2.5-2.5h3.5" />
    </>
  ),
  decal: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path
        d="m12 7.4 1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4L12 7.4Z"
        strokeLinejoin="round"
      />
    </>
  ),
  type: (
    <>
      <path d="M5 7.5v-3h14v3" />
      <path d="M12 4.5v15" />
      <path d="M9 19.5h6" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 11.6V5A1.5 1.5 0 0 1 5 3.5h6.6a1.5 1.5 0 0 1 1.06.44l7.4 7.4a1.5 1.5 0 0 1 0 2.12l-6.6 6.6a1.5 1.5 0 0 1-2.12 0l-7.4-7.4a1.5 1.5 0 0 1-.44-1.06Z" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 0 1-13.4 4.6" />
      <path d="M4.5 12a7.5 7.5 0 0 1 13.4-4.6" />
      <path d="M18.2 3.5v4h-4" />
      <path d="M5.8 20.5v-4h4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15.5" r="4.5" />
      <path d="m11.2 12.3 8.3-8.3" />
      <path d="m16.4 7.1 2.6 2.6" />
      <path d="m14 9.5 2 2" />
    </>
  ),
  /* The pet hair removal page's set (2026-10-06): the six steps, and the
     parts of an interior the add-on reaches. */
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12s3.4-6.2 9.2-6.2 9.2 6.2 9.2 6.2-3.4 6.2-9.2 6.2S2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 11.9v.2" />
    </>
  ),
  /* A floor head on its wand. */
  vacuum: (
    <>
      <path d="M18.5 3.8 12.6 16.5" />
      <path d="m17 3.2 3 1.3" />
      <path d="M4 18.6a2.1 2.1 0 0 1 2.1-2.1h8.3a2.1 2.1 0 0 1 2.1 2.1v1.4H4v-1.4Z" />
    </>
  ),
  /* A detailing scrub brush: handle, block, bristles down. */
  brush: (
    <>
      <path d="M8.5 9.5V7a2 2 0 0 1 2-2H18" />
      <rect x="4" y="9.5" width="13.5" height="4.5" rx="1.5" />
      <path d="M6.5 14v4.5" />
      <path d="M9.5 14v4.5" />
      <path d="M12.5 14v4.5" />
      <path d="M15.5 14v4.5" />
    </>
  ),
  /* A car seat in profile: backrest, cushion, runners. */
  seat: (
    <>
      <path d="M8.2 13.5 6.3 6.3a2 2 0 0 1 1.5-2.5l.8-.2a2 2 0 0 1 2.4 1.5l1.9 8.4" />
      <path d="M6.6 13.5h11.2a1.7 1.7 0 0 1 1.7 1.7v.6a1.7 1.7 0 0 1-1.7 1.7H8.4a1.8 1.8 0 0 1-1.8-1.8v-2.2Z" />
      <path d="M9.5 17.5v3" />
      <path d="M16.5 17.5v3" />
    </>
  ),
  /* Where back meets cushion, and a crevice tool working into it. */
  "seat-edge": (
    <>
      <path d="M4.5 3.5v12a3 3 0 0 0 3 3h13" />
      <path d="M14.4 8.6 9 14a.9.9 0 0 0 0 1.3.9.9 0 0 0 1.3 0l5.4-5.4" />
      <path d="M15 9.2c1.8-1.8 3.2-3.6 5.5-5.2" />
    </>
  ),
  /* A cut of carpet with its pile standing up. */
  carpet: (
    <>
      <rect x="3.5" y="14.5" width="17" height="5.5" rx="1.2" />
      <path d="M6 14.5V11" />
      <path d="M9 14.5V9" />
      <path d="M12 14.5V11" />
      <path d="M15 14.5V9" />
      <path d="M18 14.5V11" />
    </>
  ),
  /* A ribbed mat lying on the floor, in perspective. */
  mat: (
    <>
      <path d="M7 4.5h12.5L17 19.5H4.5L7 4.5Z" strokeLinejoin="round" />
      <path d="M8.3 8.5h8.5" />
      <path d="M7.8 12h8.4" />
      <path d="M7.2 15.5h8.5" />
    </>
  ),
  /* A shoe on the floor — where the feet, and the hair, go. */
  footwell: (
    <>
      <path d="M3.5 17.5v-2.2c0-.9.6-1.6 1.5-1.8l3.8-.9 2.6-3.6h2.4l.7 2.4c1.9.6 4.3 1.1 5.6 1.6a2 2 0 0 1 1.4 1.9v2.6H3.5Z" />
      <path d="M3.5 20.5h17" />
      <path d="m11.6 12.6 1.4-.4" />
    </>
  ),
  /* A car from behind, tailgate lifted. */
  boot: (
    <>
      <path d="M8.2 9.5 9.6 3.8h4.8l1.4 5.7" />
      <path d="M5.8 13.5 7.3 9.5h9.4l1.5 4" />
      <path d="M4 15a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 15v3a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18v-3Z" />
      <path d="M6.6 16.5h1.6" />
      <path d="M15.8 16.5h1.6" />
    </>
  ),
  paw: (
    <>
      <path d="M8.2 16.8c0-2.4 1.7-4.5 3.8-4.5s3.8 2.1 3.8 4.5c0 1.6-1.3 2.6-2.5 2.3-.5-.1-.9-.3-1.3-.3s-.8.2-1.3.3c-1.2.3-2.5-.7-2.5-2.3Z" />
      <ellipse cx="6.6" cy="10.6" rx="1.5" ry="2" />
      <ellipse cx="9.9" cy="6.8" rx="1.5" ry="2.1" />
      <ellipse cx="14.1" cy="6.8" rx="1.5" ry="2.1" />
      <ellipse cx="17.4" cy="10.6" rx="1.5" ry="2" />
    </>
  ),
  /* The odour & ozone treatment page's set (2026-10-06): what a smell comes
     from, and the steps that treat it. */
  smoke: (
    <>
      <rect x="3" y="15" width="18" height="3.6" rx="1" />
      <path d="M16.3 15v3.6" />
      <path d="M8 12.5c0-1.6 1.6-1.9 1.6-3.5S8 7.1 8 5.5" />
      <path d="M12.2 12.5c0-1.6 1.6-1.9 1.6-3.5s-1.6-1.9-1.6-3.5" />
    </>
  ),
  cup: (
    <>
      <path d="M4.5 10h11v4.3a4.7 4.7 0 0 1-4.7 4.7H9.2a4.7 4.7 0 0 1-4.7-4.7V10Z" />
      <path d="M15.5 11.4h1.3a2.3 2.3 0 0 1 0 4.6h-1.5" />
      <path d="M8.2 3.6c0 1 1 1.4 1 2.4s-1 1.4-1 2.4" />
      <path d="M11.8 3.6c0 1 1 1.4 1 2.4s-1 1.4-1 2.4" />
      <path d="M3.5 21h14" />
    </>
  ),
  wind: (
    <>
      <path d="M3.5 9h11a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M3.5 13h15a2.5 2.5 0 1 1-2.5 2.5" />
      <path d="M3.5 17h7" />
    </>
  ),
  /* O₃ — three atoms, bonded. */
  ozone: (
    <>
      <circle cx="12" cy="6.5" r="3" />
      <circle cx="6" cy="16.5" r="3" />
      <circle cx="18" cy="16.5" r="3" />
      <path d="m10.5 9.1-3 4.8" />
      <path d="m13.5 9.1 3 4.8" />
    </>
  ),
  /* A pleated cabin filter in its frame. */
  filter: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="m5.5 16 1.6-8 1.6 8 1.6-8 1.6 8 1.6-8 1.6 8 1.6-8 1.6 8" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 4.3 2.9 17.4a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4.3" />
      <path d="M12 17v.1" />
    </>
  ),
  /* Spores, clustered. */
  mould: (
    <>
      <circle cx="8" cy="8.5" r="2.6" />
      <circle cx="15.8" cy="7.6" r="1.9" />
      <circle cx="12.4" cy="15" r="3.2" />
      <circle cx="18.2" cy="15.6" r="1.5" />
      <circle cx="5.7" cy="16.2" r="1.4" />
    </>
  ),
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
