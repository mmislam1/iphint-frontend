"use client";

import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import IpHintWordmark, { renderTextWithIpHintWordmark } from "@/components/IpHintWordmark";
const localeOptions = ["kr", "en"] as const;
type LocaleCode = (typeof localeOptions)[number];

function FooterLangSwitcher({
  selected,
  labels,
  ariaLabel,
  onSelect,
}: {
  selected: string;
  labels: Array<{ label: string; value: LocaleCode }>;
  ariaLabel: string;
  onSelect: (l: LocaleCode) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = labels.find((l) => l.value === selected);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 px-3 py-[7px] rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 text-[12px] font-semibold text-gray-700 tracking-wide"
      >
        {/* Globe */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="uppercase">{current?.label}</span>
        {/* Triangle ▼ */}
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            aria-label={ariaLabel}
            className="absolute bottom-full right-0 mb-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/5 py-1 z-40"
          >
            {labels.map((lang) => (
              <li key={lang.value} role="option" aria-selected={lang.value === selected}>
                <button
                  onClick={() => { onSelect(lang.value); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[13px] transition-colors duration-150 ${
                    lang.value === selected
                      ? "text-gray-950 font-semibold bg-gray-50"
                      : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                  }`}
                >
                  <span className="uppercase">{lang.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale() === "en" ? "en" : "kr";
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { label: t("languages.kr"), value: "kr" as LocaleCode },
    { label: t("languages.en"), value: "en" as LocaleCode },
  ];

  const changeLanguage = (newLocale: LocaleCode) => {
    if (newLocale === locale) {
      return;
    }

    router.replace(pathname, { locale: newLocale, scroll: false });
  };

  return (
    <footer className="w-full bg-white border-t border-gray-100">

      {/* ── Top section ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-10 pt-10 sm:pt-12 pb-12 sm:pb-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start">

          {/* Logo — top-left, does not grow */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label={t("homeAria")} className="block text-gray-950">
              <div className="relative h-8 w-32">
                <Image src="/logo_footer.svg" alt="IPHINT" fill className="object-contain object-left" />
              </div>
            </Link>
          </div>

          {/* Columns — hugging the right edge, gap between them */}
          <div className="grid grid-cols-2 gap-8 w-full md:w-auto md:ml-auto md:flex md:items-start md:gap-20 lg:gap-28">

            {/* Column 1 */}
            <div className="flex flex-col gap-5">
              <p className="text-[13px] text-gray-400 font-normal">
                <IpHintWordmark
                  className="[font-family:var(--font-google-sans)]"
                  size="13px"
                  color="rgb(156 163 175)"
                />
              </p>
              <ul className="flex flex-col gap-[15px]">
                {[
                  { href: "https://luminous-beat-885.notion.site/337f70a1e02e80babbede283c5a9350a", label: t("links.research"), external: true },
                  { href: "/api", label: t("links.api") },
                  { href: "/about", label: t("links.about") },
                ].map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[17px] font-normal text-gray-900 hover:text-gray-400 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[17px] font-normal text-gray-900 hover:text-gray-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-5">
              <p className="text-[13px] text-gray-400 font-normal">
                {t("policyHeading")}
              </p>
              <ul className="flex flex-col gap-[15px]">
                {[
                  { href: "/privacy_policy", label: t("links.privacyPolicy") },
                  { href: "/terms_of_service", label: t("links.termsOfService") },
                  { href: "/usage_policy", label: t("links.usagePolicy") },
                  { href: "/refund_policy", label: t("links.refundPolicy") },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[17px] font-normal text-gray-900 hover:text-gray-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto flex min-h-[56px] flex-row items-center justify-between gap-3 px-4 py-4 sm:h-[56px] sm:px-10 sm:py-0">
          <span className="text-[13px] text-gray-500">
            {renderTextWithIpHintWordmark(t("copyright"))}
          </span>
          <div>
            <FooterLangSwitcher
              selected={locale}
              labels={languages}
              ariaLabel={t("selectLanguageAria")}
              onSelect={changeLanguage}
            />
          </div>
        </div>
      </div>

    </footer>
  );
}