'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/roles');
      if (res.success) setRoles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Roles & Permissions (RBAC)</h1>
          <p className="text-xs text-slate-500">Fine-grained permission assignment for administrative and teaching roles.</p>
        </div>

        {/* Roles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((r) => (
            <div key={r.id || r.name} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">{r.name}</h2>
                  <p className="text-slate-500 text-[11px]">{r.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold text-[10px]">
                  {r.permissions?.length || 0} Permissions
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(r.permissions || []).map((p: string) => (
                  <span key={p} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-700">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
