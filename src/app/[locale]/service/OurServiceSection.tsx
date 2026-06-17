"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

interface FeatureItem {
  icon: string;
  labelKey: string;
  alt: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: "/services/sec4_content_registration.svg",
    labelKey: "features.contentRegistration",
    alt: "Content Registration icon",
  },
  {
    icon: "/services/sec4_match_detection.svg",
    labelKey: "features.matchDetection",
    alt: "Match Detection icon",
  },
  {
    icon: "/services/sec4_dashboard_review.svg",
    labelKey: "features.dashboardReview",
    alt: "Dashboard Review icon",
  },
  {
    icon: "/services/sec4_alert.svg",
    labelKey: "features.instantAlert",
    alt: "Instant Alert icon",
  },
];

const BULLET_KEYS = [
  "bullets.0",
  "bullets.1",
  "bullets.2",
] as const;

export default function OurServiceSection() {
  const t = useTranslations("services.ourService");

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

        {/* Bullet points */}
        <ul className="mt-8 space-y-3 sm:mt-10">
          {BULLET_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-3">
              <Check
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-700"
                strokeWidth={2.5}
              />
              <span className="text-sm leading-relaxed text-gray-700 sm:text-base">
                {t(key)}
              </span>
            </li>
          ))}
        </ul>

        {/* Info box */}
        <div className="mt-8 rounded-lg bg-gray-100 p-5 sm:mt-10 sm:p-6">
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
