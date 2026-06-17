import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiClient } from '@/lib/api';
import type {
  AdminApiUsageSummary,
  AdminAnalyticsDateRange,
  AdminDashboardData,
  AdminDeactivateUserPayload,
  AdminDeactivateUserResult,
  AdminMemberDetails,
  AdminMemberSearch,
  AdminPagination,
  AdminRecentActivity,
  AdminSearchDetails,
  AdminSearchDetailsQuery,
  AdminSearchListItem,
  AdminSearchResultItem,
  AdminSearchesQuery,
  AdminSearchesResponse,
  AdminSearchUploader,
  AdminSubscriptionSummary,
  AdminUserListItem,
  AdminUserSearchesQuery,
  AdminUserSearchesResponse,
  AdminUsersQuery,
  AdminUsersResponse,
  AdminWebsiteAnalytics,
} from '@/types/admin';

const defaultPagination: AdminPagination = {
  total: 0,
  page: 1,
  limit: 10,
  pages: 0,
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  return (
    error.response?.data?.error?.message ||
    error.response?.data?.error ||
    error.response?.data?.message ||
    fallback
  );
};

const unwrapData = <T>(payload: unknown): T => {
  const candidate = payload as { data?: T } | undefined;
  return (candidate?.data ?? payload) as T;
};

const normalizePagination = (pagination?: Partial<AdminPagination>): AdminPagination => ({
  total: Number(pagination?.total ?? 0),
  page: Number(pagination?.page ?? 1),
  limit: Number(pagination?.limit ?? 10),
  pages: Number(pagination?.pages ?? 0),
});

const normalizeRecentActivity = (activity: Partial<AdminRecentActivity> | undefined): AdminRecentActivity => ({
  type: String(activity?.type ?? 'unknown'),
  userId: String(activity?.userId ?? ''),
  userName: String(activity?.userName ?? 'Unknown member'),
  userEmail: String(activity?.userEmail ?? ''),
  timestamp: String(activity?.timestamp ?? ''),
  description: String(activity?.description ?? ''),
  details:
    typeof activity?.details === 'object' && activity.details !== null
      ? activity.details
      : {},
});

const normalizeDashboard = (payload: unknown): AdminDashboardData => {
  const data = unwrapData<Partial<AdminDashboardData>>(payload) ?? {};

  return {
    totalContent: Number(data.totalContent ?? 0),
    underAnalysis: Number(data.underAnalysis ?? 0),
    analysisComplete: Number(data.analysisComplete ?? 0),
    memberCount: Number(data.memberCount ?? 0),
    activeSubscriptions: Number(data.activeSubscriptions ?? 0),
    searchesToday: Number(data.searchesToday ?? 0),
    revenueThisMonth: Number(data.revenueThisMonth ?? 0),
    recentActivity: Array.isArray(data.recentActivity)
      ? data.recentActivity.map((item) => normalizeRecentActivity(item))
      : [],
  };
};

const normalizeSubscription = (
  subscription: Partial<AdminSubscriptionSummary> | null | undefined,
): AdminSubscriptionSummary | null => {
  if (!subscription) {
    return null;
  }

  return {
    tier: String(subscription.tier ?? 'free'),
    planName: String(subscription.planName ?? ''),
    status: String(subscription.status ?? 'unknown'),
    grantSource: String(subscription.grantSource ?? ''),
    billingCycle: String(subscription.billingCycle ?? ''),
    trialEndDate: String(subscription.trialEndDate ?? ''),
    trialDaysLeft:
      subscription.trialDaysLeft === undefined || subscription.trialDaysLeft === null
        ? null
        : Number(subscription.trialDaysLeft),
  };
};

const normalizeUser = (user: Record<string, unknown>): AdminUserListItem => ({
  _id: String(user._id ?? ''),
  name: String(user.name ?? 'Unknown member'),
  email: String(user.email ?? ''),
  status: String(user.status ?? (user.isActive === false ? 'inactive' : 'active')),
  subscription: normalizeSubscription(
    (typeof user.subscription === 'object' && user.subscription !== null
      ? (user.subscription as Partial<AdminSubscriptionSummary>)
      : null),
  ),
  joiningDate: String(user.joiningDate ?? user.createdAt ?? ''),
  searchCount: Number(user.searchCount ?? 0),
});

const normalizeUsersResponse = (payload: unknown): AdminUsersResponse => {
  const data = unwrapData<{ data?: unknown[]; pagination?: Partial<AdminPagination> }>(payload) ?? {};

  return {
    data: Array.isArray(data.data) ? data.data.map((item) => normalizeUser((item ?? {}) as Record<string, unknown>)) : [],
    pagination: normalizePagination(data.pagination),
  };
};

const normalizeMemberSearch = (search: Record<string, unknown>): AdminMemberSearch => ({
  _id: String(search._id ?? ''),
  image: String(search.image ?? ''),
  status: String(search.status ?? 'unknown'),
  date: String(search.date ?? search.createdAt ?? search.uploadDate ?? ''),
});

const normalizeMemberDetails = (payload: unknown): AdminMemberDetails => {
  const data = unwrapData<Record<string, unknown>>(payload) ?? {};
  const subscription =
    typeof data.subscription === 'object' && data.subscription !== null
      ? (data.subscription as Record<string, unknown>)
      : null;

  return {
    _id: String(data._id ?? ''),
    name: String(data.name ?? 'Unknown member'),
    email: String(data.email ?? ''),
    phoneNumber: String(data.phoneNumber ?? ''),
    affiliation: String(data.affiliation ?? ''),
    jobTitle: String(data.jobTitle ?? ''),
    country: String(data.country ?? ''),
    joiningDate: String(data.joiningDate ?? data.createdAt ?? ''),
    role: String(data.role ?? 'general'),
    isActive: Boolean(data.isActive ?? false),
    isApproved: Boolean(data.isApproved ?? false),
    credits: Number(data.credits ?? 0),
    monitors: Number(data.monitors ?? 0),
    subscriptionId: String(data.subscriptionId ?? ''),
    subscriptionStatus: String(data.subscriptionStatus ?? ''),
    subscription: subscription
      ? {
          planId: String(subscription.planId ?? ''),
          planName:
            typeof subscription.planId === 'object' && subscription.planId !== null
              ? String((subscription.planId as Record<string, unknown>).name ?? '')
              : String(subscription.planName ?? ''),
          grantSource: String(subscription.grantSource ?? ''),
          status: String(subscription.status ?? ''),
          billingCycle: String(subscription.billingCycle ?? ''),
          trialEndDate: String(subscription.trialEndDate ?? ''),
          trialDaysLeft:
            subscription.trialDaysLeft === undefined || subscription.trialDaysLeft === null
              ? null
              : Number(subscription.trialDaysLeft),
        }
      : null,
    searchCount: Number(data.searchCount ?? 0),
    searches: Array.isArray(data.searches)
      ? data.searches.map((item) => normalizeMemberSearch((item ?? {}) as Record<string, unknown>))
      : [],
    referralCode: String(data.referralCode ?? ''),
    referralCount: Number(data.referralCount ?? 0),
  };
};

const normalizeUserSearchesResponse = (
  userId: string,
  payload: unknown,
): AdminUserSearchesResponse => {
  const data = unwrapData<{ data?: unknown[]; pagination?: Partial<AdminPagination> }>(payload) ?? {};

  return {
    userId,
    data: Array.isArray(data.data)
      ? data.data.map((item) => normalizeMemberSearch((item ?? {}) as Record<string, unknown>))
      : [],
    pagination: normalizePagination(data.pagination),
  };
};

const normalizeSearch = (search: Record<string, unknown>): AdminSearchListItem => ({
  _id: String(search._id ?? ''),
  image: String(search.image ?? ''),
  fileName: String(search.fileName ?? 'search-image'),
  uploaderId: String(search.uploaderId ?? ''),
  uploaderName: String(search.uploaderName ?? 'Unknown member'),
  status: String(search.status ?? 'unknown'),
  discoveryCount: Number(search.discoveryCount ?? 0),
  uploadDate: String(search.uploadDate ?? search.date ?? search.createdAt ?? ''),
});

const normalizeSearchesResponse = (payload: unknown): AdminSearchesResponse => {
  const data = unwrapData<{ data?: unknown[]; pagination?: Partial<AdminPagination> }>(payload) ?? {};

  return {
    data: Array.isArray(data.data)
      ? data.data.map((item) => normalizeSearch((item ?? {}) as Record<string, unknown>))
      : [],
    pagination: normalizePagination(data.pagination),
  };
};

const normalizeSearchUploader = (uploader: Record<string, unknown> | null | undefined): AdminSearchUploader => ({
  _id: String(uploader?._id ?? ''),
  name: String(uploader?.name ?? 'Unknown member'),
  email: String(uploader?.email ?? ''),
});

const normalizeSearchResult = (result: Record<string, unknown>): AdminSearchResultItem => ({
  _id: String(result._id ?? ''),
  image: String(result.image ?? ''),
  reviewStatus: String(result.reviewStatus ?? 'not_reviewed'),
  reviewedAt: result.reviewedAt ? String(result.reviewedAt) : null,
  details:
    typeof result.details === 'object' && result.details !== null
      ? (result.details as Record<string, unknown>)
      : {},
});

const normalizeSearchDetails = (payload: unknown): AdminSearchDetails => {
  const data = unwrapData<Record<string, unknown>>(payload) ?? {};
  const uploader =
    typeof data.uploader === 'object' && data.uploader !== null
      ? (data.uploader as Record<string, unknown>)
      : null;
  const results =
    typeof data.results === 'object' && data.results !== null
      ? (data.results as { data?: unknown[]; pagination?: Partial<AdminPagination> })
      : undefined;

  return {
    _id: String(data._id ?? ''),
    image: String(data.image ?? ''),
    status: String(data.status ?? 'unknown'),
    uploader: normalizeSearchUploader(uploader),
    date: String(data.date ?? data.uploadDate ?? data.createdAt ?? ''),
    nextRescanAt: data.nextRescanAt ? String(data.nextRescanAt) : null,
    lastRescanAt: data.lastRescanAt ? String(data.lastRescanAt) : null,
    results: {
      data: Array.isArray(results?.data)
        ? results.data.map((item) => normalizeSearchResult((item ?? {}) as Record<string, unknown>))
        : [],
      pagination: normalizePagination(results?.pagination),
    },
  };
};

const createQueryParams = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }

    query.set(key, String(value));
  });

  return query;
};

const deriveApiUsage = (
  dashboard: AdminDashboardData,
  searches: AdminSearchListItem[],
): AdminApiUsageSummary => {
  const statusBreakdownMap = searches.reduce<Record<string, number>>((accumulator, search) => {
    const status = search.status || 'unknown';
    accumulator[status] = (accumulator[status] ?? 0) + 1;
    return accumulator;
  }, {});

  const uploaderBreakdownMap = searches.reduce<Record<string, number>>((accumulator, search) => {
    const uploaderName = search.uploaderName || 'Unknown member';
    accumulator[uploaderName] = (accumulator[uploaderName] ?? 0) + 1;
    return accumulator;
  }, {});

  const totalDiscoveries = searches.reduce((accumulator, search) => accumulator + search.discoveryCount, 0);
  const totalRequests = dashboard.totalContent;
  const completedRequests = dashboard.analysisComplete;
  const pendingRequests = dashboard.underAnalysis;

  return {
    generatedAt: new Date().toISOString(),
    sampleSize: searches.length,
    totalRequests,
    completedRequests,
    pendingRequests,
    failedRequests: statusBreakdownMap.failed ?? 0,
    searchesToday: dashboard.searchesToday,
    activeMembers: dashboard.memberCount,
    averageDiscoveries: searches.length ? Number((totalDiscoveries / searches.length).toFixed(1)) : 0,
    successRate: totalRequests ? Number(((completedRequests / totalRequests) * 100).toFixed(1)) : 0,
    topUploaders: Object.entries(uploaderBreakdownMap)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([name, uploads]) => ({ name, uploads })),
    statusBreakdown: Object.entries(statusBreakdownMap)
      .sort((left, right) => right[1] - left[1])
      .map(([status, count]) => ({ status, count })),
  };
};

const normalizeWebsiteAnalytics = (payload: unknown): AdminWebsiteAnalytics => {
  const data = unwrapData<AdminWebsiteAnalytics>(payload);
  return data as AdminWebsiteAnalytics;
};

export const fetchAdminDashboard = createAsyncThunk<AdminDashboardData, void, { rejectValue: string }>(
  'admin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return normalizeDashboard(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch dashboard statistics'));
    }
  },
);

export const fetchAdminUsers = createAsyncThunk<AdminUsersResponse, AdminUsersQuery | undefined, { rejectValue: string }>(
  'admin/fetchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const params = createQueryParams({
        page: query?.page ?? 1,
        limit: query?.limit ?? 10,
        status: query?.status,
        search: query?.search,
      });

      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      return normalizeUsersResponse(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch users'));
    }
  },
);

export const fetchAdminUserDetails = createAsyncThunk<AdminMemberDetails, string, { rejectValue: string }>(
  'admin/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/userDetails/${userId}`);
      return normalizeMemberDetails(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch member details'));
    }
  },
);

export const fetchAdminUserSearches = createAsyncThunk<AdminUserSearchesResponse, AdminUserSearchesQuery, { rejectValue: string }>(
  'admin/fetchUserSearches',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = createQueryParams({ page, limit });
      const response = await apiClient.get(`/admin/userSearches/${userId}?${params.toString()}`);
      return normalizeUserSearchesResponse(userId, response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch member searches'));
    }
  },
);

export const deactivateAdminUser = createAsyncThunk<AdminDeactivateUserResult, AdminDeactivateUserPayload, { rejectValue: string }>(
  'admin/deactivateUser',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/admin/deactivate/${userId}`, reason ? { reason } : {});
      const data = unwrapData<{ userId?: string; email?: string; isActive?: boolean }>(response.data) ?? {};
      const message = String(response.data?.message ?? 'User has been deactivated');

      return {
        userId: String(data.userId ?? userId),
        email: String(data.email ?? ''),
        isActive: Boolean(data.isActive),
        message,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to deactivate user'));
    }
  },
);

export const fetchAdminSearches = createAsyncThunk<AdminSearchesResponse, AdminSearchesQuery | undefined, { rejectValue: string }>(
  'admin/fetchSearches',
  async (query, { rejectWithValue }) => {
    try {
      const params = createQueryParams({
        page: query?.page ?? 1,
        limit: query?.limit ?? 10,
        status: query?.status,
        userName: query?.userName,
      });

      const response = await apiClient.get(`/admin/searches?${params.toString()}`);
      return normalizeSearchesResponse(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch searches'));
    }
  },
);

export const fetchAdminSearchDetails = createAsyncThunk<AdminSearchDetails, AdminSearchDetailsQuery, { rejectValue: string }>(
  'admin/fetchSearchDetails',
  async ({ searchId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = createQueryParams({ page, limit });
      const response = await apiClient.get(`/admin/searchDetails/${searchId}?${params.toString()}`);
      return normalizeSearchDetails(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch search details'));
    }
  },
);

export const fetchAdminApiUsage = createAsyncThunk<AdminApiUsageSummary, { limit?: number } | undefined, { rejectValue: string }>(
  'admin/fetchApiUsage',
  async (query, { rejectWithValue }) => {
    try {
      const limit = query?.limit ?? 100;

      const [dashboardResponse, searchesResponse] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        apiClient.get(`/admin/searches?${createQueryParams({ page: 1, limit }).toString()}`),
      ]);

      const dashboard = normalizeDashboard(dashboardResponse.data);
      const searches = normalizeSearchesResponse(searchesResponse.data);
      return deriveApiUsage(dashboard, searches.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch API usage insights'));
    }
  },
);

export const fetchAdminWebsiteAnalytics = createAsyncThunk<
  AdminWebsiteAnalytics,
  { range: AdminAnalyticsDateRange },
  { rejectValue: string }
>(
  'admin/fetchWebsiteAnalytics',
  async ({ range }, { rejectWithValue }) => {
    try {
      const params = createQueryParams({ range });
      const response = await apiClient.get(`/admin/analytics?${params.toString()}`);
      return normalizeWebsiteAnalytics(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch website analytics'));
    }
  },
);

interface AdminState {
  dashboard: {
    data: AdminDashboardData | null;
    loading: boolean;
    error: string | null;
  };
  users: {
    data: AdminUserListItem[];
    pagination: AdminPagination;
    loading: boolean;
    error: string | null;
  };
  memberDetails: {
    data: AdminMemberDetails | null;
    loading: boolean;
    error: string | null;
  };
  memberSearches: {
    userId: string | null;
    data: AdminMemberSearch[];
    pagination: AdminPagination;
    loading: boolean;
    error: string | null;
  };
  searches: {
    data: AdminSearchListItem[];
    pagination: AdminPagination;
    loading: boolean;
    error: string | null;
  };
  searchDetails: {
    searchId: string | null;
    data: AdminSearchDetails | null;
    loading: boolean;
    error: string | null;
  };
  apiUsage: {
    data: AdminApiUsageSummary | null;
    loading: boolean;
    error: string | null;
  };
  analytics: {
    range: AdminAnalyticsDateRange;
    data: AdminWebsiteAnalytics | null;
    loading: boolean;
    error: string | null;
  };
  deactivation: {
    loadingByUserId: Record<string, boolean>;
    error: string | null;
    successMessage: string | null;
  };
}

const initialState: AdminState = {
  dashboard: {
    data: null,
    loading: false,
    error: null,
  },
  users: {
    data: [],
    pagination: defaultPagination,
    loading: false,
    error: null,
  },
  memberDetails: {
    data: null,
    loading: false,
    error: null,
  },
  memberSearches: {
    userId: null,
    data: [],
    pagination: defaultPagination,
    loading: false,
    error: null,
  },
  searches: {
    data: [],
    pagination: defaultPagination,
    loading: false,
    error: null,
  },
  searchDetails: {
    searchId: null,
    data: null,
    loading: false,
    error: null,
  },
  apiUsage: {
    data: null,
    loading: false,
    error: null,
  },
  analytics: {
    range: '30d',
    data: null,
    loading: false,
    error: null,
  },
  deactivation: {
    loadingByUserId: {},
    error: null,
    successMessage: null,
  },
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminMemberState(state) {
      state.memberDetails = {
        data: null,
        loading: false,
        error: null,
      };
      state.memberSearches = {
        userId: null,
        data: [],
        pagination: defaultPagination,
        loading: false,
        error: null,
      };
    },
    clearAdminDeactivationFeedback(state) {
      state.deactivation.error = null;
      state.deactivation.successMessage = null;
    },
    clearAdminSearchDetailsState(state) {
      state.searchDetails = {
        searchId: null,
        data: null,
        loading: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload ?? 'Failed to fetch dashboard statistics';
      })
      .addCase(fetchAdminUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.data = action.payload.data;
        state.users.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload ?? 'Failed to fetch users';
      })
      .addCase(fetchAdminUserDetails.pending, (state) => {
        state.memberDetails.loading = true;
        state.memberDetails.error = null;
      })
      .addCase(fetchAdminUserDetails.fulfilled, (state, action) => {
        state.memberDetails.loading = false;
        state.memberDetails.data = action.payload;
      })
      .addCase(fetchAdminUserDetails.rejected, (state, action) => {
        state.memberDetails.loading = false;
        state.memberDetails.error = action.payload ?? 'Failed to fetch member details';
      })
      .addCase(fetchAdminUserSearches.pending, (state) => {
        state.memberSearches.loading = true;
        state.memberSearches.error = null;
      })
      .addCase(fetchAdminUserSearches.fulfilled, (state, action) => {
        state.memberSearches.loading = false;
        state.memberSearches.userId = action.payload.userId;
        state.memberSearches.data = action.payload.data;
        state.memberSearches.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminUserSearches.rejected, (state, action) => {
        state.memberSearches.loading = false;
        state.memberSearches.error = action.payload ?? 'Failed to fetch member searches';
      })
      .addCase(deactivateAdminUser.pending, (state, action) => {
        state.deactivation.loadingByUserId[action.meta.arg.userId] = true;
        state.deactivation.error = null;
        state.deactivation.successMessage = null;
      })
      .addCase(deactivateAdminUser.fulfilled, (state, action) => {
        delete state.deactivation.loadingByUserId[action.payload.userId];
        state.deactivation.successMessage = action.payload.message;
        state.users.data = state.users.data.map((user) =>
          user._id === action.payload.userId
            ? { ...user, status: action.payload.isActive ? 'active' : 'inactive' }
            : user,
        );

        if (state.memberDetails.data?._id === action.payload.userId) {
          state.memberDetails.data.isActive = action.payload.isActive;
        }
      })
      .addCase(deactivateAdminUser.rejected, (state, action) => {
        delete state.deactivation.loadingByUserId[action.meta.arg.userId];
        state.deactivation.error = action.payload ?? 'Failed to deactivate user';
      })
      .addCase(fetchAdminSearches.pending, (state) => {
        state.searches.loading = true;
        state.searches.error = null;
      })
      .addCase(fetchAdminSearches.fulfilled, (state, action) => {
        state.searches.loading = false;
        state.searches.data = action.payload.data;
        state.searches.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminSearches.rejected, (state, action) => {
        state.searches.loading = false;
        state.searches.error = action.payload ?? 'Failed to fetch searches';
      })
      .addCase(fetchAdminSearchDetails.pending, (state, action) => {
        state.searchDetails.loading = true;
        state.searchDetails.error = null;
        state.searchDetails.searchId = action.meta.arg.searchId;
      })
      .addCase(fetchAdminSearchDetails.fulfilled, (state, action) => {
        state.searchDetails.loading = false;
        state.searchDetails.searchId = action.payload._id;
        state.searchDetails.data = action.payload;
      })
      .addCase(fetchAdminSearchDetails.rejected, (state, action) => {
        state.searchDetails.loading = false;
        state.searchDetails.error = action.payload ?? 'Failed to fetch search details';
      })
      .addCase(fetchAdminApiUsage.pending, (state) => {
        state.apiUsage.loading = true;
        state.apiUsage.error = null;
      })
      .addCase(fetchAdminApiUsage.fulfilled, (state, action) => {
        state.apiUsage.loading = false;
        state.apiUsage.data = action.payload;
      })
      .addCase(fetchAdminApiUsage.rejected, (state, action) => {
        state.apiUsage.loading = false;
        state.apiUsage.error = action.payload ?? 'Failed to fetch API usage insights';
      })
      .addCase(fetchAdminWebsiteAnalytics.pending, (state, action) => {
        state.analytics.loading = true;
        state.analytics.error = null;
        state.analytics.range = action.meta.arg.range;
      })
      .addCase(fetchAdminWebsiteAnalytics.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.data = action.payload;
      })
      .addCase(fetchAdminWebsiteAnalytics.rejected, (state, action) => {
        state.analytics.loading = false;
        state.analytics.error = action.payload ?? 'Failed to fetch website analytics';
      });
  },
});

export const { clearAdminMemberState, clearAdminDeactivationFeedback, clearAdminSearchDetailsState } = adminSlice.actions;
export default adminSlice.reducer;