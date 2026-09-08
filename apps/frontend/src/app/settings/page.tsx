'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { Settings, Building2, Calendar, BookOpen, Layers } from 'lucide-react';

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'academic' | 'classes' | 'grading'>('profile');
  const [profile, setProfile] = useState<any>({
    instituteName: 'Greenwood International School',
    address: '123 Education Boulevard, City',
    phone: '+92 42 111 222 333',
    email: 'info@greenwood.edu',
    principalName: 'Dr. Sarah Ahmed',
  });
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchClasses();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch('/api/settings/profile');
      if (res.success) setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await apiFetch('/api/settings/classes');
      if (res.success) setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/settings/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      if (res.success) alert('Institute profile updated!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Institute Settings & Academic Setup</h1>
          <p className="text-xs text-slate-500">Configure school details, academic sessions, class structure, and grading scales.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          {[
            { id: 'profile', label: 'Institute Profile', icon: Building2 },
            { id: 'academic', label: 'Academic Sessions', icon: Calendar },
            { id: 'classes', label: 'Classes & Sections', icon: Layers },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`pb-2 flex items-center gap-1.5 border-b-2 transition-all ${
                  isActive ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-slate-200 max-w-xl space-y-4 text-xs shadow-2xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Institute Name</label>
              <input
                type="text"
                value={profile.instituteName}
                onChange={(e) => setProfile({ ...profile, instituteName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Principal / Head Name</label>
              <input
                type="text"
                value={profile.principalName}
                onChange={(e) => setProfile({ ...profile, principalName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Address</label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div className="pt-2">
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-md font-semibold">
                Save Profile
              </button>
            </div>
          </form>
        )}

        {tab === 'classes' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs shadow-2xs">
            <h2 className="font-bold text-slate-900 text-sm mb-2">Configured Classes & Sections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {classes.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-900">{c.name} ({c.code})</div>
                  <div className="text-slate-500 mt-1">
                    Sections: {c.sections?.map((s: any) => s.name).join(', ') || 'A, B'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
