'use client'

import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setBillingCycle,
  toggleFaq,
  setHighlightedFeature,
  setLocale,
  setCtaLoading,
  selectBillingCycle,
  selectExpandedFaqIndex,
  selectHighlightedFeature,
  selectCtaLoading,
  selectIsAnnual,
} from '../../../lib/store/slices/pricingSlice'
import type { Translations, PlanId, Plan } from './pricing'
import { ChevronRight } from 'lucide-react'
import { detectCountryCodeByIp, formatPriceByCountry } from '@/lib/currency'

function CheckIconLg() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" style={{ fill: '#dddddd' }} />
      <path d="M6 10.5l3 3 5-6" stroke="#636363" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function CheckIconTable() {
  return (
    <svg className="w-5 h-5 mx-auto" viewBox="0 0 20 20" fill="none">
      <path d="M4 10.5l4.5 4.5 7.5-9" stroke="#636363" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── CTA Button ────────────────────────────────────────────────────────────
function CtaButton({ plan, isLoading, onClick }: { plan: Plan; isLoading: boolean; onClick: () => void }) {
  const isPrimary = plan.ctaVariant === 'primary'
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        w-full border border-black py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
        ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        ${isPrimary ? 'text-black shadow-lg hover:shadow-gray-200/60 hover:bg-gray-200' : 'border border-black text-black hover:bg-gray-200'}
      `}
      >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading…
        </span>
      ) : plan.cta}
    </button>
  )
}

// ─── Plan Card ─────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  isPopular,
  priceLabel,
  perMonth,
  mostPopular,
  isLoading,
  onCta,
}: {
  plan: Plan
  isPopular: boolean
  priceLabel: string
  perMonth: string
  mostPopular: string
  isLoading: boolean
  onCta: (id: PlanId) => void
}) {
  return (
    <div
      className={`
        relative flex flex-col rounded-2xl transition-all duration-300 border sm:mb-6
        ${isPopular
          ? 'shadow-2xl scale-[1.02] z-10'
          : 'shadow-sm hover:shadow-md'
        }
      `}
      style={isPopular ? { background: 'white' } : {}}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span
            className="px-4 py-2 rounded-full text-xs font-bold tracking-wider text-white shadow-md whitespace-nowrap"
            style={{ background:  '#000' }}
          >
            {mostPopular}
          </span>
        </div>
      )}

      {/* Border gradient ring for popular */}
      {isPopular && (
        <div
          className="absolute inset-0 rounded-2xl -z-10 p-[1.5px]"
          style={{ background: '#000' }}
        >
          <div className="absolute inset-0 rounded-2xl bg-white" />
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background:  '#000' }}
        >
          {plan.id === 'starter' && (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {plan.id === 'professional' && (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
          {plan.id === 'agency' && (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>

        {/* Name & description */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
        <p className="text-sm text-gray-400 mb-5">{plan.description}</p>

        {/* Price */}
        <div className="flex items-end gap-1 mb-6">
          <span className="text-5xl font-black text-gray-900 leading-none">{priceLabel}</span>
          <span className="text-gray-400 text-sm mb-1">{perMonth}</span>
        </div>

        {/* Divider */}
        <div className="h-px mb-6" style={{ background:  '#000' }} />

        {/* Features */}
        <ul className="space-y-3 flex-1 mb-7">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
              <CheckIconLg />
              {feature}
            </li>
          ))}
        </ul>

        <CtaButton plan={plan} isLoading={isLoading} onClick={() => onCta(plan.id as PlanId)} />
      </div>
    </div>
  )
}

// ─── FAQ Item ──────────────────────────────────────────────────────────────
function FaqItem({ question, answer, isOpen, onToggle }: {
  question: string; answer: string; isOpen: boolean; onToggle: () => void
}) {
  const bodyRef = useRef<HTMLDivElement>(null)

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left group"
      >
        <span className="font-semibold text-gray-800 text-sm pr-4">{question}</span>
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
          style={{ background: 'rgb(224, 224, 224)' }}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
            style={{ color:  '#000' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <ChevronRight/>
          </svg>
        </span>
      </button>
      <div
        ref={bodyRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0 }}
      >
        <p className="px-6 pb-6 text-sm text-gray-500 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

// ─── Main Client Component ─────────────────────────────────────────────────
export default function PricingClient({
  translations,
  locale,
}: {
  translations: Translations
  locale: string
}) {
  const dispatch = useDispatch()
  const billingCycle    = useSelector(selectBillingCycle)
  const expandedFaq     = useSelector(selectExpandedFaqIndex)
  const highlightedFeat = useSelector(selectHighlightedFeature)
  const ctaLoading      = useSelector(selectCtaLoading)
  const isAnnual        = useSelector(selectIsAnnual)
  const [countryCode, setCountryCode] = useState('US')

  const formatPrice = (usd: number) => formatPriceByCountry(usd, countryCode)

  useEffect(() => {
    if (locale === 'en' || locale === 'kr') dispatch(setLocale(locale))
  }, [locale, dispatch])

  useEffect(() => {
    let active = true

    const loadCountryCode = async () => {
      try {
        const detectedCountry = await detectCountryCodeByIp()
        if (!active) return
        setCountryCode(detectedCountry)
      } catch {
        if (!active) return
        setCountryCode('US')
      }
    }

    void loadCountryCode()

    return () => {
      active = false
    }
  }, [])

  const handleCta = async (planId: PlanId) => {
    dispatch(setCtaLoading(planId))
    // Simulated async action — replace with your actual handler
    await new Promise(r => setTimeout(r, 1200))
    dispatch(setCtaLoading(null))
  }

  const t = translations

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        {/* Background blobs */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ }}
          aria-hidden
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3"
          style={{ }}
          aria-hidden
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/4"
          style={{  }}
          aria-hidden
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 mb-6">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{}}
            />
            <span className="text-xs font-medium text-gray-700 tracking-wide">{t.badge}</span>
          </div>

          <h1
            className="text-3xl md:text-4xl font-semibold font-black text-gray-900 leading-tight mb-4 tracking-tight"
            style={{ }}
          >
            {t.heading}
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto mb-10">{t.subheading}</p>

          {/* Billing Toggle */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white rounded-2xl px-2 py-2 shadow-md border border-gray-100">
            <button
              onClick={() => dispatch(setBillingCycle('monthly'))}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              style={billingCycle === 'monthly' ? { background:  '#000000'} : {}}
            >
              {t.billing.monthly}
            </button>
            <button
              onClick={() => dispatch(setBillingCycle('yearly'))}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              style={billingCycle === 'yearly' ? { background:  '#000000'} : {}}
            >
              {t.billing.annual}
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {t.billing.discount}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Plan Cards ── */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {t.plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPopular={!!plan.popular}
              priceLabel={formatPrice(isAnnual ? plan.price.annual : plan.price.monthly)}
              perMonth={t.perMonth}
              mostPopular={t.mostPopular}
              isLoading={ctaLoading === plan.id}
              onCta={handleCta}
            />
          ))}
        </div>
      </section>

      {/* ── Feature Comparison ── */}
      <section className="max-w-5xl mx-auto px-2 pb-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">
            {t.comparison.title}
          </h2>
          <div
            className="w-16 h-1 rounded-full mx-auto mt-3"
            style={{ background:  '#000' }}
          />
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[720px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden pb-6">
            {/* Header row */}
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-100">
              <div className="fc text-sm font-bold text-gray-500 tracking-wider">
                Feature
              </div>
              {t.comparison.plans.map((plan, i) => (
                <div
                  key={i}
                  className="fc py-4 text-center text-sm font-bold text-gray-700"
                >
                  {plan}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {t.comparison.features.map((row, i) => {
              const isHl = highlightedFeat === row.label
              return (
                <div
                  key={i}
                  className={`grid grid-cols-4 border-b border-gray-50 last:border-none transition-colors duration-150 cursor-default ${
                    isHl ? 'bg-gray-50/60' : 'hover:bg-gray-50/70'
                  }`}
                  onMouseEnter={() => dispatch(setHighlightedFeature(row.label))}
                  onMouseLeave={() => dispatch(setHighlightedFeature(null))}
                >
                  <div className="p-4 text-sm text-gray-600 font-medium">{row.label}</div>
                  {(['starter', 'professional', 'agency'] as const).map((key) => (
                    <div key={key} className="fc p-4 text-center text-sm text-gray-600">
                      {row[key] === 'check' ? (
                        <CheckIconTable />
                      ) : row[key] === 'none' ? (
                        <span className="text-gray-300 text-lg">—</span>
                      ) : (
                        row[key]
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-4 pb-32">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">
            {t.faq.title}
          </h2>
          <div
            className="w-16 h-1 rounded-full mx-auto mt-3"
            style={{ background: '#000' }}
          />
        </div>
        <div className="space-y-3">
          {t.faq.items.map((item, i) => (
            <FaqItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={expandedFaq === i}
              onToggle={() => dispatch(toggleFaq(i))}
            />
          ))}
        </div>
      </section>

      
    </div>
  )
}
