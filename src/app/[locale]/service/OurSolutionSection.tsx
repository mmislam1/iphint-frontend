"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface FeatureItem {
  icon: string;
  labelKey: string;
  alt: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: "/services/sec3_brand.svg",
    labelKey: "features.brandProtection",
    alt: "Brand Protection icon",
  },
  {
    icon: "/services/sec3_content.svg",
    labelKey: "features.contentProtection",
    alt: "Content Protection icon",
  },
  {
    icon: "/services/sec3_infringement.svg",
    labelKey: "features.infringementPrevention",
    alt: "Infringement Prevention icon",
  },
  {
    icon: "/services/sec3_copyright.svg",
    labelKey: "features.copyrightManagement",
    alt: "Copyright Management icon",
  },
];

export default function OurSolutionSection() {
  const t = useTranslations("services.ourSolution");

  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm font-semibold text-gray-800 sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-10 grid grid-cols-2 gap-8 sm:mt-12 sm:grid-cols-4 sm:gap-6">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                <Image
                  src={feature.icon}
                  alt={feature.alt}
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="whitespace-pre-line text-xs font-semibold text-gray-900 sm:text-sm">
                {t(feature.labelKey)}
              </span>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-10 rounded-lg bg-gray-100 p-5 sm:mt-12 sm:p-6">
          <p className="text-sm font-bold text-gray-900 sm:text-base">
            {t("infoBoxTitle")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">
            {t("infoBoxBody")}
          </p>
        </div>
      </div>
    </section>
  );
}
