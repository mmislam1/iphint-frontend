'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	ArrowLeft,
	CheckCircle2,
	ChevronDown,
	Clock3,
	ExternalLink,
	Search,
	ShieldCheck,
	Trash2,
	X,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { AppDispatch, RootState } from '@/lib/store/store';
import { fetchDashboardData } from '@/lib/store/slices/userSlice';
import {
	bulkDeleteMonitoringResults,
	clearMonitoringState,
	deleteMonitoringResult,
	fetchMonitoringSearchResults,
	ReviewStatus,
	updateMonitoringResultStatus,
} from '@/lib/store/slices/monitoringSlice';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
	monitoring: { bg: 'bg-blue-50', text: 'text-blue-700' },
	analysis_complete: { bg: 'bg-green-50', text: 'text-green-700' },
	pending_review: { bg: 'bg-amber-50', text: 'text-amber-700' },
	completed: { bg: 'bg-green-50', text: 'text-green-700' },
	pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
};

function StatusBadge({ status }: { status: string }) {
	const style = STATUS_STYLES[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
	return (
		<span
			className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${style.bg} ${style.text}`}
		>
			{status.replace(/_/g, ' ')}
		</span>
	);
}

type BulkAction = ReviewStatus | 'delete' | '__none';
type DateFilter = 'latest' | 'oldest' | 'new';

type DeleteConfirmState =
	| {
		mode: 'single';
		resultId: string;
		count: 1;
	  }
	| {
		mode: 'bulk';
		count: number;
	  }
	| null;

const REVIEW_STATUS_VALUES: ReviewStatus[] = [
	'not_reviewed',
	'takedown_request',
	'report_infringement',
	'dispute',
	'legal_support_request',
];

const NEW_BADGE_WINDOW_MS = 3 * 60 * 1000;

const getFoundDateFromObjectId = (id: string): Date | null => {
	if (!id || id.length < 8) return null;
	const timestampSeconds = Number.parseInt(id.slice(0, 8), 16);
	if (!Number.isFinite(timestampSeconds)) return null;
	return new Date(timestampSeconds * 1000);
};

export default function SearchDetailsPage() {
	const dispatch = useDispatch<AppDispatch>();
	const router = useRouter();
	const params = useParams();
	const locale = String(params?.locale || 'en').toLowerCase();
	const isKorean = locale === 'kr';
	const id = params?.id as string;
	const [selectedResultIds, setSelectedResultIds] = useState<string[]>([]);
	const [bulkAction, setBulkAction] = useState<BulkAction>('__none');
	const [dateFilter, setDateFilter] = useState<DateFilter>('latest');
	const [isBulkUpdating, setIsBulkUpdating] = useState(false);
	const [previewResultId, setPreviewResultId] = useState<string | null>(null);
	const [deleteConfirmState, setDeleteConfirmState] = useState<DeleteConfirmState>(null);
	const [viewedResultIds, setViewedResultIds] = useState<string[]>([]);
	const [timeTick, setTimeTick] = useState(Date.now());
	const { selectedSearch, results, planLimits, resultsLoading, updatingResultId, deletingResultId, bulkDeleting, error } = useSelector(
		(state: RootState) => state.monitoring,
	);
	const viewedStorageKey = useMemo(() => `monitoring:viewed-results:${id}`, [id]);

	const labels = useMemo(
		() =>
			isKorean
				? {
					loadingSearchDetails: '검색 상세 정보를 불러오는 중...',
					totalResults: '전체 결과',
					reviewed: '검토 완료',
					pendingReview: '검토 대기',
					status: '상태',
					fileName: '파일명',
					date: '날짜',
					progress: '진행률',
					reviewedProgress: '검토됨',
					searchDetails: '검색 상세',
					reviewAndManage: '이미지 검색 결과를 검토하고 관리하세요.',
					backToMonitoring: '모니터링으로 돌아가기',
					searchOverview: '검색 개요',
					results: '결과',
					total: '전체',
					hiddenByPlan: '개의 결과가 요금제 제한으로 숨겨져 있습니다. 전체 썸네일과 출처 링크를 보려면 업그레이드하세요.',
					upgradePlan: '요금제 업그레이드',
					selectAll: '전체 선택',
					imagesSelected: '개 이미지 선택됨',
					apply: '적용',
					working: '처리 중...',
					loadingResults: '결과를 불러오는 중...',
					noResults: '이 검색에 대한 결과 이미지가 없습니다.',
					openImagePreview: '이미지 미리보기 열기',
					found: '발견',
					new: '신규',
					upgradeToViewResult: '이 결과를 보려면 요금제를 업그레이드하세요',
					untitledResult: '제목 없는 결과',
					unknownSource: '알 수 없는 출처',
					visit: '방문',
					upgrade: '업그레이드',
					image: '이미지',
					details: '상세',
					foundDate: '발견일',
					source: '출처',
					closePreview: '미리보기 닫기',
					resultImagePreview: '결과 이미지 미리보기',
					confirmDeletion: '삭제 확인',
					singleDeleteConfirm: '선택한 결과 이미지를 이 검토에서 영구 삭제합니다.',
					multiDeleteConfirmPrefix: '선택한 ',
					multiDeleteConfirmSuffix: '개 결과 이미지를 이 검토에서 영구 삭제합니다.',
					cannotBeUndone: '이 작업은 되돌릴 수 없습니다.',
					cancel: '취소',
					delete: '삭제',
					deleting: '삭제 중...',
					bulkAction: '일괄 작업',
					latestFirst: '최신순',
					oldestFirst: '오래된순',
					newOnly: '신규만',
					notReviewed: '미검토',
					takedownRequest: '삭제 요청',
					reportInfringement: '침해 신고',
					dispute: '이의 제기',
					legalSupportRequest: '법률지원 신청',
				}
				: {
					loadingSearchDetails: 'Loading search details...',
					totalResults: 'Total Results',
					reviewed: 'Reviewed',
					pendingReview: 'Pending Review',
					status: 'Status',
					fileName: 'File Name',
					date: 'Date',
					progress: 'Progress',
					reviewedProgress: 'reviewed',
					searchDetails: 'Search Details',
					reviewAndManage: 'Review and manage image search results.',
					backToMonitoring: 'Back to Monitoring',
					searchOverview: 'Search Overview',
					results: 'Results',
					total: 'total',
					hiddenByPlan: 'result(s) hidden by plan limit. Upgrade to unlock full thumbnails and source links.',
					upgradePlan: 'Upgrade plan',
					selectAll: 'Select all',
					imagesSelected: 'image(s) selected',
					apply: 'Apply',
					working: 'Working...',
					loadingResults: 'Loading results...',
					noResults: 'No result images found for this search.',
					openImagePreview: 'Open image preview',
					found: 'Found',
					new: 'New',
					upgradeToViewResult: 'Upgrade plan to view this result',
					untitledResult: 'Untitled result',
					unknownSource: 'Unknown source',
					visit: 'Visit',
					upgrade: 'Upgrade',
					image: 'Image',
					details: 'Details',
					foundDate: 'Found Date',
					source: 'Source',
					closePreview: 'Close preview',
					resultImagePreview: 'result image preview',
					confirmDeletion: 'Confirm Deletion',
					singleDeleteConfirm: 'This will permanently remove the selected result image from this review.',
					multiDeleteConfirmPrefix: 'This will permanently remove ',
					multiDeleteConfirmSuffix: ' selected result image(s) from this review.',
					cannotBeUndone: 'This action cannot be undone.',
					cancel: 'Cancel',
					delete: 'Delete',
					deleting: 'Deleting...',
					bulkAction: 'Bulk Action',
					latestFirst: 'Latest first',
					oldestFirst: 'Oldest first',
					newOnly: 'New only',
					notReviewed: 'Not Reviewed',
					takedownRequest: 'Takedown Request',
					reportInfringement: 'Report Infringement',
					dispute: 'Dispute',
					legalSupportRequest: 'Legal Support Request',
				},
		[isKorean],
	);

	const reviewStatusOptions = useMemo<Array<{ value: ReviewStatus; label: string }>>(
		() => [
			{ value: 'not_reviewed', label: labels.notReviewed },
			{ value: 'takedown_request', label: labels.takedownRequest },
			{ value: 'report_infringement', label: labels.reportInfringement },
			{ value: 'dispute', label: labels.dispute },
			{ value: 'legal_support_request', label: labels.legalSupportRequest },
		],
		[labels],
	);

	const bulkActionOptions = useMemo<Array<{ value: BulkAction; label: string }>>(
		() => [{ value: '__none', label: labels.bulkAction }, ...reviewStatusOptions, { value: 'delete', label: labels.delete }],
		[labels, reviewStatusOptions],
	);

	const dateFilterOptions = useMemo<Array<{ value: DateFilter; label: string }>>(
		() => [
			{ value: 'latest', label: labels.latestFirst },
			{ value: 'oldest', label: labels.oldestFirst },
			{ value: 'new', label: labels.newOnly },
		],
		[labels],
	);

	useEffect(() => {
		if (id) {
			dispatch(fetchMonitoringSearchResults(id));
		}
	}, [dispatch, id]);

	useEffect(() => {
		setSelectedResultIds([]);
	}, [id]);

	useEffect(() => {
		if (!id) {
			setViewedResultIds([]);
			return;
		}

		try {
			const raw = localStorage.getItem(viewedStorageKey);
			const parsed = raw ? JSON.parse(raw) : [];
			setViewedResultIds(Array.isArray(parsed) ? parsed : []);
		} catch {
			setViewedResultIds([]);
		}
	}, [id, viewedStorageKey]);

	useEffect(() => {
		if (!id) return;
		localStorage.setItem(viewedStorageKey, JSON.stringify(viewedResultIds));
	}, [id, viewedResultIds, viewedStorageKey]);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setTimeTick(Date.now());
		}, 30000);

		return () => {
			window.clearInterval(timer);
		};
	}, []);

	useEffect(() => {
		return () => {
			dispatch(clearMonitoringState());
		};
	}, [dispatch]);

	const reviewedCount = useMemo(
		() =>
			results.filter((result) =>
				['takedown_request', 'report_infringement', 'dispute', 'legal_support_request'].includes(result.reviewStatus),
			).length,
		[results],
	);

	const previewResult = useMemo(
		() => results.find((result) => result._id === previewResultId) || null,
		[results, previewResultId],
	);

	const markResultViewed = (resultId: string) => {
		setViewedResultIds((prev) => (prev.includes(resultId) ? prev : [...prev, resultId]));
	};

	const sortedResults = useMemo(() => {
		const copy = [...results];
		copy.sort((a, b) => {
			const aTime = getFoundDateFromObjectId(a._id)?.getTime() || 0;
			const bTime = getFoundDateFromObjectId(b._id)?.getTime() || 0;
			return dateFilter === 'oldest' ? aTime - bTime : bTime - aTime;
		});
		return copy;
	}, [results, dateFilter]);

	const visibleResults = useMemo(() => {
		if (dateFilter !== 'new') return sortedResults;
		const now = timeTick;
		return sortedResults.filter((result) => {
			const foundAt = getFoundDateFromObjectId(result._id);
			if (!foundAt) return false;
			const withinWindow = now - foundAt.getTime() <= NEW_BADGE_WINDOW_MS;
			return withinWindow && !viewedResultIds.includes(result._id);
		});
	}, [dateFilter, sortedResults, viewedResultIds, timeTick]);

	const isResultNew = (resultId: string) => {
		if (viewedResultIds.includes(resultId)) return false;
		const foundAt = getFoundDateFromObjectId(resultId);
		if (!foundAt) return false;
		return timeTick - foundAt.getTime() <= NEW_BADGE_WINDOW_MS;
	};

	const handleStatusChange = (resultId: string, reviewStatus: ReviewStatus) => {
		dispatch(updateMonitoringResultStatus({ resultId, reviewStatus })).then(() => {
			dispatch(fetchMonitoringSearchResults(id));
			dispatch(fetchDashboardData());
		});
	};

	const visibleResultIds = visibleResults.map((result) => result._id);
	const allSelected =
		visibleResultIds.length > 0 &&
		visibleResultIds.every((resultId) => selectedResultIds.includes(resultId));

	const toggleAll = () => {
		if (allSelected) {
			setSelectedResultIds((prev) => prev.filter((resultId) => !visibleResultIds.includes(resultId)));
			return;
		}
		setSelectedResultIds((prev) => Array.from(new Set([...prev, ...visibleResultIds])));
	};

	const toggleOne = (resultId: string) => {
		setSelectedResultIds((prev) =>
			prev.includes(resultId) ? prev.filter((entry) => entry !== resultId) : [...prev, resultId],
		);
	};

	const applyBulkAction = async () => {
		if (!selectedResultIds.length || !id || bulkAction === '__none') return;

		if (bulkAction === 'delete') {
			setDeleteConfirmState({ mode: 'bulk', count: selectedResultIds.length });
			return;
		}

		try {
			setIsBulkUpdating(true);
			await Promise.all(
				selectedResultIds.map((resultId) =>
					dispatch(updateMonitoringResultStatus({ resultId, reviewStatus: bulkAction })).unwrap(),
				),
			);

			await dispatch(fetchMonitoringSearchResults(id));
			await dispatch(fetchDashboardData());
			setSelectedResultIds([]);
		} finally {
			setIsBulkUpdating(false);
		}
	};

	const requestDeleteResult = (resultId: string) => {
		setDeleteConfirmState({ mode: 'single', resultId, count: 1 });
	};

	const confirmDelete = async () => {
		if (!deleteConfirmState) return;

		if (deleteConfirmState.mode === 'single') {
			await dispatch(deleteMonitoringResult(deleteConfirmState.resultId)).unwrap();
			setSelectedResultIds((prev) => prev.filter((entry) => entry !== deleteConfirmState.resultId));
		} else {
			await dispatch(bulkDeleteMonitoringResults(selectedResultIds)).unwrap();
			setSelectedResultIds([]);
		}

		await dispatch(fetchMonitoringSearchResults(id));
		await dispatch(fetchDashboardData());
		setDeleteConfirmState(null);
	};

	const closePreview = () => setPreviewResultId(null);

	useEffect(() => {
		if (!previewResultId) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closePreview();
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [previewResultId]);

	useEffect(() => {
		if (!deleteConfirmState) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setDeleteConfirmState(null);
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [deleteConfirmState]);

	if (resultsLoading && !selectedSearch) {
		return (
			<div className="space-y-6">
				<p className="py-10 text-center text-sm text-gray-500">{labels.loadingSearchDetails}</p>
			</div>
		);
	}

	if (error && !selectedSearch) {
		return (
			<div className="space-y-6">
				<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
			</div>
		);
	}

	const pendingCount = Math.max(results.length - reviewedCount, 0);

	const metricCards = [
		{ title: labels.totalResults, value: String(results.length), icon: Search, accent: 'bg-gray-900 text-white' },
		{ title: labels.reviewed, value: String(reviewedCount), icon: CheckCircle2, accent: 'bg-gray-100 text-gray-900' },
		{ title: labels.pendingReview, value: String(pendingCount), icon: Clock3, accent: 'bg-gray-200 text-gray-900' },
		{
			title: labels.status,
			value: (selectedSearch?.status ?? '-').replace(/_/g, ' '),
			icon: ShieldCheck,
			accent: 'bg-white text-gray-900 ring-1 ring-gray-200',
		},
	];

	const overviewFields = [
		{ label: labels.fileName, value: selectedSearch?.fileName ?? '-' },
		{
			label: labels.date,
			value: selectedSearch?.time ? new Date(selectedSearch.time).toLocaleString() : '-',
		},
		{ label: labels.progress, value: `${reviewedCount} / ${results.length} ${labels.reviewedProgress}` },
	];

	return (
		<div className="space-y-6 md:space-y-8">
			{/* ── Page Header ────────────────────────────────────────── */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{labels.searchDetails}</h1>
					<p className="mt-1 text-sm text-gray-500">{labels.reviewAndManage}</p>
				</div>
				<Link
					href="/user/monitoring"
					className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{labels.backToMonitoring}
				</Link>
			</div>

			{/* ── Metric Cards (mobile 2-col) ─────────────────────────── */}
			<div className="grid grid-cols-2 gap-3 md:hidden">
				{metricCards.map((card) => {
					const Icon = card.icon;
					return (
						<div key={card.title} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
							<div className="flex items-start justify-between gap-3">
								<p className="min-w-0 text-[11px] font-semibold uppercase leading-4 tracking-[0.16em] text-gray-500">
									{card.title}
								</p>
								<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${card.accent}`}>
									<Icon className="h-4 w-4" />
								</div>
							</div>
							<p className="mt-4 break-words text-xl font-semibold capitalize tracking-tight text-gray-950">
								{card.value}
							</p>
						</div>
					);
				})}
			</div>

			{/* ── Metric Cards (desktop 4-col) ─────────────────────────── */}
			<div className="hidden gap-5 md:grid md:grid-cols-4">
				{metricCards.map((card) => {
					const Icon = card.icon;
					return (
						<div key={card.title} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
							<div className="flex items-center justify-between gap-3">
								<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
									{card.title}
								</p>
								<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${card.accent}`}>
									<Icon className="h-5 w-5" />
								</div>
							</div>
							<p className="mt-4 text-2xl font-bold capitalize tracking-tight text-gray-950">
								{card.value}
							</p>
						</div>
					);
				})}
			</div>

			{/* ── Overview Panel ─────────────────────────────────────── */}
			<div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
				<h2 className="mb-5 text-base font-bold text-gray-900">{labels.searchOverview}</h2>
				<div className="flex flex-col gap-5 md:flex-row md:items-start">
					{selectedSearch?.image && (
						<div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 md:w-48 lg:w-64">
							<div className="relative aspect-square w-full">
								<img src={selectedSearch.image} alt="Search image" className="h-full w-full object-cover" />
							</div>
						</div>
					)}
					<div className="flex-1">
						<div className="mb-3 flex flex-wrap items-center gap-2">
							{selectedSearch?.status && <StatusBadge status={selectedSearch.status} />}
						</div>
						<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
							{overviewFields.map((item) => (
								<div key={item.label} className="min-w-0 border-b border-gray-100 bg-white px-4 py-3 last:border-0">
									<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
										{item.label}
									</p>
									<p className="mt-1 break-all text-sm font-medium text-gray-900">{item.value}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* ── Results Panel ──────────────────────────────────────── */}
			<div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
				<div className="border-b border-gray-100 px-5 py-4">
					<h2 className="text-base font-bold text-gray-900">
						{labels.results}{' '}
						<span className="ml-1 text-sm font-normal text-gray-500">({results.length} {labels.total})</span>
					</h2>
				</div>

				{(planLimits?.lockedCount || 0) > 0 && (
					<div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
						{planLimits?.lockedCount}{labels.hiddenByPlan}
						<button
							type="button"
							onClick={() => router.push('/user/billing')}
							className="ml-2 cursor-pointer font-semibold underline"
						>
							{labels.upgradePlan}
						</button>
					</div>
				)}

				<div className="border-b border-gray-100 bg-white p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex w-full items-center gap-2 sm:w-auto">
							<div className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={allSelected}
								onChange={toggleAll}
								disabled={resultsLoading || visibleResults.length === 0 || isBulkUpdating}
								aria-label="Select all result images"
								className="h-4 w-4 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-400"
							/>
							<p className="text-sm text-gray-600">
								{selectedResultIds.length > 0
									? `${selectedResultIds.length} image${selectedResultIds.length > 1 ? 's' : ''} selected`
									: labels.selectAll}
							</p>
							</div>
						</div>
						<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
							<div className="relative w-full sm:w-36">
								<select
									value={dateFilter}
									onChange={(event) => setDateFilter(event.target.value as DateFilter)}
									className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-2.5 pr-7 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
								>
									{dateFilterOptions.map((option) => (
										<option key={option.value} value={option.value} className="bg-white text-gray-900">
											{option.label}
										</option>
									))}
								</select>
								<ChevronDown
									size={13}
									className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
								/>
							</div>
							<div className="relative w-full sm:w-auto">
								<select
									value={bulkAction}
									onChange={(event) => setBulkAction(event.target.value as BulkAction)}
									disabled={isBulkUpdating || resultsLoading || selectedResultIds.length === 0}
									className="h-9 w-full sm:w-44 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
								>
									{bulkActionOptions.map((option) => (
										<option key={option.value} value={option.value} className="bg-white text-gray-900">
											{option.label}
										</option>
									))}
								</select>
								<ChevronDown
									size={13}
									className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
								/>
							</div>

							<button
								onClick={applyBulkAction}
								disabled={isBulkUpdating || resultsLoading || bulkDeleting || selectedResultIds.length === 0 || bulkAction === '__none'}
								className="h-9 w-full cursor-pointer rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 sm:w-auto"
							>
								{isBulkUpdating || bulkDeleting ? labels.working : labels.apply}
							</button>
						</div>
					</div>
				</div>

				{/* ── Mobile cards (below md) ── */}
				<div className="divide-y divide-gray-100 md:hidden">
					{resultsLoading ? (
						<p className="px-4 py-10 text-center text-sm text-gray-500">{labels.loadingResults}</p>
					) : results.length === 0 ? (
						<p className="px-4 py-10 text-center text-sm text-gray-500">{labels.noResults}</p>
					) : (
						visibleResults.map((result) => (
							<div key={result._id} className="p-4">
								{/* Top row: checkbox + thumbnail + title */}
								<div className="flex items-start gap-3">
									<input
										type="checkbox"
										checked={selectedResultIds.includes(result._id)}
										onChange={() => toggleOne(result._id)}
										disabled={isBulkUpdating}
										aria-label="Select result image"
										className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-400 disabled:cursor-not-allowed"
									/>
									<button
										type="button"
										onClick={() => {
											markResultViewed(result._id);
											setPreviewResultId(result._id);
										}}
										disabled={result.isLocked}
										className="shrink-0 cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
										aria-label={labels.openImagePreview}
									>
										<img
											src={result.image}
											alt={result.details?.title || 'result image'}
											className={[
												'h-16 w-16 rounded-lg border border-gray-200 object-cover',
												result.isLocked ? 'blur-sm opacity-70' : '',
											].join(' ')}
										/>
									</button>
									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-center gap-2">
											{isResultNew(result._id) && (
												<span className="inline-flex rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
													{labels.new}
												</span>
											)}
											<span className="text-[11px] text-gray-500">
												{labels.found}: {getFoundDateFromObjectId(result._id)?.toLocaleString() || '-'}
											</span>
										</div>
										<p className="line-clamp-2 text-sm font-medium text-gray-900">
											{result.isLocked
												? labels.upgradeToViewResult
												: (result.details?.title || labels.untitledResult)}
										</p>
										<p className="mt-0.5 truncate text-xs text-gray-500">
											{result.details?.source || labels.unknownSource}
										</p>
									</div>
									<button
										onClick={() => requestDeleteResult(result._id)}
										disabled={deletingResultId === result._id || isBulkUpdating || bulkDeleting}
										className="ml-2 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
										aria-label="Delete result"
									>
										<Trash2
											size={15}
											strokeWidth={2}
											className={deletingResultId === result._id ? 'animate-pulse' : ''}
										/>
									</button>
								</div>
								{/* Status + source row */}
								<div className="mt-3 flex items-center gap-2 pl-7">
									<div className="relative min-w-0 flex-1">
										<select
											value={result.reviewStatus || 'not_reviewed'}
											disabled={updatingResultId === result._id || isBulkUpdating}
											onChange={(event) =>
												handleStatusChange(result._id, event.target.value as ReviewStatus)
											}
											className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3.5 pr-3 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
										>
											{reviewStatusOptions.map((option) => (
												<option key={option.value} value={option.value} className="bg-white text-gray-900">
													{option.label}
												</option>
											))}
										</select>
										<ChevronDown
											size={14}
											className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
										/>
									</div>

									<div className="flex items-center justify-center flex-1">
									{result.details?.link && !result.isLocked ? (
										<a
											href={result.details.link}
											target="_blank"
											rel="noopener noreferrer"
											onClick={() => markResultViewed(result._id)}
											className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap text-sm font-medium text-gray-700 hover:text-gray-900"
										>
													{labels.visit} <ExternalLink className="h-3.5 w-3.5" />
										</a>
									) : result.isLocked ? (
												<span className="shrink-0 whitespace-nowrap text-sm text-amber-700">{labels.upgrade}</span>
									) : null}
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* ── Desktop table (md+) ── */}
				<div className="hidden overflow-x-auto md:block">
					<table className="w-full min-w-[780px] table-fixed border-collapse text-left">
						<thead className="bg-gray-50">
							<tr>
								<th className="w-10 px-3 py-3" />
								<th className="w-20 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{labels.image}</th>
								<th className="w-[33%] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{labels.details}</th>
								<th className="w-[17%] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{labels.foundDate}</th>
								<th className="w-[20%] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{labels.status}</th>
								<th className="w-[10%] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{labels.source}</th>
								<th className="w-[10%] pr-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{resultsLoading ? (
								<tr>
									<td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
										{labels.loadingResults}
									</td>
								</tr>
							) : visibleResults.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
										{labels.noResults}
									</td>
								</tr>
							) : (
								visibleResults.map((result) => (
									<tr key={result._id}>
										<td className="px-3 py-3">
											<input
												type="checkbox"
												checked={selectedResultIds.includes(result._id)}
												onChange={() => toggleOne(result._id)}
												disabled={isBulkUpdating}
												aria-label="Select result image"
												className="h-4 w-4 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-400 disabled:cursor-not-allowed"
											/>
										</td>
										<td className="px-3 py-3">
											<button
												type="button"
												onClick={() => {
													markResultViewed(result._id);
													setPreviewResultId(result._id);
												}}
												disabled={result.isLocked}
												className="cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
													aria-label={labels.openImagePreview}
											>
												<img
													src={result.image}
													alt={result.details?.title || 'result image'}
													className={[
														'h-14 w-14 rounded-lg border border-gray-200 object-cover',
														result.isLocked ? 'blur-sm opacity-70' : '',
													].join(' ')}
												/>
											</button>
										</td>
										<td className="px-3 py-3">
											<div className="mb-1 flex items-center gap-2">
												{isResultNew(result._id) && (
													<span className="inline-flex rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
															{labels.new}
													</span>
												)}
											</div>
												<p className="line-clamp-2 text-sm font-medium text-gray-900" title={result.details?.title || labels.untitledResult}>
													{result.isLocked ? labels.upgradeToViewResult : (result.details?.title || labels.untitledResult)}
											</p>
												<p className="mt-1 truncate text-xs text-gray-500" title={result.details?.source || labels.unknownSource}>{result.details?.source || labels.unknownSource}</p>
										</td>
										<td className="px-3 py-3 text-sm text-gray-700">
											{getFoundDateFromObjectId(result._id)?.toLocaleString() || '-'}
										</td>
										<td className="px-3 py-3">
											<div className="relative max-w-36">
												<select
													value={result.reviewStatus || 'not_reviewed'}
													disabled={updatingResultId === result._id || isBulkUpdating}
													onChange={(event) =>
														handleStatusChange(result._id, event.target.value as ReviewStatus)
													}
													className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
												>
													{reviewStatusOptions.map((option) => (
														<option key={option.value} value={option.value} className="bg-white text-gray-900">
															{option.label}
														</option>
													))}
												</select>
												<ChevronDown
													size={13}
													className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
												/>
											</div>
										</td>
										<td className="px-5 py-3">
											{result.details?.link && !result.isLocked ? (
												<a
													href={result.details.link}
													target="_blank"
													rel="noopener noreferrer"
													onClick={() => markResultViewed(result._id)}
													className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
												>
													{labels.visit} <ExternalLink className="h-3.5 w-3.5" />
												</a>
											) : result.isLocked ? (
												<span className="text-sm text-amber-700">{labels.upgrade}</span>
											) : (
												<span className="text-sm text-gray-400">—</span>
											)}
										</td>
										<td className="px-5 py-3 text-right">
											<button
												onClick={() => requestDeleteResult(result._id)}
												disabled={deletingResultId === result._id || isBulkUpdating || bulkDeleting}
												className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
												aria-label="Delete result"
												title="Delete result"
											>
												<Trash2
													size={15}
													strokeWidth={2}
													className={deletingResultId === result._id ? 'animate-pulse' : ''}
												/>
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{error && <p className="text-sm text-red-600">{error}</p>}

			{previewResult && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
					onClick={closePreview}
				>
					<div
						className="relative w-full max-w-xl rounded-xl bg-white shadow-xl"
						onClick={(event) => event.stopPropagation()}
					>
						<button
							type="button"
							onClick={closePreview}
							className="absolute right-3 top-3 cursor-pointer rounded-md border border-gray-200 bg-white p-1 text-gray-600 hover:bg-gray-50"
							aria-label={labels.closePreview}
						>
							<X className="h-4 w-4" />
						</button>

						<div className="p-5">
							<img
								src={previewResult.image}
								alt={previewResult.details?.title || labels.resultImagePreview}
								className="max-h-[65vh] w-full rounded-lg border border-gray-200 object-contain"
							/>

							<div className="mt-4 space-y-1">
								<p className="text-sm font-semibold text-gray-900">
									{previewResult.details?.title || labels.untitledResult}
								</p>
								<p className="text-xs text-gray-600">
									{labels.source}: {previewResult.details?.source || labels.unknownSource}
								</p>
								<p className="text-xs text-gray-600">
									{labels.status}:{' '}
									{reviewStatusOptions.find((option) => option.value === (previewResult.reviewStatus || 'not_reviewed'))?.label ||
										(previewResult.reviewStatus || 'not_reviewed').replace('_', ' ')}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{deleteConfirmState && (
				<div
					className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
					onClick={() => setDeleteConfirmState(null)}
				>
					<div
						className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="border-b border-gray-100 px-5 py-4">
							<h3 className="text-base font-semibold text-gray-900">{labels.confirmDeletion}</h3>
							<p className="mt-1 text-sm text-gray-600">
								{deleteConfirmState.mode === 'single'
									? labels.singleDeleteConfirm
									: `${labels.multiDeleteConfirmPrefix}${deleteConfirmState.count}${labels.multiDeleteConfirmSuffix}`}
							</p>
						</div>

						<div className="px-5 py-4">
							<p className="text-xs text-gray-500">{labels.cannotBeUndone}</p>
						</div>

						<div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
							<button
								type="button"
								onClick={() => setDeleteConfirmState(null)}
								className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								{labels.cancel}
							</button>
							<button
								type="button"
								onClick={confirmDelete}
								disabled={bulkDeleting || !!deletingResultId}
								className="cursor-pointer rounded-lg border border-red-200 bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
							>
								{bulkDeleting || deletingResultId ? labels.deleting : labels.delete}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
