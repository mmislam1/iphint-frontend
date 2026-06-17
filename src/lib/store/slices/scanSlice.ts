import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, getApiErrorMessage } from '@/lib/api';

export interface SearchFolder {
  _id: string;
  name: string;
}

export interface ScanResult {
  _id?: string;
  image?: string;
  isLocked?: boolean;
  details?: {
    title?: string;
    link?: string;
    source?: string;
  };
}

interface ScanState {
  searchId: string | null;
  results: ScanResult[];
  loading: boolean;
  foldersLoading: boolean;
  folders: SearchFolder[];
  currentFolderId: string;
  error: string | null;
}

export const performScan = createAsyncThunk(
  'scan/performScan',
  async (payload: File | string, { rejectWithValue }) => {
    try {
      let requestData;
      
      if (payload instanceof File) {
        requestData = new FormData();
        requestData.append('image', payload);
      } else {
        requestData = { imageUrl: payload };
      }

      const response = await apiClient.post('/serp/search', requestData);

      return {
        searchId: response.data?.searchId || null,
        results: Array.isArray(response.data?.results) ? response.data.results : [],
      };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to perform image scan.'));
    }
  }
);

export const fetchFolders = createAsyncThunk('scan/fetchFolders', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/user-details/folders');
    return response.data?.folders || [];
  } catch (error: unknown) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch folders.'));
  }
});

export const createFolder = createAsyncThunk(
  'scan/createFolder',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/user-details/folders', { name });
      return response.data?.folder;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create folder.'));
    }
  },
);

export const deleteFolder = createAsyncThunk(
  'scan/deleteFolder',
  async (folderId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/user-details/folders/${folderId}`);
      return folderId;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete folder.'));
    }
  },
);

export const assignSearchFolder = createAsyncThunk(
  'scan/assignSearchFolder',
  async (
    payload: { searchId: string; folderId: string },
    { rejectWithValue },
  ) => {
    try {
      await apiClient.patch(`/user-details/search/${payload.searchId}/folder`, {
        folderId: payload.folderId,
      });
      return payload.folderId;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to assign folder.'));
    }
  },
);

const scanSlice = createSlice({
  name: 'scan',
  initialState: {
    searchId: null,
    results: [],
    loading: false,
    foldersLoading: false,
    folders: [],
    currentFolderId: '',
    error: null,
  } as ScanState,
  reducers: {
    clearResults: (state) => {
      state.searchId = null;
      state.results = [];
      state.currentFolderId = '';
      state.error = null;
    },
    setCurrentFolderId: (state, action) => {
      state.currentFolderId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performScan.fulfilled, (state, action) => {
        state.loading = false;
        state.searchId = action.payload.searchId;
        state.results = action.payload.results;
        state.currentFolderId = '';
      })
      .addCase(performScan.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to perform image scan.';
      })
      .addCase(fetchFolders.pending, (state) => {
        state.foldersLoading = true;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.foldersLoading = false;
        state.folders = action.payload;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.foldersLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch folders.';
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        if (action.payload?._id) {
          state.folders = [action.payload, ...state.folders];
          state.currentFolderId = action.payload._id;
        }
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to create folder.';
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter((folder) => folder._id !== action.payload);
        if (state.currentFolderId === action.payload) {
          state.currentFolderId = '';
        }
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to delete folder.';
      })
      .addCase(assignSearchFolder.fulfilled, (state, action) => {
        state.currentFolderId = action.payload;
      })
      .addCase(assignSearchFolder.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to assign folder.';
      });
  },
});

export const { clearResults, setCurrentFolderId } = scanSlice.actions;
export default scanSlice.reducer;