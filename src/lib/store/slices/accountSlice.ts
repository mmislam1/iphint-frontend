import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { detectCountryCodeByIp } from '../../currency';

export type PlanTier = 'starter' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'annual';
export type SummaryFrequency = 'instant' | 'daily' | 'weekly';
export type NotificationFilter = 'all' | 'unread';
export type NotificationScope = 'topbar' | 'settings';
export type ReportAction = 'download' | 'preview';

export interface BillingPlan {
  tier: PlanTier;
  name: string;
  imageUploadLimit: number;
  alertLimit: number;
  pdfEnabled: boolean;
  weeklyEmailAlerts: boolean;
  features: string[];
  pricing: { monthly: number; annual: number };
}

export interface BillingSnapshot {
  subscription: {
    id?: string;
    status: 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired' | 'pending';
    hasAccess?: boolean;
    billingCycle: BillingCycle;
    grantSource?: 'paid' | 'trial' | 'referral';
    isTrial?: boolean;
    isTrialing?: boolean;
    isPastDue?: boolean;
    paddleManaged?: boolean;
    trialEndsAt?: string | null;
    trialDaysLeft?: number;
    activationDate?: string;
    currentPeriodEnd?: string;
    nextBillingDate?: string;
    cancelDate?: string;
    paddleStatus?: string;
    pendingPlan?: {
      tier: PlanTier;
      name: string;
      billingCycle: BillingCycle;
      effectiveAt?: string | null;
    } | null;
  } | null;
  plan: BillingPlan;
  credits?: number;
  alertsRemaining?: number;
  usage: {
    imagesUsedThisMonth: number;
    imageUploadLimit: number;
    alertLimit: number;
    pdfEnabled: boolean;
  };
}

export interface ReferralStatus {
  referralCode: string;
  generatedAt: string | null;
  expiresAt: string | null;
  windowOpen: boolean;
  completedInWindow: number;
  milestoneTarget: number;
  milestoneReached: boolean;
  permanentPdfAccess: boolean;
  totalReferrals: number;
}

export interface SettingsProfile {
  name: string;
  email: string;
  affiliation: string;
  jobTitle: string;
  country: string;
  phoneNumber: string;
  role: string;
  joiningDate: string;
}

export interface SettingsNotifications {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  weeklyRescanEnabled: boolean;
  notifyOnNewMatches: boolean;
  summaryFrequency: SummaryFrequency;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  actionUrl?: string;
  timestamp: string;
}

export interface ReportItem {
  searchId: string;
  image: string;
  date: string;
  matchCount: number;
}

export interface ReportPlanLimits {
  tier: PlanTier;
  alertLimit: number;
  imageUploadLimit: number;
  pdfEnabled: boolean;
  permanentPdfAccess?: boolean;
}

const defaultProfile: SettingsProfile = {
  name: '',
  email: '',
  affiliation: '',
  jobTitle: '',
  country: '',
  phoneNumber: '',
  role: '',
  joiningDate: '',
};

const defaultNotificationPrefs: SettingsNotifications = {
  emailEnabled: true,
  inAppEnabled: true,
  weeklyRescanEnabled: true,
  notifyOnNewMatches: true,
  summaryFrequency: 'instant',
};

const getUnreadCandidate = (
  items: NotificationItem[],
  notificationId: string,
) => items.find((item) => item._id === notificationId && !item.isRead);

export const fetchSubscriptionSnapshot = createAsyncThunk<BillingSnapshot, void, { rejectValue: string }>(
  'account/fetchSubscriptionSnapshot',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/billing/subscription');
      return response.data as BillingSnapshot;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load subscription data.'));
    }
  },
);

export const fetchBillingPageData = createAsyncThunk<
  { plans: BillingPlan[]; snapshot: BillingSnapshot | null; countryCode: string },
  void,
  { rejectValue: string }
>('account/fetchBillingPageData', async (_, { rejectWithValue }) => {
  try {
    const countryCodePromise: Promise<string> = (async () => {
      try {
        return await detectCountryCodeByIp();
      } catch {
        // Strict requirement: KRW only when Korean IP is detected.
        // If geo lookup fails, keep default USD.
        return 'US';
      }
    })();

    const [plansResponse, snapshotResponse, countryCode] = await Promise.all([
      apiClient.get('/billing/plans'),
      apiClient.get('/billing/subscription'),
      countryCodePromise,
    ]);

    return {
      plans: Array.isArray(plansResponse.data?.plans) ? plansResponse.data.plans : [],
      snapshot: (snapshotResponse.data ?? null) as BillingSnapshot | null,
      countryCode,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to load billing data.'));
  }
});

export const subscribeToPlan = createAsyncThunk<
  { plans: BillingPlan[]; snapshot: BillingSnapshot | null; countryCode: string },
  { tier: PlanTier; billingCycle: BillingCycle },
  { rejectValue: string }
>('account/subscribeToPlan', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post('/billing/subscribe', payload);
    return await dispatch(fetchBillingPageData()).unwrap();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to update subscription.'));
  }
});

export const cancelPlanSubscription = createAsyncThunk<
  { plans: BillingPlan[]; snapshot: BillingSnapshot | null; countryCode: string },
  void,
  { rejectValue: string }
>('account/cancelPlanSubscription', async (_, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post('/billing/cancel');
    return await dispatch(fetchBillingPageData()).unwrap();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to cancel subscription.'));
  }
});

export const pauseSubscription = createAsyncThunk<
  { plans: BillingPlan[]; snapshot: BillingSnapshot | null; countryCode: string },
  void,
  { rejectValue: string }
>('account/pauseSubscription', async (_, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post('/billing/pause');
    return await dispatch(fetchBillingPageData()).unwrap();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to pause subscription.'));
  }
});

export const resumeSubscription = createAsyncThunk<
  { plans: BillingPlan[]; snapshot: BillingSnapshot | null; countryCode: string },
  void,
  { rejectValue: string }
>('account/resumeSubscription', async (_, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post('/billing/resume');
    return await dispatch(fetchBillingPageData()).unwrap();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to resume subscription.'));
  }
});

export const resumeAutoRenew = createAsyncThunk<
  { plans: BillingPlan[]; snapshot: BillingSnapshot | null; countryCode: string },
  void,
  { rejectValue: string }
>('account/resumeAutoRenew', async (_, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post('/billing/resume-auto-renew');
    return await dispatch(fetchBillingPageData()).unwrap();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to resume auto-renew.'));
  }
});

export const upgradeSubscription = createAsyncThunk<
  { plans: BillingPlan[]; snapshot: BillingSnapshot | null; countryCode: string },
  { tier: PlanTier; billingCycle?: BillingCycle },
  { rejectValue: string }
>('account/upgradeSubscription', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.patch('/billing/subscription', payload);
    return await dispatch(fetchBillingPageData()).unwrap();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to change subscription.'));
  }
});

export const fetchReferralStatus = createAsyncThunk<ReferralStatus, void, { rejectValue: string }>(
  'account/fetchReferralStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/referral/status');
      return response.data as ReferralStatus;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load referral status.'));
    }
  },
);

export const generateReferralWindow = createAsyncThunk<ReferralStatus, void, { rejectValue: string }>(
  'account/generateReferralWindow',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/referral/generate');
      const response = await apiClient.get('/referral/status');
      return response.data as ReferralStatus;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to activate referral window.'));
    }
  },
);

export const fetchSettingsOverview = createAsyncThunk<
  { profile: SettingsProfile; notifications: SettingsNotifications; unreadCount: number },
  void,
  { rejectValue: string }
>('account/fetchSettingsOverview', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/user-details/settings');
    const settings = response.data?.settings || {};

    return {
      profile: { ...defaultProfile, ...(settings.profile || {}) },
      notifications: { ...defaultNotificationPrefs, ...(settings.notifications || {}) },
      unreadCount: Number(settings.unreadNotifications || 0),
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to load settings.'));
  }
});

export const fetchNotifications = createAsyncThunk<
  { scope: NotificationScope; items: NotificationItem[]; unreadCount: number },
  { scope: NotificationScope; status: NotificationFilter; q?: string; page?: number; limit?: number },
  { rejectValue: string }
>('account/fetchNotifications', async ({ scope, status, q = '', page = 1, limit = 20 }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/user-details/notifications', {
      params: { status, q, page, limit },
    });

    return {
      scope,
      items: Array.isArray(response.data?.notifications) ? response.data.notifications : [],
      unreadCount: Number(response.data?.unreadCount || 0),
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to load notifications.'));
  }
});

export const updateProfileSettings = createAsyncThunk<SettingsProfile, SettingsProfile, { rejectValue: string }>(
  'account/updateProfileSettings',
  async (profile, { rejectWithValue }) => {
    try {
      await apiClient.patch('/user-details/settings/profile', profile);
      return profile;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Could not update profile.'));
    }
  },
);

export const updateNotificationPreferences = createAsyncThunk<
  SettingsNotifications,
  SettingsNotifications,
  { rejectValue: string }
>('account/updateNotificationPreferences', async (preferences, { rejectWithValue }) => {
  try {
    await apiClient.patch('/user-details/settings/notifications', preferences);
    return preferences;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Could not update notification preferences.'));
  }
});

export const updatePasswordSettings = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>('account/updatePasswordSettings', async (payload, { rejectWithValue }) => {
  try {
    await apiClient.patch('/user-details/settings/password', payload);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Could not update password.'));
  }
});

export const markNotificationRead = createAsyncThunk<string, string, { rejectValue: string }>(
  'account/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await apiClient.patch(`/user-details/notifications/${notificationId}/read`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Could not update notification.'));
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk<void, void, { rejectValue: string }>(
  'account/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.patch('/user-details/notifications/read-all');
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Could not mark all notifications as read.'));
    }
  },
);

export const deleteNotification = createAsyncThunk<string, string, { rejectValue: string }>(
  'account/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/user-details/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Could not delete notification.'));
    }
  },
);

export const deleteAllNotifications = createAsyncThunk<void, void, { rejectValue: string }>(
  'account/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.delete('/user-details/notifications');
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Could not delete all notifications.'));
    }
  },
);

export const fetchReportsPageData = createAsyncThunk<
  { reports: ReportItem[]; planLimits: ReportPlanLimits | null },
  void,
  { rejectValue: string }
>('account/fetchReportsPageData', async (_, { rejectWithValue }) => {
  try {
    const [reportsResponse, limitsResponse] = await Promise.all([
      apiClient.get('/user-details/reports'),
      apiClient.get('/billing/plan-limits'),
    ]);

    return {
      reports: Array.isArray(reportsResponse.data?.reports) ? reportsResponse.data.reports : [],
      planLimits: (limitsResponse.data ?? null) as ReportPlanLimits | null,
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to load reports.'));
  }
});

export const requestReportPdf = createAsyncThunk<
  { searchId: string; action: ReportAction; objectUrl: string },
  { searchId: string; action: ReportAction },
  { rejectValue: string }
>('account/requestReportPdf', async ({ searchId, action }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/pdf/${action}/${searchId}`, {
      responseType: 'blob',
    });

    return {
      searchId,
      action,
      objectUrl: URL.createObjectURL(response.data as Blob),
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Could not generate PDF.'));
  }
});

interface AccountState {
  subscription: {
    data: BillingSnapshot | null;
    loading: boolean;
    error: string | null;
  };
  billing: {
    plans: BillingPlan[];
    loading: boolean;
    error: string | null;
    savingPlan: PlanTier | null;
    cancelLoading: boolean;
    pauseLoading: boolean;
    resumeLoading: boolean;
    resumeAutoRenewLoading: boolean;
    upgradeLoading: PlanTier | null;
    countryCode: string;
  };
  referral: {
    data: ReferralStatus | null;
    loading: boolean;
    generating: boolean;
    error: string | null;
  };
  settings: {
    profile: SettingsProfile;
    notificationPreferences: SettingsNotifications;
    loading: boolean;
    error: string | null;
    profileSaving: boolean;
    preferencesSaving: boolean;
    passwordSaving: boolean;
  };
  notifications: {
    unreadCount: number;
    topbar: {
      items: NotificationItem[];
      loading: boolean;
      error: string | null;
    };
    settings: {
      items: NotificationItem[];
      loading: boolean;
      error: string | null;
    };
  };
  reports: {
    data: ReportItem[];
    planLimits: ReportPlanLimits | null;
    loading: boolean;
    error: string | null;
    actionLoading: Record<string, ReportAction | null>;
  };
}

const initialState: AccountState = {
  subscription: {
    data: null,
    loading: false,
    error: null,
  },
  billing: {
    plans: [],
    loading: false,
    error: null,
    savingPlan: null,
    cancelLoading: false,
    pauseLoading: false,
    resumeLoading: false,
    resumeAutoRenewLoading: false,
    upgradeLoading: null,
    countryCode: 'US',
  },
  referral: {
    data: null,
    loading: false,
    generating: false,
    error: null,
  },
  settings: {
    profile: defaultProfile,
    notificationPreferences: defaultNotificationPrefs,
    loading: false,
    error: null,
    profileSaving: false,
    preferencesSaving: false,
    passwordSaving: false,
  },
  notifications: {
    unreadCount: 0,
    topbar: {
      items: [],
      loading: false,
      error: null,
    },
    settings: {
      items: [],
      loading: false,
      error: null,
    },
  },
  reports: {
    data: [],
    planLimits: null,
    loading: false,
    error: null,
    actionLoading: {},
  },
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionSnapshot.pending, (state) => {
        state.subscription.loading = true;
        state.subscription.error = null;
      })
      .addCase(fetchSubscriptionSnapshot.fulfilled, (state, action) => {
        state.subscription.loading = false;
        state.subscription.data = action.payload;
      })
      .addCase(fetchSubscriptionSnapshot.rejected, (state, action) => {
        state.subscription.loading = false;
        state.subscription.error = action.payload ?? 'Failed to load subscription data.';
      })
      .addCase(fetchBillingPageData.pending, (state) => {
        state.billing.loading = true;
        state.billing.error = null;
      })
      .addCase(fetchBillingPageData.fulfilled, (state, action) => {
        state.billing.loading = false;
        state.billing.plans = action.payload.plans;
        state.billing.countryCode = action.payload.countryCode;
        state.subscription.data = action.payload.snapshot;
        state.subscription.error = null;
      })
      .addCase(fetchBillingPageData.rejected, (state, action) => {
        state.billing.loading = false;
        state.billing.error = action.payload ?? 'Failed to load billing data.';
      })
      .addCase(subscribeToPlan.pending, (state, action) => {
        state.billing.savingPlan = action.meta.arg.tier;
        state.billing.error = null;
      })
      .addCase(subscribeToPlan.fulfilled, (state, action) => {
        state.billing.savingPlan = null;
        state.billing.plans = action.payload.plans;
        state.billing.countryCode = action.payload.countryCode;
        state.subscription.data = action.payload.snapshot;
      })
      .addCase(subscribeToPlan.rejected, (state, action) => {
        state.billing.savingPlan = null;
        state.billing.error = action.payload ?? 'Failed to update subscription.';
      })
      .addCase(cancelPlanSubscription.pending, (state) => {
        state.billing.cancelLoading = true;
        state.billing.error = null;
      })
      .addCase(cancelPlanSubscription.fulfilled, (state, action) => {
        state.billing.cancelLoading = false;
        state.billing.plans = action.payload.plans;
        state.billing.countryCode = action.payload.countryCode;
        state.subscription.data = action.payload.snapshot;
      })
      .addCase(cancelPlanSubscription.rejected, (state, action) => {
        state.billing.cancelLoading = false;
        state.billing.error = action.payload ?? 'Failed to cancel subscription.';
      })
      .addCase(pauseSubscription.pending, (state) => {
        state.billing.pauseLoading = true;
        state.billing.error = null;
      })
      .addCase(pauseSubscription.fulfilled, (state, action) => {
        state.billing.pauseLoading = false;
        state.billing.plans = action.payload.plans;
        state.billing.countryCode = action.payload.countryCode;
        state.subscription.data = action.payload.snapshot;
      })
      .addCase(pauseSubscription.rejected, (state, action) => {
        state.billing.pauseLoading = false;
        state.billing.error = action.payload ?? 'Failed to pause subscription.';
      })
      .addCase(resumeSubscription.pending, (state) => {
        state.billing.resumeLoading = true;
        state.billing.error = null;
      })
      .addCase(resumeSubscription.fulfilled, (state, action) => {
        state.billing.resumeLoading = false;
        state.billing.plans = action.payload.plans;
        state.billing.countryCode = action.payload.countryCode;
        state.subscription.data = action.payload.snapshot;
      })
      .addCase(resumeSubscription.rejected, (state, action) => {
        state.billing.resumeLoading = false;
        state.billing.error = action.payload ?? 'Failed to resume subscription.';
      })
      .addCase(resumeAutoRenew.pending, (state) => {
        state.billing.resumeAutoRenewLoading = true;
        state.billing.error = null;
      })
      .addCase(resumeAutoRenew.fulfilled, (state, action) => {
        state.billing.resumeAutoRenewLoading = false;
        state.billing.plans = action.payload.plans;
        state.billing.countryCode = action.payload.countryCode;
        state.subscription.data = action.payload.snapshot;
      })
      .addCase(resumeAutoRenew.rejected, (state, action) => {
        state.billing.resumeAutoRenewLoading = false;
        state.billing.error = action.payload ?? 'Failed to resume auto-renew.';
      })
      .addCase(upgradeSubscription.pending, (state, action) => {
        state.billing.upgradeLoading = action.meta.arg.tier;
        state.billing.error = null;
      })
      .addCase(upgradeSubscription.fulfilled, (state, action) => {
        state.billing.upgradeLoading = null;
        state.billing.plans = action.payload.plans;
        state.billing.countryCode = action.payload.countryCode;
        state.subscription.data = action.payload.snapshot;
      })
      .addCase(upgradeSubscription.rejected, (state, action) => {
        state.billing.upgradeLoading = null;
        state.billing.error = action.payload ?? 'Failed to change subscription.';
      })
      .addCase(fetchReferralStatus.pending, (state) => {
        state.referral.loading = true;
        state.referral.error = null;
      })
      .addCase(fetchReferralStatus.fulfilled, (state, action) => {
        state.referral.loading = false;
        state.referral.data = action.payload;
      })
      .addCase(fetchReferralStatus.rejected, (state, action) => {
        state.referral.loading = false;
        state.referral.error = action.payload ?? 'Failed to load referral status.';
      })
      .addCase(generateReferralWindow.pending, (state) => {
        state.referral.generating = true;
        state.referral.error = null;
      })
      .addCase(generateReferralWindow.fulfilled, (state, action) => {
        state.referral.generating = false;
        state.referral.data = action.payload;
      })
      .addCase(generateReferralWindow.rejected, (state, action) => {
        state.referral.generating = false;
        state.referral.error = action.payload ?? 'Failed to activate referral window.';
      })
      .addCase(fetchSettingsOverview.pending, (state) => {
        state.settings.loading = true;
        state.settings.error = null;
      })
      .addCase(fetchSettingsOverview.fulfilled, (state, action) => {
        state.settings.loading = false;
        state.settings.profile = action.payload.profile;
        state.settings.notificationPreferences = action.payload.notifications;
        state.notifications.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchSettingsOverview.rejected, (state, action) => {
        state.settings.loading = false;
        state.settings.error = action.payload ?? 'Failed to load settings.';
      })
      .addCase(fetchNotifications.pending, (state, action) => {
        state.notifications[action.meta.arg.scope].loading = true;
        state.notifications[action.meta.arg.scope].error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications[action.payload.scope].loading = false;
        state.notifications[action.payload.scope].items = action.payload.items;
        state.notifications.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notifications[action.meta.arg.scope].loading = false;
        state.notifications[action.meta.arg.scope].error = action.payload ?? 'Failed to load notifications.';
      })
      .addCase(updateProfileSettings.pending, (state) => {
        state.settings.profileSaving = true;
        state.settings.error = null;
      })
      .addCase(updateProfileSettings.fulfilled, (state, action) => {
        state.settings.profileSaving = false;
        state.settings.profile = action.payload;
      })
      .addCase(updateProfileSettings.rejected, (state, action) => {
        state.settings.profileSaving = false;
        state.settings.error = action.payload ?? 'Could not update profile.';
      })
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.settings.preferencesSaving = true;
        state.settings.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.settings.preferencesSaving = false;
        state.settings.notificationPreferences = action.payload;
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.settings.preferencesSaving = false;
        state.settings.error = action.payload ?? 'Could not update notification preferences.';
      })
      .addCase(updatePasswordSettings.pending, (state) => {
        state.settings.passwordSaving = true;
        state.settings.error = null;
      })
      .addCase(updatePasswordSettings.fulfilled, (state) => {
        state.settings.passwordSaving = false;
      })
      .addCase(updatePasswordSettings.rejected, (state, action) => {
        state.settings.passwordSaving = false;
        state.settings.error = action.payload ?? 'Could not update password.';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const targetId = action.payload;
        const shouldDecrement =
          !!getUnreadCandidate(state.notifications.topbar.items, targetId) ||
          !!getUnreadCandidate(state.notifications.settings.items, targetId);

        state.notifications.topbar.items = state.notifications.topbar.items.map((item) =>
          item._id === targetId ? { ...item, isRead: true } : item,
        );
        state.notifications.settings.items = state.notifications.settings.items.map((item) =>
          item._id === targetId ? { ...item, isRead: true } : item,
        );

        if (shouldDecrement) {
          state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.topbar.items = state.notifications.topbar.items.map((item) => ({ ...item, isRead: true }));
        state.notifications.settings.items = state.notifications.settings.items.map((item) => ({ ...item, isRead: true }));
        state.notifications.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const targetId = action.payload;
        const shouldDecrement =
          !!getUnreadCandidate(state.notifications.topbar.items, targetId) ||
          !!getUnreadCandidate(state.notifications.settings.items, targetId);

        state.notifications.topbar.items = state.notifications.topbar.items.filter((item) => item._id !== targetId);
        state.notifications.settings.items = state.notifications.settings.items.filter((item) => item._id !== targetId);

        if (shouldDecrement) {
          state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
        }
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications.topbar.items = [];
        state.notifications.settings.items = [];
        state.notifications.unreadCount = 0;
      })
      .addCase(fetchReportsPageData.pending, (state) => {
        state.reports.loading = true;
        state.reports.error = null;
      })
      .addCase(fetchReportsPageData.fulfilled, (state, action) => {
        state.reports.loading = false;
        state.reports.data = action.payload.reports;
        state.reports.planLimits = action.payload.planLimits;
      })
      .addCase(fetchReportsPageData.rejected, (state, action) => {
        state.reports.loading = false;
        state.reports.error = action.payload ?? 'Failed to load reports.';
      })
      .addCase(requestReportPdf.pending, (state, action) => {
        state.reports.actionLoading[action.meta.arg.searchId] = action.meta.arg.action;
        state.reports.error = null;
      })
      .addCase(requestReportPdf.fulfilled, (state, action) => {
        state.reports.actionLoading[action.payload.searchId] = null;
      })
      .addCase(requestReportPdf.rejected, (state, action) => {
        state.reports.actionLoading[action.meta.arg.searchId] = null;
        state.reports.error = action.payload ?? 'Could not generate PDF.';
      });
  },
});

export default accountSlice.reducer;