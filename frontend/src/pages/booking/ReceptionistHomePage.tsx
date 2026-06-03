import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateTime, todayGMT7 } from '../../config/constants';

// ReceptionistHomePage — Màn hình chính module Đặt/Trả phòng cho Lễ tân.
// 4 nút điều hướng (Đặt phòng, Quản lý đặt phòng, Check-in, Check-out) + bảng booking hôm nay (GET /api/bookings).

interface TodayBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  roomId: string;
  startTime: string;
  endTime: string;
  status: string;
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Đã đặt',
  CHECKED_IN: 'Đã nhận phòng',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

function mapBooking(b: any): TodayBooking {
  return {
    id: b.id,
    customerName: b.customer?.fullName ?? 'N/A',
    customerPhone: b.customer?.phone ?? '',
    roomId: b.room?.id ?? 'N/A',
    startTime: b.startTime ?? '',
    endTime: b.endTime ?? '',
    status: b.status ?? '',
  };
}

export default function ReceptionistHomePage(): React.ReactElement {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<TodayBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const today = todayGMT7();
    const fetchBookings = async (): Promise<void> => {
      try {
        const res = await fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data: any[] = await res.json();
          const todayBookings = data
            .map(mapBooking)
            .filter((b) => b.startTime.slice(0, 10) === today);
          setBookings(todayBookings);
        }
      } catch (e) {
        console.error('Failed to fetch bookings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // UC05 đặt phòng → /search-free-room (tìm phòng trống → chọn khách → xác nhận)
  // UC06 hủy phòng  → /cancel-booking ("Quản lý đặt phòng")
  // UC07 check-in   → /check-in
  // UC08 check-out  → /checkout
  const actions: { label: string; icon: string; path: string }[] = [
    { label: 'Đặt phòng', icon: 'add_circle', path: '/search-free-room' },
    { label: 'Quản lý đặt phòng', icon: 'event_note', path: '/cancel-booking' },
    { label: 'Check-in', icon: 'login', path: '/check-in' },
    { label: 'Check-out', icon: 'logout', path: '/checkout' },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Lễ tân</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((a) => (
          <button
            key={a.path}
            onClick={() => navigate(a.path)}
            className="flex items-center gap-4 bg-surface-container rounded-xl border border-slate-700/50 p-6 hover:border-primary-container transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[32px] text-primary-container">{a.icon}</span>
            <span className="font-h2 text-white">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-surface-container-low">
          <span className="font-label-caps text-slate-400 uppercase">Đặt phòng hôm nay</span>
        </div>
        {loading ? (
          <div className="p-8 text-slate-400">Đang tải danh sách đặt phòng...</div>
        ) : (
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
                <th className="py-4 px-6">Mã đặt</th>
                <th className="py-4 px-6">Khách hàng</th>
                <th className="py-4 px-6">SĐT</th>
                <th className="py-4 px-6">Phòng</th>
                <th className="py-4 px-6">Bắt đầu</th>
                <th className="py-4 px-6">Kết thúc</th>
                <th className="py-4 px-6">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="font-body-md divide-y divide-slate-800/50">
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">Chưa có đặt phòng nào trong hôm nay.</td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-4 px-6 text-slate-200 font-medium">{b.id}</td>
                  <td className="py-4 px-6 text-slate-200">{b.customerName}</td>
                  <td className="py-4 px-6 text-slate-400">{b.customerPhone}</td>
                  <td className="py-4 px-6 text-primary-container font-medium">{b.roomId}</td>
                  <td className="py-4 px-6 text-slate-400">{b.startTime ? formatDateTime(b.startTime) : '--'}</td>
                  <td className="py-4 px-6 text-slate-400">{b.endTime ? formatDateTime(b.endTime) : '--'}</td>
                  <td className="py-4 px-6 text-slate-400">{STATUS_LABEL[b.status] ?? b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
