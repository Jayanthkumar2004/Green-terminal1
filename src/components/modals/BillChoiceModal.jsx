import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { X, Receipt, Edit3, Sparkles, CheckCircle, Calculator, Building, User, Phone, Hash, Calendar } from 'lucide-react';

export const BillChoiceModal = ({ stay, room, onClose, onConfirmBill }) => {
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'

  const defaultCheckIn = stay?.check_in ? new Date(stay.check_in).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
  const defaultCheckOut = stay?.check_out ? new Date(stay.check_out).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);

  const [manualData, setManualData] = useState({
    guest_name: stay?.guest_name || '',
    phone: stay?.phone || '',
    company_name: stay?.company_name || '',
    gst_number: stay?.gst_number || '',
    room_number: room?.room_number || stay?.room_number || '1003',
    room_type: room?.room_type || 'AC',
    room_rate: room?.rate || stay?.room_rate || 1425,
    check_in: defaultCheckIn,
    check_out: defaultCheckOut,
    reg_number: '7732',
    payment_method: 'CARD PAID',
    manual_grand_total: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'auto') {
      onConfirmBill({
        stay,
        room,
        isManual: false
      });
    } else {
      onConfirmBill({
        stay: {
          ...stay,
          guest_name: manualData.guest_name,
          phone: manualData.phone,
          company_name: manualData.company_name,
          gst_number: manualData.gst_number,
          check_in: manualData.check_in,
          check_out: manualData.check_out,
          room_rate: parseFloat(manualData.room_rate) || 1425
        },
        room: {
          ...room,
          room_number: manualData.room_number,
          room_type: manualData.room_type,
          rate: parseFloat(manualData.room_rate) || 1425
        },
        customBillData: {
          reg_number: manualData.reg_number,
          payment_method: manualData.payment_method,
          manual_grand_total: manualData.manual_grand_total ? parseFloat(manualData.manual_grand_total) : null
        },
        isManual: true
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            <h3 className="font-black text-lg">GENERATE INVOICE BILL</h3>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'auto'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>AUTOMATIC BILL</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'manual'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>MANUAL BILL (EDITABLE)</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'auto' ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
              <p className="font-bold text-emerald-900 dark:text-emerald-300">
                Automatic bill calculation mode selected.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                System will calculate stay duration, billable days, room rate, CGST (2.5%), and SGST (2.5%) directly from active stay records.
              </p>
              <div className="pt-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                GUEST: {stay?.guest_name || 'GUEST'} • ROOM {room?.room_number || '1003'}
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="clay-input w-full px-3 py-1.5 text-xs font-bold uppercase"
                    value={manualData.guest_name}
                    onChange={(e) => setManualData({ ...manualData, guest_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    required
                    className="clay-input w-full px-3 py-1.5 text-xs font-mono font-bold"
                    value={manualData.room_number}
                    onChange={(e) => setManualData({ ...manualData, room_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    className="clay-input w-full px-3 py-1.5 text-xs uppercase"
                    placeholder="Optional Company"
                    value={manualData.company_name}
                    onChange={(e) => setManualData({ ...manualData, company_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    className="clay-input w-full px-3 py-1.5 text-xs uppercase"
                    placeholder="Optional GST"
                    value={manualData.gst_number}
                    onChange={(e) => setManualData({ ...manualData, gst_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    className="clay-input w-full px-3 py-1.5 text-xs"
                    value={manualData.phone}
                    onChange={(e) => setManualData({ ...manualData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Reg #
                  </label>
                  <input
                    type="text"
                    className="clay-input w-full px-3 py-1.5 text-xs font-mono font-bold"
                    value={manualData.reg_number}
                    onChange={(e) => setManualData({ ...manualData, reg_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Check-in Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="clay-input w-full px-2 py-1 text-xs font-semibold"
                    value={manualData.check_in}
                    onChange={(e) => setManualData({ ...manualData, check_in: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Check-out Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="clay-input w-full px-2 py-1 text-xs font-semibold"
                    value={manualData.check_out}
                    onChange={(e) => setManualData({ ...manualData, check_out: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Room Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    className="clay-input w-full px-3 py-1.5 text-xs font-bold"
                    value={manualData.room_rate}
                    onChange={(e) => setManualData({ ...manualData, room_rate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Manual Total Amount (₹) (Optional Override)
                  </label>
                  <input
                    type="number"
                    className="clay-input w-full px-3 py-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400"
                    placeholder="e.g. 3000"
                    value={manualData.manual_grand_total}
                    onChange={(e) => setManualData({ ...manualData, manual_grand_total: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  className="clay-input w-full px-3 py-1.5 text-xs font-bold"
                  value={manualData.payment_method}
                  onChange={(e) => setManualData({ ...manualData, payment_method: e.target.value })}
                >
                  <option value="CARD PAID">CARD PAID</option>
                  <option value="CAS PAID">CAS PAID</option>
                  <option value="UPI PAID">UPI PAID</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            <span>GENERATE {mode === 'manual' ? 'MANUAL' : 'AUTOMATIC'} INVOICE PREVIEW</span>
          </button>
        </form>

      </div>
    </div>
  );
};
