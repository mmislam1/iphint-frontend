export interface AdminPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminRecentActivity {
  type: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  description: string;
  details: Record<string, unknown>;
}

export interface AdminDashboardData {
  totalContent: number;
  underAnalysis: number;
  analysisComplete: number;
  memberCount: number;
  activeSubscriptions: number;
  searchesToday: number;
  revenueThisMonth: number;
  recentActivity: AdminRecentActivity[];
}

export interface AdminSubscriptionSummary {
  tier: string;
  planName: string;
  status: string;
  grantSource: string;
  billingCycle: string;
  trialEndDate: string;
  trialDaysLeft: number | null;
}

export interface AdminUserListItem {
  _id: string;
  name: string;
  email: string;
  status: string;
  subscription: AdminSubscriptionSummary | null;
  joiningDate: string;
  searchCount: number;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface AdminUsersResponse {
  data: AdminUserListItem[];
  pagination: AdminPagination;
}

export interface AdminMemberSearch {
  _id: string;
  image: string;
  status: string;
  date: string;
}

export interface AdminMemberSubscription {
  planId: string;
  planName: string;
  grantSource: string;
  status: string;
  billingCycle: string;
  trialEndDate: string;
  trialDaysLeft: number | null;
}

export interface AdminMemberDetails {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  affiliation: string;
  jobTitle: string;
  country: string;
  joiningDate: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  credits: number;
  monitors: number;
  subscriptionId: string;
  subscriptionStatus: string;
  subscription: AdminMemberSubscription | null;
  searchCount: number;
  searches: AdminMemberSearch[];
  referralCode: string;
  referralCount: number;
}

export interface AdminUserSearchesQuery {
  userId: string;
  page?: number;
  limit?: number;
}

export interface AdminUserSearchesResponse {
  userId: string;
  data: AdminMemberSearch[];
  pagination: AdminPagination;
}

export interface AdminDeactivateUserPayload {
  userId: string;
  reason?: string;
}

export interface AdminDeactivateUserResult {
  userId: string;
  email: string;
  isActive: boolean;
  message: string;
}

export interface AdminSearchListItem {
  _id: string;
  image: string;
  fileName: string;
  uploaderId: string;
  uploaderName: string;
  status: string;
  discoveryCount: number;
  uploadDate: string;
}

export interface AdminSearchesQuery {
  page?: number;
  limit?: number;
  status?: string;
  userName?: string;
}

export interface AdminSearchesResponse {
  data: AdminSearchListItem[];
  pagination: AdminPagination;
}

export interface AdminSearchUploader {
  _id: string;
  name: string;
  email: string;
}

export interface AdminSearchResultItem {
  _id: string;
  image: string;
  reviewStatus: string;
  reviewedAt: string | null;
  details: Record<string, unknown>;
}

export interface AdminSearchDetailsResults {
  data: AdminSearchResultItem[];
  pagination: AdminPagination;
}

export interface AdminSearchDetailsQuery {
  searchId: string;
  page?: number;
  limit?: number;
}

export interface AdminSearchDetails {
  _id: string;
  image: string;
  status: string;
  uploader: AdminSearchUploader;
  date: string;
  nextRescanAt: string | null;
  lastRescanAt: string | null;
  results: AdminSearchDetailsResults;
}

export interface AdminUsageStatusItem {
  status: string;
  count: number;
}

export interface AdminUsageTopUploader {
  name: string;
  uploads: number;
}

export interface AdminApiUsageSummary {
  generatedAt: string;
  sampleSize: number;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  failedRequests: number;
  searchesToday: number;
  activeMembers: number;
  averageDiscoveries: number;
  successRate: number;
  topUploaders: AdminUsageTopUploader[];
  statusBreakdown: AdminUsageStatusItem[];
}

export type AdminAnalyticsDateRange = '7d' | '30d' | '90d';

export interface AdminAnalyticsTimeseriesPoint {
  date: string;
  visitors: number;
  activeUsers: number;
  pageViews: number;
  sessions: number;
}

export interface AdminAnalyticsGeoPoint {
  label: string;
  value: number;
}

export interface AdminAnalyticsSourcePoint {
  label: string;
  sessions: number;
  users: number;
  engagementRate: number;
  bounceRate: number;
}

export interface AdminAnalyticsTechnologyPoint {
  label: string;
  sessions: number;
  users: number;
}

export interface AdminAnalyticsPagePoint {
  path: string;
  title: string;
  views: number;
  avgEngagementSeconds: number;
  engagementRate: number;
  bounceRate: number;
}

export interface AdminAnalyticsLandingPagePoint {
  landingPage: string;
  sessions: number;
  engagementRate: number;
  bounceRate: number;
  avgEngagementSeconds: number;
}

export interface AdminAnalyticsRealtimePoint {
  label: string;
  activeUsers: number;
}

export interface AdminAnalyticsRealtimePagePoint {
  path: string;
  activeUsers: number;
}

export interface AdminAnalyticsRealtimeSnapshot {
  totalActiveUsers: number;
  topCountries: AdminAnalyticsRealtimePoint[];
  topCities: AdminAnalyticsRealtimePoint[];
  devices: AdminAnalyticsRealtimePoint[];
  browsers: AdminAnalyticsRealtimePoint[];
  activePages: AdminAnalyticsRealtimePagePoint[];
}

export interface AdminAnalyticsSummary {
  totalVisitors: number;
  uniqueVisitors: number;
  activeVisitors: number;
  pageViews: number;
  sessions: number;
  engagementRate: number;
  bounceRate: number;
  averageSessionDurationSeconds: number;
}

export interface AdminWebsiteAnalytics {
  range: AdminAnalyticsDateRange;
  generatedAt: string;
  summary: AdminAnalyticsSummary;
  dailyTraffic: AdminAnalyticsTimeseriesPoint[];
  trafficGrowth: AdminAnalyticsTimeseriesPoint[];
  topCountries: AdminAnalyticsGeoPoint[];
  topCities: AdminAnalyticsGeoPoint[];
  trafficSources: AdminAnalyticsSourcePoint[];
  referrers: AdminAnalyticsSourcePoint[];
  deviceUsage: AdminAnalyticsTechnologyPoint[];
  browserUsage: AdminAnalyticsTechnologyPoint[];
  operatingSystemUsage: AdminAnalyticsTechnologyPoint[];
  topPages: AdminAnalyticsPagePoint[];
  topContent: AdminAnalyticsPagePoint[];
  topLandingPages: AdminAnalyticsLandingPagePoint[];
  realtime: AdminAnalyticsRealtimeSnapshot;
}