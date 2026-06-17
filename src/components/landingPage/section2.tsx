// components/landing/Section2.tsx
import Image from "next/image";
import { useTranslations } from "next-intl";

type Feature = {
  key: string;
  icon: string;
  iconWidth?: number;
  iconHeight?: number;
  iconClassName?: string;
};

const features: Feature[] = [
  {
    key: "searchEngines",
    icon: "/sec2_searchEngines.svg",
  },
  {
    key: "socialMedia",
    icon: "/sec2_socialMedia.svg",
  },
  {
    key: "harmfulSites",
    icon: "/sec2_harmfulSites.svg",
  },
  {
    key: "streamingSites",
    icon: "/sec2_streamingSites.svg",
  },
  {
    key: "deepWeb",
    icon: "/sec2_deepWeb.svg",
  },
];

export default function Section2() {
  const t = useTranslations("Landing.section2");

  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        
        {/* Rounded Container */}
        <div className="bg-[#F8F8F8] rounded-[32px] px-6 md:px-12 py-12 md:py-16">
          
          {/* Heading */}
          <h2 className="mb-12 text-center text-black typo-t6 md:[font-family:var(--font-iphint)] md:text-[1.75rem] md:leading-[2.25rem] md:font-bold">
            {t("title")}
          </h2>

          {/* Features Grid */}
          <div className="
            grid 
            grid-cols-2 
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-5 
            gap-y-10 
            gap-x-6 
          ">
            {features.map((item, i) => (
              <div
                key={i}
                className={[
                  "flex flex-col items-center space-y-4 text-center",
                  features.length % 2 === 1 && i === features.length - 1 ? "col-span-2 md:col-span-1" : "",
                ].join(" ")}
              >
                
                {/* Icon */}
                <div className="flex h-[62px] w-[62px] items-center justify-center md:h-[120px] md:w-[120px]">
                  <Image
                    src={item.icon}
                    alt={t(`features.${item.key}.title`)}
                    width={item.iconWidth ?? 120}
                    height={item.iconHeight ?? 120}
                    className={item.iconClassName ?? "h-[62px] w-[62px] object-contain md:h-[120px] md:w-[120px]"}
                  />
                </div>

                {/* Title */}
                <h3 className="typo-t7 text-black font-bold md:[font-family:var(--font-iphint)] md:text-[1.25rem] md:leading-[1.875rem] ">
                  {t(`features.${item.key}.title`)}
                </h3>

                {/* Description */}
                <p className="max-w-[180px] text-gray-600 typo-caption md:[font-family:var(--font-iphint)] md:text-[1rem] md:leading-[1.5rem] md:font-bold">
                  {t(`features.${item.key}.description`)}
                </p>

              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}