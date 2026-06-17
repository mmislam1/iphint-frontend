// components/landing/Section3.tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import ContactSalesButton from "@/components/contact/ContactSalesButton";

const features = [
  {
    key: "deepWebDetection",
    icon: "/sec3_deepWebDetection.svg",
  },
  {
    key: "highAccuracy",
    icon: "/sec3_highAccuracy.svg",
  },
  {
    key: "alertService",
    icon: "/sec3_alertService.svg",
  },
  {
    key: "secureStorage",
    icon: "/sec3_secureStorage.svg",
  },
];

export default function Section3() {
  const t = useTranslations("Landing.section3");

  return (
    <section className="w-full py-16 md:py-24">
      
      {/* Content wrapper (full width feel with padding) */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16">
        
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black">
            {t("title")}
          </h2>
          <p className="mt-4 text-gray-700 text-sm md:text-base">
            {t("description")}
          </p>
        </div>

        {/* Cards */}
        <div className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-4 
          gap-6
        ">
          {features.map((item, i) => (
            <div
              key={i}
              className="
                bg-[#e9e9e9] 
                rounded-2xl 
                p-6 md:p-8 
                flex flex-col 
                gap-4 
                h-full
              "
            >
              
              {/* Icon */}
              <Image
                src={item.icon}
                alt={t(`features.${item.key}.title`)}
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10"
              />

              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-black">
                {t(`features.${item.key}.title`)}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {t(`features.${item.key}.description`)}
              </p>

            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 bg-black text-white text-center px-6 py-5 text-sm flex flex-wrap justify-center gap-x-1 gap-y-1">
        <span>{t("footerQuestion")}</span>
        <ContactSalesButton className="underline whitespace-nowrap">
          {t("footerCta")}
        </ContactSalesButton>
      </div>

    </section>
  );
}