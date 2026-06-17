export interface DashboardStats {
  totalScans: number;
  activeMonitors: number;
  totalMatches: number;
  monitorComplete?: number;
  pendingReview?: number;
}

export interface SearchDetail {
  searchId: string;
  image: string;
  status: string;
  time: string;
  resultCount: number;
  fileName: string;
}

export interface AlertData {
  _id: string;
  title: string;
  timestamp: string;
}

export interface DashboardState {
  stats: DashboardStats | null;
  latestSearches: SearchDetail[];
  alerts: AlertData[];
  loading: boolean;
  error: string | null;
}