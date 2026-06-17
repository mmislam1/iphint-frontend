"use client";

import React, { useState, useSyncExternalStore } from "react";
import UserSidebar from "@/components/user/UserSidebar";
import { useTranslations } from "next-intl";
import SidebarToggleButton from "@/components/layout/SidebarToggleButton";

const desktopSidebarMediaQuery = "(min-width: 1024px)";

const subscribeToDesktopSidebar = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(desktopSidebarMediaQuery);
  mediaQueryList.addEventListener("change", callback);

  return () => {
    mediaQueryList.removeEventListener("change", callback);
  };
};

const getDesktopSidebarSnapshot = () => window.matchMedia(desktopSidebarMediaQuery).matches;
const getDesktopSidebarServerSnapshot = () => false;

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const isDesktopSidebar = useSyncExternalStore(
    subscribeToDesktopSidebar,
    getDesktopSidebarSnapshot,
    getDesktopSidebarServerSnapshot,
  );
  const sidebarOpen = isDesktopSidebar ? desktopSidebarOpen : mobileSidebarOpen;
  const t = useTranslations();

  const handleSidebarToggle = () => {
    if (isDesktopSidebar) {
      setDesktopSidebarOpen((previous) => !previous);
      return;
    }

    setMobileSidebarOpen((previous) => !previous);
  };

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div 
          className="fixed inset-x-0 bottom-0 top-16 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-72 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <UserSidebar t={t} onClose={() => setMobileSidebarOpen(false)} />
      </aside>

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${isDesktopSidebar && sidebarOpen ? "lg:ml-72" : "lg:ml-0"}`}>
        <div className="sticky top-16 z-20 px-4 pt-4 sm:px-6 lg:px-10">
          <SidebarToggleButton isOpen={sidebarOpen} onClick={handleSidebarToggle} />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}