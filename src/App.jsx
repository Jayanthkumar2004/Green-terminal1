import React, { useState } from 'react';
import { useHotel } from './context/HotelContext';
import { AuthModal } from './components/auth/AuthModal';
import { Header } from './components/dashboard/Header';
import { MetricsOverview } from './components/dashboard/MetricsOverview';
import { RoomBoard } from './components/roomboard/RoomBoard';
import { RoomActionModal } from './components/dashboard/RoomActionModal';
import { BookingModal } from './components/modals/BookingModal';
import { CheckInModal } from './components/modals/CheckInModal';
import { CheckOutModal } from './components/modals/CheckOutModal';
import { InvoiceModal } from './components/billing/InvoiceModal';
import { RoomAdminModal } from './components/admin/RoomAdminModal';
import { BillsList } from './components/billing/BillsList';
import { HistoryView } from './components/history/HistoryView';
import { BillChoiceModal } from './components/modals/BillChoiceModal';

export function App() {
  const { user, getRoomActiveStay, theme } = useHotel();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Active Modals state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [checkInRoom, setCheckInRoom] = useState(null);
  const [checkOutRoom, setCheckOutRoom] = useState(null);

  // Bill Choice Modal state
  const [billChoiceData, setBillChoiceData] = useState(null); // { stay, room }
  
  // Invoice Modal state
  const [invoiceData, setInvoiceData] = useState(null); // { stay, room, customBillData }

  if (!user) {
    return <AuthModal />;
  }

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleGenerateBillFromAction = (room) => {
    const activeStay = getRoomActiveStay(room.id);
    if (!activeStay) return;
    setBillChoiceData({ stay: activeStay, room });
  };

  const handleAfterCheckoutGenerateBill = (checkoutResult) => {
    if (checkoutResult?.activeStay && checkoutResult?.room) {
      setBillChoiceData({
        stay: checkoutResult.activeStay,
        room: checkoutResult.room
      });
    }
  };

  const handleConfirmBillChoice = ({ stay, room, customBillData }) => {
    setBillChoiceData(null);
    setInvoiceData({
      stay,
      room,
      customBillData
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-200/60 text-slate-800'} p-3 sm:p-6 font-sans transition-colors duration-200 selection:bg-emerald-500 selection:text-white`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Claymorphic App Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <MetricsOverview />
            <RoomBoard onSelectRoom={handleSelectRoom} />
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <RoomBoard onSelectRoom={handleSelectRoom} />
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryView />
        )}

        {activeTab === 'admin' && (
          <RoomAdminModal />
        )}

        {activeTab === 'bills' && (
          <BillsList />
        )}

        {/* Room Action Panel Modal */}
        {selectedRoom && (
          <RoomActionModal
            room={selectedRoom}
            onClose={() => setSelectedRoom(null)}
            onOpenBooking={(room) => setBookingRoom(room)}
            onOpenCheckIn={(room) => setCheckInRoom(room)}
            onOpenCheckOut={(room) => setCheckOutRoom(room)}
            onGenerateBill={(room) => handleGenerateBillFromAction(room)}
          />
        )}

        {/* Booking Form Modal */}
        {bookingRoom && (
          <BookingModal
            room={bookingRoom}
            onClose={() => setBookingRoom(null)}
          />
        )}

        {/* Check-In Form Modal */}
        {checkInRoom && (
          <CheckInModal
            room={checkInRoom}
            onClose={() => setCheckInRoom(null)}
          />
        )}

        {/* Check-Out Modal */}
        {checkOutRoom && (
          <CheckOutModal
            room={checkOutRoom}
            onClose={() => setCheckOutRoom(null)}
            onGenerateBillAfterCheckout={handleAfterCheckoutGenerateBill}
          />
        )}

        {/* Automatic vs Manual Bill Choice Modal */}
        {billChoiceData && (
          <BillChoiceModal
            stay={billChoiceData.stay}
            room={billChoiceData.room}
            onClose={() => setBillChoiceData(null)}
            onConfirmBill={handleConfirmBillChoice}
          />
        )}

        {/* Invoice Generator Modal */}
        {invoiceData && (
          <InvoiceModal
            stay={invoiceData.stay}
            room={invoiceData.room}
            customBillData={invoiceData.customBillData}
            onClose={() => setInvoiceData(null)}
          />
        )}

      </div>
    </div>
  );
}

export default App;
