'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/adminLayout/Sidebar';
import AdminTopbar from '@/components/adminLayout/Topbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:pl-72">
      <AdminSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="min-h-screen">
        <AdminTopbar onMenuClick={() => setMobileSidebarOpen((previous) => !previous)} />

        <main className="min-h-screen px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}