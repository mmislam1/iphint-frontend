import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, getApiErrorMessage } from '@/lib/api';

export type ReviewStatus =
  | 'not_reviewed'
  | 'takedown_request'
  | 'report_infringement'
  | 'dispute'
  | 'legal_support_request';

export interface MonitoringSearch {
  searchId: string;
  image: string;
  status: string;
  time: string;
  folderId?: string | null;
  fileName: string;
  totalResults: number;
  reviewedResults: number;
  analysisStatus: 'pending_review' | 'monitoring' | 'analysis_complete';
}

export interface MonitoringResult {
  _id: string;
  image: string;
  isLocked?: boolean;
  details?: {
    title?: string;
    link?: string;
    source?: string;
  };
  reviewStatus: ReviewStatus;
  reviewedAt?: string | null;
}

interface MonitoringState {
  searches: MonitoringSearch[];
  selectedSearch: {
    searchId: string;
    image: string;
    status: string;
    time: string;
    fileName: string;
  } | null;
  results: MonitoringResult[];
  planLimits: {
    tier: 'starter' | 'pro' | 'premium';
    maxResults: number;
    pdfEnabled: boolean;
    lockedCount: number;
  } | null;
  loading: boolean;
  resultsLoading: boolean;
  updatingResultId: string | null;
  deletingResultId: string | null;
  bulkDeleting: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
}

interface MonitoringSearchesPayload {
  data: MonitoringSearch[];
  pagination?: {
    page?: number;
    pages?: number;
    total?: number;
  };
}

interface MonitoringResultsPayload {
  search: MonitoringState['selectedSearch'];
  results: MonitoringResult[];
  planLimits: MonitoringState['planLimits'];
}

type MonitoringPlanLimits = NonNullable<MonitoringState['planLimits']>;

const unwrapData = <T>(payload: unknown): T => {
  const candidate = payload as { data?: T } | undefined;
  return (candidate?.data ?? payload) as T;
};

const normalizePaginationValue = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePlanTier = (value: unknown): MonitoringPlanLimits['tier'] => {
  if (value === 'pro' || value === 'premium') {
    return value;
  }

  return 'starter';
};

const normalizeMonitoringSearch = (search: Record<string, unknown>): MonitoringSearch => ({
  searchId: String(search.searchId ?? search._id ?? ''),
  image: String(search.image ?? ''),
  status: String(search.status ?? 'unknown'),
  time: String(search.time ?? search.date ?? search.createdAt ?? ''),
  folderId:
    search.folderId === undefined || search.folderId === null || search.folderId === ''
      ? null
      : String(search.folderId),
  fileName: String(search.fileName ?? search.imageName ?? 'monitoring-image'),
  totalResults: Number(search.totalResults ?? search.resultCount ?? search.totalMatches ?? 0),
  reviewedResults: Number(search.reviewedResults ?? search.reviewCount ?? 0),
  analysisStatus: String(
    search.analysisStatus ?? search.monitoringStatus ?? search.status ?? 'pending_review',
  ) as MonitoringSearch['analysisStatus'],
});

const normalizeMonitoringResult = (result: Record<string, unknown>): MonitoringResult => ({
  _id: String(result._id ?? result.resultId ?? ''),
  image: String(result.image ?? ''),
  isLocked: Boolean(result.isLocked ?? false),
  details:
    typeof result.details === 'object' && result.details !== null
      ? {
          title:
            typeof (result.details as { title?: unknown }).title === 'string'
              ? (result.details as { title?: string }).title
              : undefined,
          link:
            typeof (result.details as { link?: unknown }).link === 'string'
              ? (result.details as { link?: string }).link
              : undefined,
          source:
            typeof (result.details as { source?: unknown }).source === 'string'
              ? (result.details as { source?: string }).source
              : undefined,
        }
      : undefined,
  reviewStatus: String(result.reviewStatus ?? 'not_reviewed') as ReviewStatus,
  reviewedAt: result.reviewedAt ? String(result.reviewedAt) : null,
});

const normalizeMonitoringSearchesPayload = (payload: unknown): MonitoringSearchesPayload => {
  const rawPayload = Array.isArray(payload) ? payload : null;
  const outer = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  const data =
    typeof outer.data === 'object' && outer.data !== null && !Array.isArray(outer.data)
      ? (outer.data as Record<string, unknown>)
      : outer;
  const searches =
    rawPayload ??
    (Array.isArray(outer.data)
      ? outer.data
      : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.searches)
          ? data.searches
          : []);
  const pagination =
    typeof outer.pagination === 'object' && outer.pagination !== null
      ? (outer.pagination as { page?: unknown; pages?: unknown; total?: unknown })
      : typeof data.pagination === 'object' && data.pagination !== null
        ? (data.pagination as { page?: unknown; pages?: unknown; total?: unknown })
      : undefined;

  return {
    data: Array.isArray(searches)
      ? searches.map((item) => normalizeMonitoringSearch((item ?? {}) as Record<string, unknown>))
      : [],
    pagination: pagination
      ? {
          page: normalizePaginationValue(pagination.page, 1),
          pages: normalizePaginationValue(pagination.pages, 1),
          total: normalizePaginationValue(pagination.total, 0),
        }
      : undefined,
  };
};

const normalizeMonitoringResultsPayload = (payload: unknown): MonitoringResultsPayload => {
  const rawPayload = Array.isArray(payload) ? payload : null;
  const data = rawPayload ? {} : unwrapData<Record<string, unknown>>(payload) ?? {};
  const rawSearch =
    typeof data.search === 'object' && data.search !== null
      ? (data.search as Record<string, unknown>)
      : data;
  const rawResults =
    rawPayload ??
    (Array.isArray(data.results)
      ? data.results
      : Array.isArray(data.data)
        ? data.data
        : []);

  return {
    search:
      rawSearch && (rawSearch.searchId || rawSearch._id)
        ? {
            searchId: String(rawSearch.searchId ?? rawSearch._id ?? ''),
            image: String(rawSearch.image ?? ''),
            status: String(rawSearch.status ?? 'unknown'),
            time: String(rawSearch.time ?? rawSearch.date ?? rawSearch.createdAt ?? ''),
            fileName: String(rawSearch.fileName ?? rawSearch.imageName ?? 'monitoring-image'),
          }
        : null,
    results: rawResults.map((item) => normalizeMonitoringResult((item ?? {}) as Record<string, unknown>)),
    planLimits:
      typeof data.planLimits === 'object' && data.planLimits !== null
        ? {
            tier: normalizePlanTier((data.planLimits as { tier?: unknown }).tier),
            maxResults: Number((data.planLimits as { maxResults?: unknown }).maxResults ?? 0),
            pdfEnabled: Boolean((data.planLimits as { pdfEnabled?: unknown }).pdfEnabled ?? false),
            lockedCount: Number((data.planLimits as { lockedCount?: unknown }).lockedCount ?? 0),
          }
        : null,
  };
};

const normalizeUpdatedResult = (payload: unknown) => {
  const data = unwrapData<Record<string, unknown>>(payload) ?? {};
  const result =
    typeof data.result === 'object' && data.result !== null
      ? (data.result as Record<string, unknown>)
      : data;

  return {
    _id: String(result._id ?? result.resultId ?? ''),
    reviewStatus: String(result.reviewStatus ?? 'not_reviewed') as ReviewStatus,
    reviewedAt: result.reviewedAt ? String(result.reviewedAt) : null,
  };
};

const normalizeDeletedIds = (payload: unknown) => {
  const data = unwrapData<Record<string, unknown>>(payload) ?? {};
  const deletedIds =
    Array.isArray(data.deletedIds)
      ? data.deletedIds
      : Array.isArray(data.resultIds)
        ? data.resultIds
        : [];

  return deletedIds.map((item) => String(item));
};

const initialState: MonitoringState = {
  searches: [],
  selectedSearch: null,
  results: [],
  planLimits: null,
  loading: false,
  resultsLoading: false,
  updatingResultId: null,
  deletingResultId: null,
  bulkDeleting: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0,
};

export const fetchMonitoringSearches = createAsyncThunk(
  'monitoring/fetchSearches',
  async (
    params: { name?: string; date?: string; folderId?: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.get('/user/monitoring', { params });
      return normalizeMonitoringSearchesPayload(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load monitoring data'));
    }
  },
);

export const fetchMonitoringSearchResults = createAsyncThunk(
  'monitoring/fetchSearchResults',
  async (searchId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/user/monitoring/${searchId}/results`);
      return normalizeMonitoringResultsPayload(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load search results'));
    }
  },
);

export const updateMonitoringResultStatus = createAsyncThunk(
  'monitoring/updateResultStatus',
  async (
    payload: { resultId: string; reviewStatus: ReviewStatus },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.patch(
        `/user/monitoring/result/${payload.resultId}/status`,
        { reviewStatus: payload.reviewStatus },
    );
      return normalizeUpdatedResult(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update status'));
    }
  },
);

export const deleteMonitoringResult = createAsyncThunk(
  'monitoring/deleteResult',
  async (resultId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/user/monitoring/result/${resultId}`);
      return resultId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete result'));
    }
  },
);

export const bulkDeleteMonitoringResults = createAsyncThunk(
  'monitoring/bulkDeleteResults',
  async (resultIds: string[], { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/user/monitoring/results/bulk-delete', {
        resultIds,
      });
      return normalizeDeletedIds(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to bulk delete results'));
    }
  },
);

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    clearMonitoringState(state) {
      state.selectedSearch = null;
      state.results = [];
      state.planLimits = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonitoringSearches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonitoringSearches.fulfilled, (state, action) => {
        state.loading = false;
        state.searches = action.payload.data || [];
        state.page = action.payload.pagination?.page || 1;
        state.pages = action.payload.pagination?.pages || 1;
        state.total = action.payload.pagination?.total || 0;
      })
      .addCase(fetchMonitoringSearches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMonitoringSearchResults.pending, (state) => {
        state.resultsLoading = true;
        state.error = null;
      })
      .addCase(fetchMonitoringSearchResults.fulfilled, (state, action) => {
        state.resultsLoading = false;
        state.selectedSearch = action.payload.search || null;
        state.results = action.payload.results || [];
        state.planLimits = action.payload.planLimits || null;
      })
      .addCase(fetchMonitoringSearchResults.rejected, (state, action) => {
        state.resultsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMonitoringResultStatus.pending, (state, action) => {
        state.updatingResultId = action.meta.arg.resultId;
        state.error = null;
      })
      .addCase(updateMonitoringResultStatus.fulfilled, (state, action) => {
        state.updatingResultId = null;

        const index = state.results.findIndex((item) => item._id === action.payload._id);
        if (index >= 0) {
          state.results[index] = {
            ...state.results[index],
            reviewStatus: action.payload.reviewStatus,
            reviewedAt: action.payload.reviewedAt,
          };
        }
      })
      .addCase(updateMonitoringResultStatus.rejected, (state, action) => {
        state.updatingResultId = null;
        state.error = action.payload as string;
      })
      .addCase(deleteMonitoringResult.pending, (state, action) => {
        state.deletingResultId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteMonitoringResult.fulfilled, (state, action) => {
        state.deletingResultId = null;
        state.results = state.results.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteMonitoringResult.rejected, (state, action) => {
        state.deletingResultId = null;
        state.error = action.payload as string;
      })
      .addCase(bulkDeleteMonitoringResults.pending, (state) => {
        state.bulkDeleting = true;
        state.error = null;
      })
      .addCase(bulkDeleteMonitoringResults.fulfilled, (state, action) => {
        state.bulkDeleting = false;
        const deletedSet = new Set(action.payload);
        state.results = state.results.filter((item) => !deletedSet.has(item._id));
      })
      .addCase(bulkDeleteMonitoringResults.rejected, (state, action) => {
        state.bulkDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMonitoringState } = monitoringSlice.actions;
export default monitoringSlice.reducer;
