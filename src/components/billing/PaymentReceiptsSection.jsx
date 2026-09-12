import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Receipt, Printer, Search, Trash2, Plus, Edit3, Download, Calendar, ShieldCheck, DollarSign, User, Phone, Hash, X } from 'lucide-react';
import { CheckInReceiptModal } from './CheckInReceiptModal';
import { QuickDateTimePicker } from '../common/QuickDateTimePicker';

export const PaymentReceiptsSection = () => {
  const { paymentReceipts, createPaymentReceipt, updatePaymentReceipt, deletePaymentReceipt } = useHotel();
  
  const [searchTerm, setSearchTerm] = useState('');
  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(thirtyDaysAgoStr);
  const [toDate, setToDate] = useState(todayStr);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [deletingReceipt, setDeletingReceipt] = useState(null);
  const [printingReceipt, setPrintingReceipt] = useState(null);

  const getNowLocalStr = () => {
    const d = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    receipt_number: '',
    room_number: '4007',
    category: 'AC',
    guest_name: '',
    phone: '',
    payment_method: 'CARD PAID',
    amount: '',
    created_at: getNowLocalStr(),
    notes: ''
  });

  const isWithinDateRange = (itemDateStr) => {
    if (!itemDateStr) return true;
    const d = new Date(itemDateStr).toISOString().slice(0, 10);
    return d >= fromDate && d <= toDate;
  };

  const filteredReceipts = paymentReceipts.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (r.guest_name || '').toLowerCase().includes(term) ||
      (r.room_number || '').includes(term) ||
      (r.receipt_number || '').includes(term) ||
      (r.category || '').toLowerCase().includes(term);

    return matchesSearch && isWithinDateRange(r.created_at);
  });

  const totalCollected = filteredReceipts.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const handleOpenAdd = () => {
    setFormData({
      receipt_number: String(Math.floor(8000 + Math.random() * 900)),
      room_number: '4007',
      category: 'AC',
      guest_name: '',
      phone: '',
      payment_method: 'CARD PAID',
      amount: '',
      created_at: getNowLocalStr(),
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (receipt) => {
    setEditingReceipt(receipt);
    const dateObj = receipt.created_at ? new Date(receipt.created_at) : new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const localStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;

    setFormData({
      receipt_number: receipt.receipt_number,
      room_number: receipt.room_number,
      category: receipt.category || 'AC',
      guest_name: receipt.guest_name,
      phone: receipt.phone || '',
      payment_method: receipt.payment_method || 'CARD PAID',
      amount: receipt.amount,
      created_at: localStr,
      notes: receipt.notes || ''
    });
  };

  const handleSaveAdd = async (e, shouldPrint = false) => {
    if (e) e.preventDefault();
    if (!formData.guest_name.trim() || !formData.amount) return;

    const createdDate = new Date(formData.created_at).toISOString();

    const payload = {
      ...formData,
      guest_name: formData.guest_name.toUpperCase(),
      amount: parseFloat(formData.amount) || 0,
      created_at: createdDate
    };

    const newRec = await createPaymentReceipt(payload);
    setShowAddModal(false);

    if (shouldPrint && newRec) {
      setPrintingReceipt(newRec);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReceipt || !formData.guest_name.trim()) return;

    const updatedDate = new Date(formData.created_at).toISOString();

    await updatePaymentReceipt(editingReceipt.id, {
      receipt_number: formData.receipt_number,
      room_number: formData.room_number,
      category: formData.category,
      guest_name: formData.guest_name.toUpperCase(),
      phone: formData.phone,
      payment_method: formData.payment_method,
      amount: parseFloat(formData.amount) || 0,
      created_at: updatedDate,
      notes: formData.notes
    });
    setEditingReceipt(null);
  };

  const handleDeleteConfirm = async () => {
    if (deletingReceipt) {
      await deletePaymentReceipt(deletingReceipt.id);
      setDeletingReceipt(null);
    }
  };

  const exportToExcel = () => {
    let tableRows = filteredReceipts.map(r => `
      <tr>
        <td>#${r.receipt_number}</td>
        <td>${r.room_number}</td>
        <td>${r.category || 'AC'}</td>
        <td>${r.guest_name}</td>
        <td>${r.phone || 'N/A'}</td>
        <td>₹${r.amount}</td>
        <td>${r.payment_method}</td>
        <td>${new Date(r.created_at).toLocaleString()}</td>
        <td>${r.notes || ''}</td>
      </tr>
    `).join('');

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #0284c7; color: #ffffff; font-weight: bold; border: 1px solid #0369a1; padding: 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 6px; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <h3>HOTEL GREEN TERMINAL - PAYMENT RECEIPTS REPORT</h3>
        <div>Date Range: ${fromDate} to ${toDate} | Total Collected: ₹${totalCollected.toFixed(2)}</div>
        <br/>
        <table>
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Room #</th>
              <th>Category</th>
              <th>Guest Name</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Pay Method</th>
              <th>Timestamp</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Green_Terminal_Payment_Receipts_${fromDate}_to_${toDate}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="clay-card p-4 sm:p-6 border border-slate-300 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            PAYMENT RECEIPTS REGISTRY (CRUD)
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, add, edit, delete, and print official guest payment receipts and deposit slips.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ADD RECEIPT</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow transition-all"
            title="Create & Print Manual Payment Receipt"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT MANUAL RECEIPT</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT EXCEL</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="clay-card p-4 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Total Receipts Count</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{filteredReceipts.length}</h3>
          </div>
          <div className="p-3 bg-sky-100 dark:bg-sky-950 text-sky-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="clay-card p-4 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Total Revenue Collected</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{totalCollected.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="clay-card p-4 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Filtered Date Range</p>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{fromDate} to {toDate}</h3>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            className="clay-input w-full pl-9 pr-3 py-2 text-xs font-medium"
            placeholder="Search Guest, Room #, Category, Receipt #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="clay-card p-6 border border-slate-300 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-black border-b border-slate-300 dark:border-slate-700">
                <th className="p-3">Receipt #</th>
                <th className="p-3">Room #</th>
                <th className="p-3">Category</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Pay Mode</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Check-in / Timestamp</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-slate-500 dark:text-slate-400 font-semibold">
                    No payment receipts found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-700 dark:text-sky-400">#{r.receipt_number}</td>
                    <td className="p-3 font-mono font-black text-slate-900 dark:text-white">{r.room_number}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase border border-emerald-300 dark:border-emerald-800">
                        {r.category || 'AC'}
                      </span>
                    </td>
                    <td className="p-3 font-bold uppercase text-slate-800 dark:text-slate-200">{r.guest_name}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">{r.phone || 'N/A'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                        {r.payment_method}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">₹{parseFloat(r.amount).toFixed(2)}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {new Date(r.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setPrintingReceipt(r)}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                        title="Print Receipt Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                        title="Edit Receipt Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeletingReceipt(r)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                        title="Delete Receipt"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE RECEIPT / PRINT MANUAL RECEIPT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-600" />
                <span>CREATE & PRINT MANUAL PAYMENT RECEIPT</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleSaveAdd(e, false)} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Receipt #</label>
                  <input
                    type="text"
                    required
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-mono font-bold"
                    value={formData.receipt_number}
                    onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Room #</label>
                  <input
                    type="text"
                    required
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-mono font-black"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <select
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-bold uppercase"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="AC">AC ROOM</option>
                    <option value="NON AC">NON AC ROOM</option>
                    <option value="DELUXE AC">DELUXE AC</option>
                    <option value="SUITE">SUITE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  className="clay-input w-full px-2.5 py-1.5 text-xs uppercase font-bold"
                  placeholder="FULL GUEST NAME"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-semibold"
                    placeholder="9100920936"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Amount / Daily Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-mono font-black"
                    placeholder="1425"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              {/* Quick Easy Check-in Timestamp Selector */}
              <QuickDateTimePicker
                label="Check-in / Payment Timestamp"
                value={formData.created_at}
                onChange={(val) => setFormData({ ...formData, created_at: val })}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Payment Method</label>
                  <select
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-bold"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="CARD PAID">CARD PAID</option>
                    <option value="CAS PAID">CAS PAID</option>
                    <option value="UPI PAID">UPI PAID</option>
                    <option value="CASH PAID">CASH PAID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Notes / Remarks</label>
                  <input
                    type="text"
                    className="clay-input w-full px-2.5 py-1.5 text-xs"
                    placeholder="Advance or room check-in note"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl text-xs uppercase shadow-md"
                >
                  CREATE RECEIPT
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveAdd(e, true)}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs uppercase shadow-md flex items-center justify-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>SAVE & PRINT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RECEIPT MODAL */}
      {editingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                <span>EDIT PAYMENT RECEIPT #{editingReceipt.receipt_number}</span>
              </h3>
              <button onClick={() => setEditingReceipt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Receipt #</label>
                  <input
                    type="text"
                    required
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-mono font-bold"
                    value={formData.receipt_number}
                    onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Room #</label>
                  <input
                    type="text"
                    required
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-mono font-black"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <select
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-bold uppercase"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="AC">AC ROOM</option>
                    <option value="NON AC">NON AC ROOM</option>
                    <option value="DELUXE AC">DELUXE AC</option>
                    <option value="SUITE">SUITE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  className="clay-input w-full px-2.5 py-1.5 text-xs uppercase font-bold"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-semibold"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-mono font-black"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              {/* Quick Easy Check-in Timestamp Selector */}
              <QuickDateTimePicker
                label="Check-in / Payment Timestamp"
                value={formData.created_at}
                onChange={(val) => setFormData({ ...formData, created_at: val })}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Payment Method</label>
                  <select
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-bold"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="CARD PAID">CARD PAID</option>
                    <option value="CAS PAID">CAS PAID</option>
                    <option value="UPI PAID">UPI PAID</option>
                    <option value="CASH PAID">CASH PAID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Notes</label>
                  <input
                    type="text"
                    className="clay-input w-full px-2.5 py-1.5 text-xs"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReceipt(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase shadow-md"
                >
                  UPDATE RECEIPT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE RECEIPT CONFIRMATION MODAL */}
      {deletingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">DELETE PAYMENT RECEIPT?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Are you sure you want to delete <strong>Receipt #{deletingReceipt.receipt_number}</strong> for <strong>{deletingReceipt.guest_name}</strong>? This action syncs with Supabase.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingReceipt(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs uppercase shadow-lg"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {printingReceipt && (
        <CheckInReceiptModal
          stay={{
            guest_name: printingReceipt.guest_name,
            phone: printingReceipt.phone,
            room_rate: printingReceipt.amount,
            check_in: printingReceipt.created_at,
            category: printingReceipt.category || 'AC',
            company_name: printingReceipt.notes
          }}
          room={{
            room_number: printingReceipt.room_number,
            room_type: printingReceipt.category || 'AC',
            rate: printingReceipt.amount
          }}
          onClose={() => setPrintingReceipt(null)}
        />
      )}

    </div>
  );
};
