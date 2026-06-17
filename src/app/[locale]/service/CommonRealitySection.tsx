"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { renderTextWithIpHintWordmark } from "@/components/IpHintWordmark";

interface StatItem {
  valueKey: string;
  labelKey: string;
}

const STATS: StatItem[] = [
  { valueKey: "stats.unauthorizedCopies.value", labelKey: "stats.unauthorizedCopies.label" },
  { valueKey: "stats.imagesShared.value", labelKey: "stats.imagesShared.label" },
  { valueKey: "stats.manualTracking.value", labelKey: "stats.manualTracking.label" },
  { valueKey: "stats.unprotectedContent.value", labelKey: "stats.unprotectedContent.label" },
];

export default function CommonRealitySection() {
  const t = useTranslations("services.commonReality");

  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {renderTextWithIpHintWordmark(t("title"))}
          </h2>
          <p className="mt-3 text-sm font-semibold text-gray-800 sm:text-base">
            {renderTextWithIpHintWordmark(t("subtitle"))}
          </p>
        </div>

        {/* Stats grid */}
        <div className="mt-10 grid grid-cols-2 gap-y-8 sm:mt-12 sm:grid-cols-4 sm:gap-y-0">
          {STATS.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >
              <span className="text-4xl font-black text-gray-900 sm:text-5xl lg:text-6xl">
                {renderTextWithIpHintWordmark(t(stat.valueKey))}
              </span>
              <span className="mt-2 whitespace-pre-line text-xs font-semibold uppercase tracking-wide text-gray-700 sm:text-sm">
                {renderTextWithIpHintWordmark(t(stat.labelKey))}
              </span>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-10 rounded-lg bg-gray-100 p-5 sm:mt-12 sm:p-6">
          <p className="text-sm font-bold text-gray-900 sm:text-base">
            {renderTextWithIpHintWordmark(t("infoBoxTitle"))}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">
            {renderTextWithIpHintWordmark(t("infoBoxBody"))}
          </p>
        </div>

        {/* Source attribution */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs text-gray-500">
            <Info className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <span>{renderTextWithIpHintWordmark(t("source"))}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
