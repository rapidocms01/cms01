'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { Cpu, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, Mail, Smartphone, Fingerprint } from 'lucide-react';

export default function IntegrationsPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/integrations');
      if (res.success) setConfigs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await apiFetch(`/api/integrations/${id}/test`, { method: 'POST' });
      if (res.success) {
        alert(res.data.message);
        fetchConfigs();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTestingId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return MessageSquare;
      case 'sms': return Smartphone;
      case 'email': return Mail;
      case 'biometric': return Fingerprint;
      default: return Cpu;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">External Integrations</h1>
          <p className="text-xs text-slate-500">Provider adapter configurations for WhatsApp, SMS, Email, and Biometric Hardware.</p>
        </div>

        {/* Integration Provider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((cfg) => {
            const Icon = getIcon(cfg.providerType);
            const isConnected = cfg.status === 'connected';
            return (
              <div key={cfg.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm">{cfg.providerName}</h2>
                      <p className="text-[11px] text-slate-500 uppercase font-semibold">{cfg.providerType} Provider</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-slate-600 font-mono text-[11px]">
                  Secrets & API keys are encrypted server-side only.
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400">
                    {cfg.lastConnectedAt ? `Last active: ${new Date(cfg.lastConnectedAt).toLocaleTimeString()}` : 'Never connected'}
                  </div>
                  <button
                    onClick={() => handleTestConnection(cfg.id)}
                    disabled={testingId === cfg.id}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-md font-semibold hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingId === cfg.id ? 'animate-spin' : ''}`} />
                    <span>{testingId === cfg.id ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
