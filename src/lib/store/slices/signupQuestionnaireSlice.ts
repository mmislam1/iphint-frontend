import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SignupQuestionnaireAnswers {
  activeField: string;
  imageUseLocation: string;
  unauthorizedUseExperience: string;
  stolenWorkResponse: string;
  discoverySource: string;
}

export interface SignupQuestionnaireState {
  answers: SignupQuestionnaireAnswers;
  skipped: boolean;
  completedAt: string | null;
}

export interface SignupQuestionnaireSubmission extends SignupQuestionnaireAnswers {
  skipped: boolean;
  completedAt: string;
}

const emptyAnswers: SignupQuestionnaireAnswers = {
  activeField: '',
  imageUseLocation: '',
  unauthorizedUseExperience: '',
  stolenWorkResponse: '',
  discoverySource: '',
};

const initialState: SignupQuestionnaireState = {
  answers: emptyAnswers,
  skipped: false,
  completedAt: null,
};

const signupQuestionnaireSlice = createSlice({
  name: 'signupQuestionnaire',
  initialState,
  reducers: {
    saveSignupQuestionnaire(
      state,
      action: PayloadAction<{
        answers: SignupQuestionnaireAnswers;
        skipped?: boolean;
        completedAt: string;
      }>,
    ) {
      state.answers = action.payload.answers;
      state.skipped = Boolean(action.payload.skipped);
      state.completedAt = action.payload.completedAt;
    },
    clearSignupQuestionnaire(state) {
      state.answers = emptyAnswers;
      state.skipped = false;
      state.completedAt = null;
    },
  },
});

export const { saveSignupQuestionnaire, clearSignupQuestionnaire } =
  signupQuestionnaireSlice.actions;

export default signupQuestionnaireSlice.reducer;
