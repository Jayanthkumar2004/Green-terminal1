import React from 'react';
import ReactDOM from 'react-dom';
import { X, Printer, Key, ShieldCheck } from 'lucide-react';

export const CheckInReceiptModal = ({ stay, room, onClose }) => {
  if (!stay && !room) return null;

  const roomNumber = room?.room_number || stay?.room_number || '4007';
  const rawRoomType = (room?.room_type || stay?.room_type || stay?.category || 'AC').toUpperCase();
  const roomCategory = stay?.category ? stay.category.toUpperCase() : (rawRoomType.includes('NON') || rawRoomType.includes('NON-AC') ? 'NON AC' : 'AC');
  
  const roomRate = stay?.room_rate || room?.rate || 1425;
  const guestName = stay?.guest_name || 'GUEST NAME';
  const phone = stay?.phone || '';
  const companyName = stay?.company_name || '';
  const gstNumber = stay?.gst_number || '';

  const checkInDate = stay?.check_in ? new Date(stay.check_in) : new Date();

  // Date Formatter: e.g. "12-SEP-2026 10:30 AM"
  const formatDateTime = (d) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day}-${month}-${year} ${timeStr}`;
  };

  const checkInFormatted = formatDateTime(checkInDate);
  const receiptNo = stay?.receipt_number || stay?.receipt_no || room?.receipt_number || String(Math.floor(8000 + Math.random() * 900));

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:block print:w-full print:h-auto print:min-h-0 print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden my-auto print:max-w-none print:w-full print:rounded-none print:shadow-none print:border-none print:m-0 print:p-0 print:overflow-visible print:bg-transparent print:block print:h-auto print:static">
        
        {/* Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white p-3 sm:p-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>GUEST CHECK-IN RECEIPT</span>
            </h3>
            <p className="text-xs text-slate-400">Official check-in registration slip</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT RECEIPT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div id="printable-invoice" className="p-6 md:p-8 print:p-2 bg-white text-slate-900 font-sans text-xs leading-snug">
          
          {/* Header */}
          <div className="text-center mb-5 pb-3 border-b-2 border-slate-900">
            <h1 className="text-xl md:text-2xl font-serif tracking-widest text-slate-900 font-bold uppercase mb-1">
              HOTEL GREEN TERMINAL
            </h1>
            <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-tight">
              D.No : 41-21/2-11/GF, FEEDER ROAD OPP APSRTC BUS STAND, VIJAYAWADA
            </p>
            <p className="text-[10px] font-bold text-slate-800 uppercase mt-0.5">
              PH: +91 9100920936 • GSTIN: 37AABCY6061B1ZH
            </p>
            <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider rounded mt-2 print:bg-slate-900 print:text-white">
              CHECK-IN RECEIPT / SLIP
            </div>
          </div>

          {/* Receipt Info Table */}
          <div className="border border-slate-900 mb-4 divide-y divide-slate-900">
            
            {/* Row 1: Receipt No & Date */}
            <div className="grid grid-cols-2 divide-x divide-slate-900 bg-slate-50 print:bg-slate-100 font-mono text-[11px]">
              <div className="p-2">
                <span className="font-bold text-slate-700 uppercase font-sans text-[10px] block">Receipt No:</span>
                <span className="font-black text-slate-900">#{receiptNo}</span>
              </div>
              <div className="p-2">
                <span className="font-bold text-slate-700 uppercase font-sans text-[10px] block">Check-in Time:</span>
                <span className="font-bold text-slate-900">{checkInFormatted}</span>
              </div>
            </div>

            {/* Row 2: Room Number & AC / NON AC specification */}
            <div className="grid grid-cols-2 divide-x divide-slate-900 text-xs">
              <div className="p-2.5">
                <span className="font-bold text-slate-700 uppercase text-[10px] block">Room Number:</span>
                <span className="font-mono font-black text-base text-slate-900">ROOM {roomNumber}</span>
              </div>
              <div className="p-2.5">
                <span className="font-bold text-slate-700 uppercase text-[10px] block">Room Category (AC / NON AC):</span>
                <span className="font-black text-sm uppercase text-emerald-800 print:text-black">
                  {roomCategory} ROOM ({rawRoomType})
                </span>
              </div>
            </div>

            {/* Row 3: Daily Price Rate */}
            <div className="grid grid-cols-2 divide-x divide-slate-900 text-xs">
              <div className="p-2.5">
                <span className="font-bold text-slate-700 uppercase text-[10px] block">Daily Tariff / Rate:</span>
                <span className="font-mono font-black text-sm text-slate-900">₹{parseFloat(roomRate).toFixed(2)} / Day</span>
              </div>
              <div className="p-2.5">
                <span className="font-bold text-slate-700 uppercase text-[10px] block">Check-in Status:</span>
                <span className="font-bold text-blue-700 print:text-black uppercase">CONFIRMED CHECKED-IN</span>
              </div>
            </div>

            {/* Row 4: Guest Name & Phone (Optional) */}
            <div className="p-2.5 space-y-1">
              <div className="font-bold text-slate-700 uppercase text-[10px]">Guest Information:</div>
              <div className="font-black text-sm uppercase text-slate-900 tracking-tight">
                GUEST NAME: {guestName}
              </div>
              <div className="font-mono text-xs font-bold text-slate-800">
                PHONE NUMBER: {phone ? phone : 'N/A (OPTIONAL)'}
              </div>
              {companyName && (
                <div className="font-semibold text-xs uppercase text-slate-800">
                  COMPANY: {companyName}
                </div>
              )}
              {gstNumber && (
                <div className="font-mono text-xs font-semibold text-slate-800">
                  GST NO: {gstNumber}
                </div>
              )}
            </div>

          </div>

          {/* Key & Notice Section */}
          <div className="border border-slate-300 p-3 rounded mb-4 text-[10px] space-y-1 text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Key className="w-4 h-4 text-slate-800" />
              <span>Room Key Guidelines & Policy:</span>
            </div>
            <p className="leading-tight">
              • Please deposit room key at the front office desk when leaving hotel premises.
            </p>
            <p className="leading-tight">
              • Standard 24-hour checkout cycle applies from check-in timestamp.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 font-sans text-[11px] font-bold text-slate-900 pt-4 mt-6 border-t border-slate-900">
            <div className="text-center pt-4 border-t border-dashed border-slate-400">
              GUEST'S SIGNATURE
            </div>
            <div className="text-center pt-4 border-t border-dashed border-slate-400">
              FRONT OFFICE AUTHORIZED SIGNATORY
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const printTarget = document.getElementById('print-root') || document.body;
  return ReactDOM.createPortal(modalContent, printTarget);
};
