import type { Metadata } from "next";
import {
  Audiowide,
  Bungee,
  Exo_2,
  Nunito_Sans,
  Open_Sans,
  Oswald,
} from "next/font/google";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${bungee.variable} ${exo2.variable} ${oswald.variable} ${openSans.variable} ${nunitoSans.variable} ${audiowide.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-ink">{children}</body>
    </html>
  );
}
