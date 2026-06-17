"use client";

import { Link } from "@/i18n/routing";
import { renderTextWithIpHintWordmark } from "@/components/IpHintWordmark";
import { useParams } from "next/navigation";
import { useState } from "react";

export type PolicyKey = "en" | "ko";

type PolicyCallout = {
  label?: string;
  value: string;
  href?: string;
};

type PolicySubSection = {
  subtitle: string;
  text?: string;
  paragraphs?: string[];
  list?: string[];
};

type SupportDetail = {
  label: string;
  value: string;
  href?: string;
};

type PolicySupport = {
  id: string;
  navLabel: string;
  title: string;
  description?: string;
  details: SupportDetail[];
};

export type PolicySection = {
  id: string;
  title: string;
  paragraphs?: string[];
  subSections?: PolicySubSection[];
  list?: string[];
  footerParagraphs?: string[];
  callout?: PolicyCallout;
};

export type PolicyDocument = {
  label: string;
  title: string;
  company: string;
  effectiveDate: string;
  lang: PolicyKey;
  sections: PolicySection[];
  support: PolicySupport;
};

const chromeCopy = {
  en: {
    contents: "Contents",
    backToMain: "Back to Main",
    versionSummary: "US and Korean versions",
    selectedVersion: "Selected Version",
  },
  ko: {
    contents: "목차",
    backToMain: "메인으로 돌아가기",
    versionSummary: "영문 및 한국어 버전",
    selectedVersion: "선택된 버전",
  },
} as const;

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-2 pl-5">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="relative text-slate-600 leading-relaxed before:absolute before:-left-5 before:text-slate-400 before:content-['•']"
        >
          {renderTextWithIpHintWordmark(item)}
        </li>
      ))}
    </ul>
  );
}

export default function PolicyPage({
  pageTitles,
  documents,
}: {
  pageTitles: Record<PolicyKey, string>;
  documents: Record<PolicyKey, PolicyDocument>;
}) {
  const params = useParams<{ locale?: string | string[] }>();
  const localeParam = params?.locale;
  const routeLocale = Array.isArray(localeParam) ? localeParam[0] : localeParam;
  const [activePolicy, setActivePolicy] = useState<PolicyKey>(() =>
    routeLocale === "kr" ? "ko" : "en"
  );

  const activeDocument = documents[activePolicy];
  const activeChromeCopy = chromeCopy[activeDocument.lang];
  const policyOptions = [
    { key: "en" as const, label: documents.en.label },
    { key: "ko" as const, label: documents.ko.label },
  ];

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-20 font-sans text-slate-900 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-12 lg:flex-row">
        <aside className="sticky top-24 hidden w-72 shrink-0 flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:flex">
          <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-400">
            {activeChromeCopy.contents}
          </h3>
          <nav className="hide-scrollbar flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-2">
            {activeDocument.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-black"
              >
                {section.title}
              </a>
            ))}
            <a
              href={`#${activeDocument.support.id}`}
              className="mt-2 border-t border-gray-100 pt-2 text-sm font-medium text-slate-600 transition-colors hover:text-black"
            >
              {activeDocument.support.navLabel}
            </a>
          </nav>
        </aside>

        <div className="w-full flex-1 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-12">
          <div className="mb-12 border-b border-gray-100 pb-8">
            <Link
              href="/"
              className="mb-8 inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-black"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {activeChromeCopy.backToMain}
            </Link>

            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {renderTextWithIpHintWordmark(pageTitles[activeDocument.lang])}
            </h1>
            <div className="flex flex-col gap-1 font-medium text-slate-500">
              <p>{activeChromeCopy.versionSummary}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {policyOptions.map((option) => {
                const isActive = option.key === activePolicy;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setActivePolicy(option.key)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-gray-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-gray-100 bg-slate-50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                {activeChromeCopy.selectedVersion}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">{renderTextWithIpHintWordmark(activeDocument.title)}</h2>
              <div className="mt-3 flex flex-col gap-1 font-medium text-slate-500">
                <p>{renderTextWithIpHintWordmark(activeDocument.company)}</p>
                <p>{activeDocument.effectiveDate}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-12" lang={activeDocument.lang}>
            {activeDocument.sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="mb-4 text-xl font-bold md:text-2xl">{renderTextWithIpHintWordmark(section.title)}</h2>

                {section.paragraphs && (
                  <div className="flex flex-col gap-4">
                    {section.paragraphs.map((paragraph, index) => (
                      <p key={`${section.id}-paragraph-${index}`} className="text-slate-600 leading-relaxed">
                        {renderTextWithIpHintWordmark(paragraph)}
                      </p>
                    ))}
                  </div>
                )}

                {section.subSections && (
                  <div className="mt-6 flex flex-col gap-6 border-l-2 border-slate-100 pl-4 md:pl-6">
                    {section.subSections.map((subSection, index) => (
                      <div key={`${section.id}-sub-${index}`}>
                        <h3 className="mb-1 font-semibold text-slate-800">{renderTextWithIpHintWordmark(subSection.subtitle)}</h3>

                        {subSection.text && (
                          <p className="text-slate-600 leading-relaxed">{renderTextWithIpHintWordmark(subSection.text)}</p>
                        )}

                        {subSection.paragraphs && (
                          <div className="mt-3 flex flex-col gap-3">
                            {subSection.paragraphs.map((paragraph, paragraphIndex) => (
                              <p
                                key={`${section.id}-sub-${index}-paragraph-${paragraphIndex}`}
                                className="text-slate-600 leading-relaxed"
                              >
                                {renderTextWithIpHintWordmark(paragraph)}
                              </p>
                            ))}
                          </div>
                        )}

                        {subSection.list && <BulletList items={subSection.list} />}
                      </div>
                    ))}
                  </div>
                )}

                {section.list && <BulletList items={section.list} />}

                {section.callout && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-slate-50 p-5 text-slate-700">
                    {section.callout.label && (
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        {section.callout.label}
                      </p>
                    )}
                    {section.callout.href ? (
                      <a href={section.callout.href} className="font-semibold text-blue-600 hover:underline">
                        {renderTextWithIpHintWordmark(section.callout.value)}
                      </a>
                    ) : (
                      <p className="font-semibold text-slate-900">{renderTextWithIpHintWordmark(section.callout.value)}</p>
                    )}
                  </div>
                )}

                {section.footerParagraphs && (
                  <div className="mt-4 flex flex-col gap-4">
                    {section.footerParagraphs.map((paragraph, index) => (
                      <p key={`${section.id}-footer-${index}`} className="text-slate-600 leading-relaxed">
                        {renderTextWithIpHintWordmark(paragraph)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div id={activeDocument.support.id} className="scroll-mt-24 mt-2 border-t border-gray-100 pt-10">
              <h2 className="mb-4 text-xl font-bold md:text-2xl">{renderTextWithIpHintWordmark(activeDocument.support.title)}</h2>

              {activeDocument.support.description && (
                <p className="mb-6 text-slate-600 leading-relaxed">{renderTextWithIpHintWordmark(activeDocument.support.description)}</p>
              )}

              <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-slate-50 p-6 text-sm text-slate-700 md:text-base">
                {activeDocument.support.details.map((detail) => (
                  <p key={`${detail.label}-${detail.value}`}>
                    <strong className="mb-1 block text-slate-900">{renderTextWithIpHintWordmark(detail.label)}:</strong>{" "}
                    {detail.href ? (
                      <a href={detail.href} className="text-blue-600 hover:underline">
                        {renderTextWithIpHintWordmark(detail.value)}
                      </a>
                    ) : (
                      renderTextWithIpHintWordmark(detail.value)
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}