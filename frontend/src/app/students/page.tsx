'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { IStudent } from '@school-cms/common';
import { Search, Plus, Upload, UserCheck, Eye, Edit, ShieldAlert } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male',
    dateOfBirth: '2015-01-01',
    bFormCnic: '',
    phone: '',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    classId: 'cls_1',
    sectionId: 'sec_1',
    rollNumber: '01',
    admissionDate: '2026-04-01',
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/students?search=${search}`);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/students', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.success) {
        setShowAddModal(false);
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleViewProfile = async (id: string) => {
    try {
      const res = await apiFetch(`/api/students/${id}`);
      if (res.success) {
        setSelectedStudent(res.data);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Directory</h1>
            <p className="text-xs text-slate-500">Manage admissions, student profiles, and academic promotions.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk Import</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll, or admission no..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700">
              <option>All Classes</option>
              <option>Grade 1</option>
              <option>Grade 2</option>
            </select>
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700">
              <option>Status: Active</option>
              <option>Status: Inactive</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Student Info</th>
                <th className="px-4 py-3">Admission No</th>
                <th className="px-4 py-3">Class & Section</th>
                <th className="px-4 py-3">Guardian Info</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading student directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No student records found.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{s.fullName}</div>
                      <div className="text-[11px] text-slate-500">Roll #: {s.rollNumber || 'N/A'} • {s.gender}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{s.admissionNumber}</td>
                    <td className="px-4 py-3 font-medium">Grade 1 - Section A</td>
                    <td className="px-4 py-3">
                      <div>{s.guardianName} ({s.guardianRelation})</div>
                      <div className="text-[11px] text-slate-500">{s.guardianPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewProfile(s.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="360 View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-slate-900">New Student Admission</h2>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Guardian Phone</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-md font-semibold">
                    Save Admission
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 360 Student Profile Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedStudent.student.fullName}</h2>
                  <p className="text-xs text-slate-500">Admission No: {selectedStudent.student.admissionNumber} • Roll #: {selectedStudent.student.rollNumber}</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="font-bold text-slate-800 mb-1">Guardian Information</div>
                  <div>Name: {selectedStudent.student.guardianName}</div>
                  <div>Relation: {selectedStudent.student.guardianRelation}</div>
                  <div>Phone: {selectedStudent.student.guardianPhone}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="font-bold text-slate-800 mb-1">Academic Status</div>
                  <div>Status: {selectedStudent.student.status}</div>
                  <div>Admission Date: {selectedStudent.student.admissionDate}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
