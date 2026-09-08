'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { Building2, ShieldAlert, RefreshCw, Lock, CheckCircle2 } from 'lucide-react';
import { SubscriptionStatus } from '@school-cms/common';

export default function PlatformAdminPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/platform/tenants');
      if (res.success) setTenants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleUpdateSubscription = async (tenantId: string, status: SubscriptionStatus) => {
    try {
      const res = await apiFetch(`/api/platform/tenants/${tenantId}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (res.success) {
        alert(`Updated subscription status to ${status}`);
        fetchTenants();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRunMigrations = async () => {
    setMigrating(true);
    try {
      const res = await apiFetch('/api/platform/migrations/run', { method: 'POST' });
      if (res.success) {
        alert('Multi-Tenant DB Migrations completed across all active school databases!');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Platform SaaS Central Registry</h1>
            <p className="text-xs text-slate-500">Central platform control panel for tenant database management & subscription locking.</p>
          </div>

          <button
            onClick={handleRunMigrations}
            disabled={migrating}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 text-white rounded-md text-xs font-semibold hover:bg-amber-700 disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${migrating ? 'animate-spin' : ''}`} />
            <span>{migrating ? 'Applying Migrations...' : 'Run Multi-Tenant Migrations'}</span>
          </button>
        </div>

        {/* Tenant Registry Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Institute Name & ID</th>
                <th className="px-4 py-3">Subdomain Domain</th>
                <th className="px-4 py-3">Owner Contact</th>
                <th className="px-4 py-3">Database Isolation</th>
                <th className="px-4 py-3">Subscription Status</th>
                <th className="px-4 py-3 text-right">Locking Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading tenant registry...</td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{t.instituteName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{t.id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                      {t.subdomain}.platform.com
                    </td>
                    <td className="px-4 py-3">
                      <div>{t.ownerName}</div>
                      <div className="text-[11px] text-slate-500">{t.ownerEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                        Supabase Project Per-School
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={t.subscriptionStatus}
                        onChange={(e) => handleUpdateSubscription(t.id, e.target.value as SubscriptionStatus)}
                        className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-800"
                      >
                        <option value={SubscriptionStatus.ACTIVE}>Active</option>
                        <option value={SubscriptionStatus.TRIAL}>Trial</option>
                        <option value={SubscriptionStatus.SUSPENDED}>Suspend Access</option>
                        <option value={SubscriptionStatus.EXPIRED}>Mark Expired</option>
                        <option value={SubscriptionStatus.BLOCKED}>Block Access</option>
                      </select>
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
