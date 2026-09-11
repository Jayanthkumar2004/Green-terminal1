import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Receipt, Printer, Search, Trash2, Download, Calendar, ShieldAlert } from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';

export const BillsList = () => {
  const { bills, deleteBill, clearBillsHistory } = useHotel();
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(thirtyDaysAgoStr);
  const [toDate, setToDate] = useState(todayStr);

  const [deletingBill, setDeletingBill] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const isWithinDateRange = (itemDateStr) => {
    if (!itemDateStr) return true;
    const d = new Date(itemDateStr).toISOString().slice(0, 10);
    return d >= fromDate && d <= toDate;
  };

  const filteredBills = bills.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = b.guest_name.toLowerCase().includes(term) ||
      b.room_number.includes(term) ||
      b.bill_number.includes(term);

    return matchesSearch && isWithinDateRange(b.check_in || b.created_at);
  });

  const exportToExcel = () => {
    let tableRows = filteredBills.map(b => {
      const checkIn = new Date(b.check_in).toLocaleDateString();
      const checkOut = b.check_out ? new Date(b.check_out).toLocaleDateString() : '';
      return `
        <tr>
          <td>${b.bill_number}</td>
          <td>${b.room_number}</td>
          <td>${b.guest_name}</td>
          <td>${b.reg_number || '7732'}</td>
          <td>${b.billable_days}</td>
          <td>₹${b.grand_total}</td>
          <td>${b.payment_method}</td>
          <td>${checkIn}</td>
          <td>${checkOut}</td>
        </tr>
      `;
    }).join('');

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Green Terminal Bills</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #059669; color: #ffffff; font-weight: bold; border: 1px solid #047857; padding: 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 6px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .header-title { font-size: 16px; font-weight: bold; color: #064e3b; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="header-title">HOTEL GREEN TERMINAL - GENERATED BILLS REPORT</div>
        <div>Date Range: ${fromDate} to ${toDate}</div>
        <br/>
        <table>
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Room Number</th>
              <th>Guest Name</th>
              <th>Reg Number</th>
              <th>Billable Days</th>
              <th>Grand Total</th>
              <th>Payment Method</th>
              <th>Check In</th>
              <th>Check Out</th>
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
    link.download = `Green_Terminal_Bills_${fromDate}_to_${toDate}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = async () => {
    if (deletingBill) {
      await deleteBill(deletingBill.id);
      setDeletingBill(null);
    }
  };

  const handleClearAllConfirm = async () => {
    await clearBillsHistory();
    setShowClearAllModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="clay-card p-4 sm:p-6 border border-slate-300 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            GENERATED BILLS REGISTRY
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            View, filter, delete, re-print, and export historical Green Terminal guest invoices.
          </p>
        </div>

        {/* Date Filter & Export & Clear History Buttons */}
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
            onClick={exportToExcel}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT EXCEL</span>
          </button>

          <button
            onClick={() => setShowClearAllModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg text-xs font-bold shadow-2xs transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>DELETE HISTORY</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            className="clay-input w-full pl-9 pr-3 py-2 text-xs font-medium"
            placeholder="Search Guest, Room #, Bill #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Individual Bill Delete Modal */}
      {deletingBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">DELETE BILL RECORD?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Are you sure you want to delete <strong>Bill #{deletingBill.bill_number}</strong> for <strong>{deletingBill.guest_name}</strong>? This action syncs with Supabase.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingBill(null)}
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

      {/* Clear All Bills History Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">CLEAR BILLS HISTORY?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Are you sure you want to delete all historical generated bills? This cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase"
              >
                CANCEL
              </button>
              <button
                onClick={handleClearAllConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs uppercase shadow-lg"
              >
                DELETE ALL BILLS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="clay-card p-6 border border-slate-300 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-black border-b border-slate-300 dark:border-slate-700">
                <th className="p-3">Bill #</th>
                <th className="p-3">Room #</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Check-In</th>
                <th className="p-3">Check-Out</th>
                <th className="p-3">Days</th>
                <th className="p-3">Grand Total</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-500 dark:text-slate-400 font-semibold">
                    No generated bills found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">{bill.bill_number}</td>
                    <td className="p-3 font-mono font-black text-slate-900 dark:text-white">{bill.room_number}</td>
                    <td className="p-3 font-bold uppercase text-slate-800 dark:text-slate-200">{bill.guest_name}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {new Date(bill.check_in).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {new Date(bill.check_out).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{bill.billable_days}</td>
                    <td className="p-3 font-mono font-black text-slate-900 dark:text-white">₹{bill.grand_total}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </button>

                      <button
                        onClick={() => setDeletingBill(bill)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs transition-all"
                        title="Delete Individual Bill Record"
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

      {/* Invoice Modal for selected bill */}
      {selectedBill && (
        <InvoiceModal
          initialBill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
};
