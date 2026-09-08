'use client';

import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { FileSpreadsheet, Download, Filter } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'students' | 'staff' | 'attendance' | 'fees' | 'finance' | 'exams'>('students');
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/reports?type=${reportType}`);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    window.open(`http://localhost:4000/api/reports/export/csv?type=${reportType}`, '_blank');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Reporting Center</h1>
            <p className="text-xs text-slate-500">Centralized analytics and CSV exports across all school modules.</p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>

        {/* Report Selector Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-2xs text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-700">Category:</label>
            <select
              value={reportType}
              onChange={(e: any) => setReportType(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-md font-semibold text-slate-800"
            >
              <option value="students">Students Report</option>
              <option value="staff">Staff Directory Report</option>
              <option value="attendance">Attendance Report</option>
              <option value="fees">Fee Payments Report</option>
              <option value="finance">Income & Expenses Report</option>
              <option value="exams">Exams & Marks Report</option>
            </select>
          </div>

          <button
            onClick={fetchReport}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
          >
            Generate Report Preview
          </button>
        </div>

        {/* Preview Output */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Report Output Summary</h2>
          {reportData ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div><strong>Type:</strong> {reportData.reportType.toUpperCase()}</div>
                <div><strong>Total Records:</strong> {reportData.recordCount}</div>
                <div><strong>Generated At:</strong> {new Date(reportData.generatedAt).toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-8 text-center">Click &apos;Generate Report Preview&apos; to inspect live report data.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
