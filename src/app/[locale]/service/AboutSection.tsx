"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { renderTextWithIpHintWordmark } from "@/components/IpHintWordmark";

export default function AboutSection() {
  const t = useTranslations("services.about");

  return (
    <section className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-32 xl:py-36">
      {/* Dotted background pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, #e6e6e6 1.6px, transparent 1.6px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Content row */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        {/* Left decorative icon */}
        <div className="hidden w-32 flex-shrink-0 sm:block lg:w-40">
          <Image
            src="/services/sec1_logo1.svg"
            alt=""
            width={160}
            height={160}
            className="h-auto w-full object-contain"
            aria-hidden="true"
          />
        </div>

        {/* Center text */}
        <div className="flex-1 text-center px-4 sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {renderTextWithIpHintWordmark(t("title"))}
          </h2>
          <p className="mt-3 text-base font-semibold text-gray-800 sm:text-lg">
            {renderTextWithIpHintWordmark(t("subtitle"))}
          </p>
        </div>

        {/* Right decorative icon */}
        <div className="hidden w-28 flex-shrink-0 sm:block lg:w-36">
          <Image
            src="/services/sec1_logo2.svg"
            alt=""
            width={140}
            height={140}
            className="h-auto w-full object-contain"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Mobile: show icons below text */}
      <div className="relative mx-auto mt-8 flex justify-around px-10 sm:hidden">
        <Image
          src="/services/sec1_logo1.svg"
          alt=""
          width={80}
          height={80}
          className="h-auto w-20 object-contain"
          aria-hidden="true"
        />
        <Image
          src="/services/sec1_logo2.svg"
          alt=""
          width={80}
          height={80}
          className="h-auto w-20 object-contain"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
