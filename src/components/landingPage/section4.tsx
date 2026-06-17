"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { renderTextWithIpHintWordmark } from "@/components/IpHintWordmark";

const SLIDES = [
  { key: "artist",    file: "/sec4_main.svg" },
  { key: "model",     file: "/sec4_model.svg" },
  { key: "creator",   file: "/sec4_creator.svg" },
  { key: "ecommerce", file: "/sec4_ecommerce.svg" },
];

// [clone-of-last, ...real slides, clone-of-first] for seamless infinite loop
const EXTENDED = [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]];
const REAL_COUNT = SLIDES.length;
const AUTO_SLIDE_INTERVAL = 4000;

export default function Section4() {
  const t = useTranslations("Landing.section4");

  // currentIdx 1 = first real slide, REAL_COUNT = last real
  const [currentIdx, setCurrentIdx] = useState(1);
  // Start with no transition so the initial transform is applied instantly (no flash on cold load)
  const [animated, setAnimated] = useState(false);
  const [paused, setPaused] = useState(false);

  // 0-based real index for tabs / dots / progress bar
  const activeIndex =
    currentIdx === 0
      ? REAL_COUNT - 1
      : currentIdx >= EXTENDED.length - 1
      ? 0
      : currentIdx - 1;

  const goNext = useCallback(() => {
    setAnimated(true);
    setCurrentIdx((p) => p + 1);
  }, []);

  const goPrev = useCallback(() => {
    setAnimated(true);
    setCurrentIdx((p) => p - 1);
  }, []);

  const goToReal = useCallback((realIdx: number) => {
    setAnimated(true);
    setCurrentIdx(realIdx + 1);
    setPaused(true);
  }, []);

  // When strip lands on a clone, jump instantly to the real counterpart
  const handleTransitionEnd = useCallback(() => {
    if (currentIdx === 0) {
      setAnimated(false);
      setCurrentIdx(REAL_COUNT);
    } else if (currentIdx === EXTENDED.length - 1) {
      setAnimated(false);
      setCurrentIdx(1);
    }
  }, [currentIdx]);

  // Re-enable animation one frame after the instant jump
  useEffect(() => {
    if (!animated) {
      const raf = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [animated]);

  // Auto-slide; resumes 8s after last manual interaction
  useEffect(() => {
    if (paused) {
      const timer = setTimeout(() => setPaused(false), AUTO_SLIDE_INTERVAL * 2);
      return () => clearTimeout(timer);
    }
    const id = setInterval(goNext, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [paused, goNext]);

  // Unified pointer tracking for touch + mouse drag
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);

  const onDragStart = (x: number, y: number) => {
    pointerStartX.current = x;
    pointerStartY.current = y;
    setPaused(true);
  };

  const onDragEnd = (x: number, y: number) => {
    if (pointerStartX.current === null) return;
    const dx = x - pointerStartX.current;
    const dy = Math.abs(y - (pointerStartY.current ?? y));
    pointerStartX.current = null;
    pointerStartY.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < dy) return;
    if (dx < 0) goNext(); else goPrev();
  };

  return (
    <section className="min-h-[500px] w-full bg-[#fafafa] py-20 font-sans text-slate-900">
      <div className="w-full px-6 lg:px-16 xl:px-24 flex flex-col gap-12">

        {/* Header */}
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {renderTextWithIpHintWordmark(t("title"))}
          </h2>
          <p className="text-sm md:text-base font-medium text-slate-700 max-w-3xl mx-auto leading-relaxed">
            {renderTextWithIpHintWordmark(t("description"))}
          </p>
        </div>

        {/* Swipeable content grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-0 items-stretch cursor-grab active:cursor-grabbing select-none touch-pan-y"
          onTouchStart={(e) => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
          onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
          onMouseUp={(e) => onDragEnd(e.clientX, e.clientY)}
          onMouseLeave={() => { pointerStartX.current = null; }}
        >
          {/* Image column — absolute-positioned slides, no h-full dependency */}
          <div
            className="relative min-h-72 lg:min-h-[440px] overflow-hidden rounded-2xl lg:rounded-none lg:mr-10 bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:24px_24px]"
            onTransitionEnd={handleTransitionEnd}
          >
            {EXTENDED.map((item, i) => (
              <div
                key={`img-${i}`}
                className={`absolute inset-0 flex items-center justify-center p-8${animated ? " transition-transform duration-500 ease-in-out" : ""}`}
                style={{ transform: `translateX(${(i - currentIdx) * 100}%)` }}
              >
                <Image
                  src={item.file}
                  alt={t(`items.${item.key}.title`)}
                  width={380}
                  height={380}
                  className="w-full max-w-[55%] object-contain"
                  priority={i < 2}
                />
              </div>
            ))}
          </div>

          {/* Text column */}
          <div className="flex flex-col justify-center gap-5">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
              {SLIDES.map((item, idx) => (
                <button
                  key={item.key}
                  onClick={() => goToReal(idx)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                    idx === activeIndex
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t(`items.${item.key}.title`)}
                </button>
              ))}
            </div>

            {/* Text slides — absolute-positioned, same pattern as image column */}
            <div className="relative overflow-hidden">
              {/* Invisible spacer: reserves height equal to the tallest text item */}
              <div className="flex flex-col gap-3 pr-4 invisible pointer-events-none select-none" aria-hidden="true">
                <h3 className="text-2xl font-semibold leading-snug">{t(`items.${SLIDES[activeIndex].key}.heading`)}</h3>
                <p className="text-sm leading-relaxed">{t(`items.${SLIDES[activeIndex].key}.description`)}</p>
              </div>
              {EXTENDED.map((item, i) => (
                <div
                  key={`txt-${i}`}
                  className={`absolute inset-x-0 top-0 flex flex-col gap-3 pr-4${animated ? " transition-transform duration-500 ease-in-out" : ""}`}
                  style={{ transform: `translateX(${(i - currentIdx) * 100}%)` }}
                >
                  <h3 className="text-2xl font-semibold leading-snug">
                    {renderTextWithIpHintWordmark(t(`items.${item.key}.heading`))}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {renderTextWithIpHintWordmark(t(`items.${item.key}.description`))}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-[3px] w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((activeIndex + 1) / REAL_COUNT) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToReal(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-6 bg-slate-900"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
