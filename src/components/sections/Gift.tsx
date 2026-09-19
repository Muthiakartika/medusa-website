import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";

/**
 * Padded top and bottom. It carried bottom padding only, running straight
 * on from the portfolio row above because both were the same black. The
 * portfolio is a gold band now — the client asked for the alternation — so
 * the seam is real and the card needs air above it.
 */
export default function Gift() {
  return (
    <section className="w-full bg-black py-16 lg:py-[104px]">
      <div className="shell">
        <div className="surface grid items-center gap-10 overflow-hidden p-8 lg:grid-cols-12 lg:p-12">
          <Reveal className="lg:col-span-7">
            <Image
              src="/assets/2021/12/templett_106394482.webp"
              alt="A Medusa Auto Detailing gift card"
              width={1024}
              height={512}
              sizes="(min-width: 1024px) 700px, 100vw"
              className="h-auto w-full rounded-[10px]"
            />
          </Reveal>

          <div className="lg:col-span-5">
            {/* Lede is the gift-card page's own copy, not new marketing. */}
            <SectionHead
              title="The Perfect Gift"
              lede="The gift card will be sent to the recipient with a unique code that they can use. They can select a date to book and we will come on that date."
            />
            <Reveal delay={3}>
              <Link href="/gift-card" className="btn btn-gold mt-8 rounded-full">
                Find Them Here
                <Icon name="arrow" size={18} className="ml-2.5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
