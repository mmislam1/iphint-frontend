import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ContactFormData {
  fullName: string;
  companyName: string;
  workEmail: string;
  phoneNumber: string;
  inquiryMessage: string;
  consent: {
    marketingEmails: boolean;
    serviceUpdates: boolean;
    eventPromotions: boolean;
  };
}

interface ContactModalState {
  isOpen: boolean;
  isSubmitting: boolean;
  submitSuccess: boolean;
  form: ContactFormData;
}

const initialForm: ContactFormData = {
  fullName: "",
  companyName: "",
  workEmail: "",
  phoneNumber: "",
  inquiryMessage: "",
  consent: {
    marketingEmails: false,
    serviceUpdates: false,
    eventPromotions: false,
  },
};

const initialState: ContactModalState = {
  isOpen: false,
  isSubmitting: false,
  submitSuccess: false,
  form: initialForm,
};

const contactModalSlice = createSlice({
  name: "contactModal",
  initialState,
  reducers: {
    openModal(state) {
      state.isOpen = true;
      state.submitSuccess = false;
    },
    closeModal(state) {
      state.isOpen = false;
      state.isSubmitting = false;
      state.submitSuccess = false;
      state.form = initialForm;
    },
    updateField(
      state,
      action: PayloadAction<{ field: keyof Omit<ContactFormData, "consent">; value: string }>
    ) {
      state.form[action.payload.field] = action.payload.value;
    },
    toggleConsent(
      state,
      action: PayloadAction<keyof ContactFormData["consent"]>
    ) {
      state.form.consent[action.payload] = !state.form.consent[action.payload];
    },
    setSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    setSubmitSuccess(state, action: PayloadAction<boolean>) {
      state.submitSuccess = action.payload;
      state.isSubmitting = false;
    },
    resetForm(state) {
      state.form = initialForm;
    },
  },
});

export const {
  openModal,
  closeModal,
  updateField,
  toggleConsent,
  setSubmitting,
  setSubmitSuccess,
  resetForm,
} = contactModalSlice.actions;

export default contactModalSlice.reducer;