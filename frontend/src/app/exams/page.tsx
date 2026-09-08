'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { GraduationCap, Save, Printer, Eye, Lock } from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, { marks: number; isAbsent: boolean }>>({});
  const [saving, setSaving] = useState(false);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [reportCardData, setReportCardData] = useState<any | null>(null);

  useEffect(() => {
    fetchExamsAndStudents();
  }, []);

  const fetchExamsAndStudents = async () => {
    try {
      const examRes = await apiFetch('/api/exams');
      const stdRes = await apiFetch('/api/students');
      if (examRes.success) setExams(examRes.data);
      if (stdRes.success) {
        setStudents(stdRes.data);
        const initialMap: Record<string, any> = {};
        stdRes.data.forEach((s: any) => {
          initialMap[s.id] = { marks: 85, isAbsent: false };
        });
        setMarksMap(initialMap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const records = Object.entries(marksMap).map(([studentId, data]) => ({
        studentId,
        marksObtained: data.marks,
        isAbsent: data.isAbsent,
        maxMarks: 100,
        passingMarks: 33,
      }));

      const res = await apiFetch('/api/exams/marks/bulk', {
        method: 'POST',
        body: JSON.stringify({
          examId: exams[0]?.id || 'ex_mid_2026',
          subjectId: 'subj_math',
          records,
        }),
      });

      if (res.success) {
        alert('Spreadsheet marks saved successfully!');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleViewReportCard = async (studentId: string) => {
    try {
      const res = await apiFetch(`/api/exams/report-card/${exams[0]?.id || 'ex_mid_2026'}/${studentId}`);
      if (res.success) {
        setReportCardData(res.data);
        setShowReportCardModal(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Exams & Results Center</h1>
            <p className="text-xs text-slate-500">Spreadsheet marks entry grid, Institute grading, and printable report cards.</p>
          </div>

          <button
            onClick={handleSaveMarks}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save All Marks'}</span>
          </button>
        </div>

        {/* Exam Selection Header */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-2xs text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">Exam: Mid-Term 2026</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
              Marks Entry Open
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Subject:</label>
            <select className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-800">
              <option>Mathematics (MATH-101)</option>
              <option>English Language (ENG-101)</option>
            </select>
          </div>
        </div>

        {/* Spreadsheet-Style Entry Grid */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 flex justify-between items-center">
            <span>Spreadsheet Entry Grid (Max Marks: 100 • Passing Marks: 33)</span>
            <span className="text-[11px] text-slate-500 font-normal">Use Tab / Enter for fast data entry</span>
          </div>

          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-2.5">Roll #</th>
                <th className="px-4 py-2.5">Student Name</th>
                <th className="px-4 py-2.5">Marks Obtained</th>
                <th className="px-4 py-2.5">Absent Toggle</th>
                <th className="px-4 py-2.5 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((s) => {
                const item = marksMap[s.id] || { marks: 0, isAbsent: false };
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-medium">{s.rollNumber || '01'}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{s.fullName}</td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        disabled={item.isAbsent}
                        value={item.isAbsent ? '' : item.marks}
                        onChange={(e) =>
                          setMarksMap({
                            ...marksMap,
                            [s.id]: { ...item, marks: Number(e.target.value) },
                          })
                        }
                        className="w-24 px-2 py-1 border border-slate-300 rounded-md font-mono text-center font-bold text-slate-900 disabled:bg-slate-100"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isAbsent}
                          onChange={(e) =>
                            setMarksMap({
                              ...marksMap,
                              [s.id]: { ...item, isAbsent: e.target.checked },
                            })
                          }
                          className="rounded text-blue-600"
                        />
                        <span className="text-slate-600">Mark Absent</span>
                      </label>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleViewReportCard(s.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Generate Printable Report Card"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Printable Report Card Modal */}
        {showReportCardModal && reportCardData && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-xl w-full p-8 space-y-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto border-4 border-blue-900">
              {/* Header */}
              <div className="text-center border-b pb-4 border-slate-300">
                <h1 className="text-xl font-bold text-blue-900 uppercase tracking-wide">
                  {reportCardData.institute.instituteName}
                </h1>
                <p className="text-xs text-slate-600">{reportCardData.institute.address}</p>
                <div className="mt-2 text-sm font-semibold text-slate-800 underline">
                  STUDENT ACADEMIC REPORT CARD — {reportCardData.exam.name}
                </div>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg text-slate-800">
                <div><strong>Student Name:</strong> {reportCardData.student.fullName}</div>
                <div><strong>Roll Number:</strong> {reportCardData.student.rollNumber}</div>
                <div><strong>Admission No:</strong> {reportCardData.student.admissionNumber}</div>
                <div><strong>Academic Session:</strong> 2026-2027</div>
              </div>

              {/* Subject Breakdown */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r">Subject</th>
                    <th className="p-2 border-r text-center">Max Marks</th>
                    <th className="p-2 border-r text-center">Obtained</th>
                    <th className="p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {reportCardData.subjectBreakdown.map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 border-r font-medium">{row.subjectName}</td>
                      <td className="p-2 border-r text-center font-mono">{row.maxMarks}</td>
                      <td className="p-2 border-r text-center font-mono font-bold">{row.marksObtained}</td>
                      <td className="p-2 text-center font-bold text-blue-800">{row.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Overall Summary */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between font-bold text-slate-900">
                <div>Total Marks: {reportCardData.summary.totalObtained} / {reportCardData.summary.totalMax}</div>
                <div>Percentage: {reportCardData.summary.percentage}%</div>
                <div>Final Grade: <span className="text-blue-900 text-sm">{reportCardCardGrade(reportCardData.summary.grade)}</span></div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-300">
                <button onClick={() => setShowReportCardModal(false)} className="px-4 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md">
                  Close
                </button>
                <button onClick={() => window.print()} className="px-4 py-1.5 bg-blue-900 text-white rounded-md font-semibold flex items-center gap-1.5">
                  <Printer className="w-4 h-4" />
                  <span>Print Report Card</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function reportCardCardGrade(grade: string) {
  return grade || 'A+';
}
