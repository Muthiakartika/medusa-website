"use client";

import { useEffect } from "react";
import Icon from "@/components/Icon";
import { BOOK_URL, type Included } from "@/lib/site";

/**
 * The full inclusions list for a package. A dialog is right here: the lists run
 * to forty-odd lines and the reader is comparing them against a decision they
 * are part-way through, so the page underneath should stay put.
 */
export default function IncludedDialog({
  data,
  onClose,
}: {
  data: Included;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/90 p-4 py-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={data.title}
    >
      <div
        className="relative w-full max-w-[760px] overflow-hidden rounded-[16px] bg-[#0d0d0d] shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <span aria-hidden className="block h-[5px] w-full bg-gold" />

        <div className="p-8 sm:p-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-7 right-6 text-white/60 transition-colors hover:text-gold"
          >
            <Icon name="close" size={26} />
          </button>

          <h2 className="pr-10 text-[26px] leading-[1.05] text-gold sm:text-[32px]">
            {data.title}
          </h2>
          {data.subtitle && (
            <h4 className="mt-2 text-[18px] text-white">{data.subtitle}</h4>
          )}
          {data.scope && (
            <p className="mt-1 text-[15px] font-normal text-white/70">{data.scope}</p>
          )}
          {data.price && (
            <p className="mt-2 text-[16px] font-bold text-gold">{data.price}</p>
          )}

          {data.body.map((b, i) => (
            <p
              key={i}
              className="measure mt-4 text-[15px] leading-[25px] font-normal text-white/80"
              dangerouslySetInnerHTML={{
                __html: b.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>'),
              }}
            />
          ))}

          {data.groups.length > 0 && (
            <>
              <p className="mt-8 font-[family-name:var(--font-sub)] text-[13px] tracking-[0.18em] text-white/50 uppercase">
                This service includes
              </p>
              <div className="mt-5 grid gap-8 sm:grid-cols-2">
                {data.groups.map((g, i) => (
                  <div key={i}>
                    {g.heading && (
                      <h4 className="mb-3 text-[17px] text-gold">{g.heading}</h4>
                    )}
                    <ul className="space-y-2">
                      {g.items.map((it) => (
                        <li
                          key={it}
                          className="flex gap-2.5 text-[14px] leading-[21px] font-normal text-white/80"
                        >
                          <Icon
                            name="check"
                            size={15}
                            strokeWidth={2.4}
                            className="mt-[3px] shrink-0 text-gold"
                          />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}

          <a href={BOOK_URL} className="btn btn-gold mt-10 rounded-full">
            Book Now
            <Icon name="arrow" size={18} className="ml-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
