"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";

const locales = [
  { code: "en", label: "EN" },
  { code: "kr", label: "KR" },
] as const;

function NavLangSwitcher({
  active,
  onSelect,
  ariaLabel,
}: {
  active: string;
  onSelect: (code: (typeof locales)[number]["code"]) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const current = locales.find((l) => l.code === active);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && wrapperRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-150"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="uppercase">{current?.label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <>
          <ul
            role="listbox"
            aria-label={ariaLabel}
            className="absolute top-full right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/5 py-1 z-40"
          >
            {locales.map((loc) => (
              <li key={loc.code} role="option" aria-selected={loc.code === active}>
                <button
                  onClick={() => { onSelect(loc.code as (typeof locales)[number]["code"]); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[13px] transition-colors duration-150 ${
                    loc.code === active
                      ? "text-gray-950 font-semibold bg-gray-50"
                      : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                  }`}
                >
                  <span className="uppercase">{loc.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const activeLocale = locale === "kr" ? "kr" : "en";
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const switchLocale = (nextLocale: (typeof locales)[number]["code"]) => {
    if (nextLocale === activeLocale) {
      return;
    }

    router.replace(pathname, { locale: nextLocale, scroll: false });
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/pricing", label: t("pricing") },
    { href: "/service", label: t("service") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-6 lg:px-10">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="inline-flex shrink-0 items-center"
          aria-label={t('homeAria')}
        >
          <Image src="/logo_mo.svg" alt="IPHINT" width={102} height={28} priority className="block h-7 w-auto" />
        </Link>

        {/* ── Desktop Nav ── */}
        <nav
          className="hidden md:flex items-center gap-8 ml-10"
          aria-label={t('navigationAria')}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-semibold text-gray-900 hover:text-black transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop Right Actions ── */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {/* Contact Us */}
          <Link
            href="/contact"
            className="btn-secondary"
          >
            {t("contactUs")}
          </Link>

          {/* Sign in */}
          <Link
            href="/login"
            className="btn-primary"
          >
            {t('signIn')}
          </Link>

          <div className="h-5 w-px bg-gray-200" aria-hidden="true" />

          <NavLangSwitcher active={activeLocale} onSelect={switchLocale} ariaLabel={t('selectLanguageAria')} />
        </div>

        {/* ── Mobile: lang switcher + hamburger ── */}
        <div className="md:hidden ml-auto flex items-center gap-1">
          <NavLangSwitcher active={activeLocale} onSelect={switchLocale} ariaLabel={t('selectLanguageAria')} />
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X size={22} strokeWidth={2} />
            ) : (
              <Menu size={22} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 h-[calc(100vh-64px)] border-t border-gray-100 bg-white px-6 pb-6 pt-4 space-y-1 overflow-y-auto z-50">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-3 text-[15px] font-semibold text-gray-900 border-b border-gray-100 last:border-0"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-secondary w-full"
            >
              {t("contactUs")}
            </Link>
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-gray-950 text-[14px] font-semibold text-white"
            >
              {t('signIn')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}