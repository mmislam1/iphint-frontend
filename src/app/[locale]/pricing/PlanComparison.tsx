"use client";

import { useTranslations } from "next-intl";

type ComparisonRow = { label: string; starter: string; pro: string; premium: string };

export default function PlanComparison() {
  const t = useTranslations("Pricing.comparison");
  const rows = t.raw("rows") as ComparisonRow[];
  const planNames = t.raw("planNames") as string[];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16">
      {/* Divider */}
      <div className="w-full h-px bg-gray-200 mb-16" />

      <h2 className="text-4xl font-bold tracking-tight text-gray-950 text-center mb-12">
        {t("heading")}
      </h2>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr>
              <th className="pb-6 text-left w-1/4" />
              {planNames.map((plan) => (
                <th
                  key={plan}
                  className="pb-6 text-center text-sm font-bold tracking-widest text-gray-950"
                >
                  {plan}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.label}
                className={`border-t ${
                  idx === rows.length - 1 ? "border-b" : ""
                } border-gray-200`}
              >
                <td className="py-5 pr-8 text-sm font-semibold text-gray-800 w-1/4">
                  {row.label}
                </td>
                {[row.starter, row.pro, row.premium].map((value, colIdx) => (
                  <td
                    key={colIdx}
                    className="py-5 text-center text-sm text-gray-600"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

