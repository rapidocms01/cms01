'use client';

import { AppShell } from '@/components/shell/AppShell';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  UserPlus,
  CheckSquare,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';

export default function DashboardPage() {
  const kpiCards = [
    { title: 'Total Students', value: '450', change: '+12 this month', icon: Users, color: 'bg-blue-500' },
    { title: 'Total Staff', value: '38', change: 'Teachers & Admin', icon: UserCheck, color: 'bg-indigo-500' },
    { title: 'Present Today', value: '418', change: '92.8% Attendance', icon: CalendarCheck, color: 'bg-emerald-500' },
    { title: 'Fees Collected', value: 'PKR 1,250,000', change: 'PKR 150,000 Outstanding', icon: CreditCard, color: 'bg-amber-500' },
  ];

  const quickActions = [
    { name: 'Add Student', href: '/students', icon: UserPlus, color: 'text-blue-600 border-blue-200 hover:bg-blue-50' },
    { name: 'Mark Attendance', href: '/attendance', icon: CheckSquare, color: 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' },
    { name: 'Receive Fee', href: '/finance', icon: DollarSign, color: 'text-amber-600 border-amber-200 hover:bg-amber-50' },
    { name: 'Enter Marks', href: '/exams', icon: FileSpreadsheet, color: 'text-indigo-600 border-indigo-200 hover:bg-indigo-50' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Heading */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">School Executive Dashboard</h1>
            <p className="text-xs text-slate-500">Greenwood International School — Operational Summary</p>
          </div>
          <div className="text-xs text-slate-500">Last updated: Just now</div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.name}
                href={act.href}
                className={`flex items-center gap-2.5 p-3 rounded-lg border bg-white font-medium text-xs transition-colors shadow-2xs ${act.color}`}
              >
                <Icon className="w-4 h-4" />
                <span>{act.name}</span>
              </Link>
            );
          })}
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.title} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">{kpi.title}</span>
                  <div className={`p-2 rounded-lg text-white ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{kpi.change}</div>
              </div>
            );
          })}
        </div>

        {/* Today's Operational Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Attendance Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Today&apos;s Attendance by Class</h2>
            <div className="space-y-3">
              {[
                { class: 'Grade 1 - Section A', present: 28, total: 30, pct: 93.3 },
                { class: 'Grade 2 - Section A', present: 29, total: 30, pct: 96.6 },
                { class: 'Grade 3 - Section A', present: 27, total: 30, pct: 90.0 },
              ].map((row) => (
                <div key={row.class} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{row.class}</div>
                    <div className="text-slate-500">{row.present} of {row.total} Present</div>
                  </div>
                  <div className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {row.pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Fee Payments */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Recent Payments Received</h2>
            <div className="space-y-3">
              {[
                { receipt: 'REC-2026-1001', student: 'Ali Hassan', amount: 'PKR 12,500', method: 'Cash', date: 'Today' },
                { receipt: 'REC-2026-1002', student: 'Fatima Zahra', amount: 'PKR 12,500', method: 'Bank Transfer', date: 'Today' },
              ].map((rec) => (
                <div key={rec.receipt} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{rec.student} ({rec.receipt})</div>
                    <div className="text-slate-500">{rec.method} • {rec.date}</div>
                  </div>
                  <div className="font-bold text-slate-900">{rec.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
