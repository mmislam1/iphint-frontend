'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Menu, Bell, Check, Search, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import LocaleSwitcher from '@/components/layout/LocaleSwitcher';
import { getStoredNotificationLocale } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
	formatNotificationTimestamp,
	localizeNotificationText as localizeStoredNotificationText,
	normalizeNotificationLocale,
	type LocalizableNotification,
} from '@/lib/notifications';
import {
	fetchNotifications,
	fetchSettingsOverview,
	markAllNotificationsRead,
	markNotificationRead,
	deleteNotification,
} from '@/lib/store/slices/accountSlice';

interface NotificationItem extends LocalizableNotification {
	_id: string;
	title: string;
	message?: string;
	isRead?: boolean;
	actionUrl?: string;
	timestamp: string;
}

const normalizeNotificationActionUrl = (value?: string): string | null => {
	if (!value) return null;

	let path = value.trim();
	if (!path) return null;

	// Handle absolute URLs copied into stored notifications.
	if (/^https?:\/\//i.test(path)) {
		try {
			path = new URL(path).pathname;
		} catch {
			return null;
		}
	}

	// Strip locale prefix if present.
	path = path.replace(/^\/(en|kr)(?=\/|$)/i, '');

	// Migrate legacy dashboard links to current user routes.
	if (path === '/dashboard') {
		return '/user';
	}
	if (path.startsWith('/dashboard/')) {
		return `/user${path.slice('/dashboard'.length)}`;
	}

	if (!path.startsWith('/')) {
		path = `/${path}`;
	}

	return path;
};

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
	const t = useTranslations('Dashboard.topbar');
	const locale = useLocale();
	const dispatch = useAppDispatch();
	const router = useRouter();
	const pathname = usePathname();
	const [notificationOpen, setNotificationOpen] = useState(false);
	const [notificationQuery, setNotificationQuery] = useState('');
	const notifications = useAppSelector((state) => state.account.notifications.topbar.items) as NotificationItem[];
	const unreadCount = useAppSelector((state) => state.account.notifications.unreadCount);
	const notificationPreferences = useAppSelector((state) => state.account.settings.notificationPreferences);
	const settingsLoaded = useAppSelector((state) => state.account.settings.loaded);
	const settingsLoading = useAppSelector((state) => state.account.settings.loading);
	const notificationLocale = normalizeNotificationLocale(
		notificationPreferences.locale ?? getStoredNotificationLocale() ?? locale,
	);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const notificationQueryRef = useRef(notificationQuery);

	const pageTitle = (() => {
		if (!pathname) return t('pageTitles.dashboard');
		if (pathname === '/user') return t('pageTitles.dashboard');
		if (pathname.startsWith('/user/monitoring')) return t('pageTitles.monitoring');
		if (pathname.startsWith('/user/billing')) return t('pageTitles.billing');
		if (pathname.startsWith('/user/settings')) return t('pageTitles.settings');
		if (pathname.startsWith('/user/searches/')) return t('pageTitles.details');
		if (pathname.startsWith('/user/searches')) return t('pageTitles.searches');
		return t('pageTitles.dashboard');
	})();

	const loadNotifications = React.useCallback(async (q = '') => {
		await dispatch(
			fetchNotifications({
				scope: 'topbar',
				status: 'all',
				page: 1,
				limit: 8,
				q,
				locale: notificationLocale,
			}),
		).unwrap();
	}, [dispatch, notificationLocale]);

	const loadUnreadCount = React.useCallback(async () => {
		await dispatch(
			fetchNotifications({
				scope: 'topbar',
				status: 'unread',
				page: 1,
				limit: 1,
				locale: notificationLocale,
			}),
		).unwrap();
	}, [dispatch, notificationLocale]);

	useEffect(() => {
		if (settingsLoaded || settingsLoading) return;

		dispatch(fetchSettingsOverview()).unwrap().catch(() => {
			return;
		});
	}, [dispatch, settingsLoaded, settingsLoading]);

	useEffect(() => {
		loadUnreadCount().catch(() => {
			return;
		});

		const refreshInterval = window.setInterval(() => {
			loadUnreadCount().catch(() => {
				return;
			});
		}, 30000);

		return () => {
			window.clearInterval(refreshInterval);
		};
	}, [loadUnreadCount]);

	useEffect(() => {
		if (!notificationOpen) return;

		loadNotifications(notificationQueryRef.current).catch(() => {
			return;
		});
	}, [notificationOpen, loadNotifications]);

	useEffect(() => {
		notificationQueryRef.current = notificationQuery;

		if (!notificationOpen) return;

		const timeout = window.setTimeout(() => {
			loadNotifications(notificationQuery).catch(() => {
				return;
			});
		}, 240);

		return () => window.clearTimeout(timeout);
	}, [notificationQuery, notificationOpen, loadNotifications]);

	useEffect(() => {
		const closeOnOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setNotificationOpen(false);
			}
		};

		document.addEventListener('mousedown', closeOnOutside);
		return () => document.removeEventListener('mousedown', closeOnOutside);
	}, []);

	const markRead = async (id: string) => {
		await dispatch(markNotificationRead({ notificationId: id, locale: notificationLocale }));
	};

	const removeNotification = async (id: string) => {
		await dispatch(deleteNotification(id));
	};

	const markAllRead = async () => {
		await dispatch(markAllNotificationsRead());
	};

	const goToNotification = async (item: NotificationItem) => {
		if (!item.isRead) {
			await markRead(item._id);
		}
		const targetPath = normalizeNotificationActionUrl(item.actionUrl);
		if (targetPath) {
			router.push(targetPath);
			setNotificationOpen(false);
		}
	};

	const localizeNotificationText = (
		value?: string,
		item?: NotificationItem,
		field: 'title' | 'message' = 'message',
	) => {
		const localized = localizeStoredNotificationText(value, notificationLocale, item, field);
		if (localized !== value) return localized;

		if (!value || notificationLocale !== 'ko') return value;

		const normalized = value.trim();

		if (/^Your free trial has ended\. Upgrade to continue using the service\.?$/i.test(normalized)) {
			return '무료 체험이 종료되었습니다. 서비스를 계속 이용하려면 업그레이드하세요.';
		}

		const trialEndingMatch = normalized.match(
			/^Your free trial ends in (\d+) day(?:s)?\. Upgrade to keep access\.?$/i,
		);
		if (trialEndingMatch) {
			const days = trialEndingMatch[1];
			return `무료 체험이 ${days}일 후 종료됩니다. 이용을 유지하려면 업그레이드하세요.`;
		}

		return value;
	};

	return (
		<header className="sticky top-0 z-20 h-16 border-b border-gray-200 bg-white shadow-sm">
			<div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
				<div className="flex min-w-0 items-center gap-3">
					<button
						aria-label={t('openSidebar')}
						onClick={onMenuClick}
						className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 lg:hidden"
					>
						<Menu size={18} />
					</button>
					<h1 className="max-w-[9rem] truncate text-base font-semibold leading-none text-gray-900 sm:max-w-none sm:text-lg">{pageTitle}</h1>
				</div>

				<div className="flex items-center gap-1.5 sm:gap-2">
					<div ref={menuRef} className="relative">
						<button
							type="button"
							onClick={() => setNotificationOpen((prev) => !prev)}
							className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
							aria-label={t('openNotifications')}
						>
							<Bell size={16} />
							{unreadCount > 0 && (
								<span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
									{unreadCount > 9 ? '9+' : unreadCount}
								</span>
							)}
						</button>

						{notificationOpen && (
							<div className="fixed inset-x-0 top-16 z-30 w-screen max-w-none rounded-none border-y border-gray-200 bg-white p-3 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-96 sm:max-w-[calc(100vw-1rem)] sm:rounded-xl sm:border">
								<div className="mb-2 flex items-center justify-between">
									<p className="text-sm font-semibold text-gray-900">{t('notifications')}</p>
									<button
										type="button"
										onClick={markAllRead}
										className="text-xs text-gray-600 hover:text-gray-900"
									>
										{t('markAllRead')}
									</button>
								</div>

								<div className="relative mb-2">
									<Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
									<input
										value={notificationQuery}
										onChange={(e) => setNotificationQuery(e.target.value)}
										placeholder={t('searchPlaceholder')}
										className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-xs text-gray-800 outline-none focus:border-gray-400"
									/>
								</div>

								<div className="max-h-80 space-y-2 overflow-y-auto pr-1">
									{notifications.length === 0 ? (
										<p className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-500">
											{t('empty')}
										</p>
									) : (
										notifications.map((item) => (
											<div
												key={item._id}
												className={[
													'rounded-lg border px-2.5 py-2',
													item.isRead ? 'border-gray-200 bg-white' : 'border-emerald-200 bg-emerald-50/40',
												].join(' ')}
											>
												<div className="flex items-start gap-2">
													<button
														type="button"
														onClick={() => goToNotification(item)}
														className="min-w-0 flex-1 cursor-pointer text-left"
													>
														<p className="line-clamp-1 text-xs font-semibold text-gray-900">{localizeNotificationText(item.title, item, 'title')}</p>
														{item.message && <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{localizeNotificationText(item.message, item, 'message')}</p>}
														<p className="mt-1 text-[10px] text-gray-400">{formatNotificationTimestamp(item.timestamp, notificationLocale)}</p>
													</button>

													<div className="flex items-center gap-1">
														{!item.isRead && (
															<button
																type="button"
																onClick={() => markRead(item._id)}
																className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
																aria-label={t('markAsRead')}
															>
																<Check className="h-3.5 w-3.5" />
															</button>
														)}
														<button
															type="button"
															onClick={() => removeNotification(item._id)}
															className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50"
															aria-label={t('deleteNotification')}
														>
															<Trash2 className="h-3.5 w-3.5" />
														</button>
													</div>
												</div>
											</div>
										))
									)}
								</div>
							</div>
						)}
					</div>

					<LocaleSwitcher />
				</div>
			</div>
		</header>
	);
}
