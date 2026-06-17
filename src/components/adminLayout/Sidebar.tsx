'use client';

import React from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { BarChart3, ChartArea, LayoutDashboard, LogOut, Search, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { AppDispatch } from '@/lib/store/store';
import { logout } from '@/lib/store/slices/userSlice';

const closeOnMobileOnly = (onClose: () => void) => {
	if (typeof window !== 'undefined' && window.innerWidth < 1024) {
		onClose();
	}
};

export default function AdminSidebar({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const t = useTranslations('Admin');
	const dispatch = useDispatch<AppDispatch>();
	const pathname = usePathname();
	const router = useRouter();
	const menu = [
		{ label: t('sidebar.dashboard'), href: '/admin', icon: LayoutDashboard },
		{ label: t('sidebar.users'), href: '/admin/users', icon: Users },
		{ label: t('sidebar.searches'), href: '/admin/searches', icon: Search },
		{ label: t('sidebar.analytics'), href: '/admin/analytics', icon: ChartArea },
		{ label: t('sidebar.apiUsage'), href: '/admin/api-usage', icon: BarChart3 },
	];

	const isItemActive = (href: string) => {
		if (href === '/admin') {
			return pathname === '/admin';
		}

		return pathname === href || pathname.startsWith(`${href}/`);
	};

	const handleLogout = () => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			localStorage.removeItem('lastActivityAt');
		}
		dispatch(logout());
		router.replace('/login?loggedOut=1');
	};

	return (
		<>
			{open && (
				<button
					aria-label="Close admin sidebar overlay"
					className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
					onClick={onClose}
				/>
			)}

			<aside
				className={[
					'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white shadow-sm transition-transform duration-200',
					open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
				].join(' ')}
			>
				<div className="flex h-full flex-col">
					<button
						type="button"
						onClick={() => {
							closeOnMobileOnly(onClose);
							router.push('/admin');
						}}
						className="flex h-16 items-center border-b border-slate-200 px-5"
						aria-label="Go to admin dashboard"
					>
						<Image src="/logo_mo.svg" alt="IPHINT" width={102} height={28} priority className="h-7 w-auto" />
					</button>

					<nav className="flex-1 space-y-1 px-3 py-4">
						{menu.map((item) => {
							const Icon = item.icon;
							const active = isItemActive(item.href);

							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => closeOnMobileOnly(onClose)}
									className={[
										'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
										active
											? 'bg-slate-950 text-white ring-1 ring-slate-950'
											: 'text-slate-700 hover:bg-slate-50',
									].join(' ')}
								>
									<Icon className={active ? 'h-4 w-4 text-white' : 'h-4 w-4 text-slate-500'} />
									<span>{item.label}</span>
								</Link>
							);
						})}
					</nav>

					<div className="border-t border-slate-200 px-3 py-3">
						<button
							type="button"
							onClick={() => {
								closeOnMobileOnly(onClose);
								router.push('/user');
							}}
							className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm leading-5 font-medium text-white hover:bg-gray-800"
						>
							<LayoutDashboard className="h-4 w-4 text-white" />
							<span>{t('common.goToUserDashboard')}</span>
						</button>

						<button
							type="button"
							onClick={handleLogout}
							className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-5 font-medium text-gray-700 hover:bg-gray-50"
						>
							<LogOut className="h-4 w-4 text-gray-600" />
							<span>{t('common.logout')}</span>
						</button>
					</div>
				</div>
			</aside>
		</>
	);
}
