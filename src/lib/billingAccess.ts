export type PlanTier = 'starter' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'annual';

export interface SignupOffer {
  eligible?: boolean;
  source?: 'trial' | 'referral' | string | null;
  priceConfigured?: boolean;
  trialDays?: number | null;
  message?: string | null;
}

export interface AccessSubscription {
  hasAccess?: boolean | null;
}

export interface AccessSnapshot {
  subscription?: AccessSubscription | null;
  signupOffer?: SignupOffer | null;
}

export const hasSubscriptionAccess = (snapshot?: AccessSnapshot | null) =>
  snapshot?.subscription?.hasAccess === true;

export const getSignupOfferTrialDays = (offer?: SignupOffer | null) => {
  if (typeof offer?.trialDays === 'number' && offer.trialDays > 0) {
    return offer.trialDays;
  }

  return offer?.source === 'referral' ? 30 : 7;
};

export const getSignupOfferLabel = (offer?: SignupOffer | null) =>
  `${getSignupOfferTrialDays(offer)}-day Pro trial`;

export const isSignupOfferConfigured = (offer?: SignupOffer | null) =>
  offer?.eligible === true && offer.priceConfigured === true;

export const isSignupOfferMissingPrice = (offer?: SignupOffer | null) =>
  offer?.eligible === true && offer.priceConfigured === false;
