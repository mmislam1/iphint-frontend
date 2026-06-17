import React from 'react';
import { ArrowRight, ScanLine } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

export const NewScanBanner: React.FC<{ t: any }> = ({ t }) => {
	const router = useRouter();

	const handleClick = () => {
		router.push('/user/searches');
	};

	return (
		<div className="flex flex-col gap-5 rounded-xl bg-gray-950 p-5 text-white shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:p-8">
			<div className="min-w-0 flex-1">
				<h2 className="mb-2 max-w-full truncate text-xl font-bold text-white sm:text-2xl" title={t('startScanTitle')}>
					{t('startScanTitle')}
				</h2>
				<p className="mb-5 max-w-full truncate text-sm text-gray-300 sm:mb-6" title={t('startScanSub')}>
					{t('startScanSub')}
				</p>
				<button
					className="flex w-full max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-900 transition-colors hover:bg-gray-100 sm:w-auto sm:px-6"
					onClick={handleClick}
				>
					<span className="min-w-0 truncate">{t('uploadBtn')}</span>
					<ArrowRight size={16} className="shrink-0" />
				</button>
			</div>

			<div className="hidden shrink-0 opacity-20 sm:block">
				<ScanLine size={100} />
			</div>
		</div>
	);
};
