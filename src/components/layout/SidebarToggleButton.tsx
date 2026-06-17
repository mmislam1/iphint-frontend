'use client';

import React from 'react';
import { Menu } from 'lucide-react';

export default function SidebarToggleButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Collapse sidebar' : 'Open sidebar'}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
    >
      <Menu className="h-4 w-4" />
      <span>Sidebar</span>
    </button>
  );
}