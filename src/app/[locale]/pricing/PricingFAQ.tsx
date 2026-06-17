"use client";

import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { toggleFaq, selectOpenFaqIndex } from "@/lib/store/slices/pricingSlice";

type FaqItem = { question: string; answer: string };

export default function PricingFAQ() {
  const dispatch = useDispatch();
  const openFaqIndex = useSelector(selectOpenFaqIndex);
  const t = useTranslations("Pricing");

  const faqItems = t.raw("faq.items") as FaqItem[];
  const steps = t.raw("referral.steps") as string[];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16 pb-28">
      {/* Divider */}
      <div className="w-full h-px bg-gray-200 mb-16" />

      <h2 className="text-4xl font-bold tracking-tight text-gray-950 text-center mb-12">
        {t("faq.heading")}
      </h2>

      {/* Accordion */}
      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {faqItems.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div key={idx} className="group">
              <button
                className="w-full flex items-center justify-between py-6 text-left"
                onClick={() => dispatch(toggleFaq(idx))}
                aria-expanded={isOpen}
              >
                <span className="text-base text-gray-800 font-normal pr-8">
                  {faq.question}
                </span>
                <span
                  className={`shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 transition-transform duration-200 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </span>
              </button>

              {/* Answer Panel */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-40 opacity-100 pb-6" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-sm text-gray-500 leading-relaxed pr-10">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Referral Banner */}
      <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-200">
        <p className="text-sm font-bold text-gray-950 mb-1">
          {t("referral.title")}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {t("referral.description")}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {steps.map((label, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-950 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <svg
                  className="w-4 h-4 text-gray-300 hidden sm:block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

