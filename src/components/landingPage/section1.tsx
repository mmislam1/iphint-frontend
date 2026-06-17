// components/landing/Hero.tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import ContactSalesButton from "@/components/contact/ContactSalesButton";
import { renderTextWithIpHintWordmark } from "@/components/IpHintWordmark";

type Section1Props = {
  locale: "en" | "kr";
};

export default function Section1({ locale }: Section1Props) {
  const t = useTranslations("Landing.section1");
  const heroImageSrc = locale === "kr" ? "/sec1_svg_kr.svg" : "/sec1_svg_en.svg";
  const ctaButtons = (
    <>
      <Link href="/signup" className="btn-primary btn-lg">
        {t("primaryCta")}
      </Link>

      <ContactSalesButton className="btn-secondary btn-lg">
        {t("secondaryCta")}
      </ContactSalesButton>
    </>
  );

  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:gap-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-6 lg:px-10 xl:gap-8 xl:px-0">
        
        {/* LEFT CONTENT */}
        <div className="space-y-6 lg:w-[calc(100%-50px)] lg:pr-4">
          <h1 className="typo-t3 whitespace-pre-line text-black md:[font-family:var(--font-google-sans)] md:text-[3.75rem] md:leading-[4.5rem] md:tracking-[-0.02em] md:font-bold">
            {renderTextWithIpHintWordmark(t("title"))}
          </h1>

          <h2 className="typo-t7 text-black md:text-[1.5rem] md:leading-[1.875rem] md:font-bold">
            {renderTextWithIpHintWordmark(t("subtitle"))}
          </h2>

          <p className="typo-t7-r max-w-xl text-gray-600 md:text-[1rem] md:leading-[1.5rem]">
            {renderTextWithIpHintWordmark(t("description"))}
          </p>

          {/* CTA Buttons */}
          <div className="hidden flex-wrap gap-4 pt-4 md:flex">
            {ctaButtons}
          </div>
        </div>

        {/* RIGHT SVG */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative flex w-full max-w-[520px] items-center justify-center overflow-hidden rounded-[32px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#d7dbe0_2px,_transparent_2px)] [background-size:22px_22px]"
            />
            <Image
              src={heroImageSrc}
              alt={t("imageAlt")}
              width={520}
              height={520}
              priority
              className="relative z-10 h-auto w-full max-w-[520px] object-contain"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-2 md:hidden">
          {ctaButtons}
        </div>
      </div>
    </section>
  );
}