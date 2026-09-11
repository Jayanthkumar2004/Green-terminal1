import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { RoomCell } from './RoomCell';
import { SuiteRoomCell } from './SuiteRoomCell';
import { Layers } from 'lucide-react';

export const RoomBoard = ({ onSelectRoom }) => {
  const { rooms } = useHotel();

  const normalRooms = rooms.filter(r => r.room_type !== 'SUITE');
  const suiteRooms = rooms.filter(r => r.room_type === 'SUITE');

  const groupRoomsByFloor = (roomList) => {
    const floorsMap = {};

    const sorted = [...roomList].sort((a, b) => {
      const numA = parseInt(a.room_number.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.room_number.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    sorted.forEach(room => {
      const cleanNum = room.room_number.trim();
      let floorKey = 'Floor 1';

      if (cleanNum.length === 3) {
        floorKey = `Floor ${cleanNum[0]}`;
      } else if (cleanNum.length === 4) {
        floorKey = `Floor ${cleanNum[0]}`;
      } else if (cleanNum.length <= 2) {
        floorKey = 'Ground Floor';
      } else {
        floorKey = `Floor ${cleanNum.slice(0, cleanNum.length - 2)}`;
      }

      if (!floorsMap[floorKey]) {
        floorsMap[floorKey] = [];
      }
      floorsMap[floorKey].push(room);
    });

    return floorsMap;
  };

  const groupedFloors = groupRoomsByFloor(normalRooms);

  return (
    <div className="clay-card p-3 md:p-4 border border-slate-300 dark:border-slate-800">
      {/* Board Header & Color Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-none">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ROOM STATUS BOARD
          </h2>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Physical 3D clay chart view • Click cell for operations
          </p>
        </div>

        {/* Deep Color Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-md shadow-sm">
            <div className="w-2.5 h-2.5 bg-white rounded-xs"></div>
            <span>Available (Green)</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-md shadow-sm">
            <div className="w-2.5 h-2.5 bg-white rounded-xs"></div>
            <span>Checked-In (Blue)</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white rounded-md shadow-sm">
            <div className="w-2.5 h-2.5 bg-white rounded-xs"></div>
            <span>Booked (Red)</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-slate-950 rounded-md shadow-sm">
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-xs"></div>
            <span>Yet to Clean (Yellow)</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-600 text-white rounded-md shadow-sm">
            <div className="w-2.5 h-2.5 bg-white rounded-xs"></div>
            <span>Maintenance (Orange)</span>
          </div>
        </div>
      </div>

      {/* Main Floor-Wise Room Grid */}
      <div className="space-y-2">
        {Object.keys(groupedFloors).length === 0 ? (
          <div className="text-center py-6 text-slate-500 font-semibold text-xs">
            No normal rooms found. Use Admin tab to add rooms.
          </div>
        ) : (
          Object.entries(groupedFloors).map(([floorName, floorRooms]) => (
            <div key={floorName} className="space-y-0.5">
              <div className="text-[9px] font-black tracking-widest text-slate-600 dark:text-slate-300 uppercase py-0.5 px-1 bg-slate-200/70 dark:bg-slate-800 rounded">
                {floorName} ({floorRooms.length} Rooms)
              </div>
              <div className="room-grid-7 shadow-2xs">
                {floorRooms.map(room => (
                  <RoomCell
                    key={room.id}
                    room={room}
                    onSelectRoom={onSelectRoom}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Separate Suite Section at Bottom */}
      {suiteRooms.length > 0 && (
        <div className="mt-2 pt-2 border-t-2 border-slate-300 dark:border-slate-800">
          <div className="text-[9px] font-black tracking-widest text-emerald-800 dark:text-emerald-400 uppercase mb-1">
            SUITE ROOM SECTION
          </div>
          {suiteRooms.map(suite => (
            <SuiteRoomCell
              key={suite.id}
              room={suite}
              onSelectRoom={onSelectRoom}
            />
          ))}
        </div>
      )}
    </div>
  );
};
