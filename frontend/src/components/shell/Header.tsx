'use client';

import { Bell, Search, Menu, PanelLeft, ShieldCheck } from 'lucide-react';
import { useUserRole } from './UserRoleContext';
import { DefaultRole } from '@school-cms/common';

interface HeaderProps {
  onToggleMobileDrawer?: () => void;
  onToggleDesktopCollapse?: () => void;
  isDesktopCollapsed?: boolean;
}

export function Header({
  onToggleMobileDrawer,
  onToggleDesktopCollapse,
  isDesktopCollapsed = false,
}: HeaderProps) {
  const { currentRole, setRole } = useUserRole();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
      {/* Left: Mobile Menu Toggle, Desktop Toggle, Tenant Badge & Search */}
      <div className="flex items-center gap-3">
        {/* Mobile Drawer Trigger */}
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          className="lg:hidden p-2 text-[#101720] hover:text-[#001B61] hover:bg-[#F5F5F5] rounded-xl"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Trigger */}
        <button
          type="button"
          onClick={onToggleDesktopCollapse}
          className="hidden lg:flex p-2 text-slate-500 hover:text-[#001B61] hover:bg-[#F5F5F5] rounded-xl transition-colors"
          title={isDesktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar Collapse"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Tenant Context Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#F5F5F5] rounded-full border border-slate-200 text-xs font-semibold text-[#101720]">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Tenant: greenwood.platform.com</span>
        </div>

        {/* Quick Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, staff, roll numbers..."
            className="pl-9 pr-4 py-1.5 bg-[#F5F5F5] border border-slate-200 rounded-xl text-xs text-[#101720] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#001B61] w-48 md:w-64 font-medium"
          />
        </div>
      </div>

      {/* Right: Live RBAC Role Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Live RBAC Role Switcher */}
        <div className="flex items-center gap-1.5 bg-[#001B61] text-white px-3 py-1 rounded-xl text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFA800] shrink-0" />
          <span className="hidden md:inline text-slate-200">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value)}
            className="bg-transparent font-bold text-white border-0 focus:ring-0 cursor-pointer text-xs p-0 focus:outline-hidden"
          >
            <option value={DefaultRole.INSTITUTE_ADMIN} className="text-[#101720] bg-white">Institute Admin (All Permissions)</option>
            <option value={DefaultRole.PRINCIPAL} className="text-[#101720] bg-white">Principal</option>
            <option value={DefaultRole.TEACHER} className="text-[#101720] bg-white">Teacher</option>
            <option value={DefaultRole.ACCOUNTANT} className="text-[#101720] bg-white">Accountant</option>
          </select>
        </div>

        {/* Notifications Button */}
        <button className="relative p-2 text-slate-600 hover:text-[#001B61] hover:bg-[#F5F5F5] rounded-full transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FFA800] rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#001B61] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs border border-blue-900">
            SA
          </div>
          <div className="text-left hidden xl:block">
            <div className="text-xs font-bold text-[#101720] leading-tight">Dr. Sarah Ahmed</div>
            <div className="text-[10px] text-slate-500 font-semibold leading-tight">{currentRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
