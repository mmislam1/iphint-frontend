"use client";

import Image from "next/image";
import { useRef, type WheelEvent } from "react";
import { useTranslations } from "next-intl";
import { renderTextWithIpHintWordmark } from "@/components/IpHintWordmark";

const testimonials = [
  {
    key: "artist",
    imageSrc: "/section5/img1.png",
  },
  {
    key: "ceo",
    imageSrc: "/section5/img2.png",
  },
  {
    key: "influencer",
    imageSrc: "/section5/img3.png",
  },
  {
    key: "artist",
    imageSrc: "/section5/img4.png",
  },
];

export default function Section5() {
  const t = useTranslations("Landing.section5");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) {
      return;
    }

    const { clientWidth } = scrollRef.current;
    const offset = Math.max(clientWidth * 0.75, 280);

    scrollRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = event.currentTarget;

    if (container.scrollWidth <= container.clientWidth) {
      return;
    }

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    container.scrollBy({ left: event.deltaY, behavior: "auto" });
  };

  return (
    <section className="w-full overflow-hidden bg-slate-50 py-14 sm:py-16 lg:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-14 lg:mb-16">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">{renderTextWithIpHintWordmark(t("title"))}</h2>
          <p className="mx-auto max-w-xl text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">
            {renderTextWithIpHintWordmark(t("subtitle"))}
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          <div
            ref={scrollRef}
            onWheel={handleWheel}
            className="grid grid-flow-col auto-cols-[88%] gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-px-4 scroll-smooth hide-scrollbar sm:auto-cols-[72%] sm:gap-5 md:auto-cols-[48%] md:gap-6 lg:auto-cols-[38%] xl:auto-cols-[31%] 2xl:auto-cols-[24%]"
          >
            {testimonials.map((item, idx) => (
              <article
                key={idx}
                className="flex min-w-0 snap-start flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 xl:p-10"
              >
                <div>
                  <div className="mb-4 md:mb-6">
                    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.5 0C2.46243 0 0 2.46243 0 5.5V11H7V5.5C7 4.67157 6.32843 4 5.5 4H4V0H5.5ZM19.5 0C16.4624 0 14 2.46243 14 5.5V11H21V5.5C21 4.67157 20.3284 4 19.5 4H18V0H19.5Z" fill="black"/>
                    </svg>
                  </div>
                  <h3 className="mb-3 text-lg font-bold leading-tight sm:text-xl">{renderTextWithIpHintWordmark(t(`testimonials.${item.key}.quote`))}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-slate-600 sm:text-base md:mb-10">{renderTextWithIpHintWordmark(t(`testimonials.${item.key}.content`))}</p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={item.imageSrc}
                      alt={t(`testimonials.${item.key}.author`)}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{renderTextWithIpHintWordmark(t(`testimonials.${item.key}.author`))}</p>
                    <p className="text-xs text-slate-500">{renderTextWithIpHintWordmark(t(`testimonials.${item.key}.subtext`))}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 md:hidden">
            {t("swipeHint")}
          </p>

          <div className="mt-6 hidden items-center justify-center gap-4 md:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 transition-colors hover:bg-gray-50"
              aria-label={t("scrollLeft")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 transition-colors hover:bg-gray-50"
              aria-label={t("scrollRight")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}