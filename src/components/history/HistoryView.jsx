import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { History, UserCheck, CalendarCheck, Receipt, Search, Printer, Trash2, Download, ShieldAlert, Calendar, HardDrive } from 'lucide-react';
import { InvoiceModal } from '../billing/InvoiceModal';
import { BillChoiceModal } from '../modals/BillChoiceModal';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const HistoryView = () => {
  const { stays, bookings, bills, rooms, deleteStay, deleteBooking, deleteBill, clearAllHistory } = useHotel();
  const [activeSubTab, setActiveSubTab] = useState('stays');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Printing & Choice Modal States
  const [selectedBill, setSelectedBill] = useState(null);
  const [billChoiceData, setBillChoiceData] = useState(null);
  const [customInvoiceData, setCustomInvoiceData] = useState(null);

  // Storage Usage State
  const [storagePercentage, setStoragePercentage] = useState(0.0);

  useEffect(() => {
    let isMounted = true;

    const fetchStorageUsage = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) setStoragePercentage(0.0);
        return;
      }

      try {
        const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
        if (bErr || !buckets) {
          if (isMounted) setStoragePercentage(0.0);
          return;
        }

        let totalBytes = 0;

        const getFolderSize = async (bucketId, path = '') => {
          let bytes = 0;
          const { data: items, error: iErr } = await supabase.storage.from(bucketId).list(path, { limit: 1000 });
          if (iErr || !items) return 0;

          for (const item of items) {
            const size = item.metadata?.size || item.size || 0;
            if (size > 0) {
              bytes += size;
            } else if (!item.id || !item.metadata) {
              const subPath = path ? `${path}/${item.name}` : item.name;
              bytes += await getFolderSize(bucketId, subPath);
            }
          }
          return bytes;
        };

        for (const bucket of buckets) {
          const bucketId = bucket.id || bucket.name;
          if (bucketId) {
            const bSize = await getFolderSize(bucketId);
            totalBytes += bSize;
          }
        }

        const TOTAL_QUOTA_BYTES = 1024 * 1024 * 1024;
        const calcPercent = (totalBytes / TOTAL_QUOTA_BYTES) * 100;
        const finalPercent = Math.min(100, Math.max(0, Number(calcPercent.toFixed(1))));

        if (isMounted) {
          setStoragePercentage(finalPercent);
        }
      } catch (err) {
        console.warn('Error fetching Supabase storage usage:', err);
        if (isMounted) setStoragePercentage(0.0);
      }
    };

    fetchStorageUsage();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(thirtyDaysAgoStr);
  const [toDate, setToDate] = useState(todayStr);

  const [deletingItem, setDeletingItem] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const getRoomObject = (roomId, roomNumber) => {
    if (roomId) {
      const r = rooms.find(room => room.id === roomId);
      if (r) return r;
    }
    if (roomNumber) {
      const r = rooms.find(room => String(room.room_number).trim() === String(roomNumber).trim());
      if (r) return r;
    }
    return { room_number: roomNumber || '1003', rate: 1425, room_type: 'AC' };
  };

  const getRoomNumber = (roomId) => {
    const r = rooms.find(room => room.id === roomId);
    return r ? r.room_number : 'N/A';
  };

  const isWithinDateRange = (itemDateStr) => {
    if (!itemDateStr) return true;
    const d = new Date(itemDateStr).toISOString().slice(0, 10);
    return d >= fromDate && d <= toDate;
  };

  const filteredStays = stays.filter(s => {
    const roomNum = getRoomNumber(s.room_id);
    const term = searchTerm.toLowerCase();
    const matchesSearch = s.guest_name.toLowerCase().includes(term) ||
      roomNum.toLowerCase().includes(term) ||
      (s.phone && s.phone.includes(term)) ||
      (s.company_name && s.company_name.toLowerCase().includes(term));
    
    return matchesSearch && isWithinDateRange(s.check_in);
  });

  const filteredBookings = bookings.filter(b => {
    const roomNum = getRoomNumber(b.room_id);
    const term = searchTerm.toLowerCase();
    const matchesSearch = b.guest_name.toLowerCase().includes(term) ||
      roomNum.toLowerCase().includes(term) ||
      (b.phone && b.phone.includes(term));

    return matchesSearch && isWithinDateRange(b.check_in);
  });

  const filteredBills = bills.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = b.guest_name.toLowerCase().includes(term) ||
      b.room_number.includes(term) ||
      b.bill_number.includes(term);

    return matchesSearch && isWithinDateRange(b.check_in || b.created_at);
  });

  const exportToExcel = () => {
    let headersHTML = '';
    let rowsHTML = '';
    let reportTitle = '';

    if (activeSubTab === 'stays') {
      reportTitle = 'GUEST STAYS HISTORY';
      headersHTML = `
        <tr>
          <th>Room Number</th>
          <th>Guest Name</th>
          <th>Company Name</th>
          <th>Phone</th>
          <th>Check In</th>
          <th>Check Out</th>
          <th>Billable Days</th>
          <th>Status</th>
        </tr>
      `;
      rowsHTML = filteredStays.map(s => {
        const roomNum = getRoomNumber(s.room_id);
        const checkIn = new Date(s.check_in).toLocaleString();
        const checkOut = s.check_out ? new Date(s.check_out).toLocaleString() : 'Active';
        return `
          <tr>
            <td>${roomNum}</td>
            <td>${s.guest_name}</td>
            <td>${s.company_name || '-'}</td>
            <td>${s.phone || '-'}</td>
            <td>${checkIn}</td>
            <td>${checkOut}</td>
            <td>${s.billable_days || 1}</td>
            <td>${s.status}</td>
          </tr>
        `;
      }).join('');
    } else if (activeSubTab === 'bookings') {
      reportTitle = 'RESERVED BOOKINGS HISTORY';
      headersHTML = `
        <tr>
          <th>Room Number</th>
          <th>Reserved Guest</th>
          <th>Phone</th>
          <th>Check In Date</th>
          <th>Expected Checkout</th>
          <th>Status</th>
        </tr>
      `;
      rowsHTML = filteredBookings.map(b => {
        const roomNum = getRoomNumber(b.room_id);
        const checkIn = new Date(b.check_in).toLocaleString();
        const expected = b.expected_checkout ? new Date(b.expected_checkout).toLocaleString() : '-';
        return `
          <tr>
            <td>${roomNum}</td>
            <td>${b.guest_name}</td>
            <td>${b.phone || '-'}</td>
            <td>${checkIn}</td>
            <td>${expected}</td>
            <td>${b.status}</td>
          </tr>
        `;
      }).join('');
    } else {
      reportTitle = 'GENERATED BILLS HISTORY';
      headersHTML = `
        <tr>
          <th>Bill Number</th>
          <th>Room Number</th>
          <th>Guest Name</th>
          <th>Reg Number</th>
          <th>Billable Days</th>
          <th>Grand Total</th>
          <th>Payment Method</th>
          <th>Check In</th>
        </tr>
      `;
      rowsHTML = filteredBills.map(b => {
        const checkIn = new Date(b.check_in).toLocaleDateString();
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
          </tr>
        `;
      }).join('');
    }

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
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
        <div class="header-title">HOTEL GREEN TERMINAL - ${reportTitle}</div>
        <div>Date Range: ${fromDate} to ${toDate}</div>
        <br/>
        <table>
          <thead>
            ${headersHTML}
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Green_Terminal_${activeSubTab}_${fromDate}_to_${toDate}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    if (deletingItem.type === 'stay') await deleteStay(deletingItem.id);
    if (deletingItem.type === 'booking') await deleteBooking(deletingItem.id);
    if (deletingItem.type === 'bill') await deleteBill(deletingItem.id);
    setDeletingItem(null);
  };

  const handleClearAllConfirm = async () => {
    await clearAllHistory();
    setShowClearAllModal(false);
  };

  const handleOpenPrintChoiceForStay = (stay) => {
    const roomObj = getRoomObject(stay.room_id, stay.room_number);
    setBillChoiceData({ stay, room: roomObj });
  };

  const handleOpenPrintChoiceForBill = (bill) => {
    const roomObj = getRoomObject(bill.room_id, bill.room_number);
    const stayObj = {
      guest_name: bill.guest_name,
      phone: bill.phone,
      company_name: bill.company_name,
      gst_number: bill.gst_number,
      check_in: bill.check_in,
      check_out: bill.check_out,
      room_rate: bill.room_rate,
      room_number: bill.room_number
    };
    setBillChoiceData({ stay: stayObj, room: roomObj, initialBill: bill });
  };

  const handleConfirmBillChoice = ({ stay, room, customBillData, isManual }) => {
    setBillChoiceData(null);
    setCustomInvoiceData({ stay, room, customBillData });
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="clay-card p-4 sm:p-6 border border-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <History className="w-6 h-6 text-emerald-600" />
            HOTEL AUDIT & HISTORY REGISTRY
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            View, export, and manage historical stays, bookings, and invoices stored in Supabase.
          </p>
        </div>

        {/* Date Filter & Export Controls */}
        <div className="flex flex-wrap items-center gap-2">
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

          {/* CLEAR ALL DATA BUTTON */}
          <button
            onClick={() => setShowClearAllModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold shadow-2xs transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>CLEAR ALL DATA</span>
          </button>
        </div>
      </div>

      {/* Horizontal Supabase Storage Usage Progress Bar */}
      <div className="clay-card p-3 sm:p-4 border border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              SUPABASE STORAGE USAGE
            </span>
          </div>
          <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
            {storagePercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-300/50 dark:border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${Math.max(storagePercentage, 0.5)}%` }}
          />
        </div>
      </div>

      {/* Sub Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-xl shadow-inner max-w-md">
          <button
            onClick={() => setActiveSubTab('stays')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'stays' ? 'bg-emerald-600 text-white shadow' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Guest Stays ({filteredStays.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bookings')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'bookings' ? 'bg-emerald-600 text-white shadow' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Bookings ({filteredBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bills')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'bills' ? 'bg-emerald-600 text-white shadow' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Bills ({filteredBills.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            className="clay-input w-full pl-9 pr-3 py-2 text-xs font-medium"
            placeholder="Search Guest, Room #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Delete Item Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">DELETE RECORD?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Are you sure you want to delete <strong>{deletingItem.label}</strong> from history logs? This action syncs with Supabase.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
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

      {/* Clear All History Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">CLEAR ALL HISTORY DATA?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Are you sure you want to permanently clear all historical stays, completed bookings, and bills? Active checked-in guests will remain untouched.
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
                CLEAR ALL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stays History Table */}
      {activeSubTab === 'stays' && (
        <div className="clay-card p-4 sm:p-6 border border-slate-300 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-black border-b border-slate-300 dark:border-slate-700">
                  <th className="p-3">Room #</th>
                  <th className="p-3">Guest Name</th>
                  <th className="p-3">Company / GST</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {filteredStays.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-6 text-center text-slate-500 dark:text-slate-400 font-semibold">
                      No stay history records found for selected dates.
                    </td>
                  </tr>
                ) : (
                  filteredStays.map((stay) => {
                    const roomNum = getRoomNumber(stay.room_id);
                    return (
                      <tr key={stay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-black text-sm text-slate-900 dark:text-white">{roomNum}</td>
                        <td className="p-3 font-bold uppercase text-slate-900 dark:text-white">{stay.guest_name}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {stay.company_name ? (
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200 uppercase">{stay.company_name}</div>
                              {stay.gst_number && <div className="text-[10px] font-mono">GST: {stay.gst_number}</div>}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{stay.phone || '-'}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                          {new Date(stay.check_in).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                          {stay.check_out ? (
                            new Date(stay.check_out).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          ) : (
                            <span className="text-sky-700 dark:text-sky-400 font-bold">STILL IN ROOM</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{stay.billable_days || 1}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            stay.status === 'CHECKED_IN' ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                          }`}>
                            {stay.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenPrintChoiceForStay(stay)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                            title="Print Bill (Automatic / Manual Choice)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Bill</span>
                          </button>
                          <button
                            onClick={() => setDeletingItem({ id: stay.id, type: 'stay', label: `Stay for ${stay.guest_name} (Room ${roomNum})` })}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition-colors inline-block align-middle"
                            title="Delete Stay Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings History Table */}
      {activeSubTab === 'bookings' && (
        <div className="clay-card p-4 sm:p-6 border border-slate-300 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-black border-b border-slate-300 dark:border-slate-700">
                  <th className="p-3">Room #</th>
                  <th className="p-3">Reserved Guest</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Check-In Date</th>
                  <th className="p-3">Expected Checkout</th>
                  <th className="p-3">Booking Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-500 dark:text-slate-400 font-semibold">
                      No booking history records found for selected dates.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const roomNum = getRoomNumber(b.room_id);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-black text-sm text-slate-900 dark:text-white">{roomNum}</td>
                        <td className="p-3 font-bold uppercase text-slate-900 dark:text-white">{b.guest_name}</td>
                        <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{b.phone || '-'}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                          {new Date(b.check_in).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                          {b.expected_checkout ? new Date(b.expected_checkout).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            b.status === 'ACTIVE' ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setDeletingItem({ id: b.id, type: 'booking', label: `Booking for ${b.guest_name} (Room ${roomNum})` })}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition-colors"
                            title="Delete Booking Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bills History Table */}
      {activeSubTab === 'bills' && (
        <div className="clay-card p-4 sm:p-6 border border-slate-300 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-black border-b border-slate-300 dark:border-slate-700">
                  <th className="p-3">Bill #</th>
                  <th className="p-3">Room #</th>
                  <th className="p-3">Guest Name</th>
                  <th className="p-3">Reg #</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Grand Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-slate-500 dark:text-slate-400 font-semibold">
                      No generated bills found for selected dates.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">{bill.bill_number}</td>
                      <td className="p-3 font-mono font-black text-slate-900 dark:text-white">{bill.room_number}</td>
                      <td className="p-3 font-bold uppercase text-slate-900 dark:text-white">{bill.guest_name}</td>
                      <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{bill.reg_number || '7732'}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{bill.billable_days}</td>
                      <td className="p-3 font-mono font-black text-slate-900 dark:text-white">₹{bill.grand_total}</td>
                      <td className="p-3 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{bill.payment_method}</td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenPrintChoiceForBill(bill)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                          title="Print Bill (Automatic / Manual Option)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Bill</span>
                        </button>
                        <button
                          onClick={() => setDeletingItem({ id: bill.id, type: 'bill', label: `Bill #${bill.bill_number} for ${bill.guest_name}` })}
                          className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition-colors inline-block align-middle"
                          title="Delete Bill Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bill Choice Modal (Automatic vs Manual Option) */}
      {billChoiceData && (
        <BillChoiceModal
          stay={billChoiceData.stay}
          room={billChoiceData.room}
          onClose={() => setBillChoiceData(null)}
          onConfirmBill={handleConfirmBillChoice}
        />
      )}

      {/* Invoice Modal for Custom / Choice Bill */}
      {customInvoiceData && (
        <InvoiceModal
          stay={customInvoiceData.stay}
          room={customInvoiceData.room}
          customBillData={customInvoiceData.customBillData}
          onClose={() => setCustomInvoiceData(null)}
        />
      )}

      {/* Invoice Modal for Direct Selected Bill */}
      {selectedBill && (
        <InvoiceModal
          initialBill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
};
