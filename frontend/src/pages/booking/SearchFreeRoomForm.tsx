import { useState, useEffect } from 'react';
import { todayGMT7 } from '../../config/constants';

// SearchFreeRoomForm — Màn hình con của module Đặt phòng (UC05)
// Chọn ngày/giờ + chi nhánh, nút "Tìm" gọi GET /api/bookings/search-free → bảng phòng trống.

interface Branch {
  id: string;
  name: string;
}

interface FreeRoom {
  id: string;
  type: string;
  cap: string;
  price: string;
}

interface SearchFreeRoomFormProps {
  onPickRoom?: (room: FreeRoom, branchId: string, bookingDate: string, startTime: string, endTime: string) => void;
}

const START_HOURS: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const END_HOURS: string[] = ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

function mapFreeRoom(r: any): FreeRoom {
  return {
    id: r.id,
    type: r.roomType?.nameType || r.type || 'N/A',
    cap: `${r.capacity ?? 0} người`,
    price: `${Number(r.price ?? 0).toLocaleString()}đ`,
  };
}

export default function SearchFreeRoomForm(props: SearchFreeRoomFormProps): React.ReactElement {
  const { onPickRoom } = props;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(todayGMT7());
  const [startTime, setStartTime] = useState<string>('18:00');
  const [endTime, setEndTime] = useState<string>('21:00');
  const [rooms, setRooms] = useState<FreeRoom[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loadBranches = async (): Promise<void> => {
      try {
        const res = await fetch('/api/branches', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data: any[] = await res.json();
          setBranches(data.map((b: any): Branch => ({ id: b.id, name: b.name })));
        }
      } catch (e) {
        console.error('Failed to fetch branches:', e);
      }
    };
    loadBranches();
  }, []);

  const handleSearch = async (): Promise<void> => {
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (branchId) params.set('branchId', branchId);
      params.set('startTime', `${bookingDate}T${startTime}:00`);
      params.set('endTime', `${bookingDate}T${endTime}:00`);
      const res = await fetch(`/api/bookings/search-free?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data: any[] = await res.json();
        setRooms(data.map(mapFreeRoom));
        setSearched(true);
      } else {
        alert('Không thể tìm phòng trống. Vui lòng thử lại.');
      }
    } catch (e) {
      console.error('Failed to search free rooms:', e);
      alert('Lỗi kết nối server.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
        <div>
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Ngày</label>
          <input
            type="date"
            className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
        </div>
        <div>
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Từ giờ</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
          >
            {START_HOURS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Đến giờ</label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
          >
            {END_HOURS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Chi nhánh</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container min-w-[160px]"
          >
            <option value="">Tất cả</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          {searching ? 'Đang tìm...' : 'Tìm phòng trống'}
        </button>
        {searched && (
          <span className="font-body-md text-status-available ml-auto">Kết quả: {rooms.length} phòng trống</span>
        )}
      </div>

      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
              <th className="py-4 px-6">Phòng</th>
              <th className="py-4 px-6">Loại</th>
              <th className="py-4 px-6">Sức chứa</th>
              <th className="py-4 px-6">Giá/giờ</th>
              {onPickRoom && <th className="py-4 px-6">Chọn</th>}
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {rooms.length === 0 && (
              <tr>
                <td colSpan={onPickRoom ? 5 : 4} className="py-8 text-center text-slate-500">
                  {searched ? 'Không có phòng trống trong khung giờ này.' : 'Nhấn "Tìm phòng trống" để hiển thị kết quả.'}
                </td>
              </tr>
            )}
            {rooms.map((r) => (
              <tr key={r.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-slate-200 font-medium">{r.id}</td>
                <td className="py-4 px-6 text-slate-400">{r.type}</td>
                <td className="py-4 px-6 text-slate-400">{r.cap}</td>
                <td className="py-4 px-6 text-slate-400">{r.price}</td>
                {onPickRoom && (
                  <td className="py-4 px-6">
                    <button
                      onClick={() => onPickRoom(r, branchId, bookingDate, startTime, endTime)}
                      className="px-4 py-2 rounded-lg font-label-caps bg-primary-container text-on-primary-container hover:bg-primary transition-colors"
                    >
                      Chọn
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
