import { z } from 'zod'

// ─── Locale ────────────────────────────────────────────────────────────────
export const LocaleSchema = z.enum(['en', 'kr'])
export type Locale = z.infer<typeof LocaleSchema>

// ─── Plan ──────────────────────────────────────────────────────────────────
export const PlanIdSchema = z.enum(['starter', 'professional', 'agency'])
export type PlanId = z.infer<typeof PlanIdSchema>

export const BillingCycleSchema = z.enum(['monthly', 'annual'])
export type BillingCycle = z.infer<typeof BillingCycleSchema>

export const PlanPriceSchema = z.object({
  monthly: z.number().positive(),
  annual: z.number().positive(),
})

export const PlanSchema = z.object({
  id: PlanIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  popular: z.boolean().optional(),
  price: PlanPriceSchema,
  cta: z.string().min(1),
  ctaVariant: z.enum(['primary', 'outline']),
  features: z.array(z.string().min(1)).min(1),
})
export type Plan = z.infer<typeof PlanSchema>

// ─── Feature Comparison Row ────────────────────────────────────────────────
export const FeatureRowSchema = z.object({
  label: z.string().min(1),
  starter: z.string().min(1),
  professional: z.string().min(1),
  agency: z.string().min(1),
})
export type FeatureRow = z.infer<typeof FeatureRowSchema>

// ─── FAQ Item ──────────────────────────────────────────────────────────────
export const FaqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
})
export type FaqItem = z.infer<typeof FaqItemSchema>

// ─── Full Translations Schema ──────────────────────────────────────────────
export const TranslationsSchema = z.object({
  badge: z.string(),
  heading: z.string(),
  subheading: z.string(),
  billing: z.object({
    monthly: z.string(),
    annual: z.string(),
    discount: z.string(),
  }),
  plans: z.array(PlanSchema),
  comparison: z.object({
    title: z.string(),
    features: z.array(FeatureRowSchema),
    plans: z.array(z.string()),
  }),
  faq: z.object({
    title: z.string(),
    items: z.array(FaqItemSchema),
  }),
  month: z.string(),
  mostPopular: z.string(),
  perMonth: z.string(),
})
export type Translations = z.infer<typeof TranslationsSchema>

// ─── Page Params ───────────────────────────────────────────────────────────
export const PageParamsSchema = z.object({
  locale: LocaleSchema,
})
export type PageParams = z.infer<typeof PageParamsSchema>
