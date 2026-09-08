'use client';

import { Bell, Search, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      {/* Left: Tenant Context Badge & Quick Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Tenant: greenwood.platform.com</span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, staff, roll numbers..."
            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* Right: Academic Session, Notifications & User Profile */}
      <div className="flex items-center gap-4">
        <div className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md">
          Session: 2026-2027
        </div>

        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
            SA
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-medium text-slate-900 leading-tight">Dr. Sarah Ahmed</div>
            <div className="text-[10px] text-slate-500 leading-tight">Institute Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
