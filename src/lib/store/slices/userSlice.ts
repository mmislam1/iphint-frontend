import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { DashboardState } from '../../../types/dashboard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  referralCode: string;
  referralCount: number;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  data?: UserData;
  message?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
  companyName?: string;
  specificRole?: string;
  country?: string;
  phoneNumber?: string;
}

interface UserProfilePatch {
  name?: string;
  email?: string;
}

interface UserState extends DashboardState {
  // Auth
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  authNotice: string | null;

  // User info
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;

  // User dashboard fields
  credits: number;
  referralCode: string | null;
  referralCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
};

const saveSession = (token: string, user: UserData): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem('token', token);
  storage.setItem('user', JSON.stringify(user));
};

const clearSession = (): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem('token');
  storage.removeItem('user');
};

const loadSession = (): { token: string | null; user: UserData | null } => {
  const storage = getStorage();
  if (!storage) {
    return { token: null, user: null };
  }

  const token = storage.getItem('token') || null;

  try {
    return {
      token,
      user: JSON.parse(storage.getItem('user') || 'null'),
    };
  } catch {
    // Keep token even if user JSON is corrupted; profile can be re-hydrated later.
    return { token, user: null };
  }
};

const patchStoredUser = (patch: UserProfilePatch): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    const current = JSON.parse(storage.getItem('user') || 'null') as UserData | null;
    if (!current) {
      return;
    }

    const next: UserData = {
      ...current,
      ...(typeof patch.name === 'string' ? { name: patch.name } : {}),
      ...(typeof patch.email === 'string' ? { email: patch.email } : {}),
    };

    storage.setItem('user', JSON.stringify(next));
  } catch {
    // Ignore localStorage corruption and let fresh auth flows re-hydrate session.
  }
};

// ─── Initial State ────────────────────────────────────────────────────────────

const { token, user } = loadSession();

const initialState: UserState = {
  // ── Dashboard (untouched) ──────────────────────────────────────────────────
  stats: null,
  latestSearches: [],
  alerts: [],
  loading: false,
  error: null,

  // ── Auth ───────────────────────────────────────────────────────────────────
  token,
  isAuthenticated: !!token,
  authLoading: false,
  authError: null,
  authNotice: null,

  // ── User info ──────────────────────────────────────────────────────────────
  id: user?.id || null,
  name: user?.name || null,
  email: user?.email || null,
  role: user?.role || null,

  // ── User dashboard fields ──────────────────────────────────────────────────
  credits: user?.credits ?? 0,
  referralCode: user?.referralCode || null,
  referralCount: user?.referralCount ?? 0,
};

// ─── Dashboard Thunks (untouched) ─────────────────────────────────────────────

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/user-details/dashboard');
      return response.data;
    } catch (error) {
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
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load alerts'));
    }
  }
);

// ─── Auth Thunks ──────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Login failed'));
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>('user/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
    return data;
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Registration failed'));
  }
});

export const fetchCurrentUserProfile = createAsyncThunk<
  UserData,
  void,
  { rejectValue: string }
>('user/fetchCurrentUserProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get<AuthResponse>('/auth/me');
    const user = data?.data;

    if (!user) {
      return rejectWithValue('Failed to load user profile.');
    }

    const storage = getStorage();
    storage?.setItem('user', JSON.stringify(user));
    return user;
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Failed to load user profile.'));
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {
    logout(state) {
      clearSession();
      Object.assign(state, {
        token: null,
        isAuthenticated: false,
        id: null,
        name: null,
        email: null,
        role: null,
        credits: 0,
        referralCode: null,
        referralCount: 0,
        authLoading: false,
        authError: null,
        authNotice: null,
      });
    },

    clearError(state) {
      state.authError = null;
      state.authNotice = null;
    },

    updateCredits(state, action: PayloadAction<number>) {
      state.credits = action.payload;
    },

    incrementReferralCount(state) {
      state.referralCount += 1;
    },

    syncUserProfile(state, action: PayloadAction<UserProfilePatch>) {
      if (typeof action.payload.name === 'string') {
        state.name = action.payload.name;
      }

      if (typeof action.payload.email === 'string') {
        state.email = action.payload.email;
      }

      patchStoredUser(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      // ── Dashboard (untouched) ──────────────────────────────────────────────
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
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
      })

      // ── Login ──────────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
        state.authNotice = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, data } = action.payload;
        if (!token || !data) {
          state.authLoading = false;
          state.authError = 'Unexpected login response. Please try again.';
          return;
        }
        saveSession(token, data);
        state.authLoading = false;
        state.authError = null;
        state.authNotice = null;
        state.token = token;
        state.isAuthenticated = true;
        state.id = data.id;
        state.name = data.name;
        state.email = data.email;
        state.role = data.role;
        state.credits = data.credits;
        state.referralCode = data.referralCode;
        state.referralCount = data.referralCount;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload ?? 'Something went wrong';
      })

      // ── Register ───────────────────────────────────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
        state.authNotice = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.authError = null;
        const { token, data, message } = action.payload;

        if (token && data) {
          saveSession(token, data);
          state.authNotice = null;
          state.token = token;
          state.isAuthenticated = true;
          state.id = data.id;
          state.name = data.name;
          state.email = data.email;
          state.role = data.role;
          state.credits = data.credits;
          state.referralCode = data.referralCode;
          state.referralCount = data.referralCount;
          return;
        }

        // Verification-required registration flow: no active session yet.
        state.authNotice = message ?? 'Registration successful. Please verify your email before logging in.';
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload ?? 'Something went wrong';
        state.authNotice = null;
      })

      // ── Hydrate Current User Profile ───────────────────────────────────────
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        const data = action.payload;
        state.id = data.id;
        state.name = data.name;
        state.email = data.email;
        state.role = data.role;
        state.credits = data.credits;
        state.referralCode = data.referralCode;
        state.referralCount = data.referralCount;
      });
  },
});

export const { logout, clearError, updateCredits, incrementReferralCount, syncUserProfile } =
  userSlice.actions;

export default userSlice.reducer;

// ─── RootState ────────────────────────────────────────────────────────────────

interface RootState {
  user: UserState;
}

// ─── Selectors ────────────────────────────────────────────────────────────────

// Auth
export const selectIsAuthenticated = (state: RootState): boolean => state.user.isAuthenticated;
export const selectToken = (state: RootState): string | null => state.user.token;
export const selectAuthLoading = (state: RootState): boolean => state.user.authLoading;
export const selectAuthError = (state: RootState): string | null => state.user.authError;
export const selectAuthNotice = (state: RootState): string | null => state.user.authNotice;

// User info
export const selectUserId = (state: RootState): string | null => state.user.id;
export const selectUserName = (state: RootState): string | null => state.user.name;
export const selectUserEmail = (state: RootState): string | null => state.user.email;
export const selectUserRole = (state: RootState): string | null => state.user.role;

// User dashboard fields
export const selectCredits = (state: RootState): number => state.user.credits;
export const selectReferralCode = (state: RootState): string | null => state.user.referralCode;
export const selectReferralCount = (state: RootState): number => state.user.referralCount;

// Dashboard (untouched)
export const selectDashboardStats = (state: RootState) => state.user.stats;
export const selectLatestSearches = (state: RootState) => state.user.latestSearches;
export const selectAlerts = (state: RootState) => state.user.alerts;
export const selectDashboardLoading = (state: RootState): boolean => state.user.loading;
export const selectDashboardError = (state: RootState): string | null => state.user.error;