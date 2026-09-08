'use client';

import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Contact, Printer, Sparkles } from 'lucide-react';

export default function IdCardsPage() {
  const [template, setTemplate] = useState({
    headerTitle: 'GREENWOOD INTERNATIONAL SCHOOL',
    primaryColor: '#1e3a8a',
    showBarcode: true,
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">ID Cards Generator</h1>
            <p className="text-xs text-slate-500">Configure template design and generate batch student & staff ID cards.</p>
          </div>

          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700">
            <Printer className="w-3.5 h-3.5" />
            <span>Print Batch Cards</span>
          </button>
        </div>

        {/* Card Template Live Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h2 className="font-bold text-slate-900 text-sm">Template Customization</h2>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Header Title</label>
              <input
                type="text"
                value={template.headerTitle}
                onChange={(e) => setTemplate({ ...template, headerTitle: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Primary Color</label>
              <input
                type="color"
                value={template.primaryColor}
                onChange={(e) => setTemplate({ ...template, primaryColor: e.target.value })}
                className="h-8 w-16 p-0 border-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex items-center justify-center">
            <div className="w-64 h-96 bg-white rounded-xl shadow-lg overflow-hidden border border-slate-300 flex flex-col justify-between">
              <div style={{ backgroundColor: template.primaryColor }} className="p-3 text-white text-center">
                <div className="text-[10px] font-bold tracking-wider">{template.headerTitle}</div>
                <div className="text-[9px] text-slate-200">STUDENT IDENTITY CARD</div>
              </div>

              <div className="p-4 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-slate-500 font-bold text-lg">
                  PHOTO
                </div>
                <div className="font-bold text-sm text-slate-900">Ali Hassan</div>
                <div className="text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">Grade 1 - Section A</div>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div>Roll #: 01</div>
                  <div>Admission #: ADM-1001</div>
                  <div>Emergency: +92 300 1112233</div>
                </div>
              </div>

              {template.showBarcode && (
                <div className="bg-slate-50 p-2 border-t border-slate-200 text-center font-mono text-[10px] text-slate-600 tracking-widest">
                  |||||| ||| ||||||| ||| |||
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
