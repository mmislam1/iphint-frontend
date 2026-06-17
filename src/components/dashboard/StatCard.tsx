import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend }) => (
  <div className="flex min-w-0 flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
      <span className="min-w-0 truncate text-sm font-medium text-gray-500" title={title}>{title}</span>
      {trend && <span className="shrink-0 truncate text-xs font-semibold text-gray-700" title={trend}>{trend}</span>}
    </div>
    <div className="truncate text-3xl font-bold text-gray-900" title={String(value)}>{value}</div>
  </div>
);