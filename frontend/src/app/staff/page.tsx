'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { IStaff } from '@school-cms/common';
import { UserCheck, Plus, Search, Mail, Phone } from 'lucide-react';

export default function StaffPage() {
  const [staffList, setStaffList] = useState<IStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/staff?search=${search}`);
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Staff Management</h1>
            <p className="text-xs text-slate-500">Directory of teachers, administrative officers, and support staff.</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Staff Name & ID</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Employment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading staff records...</td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No staff members found.</td>
                </tr>
              ) : (
                staffList.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{st.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{st.staffIdNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{st.designation}</td>
                    <td className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-600">{st.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400"/> {st.email}</div>
                      <div className="flex items-center gap-1 text-slate-500"><Phone className="w-3 h-3 text-slate-400"/> {st.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                        {st.employmentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
