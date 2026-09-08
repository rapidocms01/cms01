'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { apiFetch } from '@/lib/api-client';
import { CreditCard, DollarSign, Plus, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

export default function FinancePage() {
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Receive Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    studentId: 'STD-2026-001',
    amountPaid: 12500,
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: 'Monthly tuition fee',
  });

  // Student Ledger View State
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerData, setLedgerData] = useState<any | null>(null);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const headsRes = await apiFetch('/api/fees/heads');
      const structRes = await apiFetch('/api/fees/structures');
      if (headsRes.success) setFeeHeads(headsRes.data);
      if (structRes.success) setStructures(structRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleGenerateFees = async () => {
    try {
      const res = await apiFetch('/api/fees/generate', {
        method: 'POST',
        body: JSON.stringify({
          classId: 'cls_1',
          monthYear: '2026-09',
          dueDate: '2026-09-10',
        }),
      });
      if (res.success) {
        alert(`Successfully generated ${res.data.generatedCount} student fee charges for September 2026!`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReceivePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/fees/payments', {
        method: 'POST',
        body: JSON.stringify(paymentForm),
      });
      if (res.success) {
        alert(`Payment received! Issued Receipt #${res.data.receiptNumber}`);
        setShowPaymentModal(false);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleViewLedger = async (studentId: string) => {
    try {
      const res = await apiFetch(`/api/fees/ledger/${studentId}`);
      if (res.success) {
        setLedgerData(res.data);
        setShowLedgerModal(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Fees & Financial Accounting</h1>
            <p className="text-xs text-slate-500">Manage fee heads, recurring fee structures, payment receipts, and student ledgers.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateFees}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Monthly Fees</span>
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 shadow-2xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Receive Payment</span>
            </button>
          </div>
        </div>

        {/* Finance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fee Heads */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Configured Fee Heads</h2>
            <div className="space-y-2">
              {feeHeads.map((head) => (
                <div key={head.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div className="font-semibold text-slate-800">{head.name} ({head.code})</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${head.isRecurring ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                    {head.isRecurring ? 'Recurring Monthly' : 'One-Time'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Ledger View Shortcut */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Student Ledger Lookup</h2>
            <p className="text-xs text-slate-500 mb-4">View chronological debit/credit ledger calculations for any student.</p>
            <button
              onClick={() => handleViewLedger('STD-2026-001')}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800"
            >
              Open Sample Ledger (STD-2026-001)
            </button>
          </div>
        </div>

        {/* Receive Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
              <h2 className="text-base font-bold text-slate-900">Receive Student Fee Payment</h2>
              <form onSubmit={handleReceivePayment} className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Student Admission ID</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.studentId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount Paid (PKR)</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amountPaid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white rounded-md font-semibold">
                    Confirm & Print Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ledger View Modal */}
        {showLedgerModal && ledgerData && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Student Account Ledger</h2>
                  <p className="text-xs text-slate-500">Student ID: {ledgerData.studentId} • Net Outstanding Balance: PKR {ledgerData.currentBalance}</p>
                </div>
                <button onClick={() => setShowLedgerModal(false)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-right">Debit (+)</th>
                    <th className="p-2 text-right">Credit (-)</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ledgerData.ledger.map((entry: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 font-mono">{entry.date}</td>
                      <td className="p-2 font-medium">{entry.description}</td>
                      <td className="p-2 text-right text-red-600">{entry.debit > 0 ? `PKR ${entry.debit}` : '-'}</td>
                      <td className="p-2 text-right text-emerald-600">{entry.credit > 0 ? `PKR ${entry.credit}` : '-'}</td>
                      <td className="p-2 text-right font-bold text-slate-900">PKR {entry.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
