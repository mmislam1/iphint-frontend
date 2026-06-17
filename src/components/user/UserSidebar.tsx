"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { 
  LayoutDashboard, 
  Maximize, 
  History, 
  Eye, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut 
} from "lucide-react";
import { logout } from "../../lib/store/slices/userSlice";
import { AppDispatch } from "../../lib/store/store";

interface UserSidebarProps {
  t: (key: string) => string;
  onClose?: () => void;
}

const UserSidebar = ({ t, onClose }: UserSidebarProps) => {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  // Mapping based on sidebar.png structure
  const menuItems = [
    { name: t("userSidebar.dashboard"), icon: LayoutDashboard, href: "/user/dashboard" },
    { name: t("userSidebar.newScan"), icon: Maximize, href: "/user/newScan" },
    { name: t("userSidebar.history"), icon: History, href: "/user/history" },
    { name: t("userSidebar.monitoring"), icon: Eye, href: "/user/monitoring" },
    { name: t("userSidebar.reports"), icon: FileText, href: "/user/reports" },
    { name: t("userSidebar.billing"), icon: CreditCard, href: "/user/billing" },
    { name: t("userSidebar.settings"), icon: Settings, href: "/user/settings" },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivityAt');
    }
    dispatch(logout());
    window.location.href = "/login?loggedOut=1";
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 py-8 px-4">
      {/* Brand Header */}
      

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                size={20}
                className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
          {t("userSidebar.logout")}
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;