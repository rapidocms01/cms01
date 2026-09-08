'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function AttendancePage() {
  const [entityType, setEntityType] = useState<'student' | 'staff'>('student');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'late' | 'leave'>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAttendanceList();
  }, [entityType, date]);

  const fetchAttendanceList = async () => {
    setLoading(true);
    try {
      if (entityType === 'student') {
        const res = await apiFetch('/api/students');
        if (res.success) {
          setStudents(res.data);
          const initialMap: Record<string, any> = {};
          res.data.forEach((s: any) => {
            initialMap[s.id] = 'present'; // Default mark present
          });
          setAttendanceMap(initialMap);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id: string, status: 'present' | 'absent' | 'late' | 'leave') => {
    setAttendanceMap((prev) => ({ ...prev, [id]: status }));
  };

  const handleMarkAllPresent = () => {
    const nextMap = { ...attendanceMap };
    Object.keys(nextMap).forEach((key) => (nextMap[key] = 'present'));
    setAttendanceMap(nextMap);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceMap).map(([entityId, status]) => ({
        entityId,
        status,
      }));
      const res = await apiFetch('/api/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          entityType,
          date,
          classId: 'cls_1',
          sectionId: 'sec_1',
          records,
        }),
      });
      if (res.success) {
        alert('Attendance records saved successfully!');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Attendance Register</h1>
            <p className="text-xs text-slate-500">Record daily student and staff attendance status.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold hover:bg-emerald-100"
            >
              Mark All Present
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 shadow-2xs text-xs">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setEntityType('student')}
              className={`px-3 py-1 rounded-md font-semibold ${
                entityType === 'student' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Student Attendance
            </button>
            <button
              onClick={() => setEntityType('staff')}
              className={`px-3 py-1 rounded-md font-semibold ${
                entityType === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Staff Attendance
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-800"
            />
          </div>
        </div>

        {/* Attendance Grid */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Roll # / Admission</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-center">Status Selector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((s) => {
                const currentStatus = attendanceMap[s.id] || 'present';
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-medium text-slate-600">{s.admissionNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{s.fullName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {[
                          { id: 'present', label: 'Present', color: 'bg-emerald-600 text-white', icon: CheckCircle2 },
                          { id: 'absent', label: 'Absent', color: 'bg-red-600 text-white', icon: XCircle },
                          { id: 'late', label: 'Late', color: 'bg-amber-500 text-white', icon: Clock },
                          { id: 'leave', label: 'Leave', color: 'bg-blue-600 text-white', icon: AlertCircle },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => handleStatusChange(s.id, st.id as any)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                              currentStatus === st.id
                                ? st.color
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span>{st.label}</span>
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
