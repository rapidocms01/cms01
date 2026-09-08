'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Contact,
  FileSpreadsheet,
  Cpu,
  ShieldAlert,
  Settings,
  Building2,
} from 'lucide-react';

const navigationGroups = [
  {
    title: 'OVERVIEW',
    items: [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'Students', href: '/students', icon: Users },
      { name: 'Staff', href: '/staff', icon: UserCheck },
      { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
    ],
  },
  {
    title: 'FINANCE',
    items: [{ name: 'Fees & Finance', href: '/finance', icon: CreditCard }],
  },
  {
    title: 'ACADEMICS',
    items: [
      { name: 'Exams & Results', href: '/exams', icon: GraduationCap },
      { name: 'ID Cards', href: '/id-cards', icon: Contact },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [{ name: 'Reports', href: '/reports', icon: FileSpreadsheet }],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Integrations', href: '/integrations', icon: Cpu },
      { name: 'Roles & Permissions', href: '/roles', icon: ShieldAlert },
      { name: 'Institute Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          G
        </div>
        <div>
          <h1 className="font-semibold text-white text-sm leading-tight">Greenwood Int.</h1>
          <p className="text-xs text-slate-400">School Management CMS</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Tenant Admin Toggle */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <Link
          href="/platform"
          className="flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
        >
          <Building2 className="w-4 h-4 text-amber-500" />
          <span>Platform Admin Console</span>
        </Link>
      </div>
    </aside>
  );
}
