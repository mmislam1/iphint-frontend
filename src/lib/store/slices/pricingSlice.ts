import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type BillingCycle = "monthly" | "yearly";

interface PricingState {
  billingCycle: BillingCycle;
  openFaqIndex: number | null;
  highlightedFeature: string | null;
  locale: string;
  ctaLoading: string | null;
}

const initialState: PricingState = {
  billingCycle: "yearly",
  openFaqIndex: null,
  highlightedFeature: null,
  locale: "en",
  ctaLoading: null,
};

const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    setBillingCycle(state, action: PayloadAction<BillingCycle>) {
      state.billingCycle = action.payload;
    },
    toggleFaq(state, action: PayloadAction<number>) {
      state.openFaqIndex =
        state.openFaqIndex === action.payload ? null : action.payload;
    },
    setHighlightedFeature(state, action: PayloadAction<string | null>) {
      state.highlightedFeature = action.payload;
    },
    setLocale(state, action: PayloadAction<string>) {
      state.locale = action.payload;
    },
    setCtaLoading(state, action: PayloadAction<string | null>) {
      state.ctaLoading = action.payload;
    },
  },
});

export const { setBillingCycle, toggleFaq, setHighlightedFeature, setLocale, setCtaLoading } = pricingSlice.actions;
export default pricingSlice.reducer;

// Selectors
export const selectBillingCycle = (state: { pricing: PricingState }) =>
  state.pricing.billingCycle;
export const selectOpenFaqIndex = (state: { pricing: PricingState }) =>
  state.pricing.openFaqIndex;
export const selectExpandedFaqIndex = (state: { pricing: PricingState }) =>
  state.pricing.openFaqIndex;
export const selectHighlightedFeature = (state: { pricing: PricingState }) =>
  state.pricing.highlightedFeature;
export const selectCtaLoading = (state: { pricing: PricingState }) =>
  state.pricing.ctaLoading;
export const selectIsAnnual = (state: { pricing: PricingState }) =>
  state.pricing.billingCycle === "yearly";
