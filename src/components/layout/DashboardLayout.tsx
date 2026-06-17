'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/dashboardLayout/Sidebar';
import Topbar from '@/components/dashboardLayout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 lg:pl-60">
      <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="min-h-screen">
        <Topbar onMenuClick={() => setMobileSidebarOpen((previous) => !previous)} />

        <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto w-full space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
