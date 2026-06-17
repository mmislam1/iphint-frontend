import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import ContactSalesButton from "@/components/contact/ContactSalesButton";
import IpHintWordmark from "@/components/IpHintWordmark";

export default function Section8() {
  const t = useTranslations("Landing.section8");

  return (
    <section className="w-full py-12 px-6">
      <div className="flex flex-1 max-w-7xl mx-auto bg-slate-100 rounded-[40px] py-16 px-10 flex-col md:flex-row items-center justify-between gap-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center md:text-left">
          {t("titleBeforeBrand")}
          <IpHintWordmark as="span" className="font-extrabold [font-family:var(--font-google-sans)]" />
          {t("titleAfterBrand")}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/login" className="btn-primary">
            {t("primaryCta")}
          </Link>
          <ContactSalesButton className="btn-secondary">
            {t("secondaryCta")}
          </ContactSalesButton>
        </div>
      </div>
    </section>
  );
}