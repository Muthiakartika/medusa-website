"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * A GIF that has a recording here plays as one. The source ships the booking
 * phone — a screen recording of the booking flow — as a 26.4 MB GIF, 627
 * frames over 51.5 seconds, which every visitor who scrolled that far
 * downloaded whole. The same frames at the same timing are 1.4 MB of H.264.
 *
 * Three files stand in for it, all cut from the GIF itself, and all framing
 * the phone alone: the GIF stands it in the middle of a transparent
 * 1000x1000 canvas, which left the handset at 45% of whatever box it was
 * given — too small, in the repo owner's words, "agak besarin".
 * - `still` — frame 0. It is the in-flow image, so the alt text and the
 *   no-JS picture are the GIF's, and it shows until the video is playing.
 * - `video` — the same box. A video has no alpha, so the corners outside the
 *   handset are filled with the rim's own colour…
 * - `mask` — …and cut away again by the GIF's own silhouette, which is what
 *   lets one file sit on the gold band and on the ink one.
 */
const LOOPS: Record<string, { still: string; video: string; mask: string; w: number; h: number }> =
  {
    "/assets/2024/03/phone_14_01_Converted__1.gif": {
      still: "/assets/2024/03/phone_14_01_Converted__1-phone.webp",
      video: "/assets/2024/03/phone_14_01_Converted__1.mp4",
      mask: "/assets/2024/03/phone_14_01_Converted__1-mask.png",
      // The phone's box on the GIF's canvas, 912 rather than 911 tall
      // because 4:2:0 video wants even dimensions.
      w: 452,
      h: 912,
    },
  };

/**
 * `src` as a looping video when `LOOPS` has a recording of it, and as a plain
 * image otherwise.
 *
 * The video loads and plays only near the screen, the way `MapEmbed` holds
 * the map back, and pauses when it leaves. Anywhere it cannot play — no JS,
 * Low Power Mode refusing `play()` — the still is the picture.
 */
export default function GifLoop({
  src,
  alt,
  width,
  height,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const loop = LOOPS[src];
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver !== "function") return;

    // React sets `muted` as a property and never as an attribute, and iOS
    // only lets a muted video start without a tap.
    video.muted = true;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }
      },
      { rootMargin: "500px" },
    );

    io.observe(video);
    return () => io.disconnect();
  }, []);

  if (!loop) {
    return (
      <Image src={src} alt={alt} width={width} height={height} unoptimized className={className} />
    );
  }

  const mask = `url(${loop.mask})`;

  return (
    <div className={`relative ${className}`}>
      <Image
        src={loop.still}
        alt={alt}
        width={loop.w}
        height={loop.h}
        unoptimized
        className="h-auto w-full"
      />
      <video
        ref={ref}
        src={loop.video}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 h-full w-full ${playing ? "" : "opacity-0"}`}
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      />
    </div>
  );
}
