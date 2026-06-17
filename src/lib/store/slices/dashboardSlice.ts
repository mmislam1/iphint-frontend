import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { DashboardState } from '../../../types/dashboard';

const initialState: DashboardState = {
  stats: null,
  latestSearches: [],
  alerts: [],
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/user-details/dashboard');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load dashboard'));
    }
  }
);

export const fetchAlerts = createAsyncThunk(
  'dashboard/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/user-details/alerts');
      return response.data.alerts;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load alerts'));
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.latestSearches = action.payload.latestSearches;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Alerts Data
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
      });
  },
});

export default dashboardSlice.reducer;