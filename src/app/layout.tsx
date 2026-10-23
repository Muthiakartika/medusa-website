import type { Metadata } from "next";
import {
  Audiowide,
  Bungee,
  Exo_2,
  Nunito_Sans,
  Open_Sans,
  Oswald,
} from "next/font/google";
import PromoPopup from "@/components/PromoPopup";
import "./globals.css";

/* The live site serves these six families via fonts.bunny.net.
   next/font/google self-hosts the identical files. */
const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * Incremental Static Regeneration, for every route under this layout.
 *
 * Set here rather than on 255 page files: a `revalidate` on a layout is the
 * default for its whole subtree, and the lowest value across a route wins, so
 * a page that needs to refresh faster can still say so itself.
 *
 * What it buys, concretely:
 *
 * - Pages are served from the prerender cache and revalidated in the
 *   background at most once an hour, so a visitor never waits on a render.
 * - Next sends `Cache-Control: s-maxage=3600, stale-while-revalidate` with
 *   them, which is what a CDN in front of this needs in order to hold them.
 * - `revalidatePath` can flush one page, or all of them, without a redeploy —
 *   see `app/api/revalidate/route.ts`.
 *
 * An hour rather than a minute because the content behind these pages is a
 * build artefact (`src/content/pages.json`), not a live feed: see the note in
 * PROJECT.md about what a regeneration can and cannot pick up.
 *
 * Development ignores this entirely — `next dev` re-renders every request.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  metadataBase: new URL("https://medusaautodetailing.co.uk"),
  title:
    "Mobile Car Wash, Mobile Valeting & Detailing London – Medusa Auto Detailing",
  description:
    "Medusa Auto Detailing are London's Premium Mobile Car Detailing & Valeting service. We come to you, whether you're at home or work. Book Now!",
  alternates: { canonical: "/" },
  icons: {
    icon: "/assets/2022/01/cropped-d-32x32.png",
    apple: "/assets/2022/01/cropped-d-180x180.png",
  },
  openGraph: {
    locale: "en_GB",
    type: "website",
    siteName: "Mobile Car Detailing & Valeting",
    title:
      "Mobile Car Wash, Mobile Valeting & Detailing London – Medusa Auto Detailing",
    description:
      "Medusa Auto Detailing are London's Premium Mobile Car Detailing & Valeting service. We come to you, whether you're at home or work. Book Now!",
    url: "/",
    images: [
      {
        url: "/assets/2024/10/Untitled-design-2.webp",
        width: 1650,
        height: 1275,
        type: "image/webp",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  /* No Ahrefs verification tag. It was here while the deployment lived on a
     *.vercel.app subdomain, where the TXT-record method was not open to us.
     Since 2026-09-26 the property is verified by a TXT record on the domain
     itself (Cloudflare DNS), so the tag went. Ahrefs re-checks ownership
     before each crawl: that record has to stay. */
};

/**
 * Sends a visitor on a mirror domain to the same page on the real one.
 *
 * Three domains re-serve this site live (PROJECT.md §14), and they fetch it
 * under our own hostname, so nothing on the server can tell their traffic
 * from a visitor's. The browser is the one place the borrowed hostname shows,
 * so this runs there, inline in <head>, before the first paint.
 *
 * - **The hostname is joined at run time.** The mirrors string-replace it in
 *   every body they relay; written out whole, this would become a check of the
 *   mirror against itself, and pass.
 * - **Path, query and hash go with the visitor**, so a UTM tag survives.
 * - **The hosts it lets alone** are this site's own, local development (by
 *   name, by LAN address, or through the ngrok tunnel `allowedDevOrigins`
 *   opens), Vercel previews, and Google Translate's proxy, which is a reader
 *   asking for this page in another language.
 * - **`data-cfasync="false"`** keeps Cloudflare's Rocket Loader, on whatever
 *   zone serves the copy, from deferring it past the paint.
 *
 * Friction, not a lock: an operator who notices can strip it.
 */
const DOMAIN_GUARD = `(function(){
var c=["medusaautodetailing","co","uk"].join("."),h=location.hostname;
if(h===c||h==="www."+c||h==="localhost"||h==="127.0.0.1"||h==="[::1]"||/\\.(vercel\\.app|local|ngrok-free\\.app|translate\\.goog)$/.test(h)||/^(10|192\\.168|172\\.(1[6-9]|2\\d|3[01]))\\./.test(h))return;
location.replace("https://"+c+location.pathname+location.search+location.hash);
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${bungee.variable} ${exo2.variable} ${oswald.variable} ${openSans.variable} ${nunitoSans.variable} ${audiowide.variable} antialiased`}
    >
      <head>
        <script
          data-cfasync="false"
          dangerouslySetInnerHTML={{ __html: DOMAIN_GUARD }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-ink">
        {children}
        <PromoPopup />
      </body>
    </html>
  );
}
