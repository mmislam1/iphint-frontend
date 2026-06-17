'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, ChevronDown, Filter, Search as SearchIcon, LayoutGrid, List, Trash2, FolderOpen } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { AppDispatch, RootState } from '@/lib/store/store';
import { fetchMonitoringSearches } from '@/lib/store/slices/monitoringSlice';
import { deleteFolder, fetchFolders } from '@/lib/store/slices/scanSlice';

export default function MonitoringPage() {
  const t = useTranslations('Dashboard.monitoring');
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { searches, loading, error, page, pages, total } = useSelector(
    (state: RootState) => state.monitoring,
  );
  const { folders } = useSelector((state: RootState) => state.scan);

  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [folderFilter, setFolderFilter] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);
  const folderMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchFolders());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchMonitoringSearches({
        name: nameFilter,
        date: dateFilter,
        folderId: folderFilter,
        page: activePage,
        limit: 12,
      }),
    );
  }, [dispatch, nameFilter, dateFilter, folderFilter, activePage]);

  useEffect(() => {
    if (!folderMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!folderMenuRef.current?.contains(event.target as Node)) {
        setFolderMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [folderMenuOpen]);

  const currentPage = page || activePage;

  const pageLabel = useMemo(() => {
    if (!total) return t('noItems');
    const start = (currentPage - 1) * 12 + 1;
    const end = Math.min(currentPage * 12, total);
    return t('pageLabel', { start, end, total });
  }, [currentPage, t, total]);

  const statusPill = (analysisStatus: string) => {
    if (analysisStatus === 'analysis_complete') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (analysisStatus === 'monitoring') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const statusLabel = (analysisStatus: string) => {
    if (analysisStatus === 'analysis_complete') return t('statusLabels.analysisComplete');
    if (analysisStatus === 'monitoring') return t('statusLabels.monitoring');
    return t('statusLabels.pendingReview');
  };

  const handleDeleteSelectedFolder = async () => {
    if (!folderFilter) return;
    const action = await dispatch(deleteFolder(folderFilter));
    if (deleteFolder.fulfilled.match(action)) {
      setFolderFilter('');
      setActivePage(1);
      setFolderMenuOpen(false);
    }
  };

  const selectedFolderName = folders.find((folder) => folder._id === folderFilter)?.name || t('allCollections');

  const handleFolderSelect = (folderId: string) => {
    setActivePage(1);
    setFolderFilter(folderId);
    setFolderMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('description')}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex w-full flex-col gap-3 sm:flex-row xl:flex-1">
            <div className="flex min-w-0 items-center gap-2 sm:w-[18rem] sm:flex-none">
              <div ref={folderMenuRef} className="relative min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setFolderMenuOpen((prev) => !prev)}
                className="inline-flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900"
              >
                <FolderOpen className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{selectedFolderName}</span>
                <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-gray-400" />
              </button>

              {folderMenuOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => handleFolderSelect('')}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FolderOpen className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{t('allCollections')}</span>
                  </button>
                  {folders.map((folder) => (
                    <button
                      type="button"
                      key={folder._id}
                      onClick={() => handleFolderSelect(folder._id)}
                      className={[
                        'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50',
                        folderFilter === folder._id ? 'bg-gray-50 text-gray-900' : 'text-gray-700',
                      ].join(' ')}
                    >
                      <FolderOpen className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="truncate">{folder.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

              {folderFilter && (
                <button
                  type="button"
                  onClick={handleDeleteSelectedFolder}
                  className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  aria-label={t('deleteSelectedFolder')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="relative min-w-0 flex-1">
              <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => {
                  setActivePage(1);
                  setDateFilter(event.target.value);
                }}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none ring-0 focus:border-gray-400"
              />
            </div>
          </div>

          <div className="relative min-w-0 w-full xl:max-w-md xl:flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={nameFilter}
              onChange={(event) => {
                setActivePage(1);
                setNameFilter(event.target.value);
              }}
              placeholder={t('filterByImageName')}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400"
            />
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between xl:w-auto xl:flex-none xl:justify-end">
            <button
              onClick={() => {
                setNameFilter('');
                setDateFilter('');
                setFolderFilter('');
                setActivePage(1);
                setFolderMenuOpen(false);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              <Filter className="h-4 w-4" />
              {t('resetFilters')}
            </button>

            <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={[
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100',
                ].join(' ')}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                {t('grid')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={[
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100',
                ].join(' ')}
              >
                <List className="h-3.5 w-3.5" />
                {t('list')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {viewMode === 'list' ? (
          <>
            {loading ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                {t('loading')}
              </div>
            ) : searches.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                {t('empty')}
              </div>
            ) : (
              <>
                <div className="md:hidden divide-y divide-gray-100">
                  {searches.map((item) => (
                    <div key={item.searchId} className="p-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ src: item.image, name: item.fileName })}
                          className="shrink-0 cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                          aria-label={t('previewImageAria')}
                        >
                          <img
                            src={item.image}
                            alt={item.fileName}
                            className="h-28 w-28 rounded-lg border border-gray-200 object-cover transition-opacity hover:opacity-80"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => router.push(`/user/searches/${item.searchId}`)}
                          className="min-w-0 flex-1 cursor-pointer text-left"
                        >
                          <p className="truncate text-sm font-semibold text-gray-900" title={item.fileName}>
                            {item.fileName}
                          </p>
                          <div className="mt-2 space-y-1.5 text-xs text-gray-600">
                            <p>
                              <span className="font-medium text-gray-700">{t('labels.date')}:</span>{' '}
                              {new Date(item.time).toLocaleDateString()}
                            </p>
                            <p>
                              <span className="font-medium text-gray-700">{t('labels.progress')}:</span>{' '}
                              {t('reviewedCount', { reviewed: item.reviewedResults, total: item.totalResults })}
                            </p>
                          </div>
                          <span
                            className={[
                              'mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                              statusPill(item.analysisStatus),
                            ].join(' ')}
                          >
                            {statusLabel(item.analysisStatus)}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-[760px] w-full table-fixed border-collapse text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-28 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('labels.image')}</th>
                        <th className="w-[40%] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('labels.fileName')}</th>
                        <th className="w-32 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('labels.date')}</th>
                        <th className="w-36 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('labels.progress')}</th>
                        <th className="w-40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('labels.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {searches.map((item) => (
                        <tr
                          key={item.searchId}
                          onClick={() => router.push(`/user/searches/${item.searchId}`)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage({ src: item.image, name: item.fileName });
                              }}
                              className="cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                              aria-label={t('previewImageAria')}
                            >
                              <img
                                src={item.image}
                                alt={item.fileName}
                                className="h-16 w-16 rounded-lg border border-gray-200 object-cover transition-opacity hover:opacity-80"
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            <div className="min-w-0 truncate" title={item.fileName}>
                              {item.fileName}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(item.time).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {t('reviewedCount', { reviewed: item.reviewedResults, total: item.totalResults })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                                statusPill(item.analysisStatus),
                              ].join(' ')}
                            >
                              {statusLabel(item.analysisStatus)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        ) : (
        <div className="p-4 md:p-5">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">{t('loading')}</div>
          ) : searches.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              {t('empty')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {searches.map((item) => (
                <button
                  type="button"
                  key={item.searchId}
                  onClick={() => router.push(`/user/searches/${item.searchId}`)}
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-colors hover:bg-gray-50"
                >
                  <img
                    src={item.image}
                    alt={item.fileName}
                    className="h-40 w-full rounded-lg border border-gray-200 object-cover"
                  />
                  <p className="mt-3 line-clamp-1 text-sm font-semibold text-gray-900">{item.fileName}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(item.time).toLocaleDateString()}</p>
                  <p className="mt-2 text-xs text-gray-700">
                    {t('reviewedCount', { reviewed: item.reviewedResults, total: item.totalResults })}
                  </p>
                  <span
                    className={[
                      'mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                      statusPill(item.analysisStatus),
                    ].join(' ')}
                  >
                    {statusLabel(item.analysisStatus)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">{pageLabel}</p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setActivePage(Math.max(1, currentPage - 1))}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('previous')}
            </button>
            <button
              disabled={currentPage >= pages}
              onClick={() => setActivePage(Math.min(pages, currentPage + 1))}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('next')}
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 cursor-pointer rounded-md border border-gray-200 bg-white p-1 text-gray-600 hover:bg-gray-50"
              aria-label={t('closePreviewAria')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div className="p-5">
              <img
                src={previewImage.src}
                alt={previewImage.name}
                className="w-full max-h-[70vh] rounded-lg border border-gray-200 bg-gray-50 object-contain"
              />
              <p className="mt-3 text-sm font-medium text-gray-900">{previewImage.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
