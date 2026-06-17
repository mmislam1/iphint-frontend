'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Mail, Palette, RefreshCcw, Search, Shield, Trash2, UserCircle2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useRouter } from '@/i18n/routing';
import {
  setFontSize,
  FONT_SIZE_LABELS,
  type FontSizeKey,
} from '@/lib/store/slices/themeSlice';
import {
  deleteAllNotifications,
  deleteNotification,
  fetchNotifications,
  fetchSettingsOverview,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
  updatePasswordSettings,
  updateProfileSettings,
} from '@/lib/store/slices/accountSlice';
import { syncUserProfile } from '@/lib/store/slices/userSlice';

type SummaryFrequency = 'instant' | 'daily' | 'weekly';

interface SettingsProfile {
  name: string;
  email: string;
  affiliation: string;
  jobTitle: string;
  country: string;
  phoneNumber: string;
  role: string;
  joiningDate: string;
}

interface SettingsNotifications {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  weeklyRescanEnabled: boolean;
  notifyOnNewMatches: boolean;
  summaryFrequency: SummaryFrequency;
}

interface NotificationItem {
  _id: string;
  title: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  actionUrl?: string;
  timestamp: string;
}

const normalizeNotificationActionUrl = (value?: string): string | null => {
  if (!value) return null;

  let path = value.trim();
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      return null;
    }
  }

  path = path.replace(/^\/(en|kr)(?=\/|$)/i, '');

  if (path === '/dashboard') return '/user';
  if (path.startsWith('/dashboard/')) {
    return `/user${path.slice('/dashboard'.length)}`;
  }

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  return path;
};

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('UserPanel.settings');
  const {
    profile: storedProfile,
    notificationPreferences: storedNotificationPrefs,
    loading,
    error: settingsError,
    profileSaving,
    preferencesSaving: prefsSaving,
    passwordSaving,
  } = useAppSelector((state) => state.account.settings);
  const notifications = useAppSelector((state) => state.account.notifications.settings.items) as NotificationItem[];
  const notificationsError = useAppSelector((state) => state.account.notifications.settings.error);
  const unreadCount = useAppSelector((state) => state.account.notifications.unreadCount);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settingsSection, setSettingsSection] = useState<'profile' | 'notifications' | 'appearance'>('profile');
  const { fontSize } = useAppSelector((state) => state.theme);

  const [profile, setProfile] = useState<SettingsProfile>({
    name: '',
    email: '',
    affiliation: '',
    jobTitle: '',
    country: '',
    phoneNumber: '',
    role: '',
    joiningDate: '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState<SettingsNotifications>({
    emailEnabled: true,
    inAppEnabled: true,
    weeklyRescanEnabled: true,
    notifyOnNewMatches: true,
    summaryFrequency: 'instant',
  });

  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
  const [notificationQuery, setNotificationQuery] = useState('');
  const [pendingDeleteNotificationId, setPendingDeleteNotificationId] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const joinDateLabel = useMemo(() => {
    if (!profile.joiningDate) return 'N/A';
    const date = new Date(profile.joiningDate);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  }, [profile.joiningDate]);

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess('');
      return;
    }
    setSuccess(msg);
    setError('');
  };

  const loadSettings = React.useCallback(async () => {
    await dispatch(fetchSettingsOverview()).unwrap();
  }, [dispatch]);

  const loadNotifications = React.useCallback(async (status: 'all' | 'unread', q = '') => {
    await dispatch(
      fetchNotifications({ scope: 'settings', status, q, page: 1, limit: 20 }),
    ).unwrap();
  }, [dispatch]);

  useEffect(() => {
    setProfile(storedProfile);
  }, [storedProfile]);

  useEffect(() => {
    setNotificationPrefs(storedNotificationPrefs);
  }, [storedNotificationPrefs]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setError('');
        await Promise.all([loadSettings(), loadNotifications('all', '')]);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to load settings');
        setSuccess('');
      }
    };

    bootstrap();
  }, [loadNotifications, loadSettings]);

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = await dispatch(updateProfileSettings(profile)).unwrap();
      dispatch(syncUserProfile({ name: updatedProfile.name, email: updatedProfile.email }));
      showMessage(t('profileSaved'));
    } catch (err) {
      showMessage(typeof err === 'string' ? err : t('profileSaveFailed'), true);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await dispatch(updateNotificationPreferences(notificationPrefs)).unwrap();
      showMessage(t('preferencesSaved'));
    } catch (err) {
      showMessage(typeof err === 'string' ? err : t('preferencesSaveFailed'), true);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage(t('passwordMismatch'), true);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showMessage(t('passwordTooShort'), true);
      return;
    }

    try {
      await dispatch(updatePasswordSettings({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })).unwrap();
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage(t('passwordSaved'));
    } catch (err) {
      showMessage(typeof err === 'string' ? err : t('passwordSaveFailed'), true);
    }
  };

  const applyNotificationFilter = async (status: 'all' | 'unread') => {
    setNotificationFilter(status);
    try {
      await loadNotifications(status, notificationQuery);
    } catch {
      showMessage(t('notificationsFailed'), true);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      await loadNotifications(notificationFilter, notificationQuery);
      showMessage(t('notificationDeleted'));
    } catch {
      showMessage(t('notificationDeleteFailed'), true);
    }
  };

  const confirmDeleteNotification = async () => {
    if (!pendingDeleteNotificationId) return;
    await handleDeleteNotification(pendingDeleteNotificationId);
    setPendingDeleteNotificationId(null);
  };

  useEffect(() => {
    if (!pendingDeleteNotificationId) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-delete-confirm-popover]')) return;
      if (target.closest('[data-delete-confirm-trigger]')) return;

      setPendingDeleteNotificationId(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPendingDeleteNotificationId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [pendingDeleteNotificationId]);

  const handleDeleteAllNotifications = async () => {
    try {
      await dispatch(deleteAllNotifications()).unwrap();
      showMessage(t('allDeleted'));
    } catch {
      showMessage(t('allDeleteFailed'), true);
    }
  };

  const handleNotificationSearch = async () => {
    try {
      await loadNotifications(notificationFilter, notificationQuery);
    } catch {
      showMessage(t('searchFailed'), true);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await dispatch(markNotificationRead(id)).unwrap();
      await loadNotifications(notificationFilter, notificationQuery);
    } catch {
      showMessage(t('markReadFailed'), true);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsRead()).unwrap();
      await loadNotifications(notificationFilter, notificationQuery);
      showMessage(t('allMarkedRead'));
    } catch {
      showMessage(t('markAllReadFailed'), true);
    }
  };

  const handleOpenNotification = async (item: NotificationItem) => {
    try {
      if (!item.isRead) {
        await dispatch(markNotificationRead(item._id)).unwrap();
      }

      const targetPath = normalizeNotificationActionUrl(item.actionUrl);
      if (targetPath) {
        router.push(targetPath);
      }
    } catch {
      showMessage(t('openFailed'), true);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-52 animate-pulse rounded-2xl bg-white border border-gray-100" />
        <div className="h-52 animate-pulse rounded-2xl bg-white border border-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('description')}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {t('unreadLabel')} <span className="font-semibold text-gray-900">{unreadCount}</span>
          </div>
        </div>

        <div className="mt-4 inline-flex flex-wrap gap-2" role="tablist" aria-label="Settings sections">
          <button
            type="button"
            role="tab"
            aria-selected={settingsSection === 'profile'}
            onClick={() => setSettingsSection('profile')}
            className={[
              'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              settingsSection === 'profile'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900',
            ].join(' ')}
          >
            <UserCircle2 className="h-4 w-4" />
            {t('tabProfile')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={settingsSection === 'notifications'}
            onClick={() => setSettingsSection('notifications')}
            className={[
              'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              settingsSection === 'notifications'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900',
            ].join(' ')}
          >
            <Bell className="h-4 w-4" />
            {t('tabNotifications')}
            {unreadCount > 0 && (
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  settingsSection === 'notifications' ? 'bg-white/20 text-white' : 'bg-gray-900 text-white',
                ].join(' ')}
              >
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={settingsSection === 'appearance'}
            onClick={() => setSettingsSection('appearance')}
            className={[
              'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              settingsSection === 'appearance'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900',
            ].join(' ')}
          >
            <Palette className="h-4 w-4" />
            {t('tabAppearance')}
          </button>
        </div>
      </div>

      {(error || settingsError || notificationsError) && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error || settingsError || notificationsError}</div>}
      {success && <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      {settingsSection === 'profile' && (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-gray-900">
          <UserCircle2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('profileTitle')}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm text-gray-600">
            {t('fullName')}
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600">
            {t('email')}
            <input
              value={profile.email}
              disabled
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </label>

          <label className="text-sm text-gray-600">
            {t('organization')}
            <input
              value={profile.affiliation}
              onChange={(e) => setProfile((p) => ({ ...p, affiliation: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600">
            {t('jobTitle')}
            <input
              value={profile.jobTitle}
              onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600">
            {t('country')}
            <input
              value={profile.country}
              onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600">
            {t('phoneNumber')}
            <input
              value={profile.phoneNumber}
              onChange={(e) => setProfile((p) => ({ ...p, phoneNumber: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>{t('roleLabel')} {profile.role || 'general'}</span>
          <span>{t('joinedLabel')} {joinDateLabel}</span>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={profileSaving}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {profileSaving ? t('saving') : t('saveProfile')}
        </button>
      </section>
      )}

      {settingsSection === 'notifications' && (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-gray-900">
          <Mail className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('notificationsTitle')}</h2>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          {t('notificationsDescription')}
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            {t('emailNotifications')}
            <input
              type="checkbox"
              checked={notificationPrefs.emailEnabled}
              onChange={(e) => setNotificationPrefs((p) => ({ ...p, emailEnabled: e.target.checked }))}
              className="h-4 w-4 accent-gray-900"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            {t('inAppNotifications')}
            <input
              type="checkbox"
              checked={notificationPrefs.inAppEnabled}
              onChange={(e) => setNotificationPrefs((p) => ({ ...p, inAppEnabled: e.target.checked }))}
              className="h-4 w-4 accent-gray-900"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            {t('weeklyRescan')}
            <input
              type="checkbox"
              checked={notificationPrefs.weeklyRescanEnabled}
              onChange={(e) => setNotificationPrefs((p) => ({ ...p, weeklyRescanEnabled: e.target.checked }))}
              className="h-4 w-4 accent-gray-900"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            {t('notifyMatches')}
            <input
              type="checkbox"
              checked={notificationPrefs.notifyOnNewMatches}
              onChange={(e) => setNotificationPrefs((p) => ({ ...p, notifyOnNewMatches: e.target.checked }))}
              className="h-4 w-4 accent-gray-900"
            />
          </label>

          <label className="text-sm text-gray-600">
            {t('digestFrequency')}
            <select
              value={notificationPrefs.summaryFrequency}
              onChange={(e) =>
                setNotificationPrefs((p) => ({ ...p, summaryFrequency: e.target.value as SummaryFrequency }))
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            >
              <option value="instant">{t('instant')}</option>
              <option value="daily">{t('daily')}</option>
              <option value="weekly">{t('weekly')}</option>
            </select>
          </label>
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={prefsSaving}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {prefsSaving ? t('saving') : t('savePreferences')}
        </button>
      </section>
      )}

      {settingsSection === 'profile' && (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-gray-900">
          <Shield className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('securityTitle')}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-sm text-gray-600">
            {t('currentPassword')}
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>
          <label className="text-sm text-gray-600">
            {t('newPassword')}
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>
          <label className="text-sm text-gray-600">
            {t('confirmPassword')}
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>
        </div>

        <button
          onClick={handleUpdatePassword}
          disabled={passwordSaving}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {passwordSaving ? t('updating') : t('updatePassword')}
        </button>
      </section>
      )}

      {settingsSection === 'notifications' && (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-900">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t('inboxTitle')}</h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{t('unreadCount', { count: unreadCount })}</span>
            <button
              onClick={handleMarkAllRead}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              {t('markAllRead')}
            </button>
            <button
              onClick={handleDeleteAllNotifications}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
            >
              {t('deleteAll')}
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={notificationQuery}
              onChange={(e) => setNotificationQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNotificationSearch();
              }}
              placeholder={t('searchAlerts')}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-gray-400"
            />
          </div>
          <button
            onClick={handleNotificationSearch}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {t('search')}
          </button>
          <button
            onClick={() => applyNotificationFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-sm ${notificationFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('all')}
          </button>
          <button
            onClick={() => applyNotificationFilter('unread')}
            className={`rounded-lg px-3 py-1.5 text-sm ${notificationFilter === 'unread' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('unread')}
          </button>
          <button
            onClick={() => applyNotificationFilter(notificationFilter)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            {t('refresh')}
          </button>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
              {t('noNotifications')}
            </p>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => item.actionUrl && handleOpenNotification(item)}
                className={`rounded-xl border px-4 py-3 ${item.isRead ? 'border-gray-200 bg-white' : 'border-emerald-200 bg-emerald-50/40'} ${item.actionUrl ? 'cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50/80' : ''}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    {item.message && <p className="mt-1 text-sm text-gray-600">{item.message}</p>}
                    <p className="mt-2 text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-center">
                    {!item.isRead && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMarkRead(item._id);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('markRead')}
                      </button>
                    )}
                    <div className="relative">
                      <button
                        data-delete-confirm-trigger
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDeleteNotificationId(item._id);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('delete')}
                      </button>

                      {pendingDeleteNotificationId === item._id && (
                        <div
                          data-delete-confirm-popover
                          onClick={(event) => event.stopPropagation()}
                          className="absolute bottom-full right-0 z-30 mb-1.5 w-32 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-lg"
                        >
                          <p className="text-center text-[11px] font-semibold text-black">{t('deleteConfirm')}</p>
                          <div className="mt-1.5 flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPendingDeleteNotificationId(null)}
                              className="rounded-md border border-black px-2 py-0.5 text-[10px] font-medium text-black hover:bg-gray-100"
                            >
                              {t('no')}
                            </button>
                            <button
                              type="button"
                              onClick={confirmDeleteNotification}
                              className="rounded-md bg-black px-2 py-0.5 text-[10px] font-medium text-white hover:bg-gray-900"
                            >
                              {t('yes')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      )}

      {settingsSection === 'appearance' && (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-gray-900">
          <Palette className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('appearanceTitle')}</h2>
        </div>

        <div className="space-y-8">
          {/* Font Family */}
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-900">{t('fontFamilyTitle')}</p>
            <p className="mb-3 text-xs text-gray-500">{t('fontFamilyDescription')}</p>
            <div className="flex flex-wrap gap-2">
              <span
                className={[
                  'rounded-lg border px-4 py-2 text-sm transition-colors',
                  locale === 'en'
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-700',
                ].join(' ')}
              >
                Noto Sans
              </span>
              <span
                className={[
                  'rounded-lg border px-4 py-2 text-sm transition-colors',
                  locale === 'kr'
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-700',
                ].join(' ')}
              >
                Pretendard
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-500">{t('fontNote')}</p>
          </div>

          {/* Font Size */}
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-900">{t('fontSizeTitle')}</p>
            <p className="mb-3 text-xs text-gray-500">{t('fontSizeDescription')}</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FONT_SIZE_LABELS) as FontSizeKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => dispatch(setFontSize(key))}
                  className={[
                    'rounded-lg border px-4 py-2 text-sm transition-colors',
                    fontSize === key
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100',
                  ].join(' ')}
                >
                  {FONT_SIZE_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{t('previewLabel')}</p>
            <p className="text-2xl font-bold text-gray-900">The quick brown fox</p>
            <p className="text-base text-gray-600">jumps over the lazy dog. 0123456789</p>
            <p className="mt-1 text-sm text-gray-400">ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz</p>
          </div>
        </div>
      </section>
      )}
    </div>
  );
}
