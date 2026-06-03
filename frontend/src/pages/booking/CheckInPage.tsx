import { useState, useEffect } from 'react';
import { formatDateTime } from '../../config/constants';

// CheckInPage — Màn hình module Trả/Nhận phòng (UC07 — Check-in)
// Bảng booking "Chờ nhận" (GET /api/bookings/pending) + nút "Xác nhận check-in"
// gọi PUT /api/bookings/{id}/status với body { status: "CHECKED_IN" }.

interface PendingBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  roomId: string;
  startTime: string;
  endTime: string;
  guestCount: number;
}

function mapBooking(b: any): PendingBooking {
  return {
    id: b.id,
    customerName: b.customer?.fullName ?? 'N/A',
    customerPhone: b.customer?.phone ?? '',
    roomId: b.room?.id ?? 'N/A',
    startTime: b.startTime ?? '',
    endTime: b.endTime ?? '',
    guestCount: Number(b.guestCount ?? 0),
  };
}

export default function CheckInPage(): React.ReactElement {
  const [bookings, setBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const fetchPending = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings/pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data: any[] = await res.json();
        setBookings(data.map(mapBooking));
      }
    } catch (e) {
      console.error('Failed to fetch pending bookings:', e);
    }
  };

  useEffect(() => {
    fetchPending().finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async (id: string): Promise<void> => {
    setCheckingInId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CHECKED_IN' }),
      });
      if (res.ok) {
        alert(`Check-in thành công cho đặt phòng ${id}!`);
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert('Check-in thất bại! Vui lòng thử lại.');
      }
    } catch (e) {
      console.error('Failed to check in:', e);
      alert('Lỗi kết nối server.');
    } finally {
      setCheckingInId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải danh sách chờ nhận phòng...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Nhận phòng (Check-in)</h1>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-surface-container-low">
          <span className="font-label-caps text-slate-400 uppercase">Danh sách đặt phòng chờ nhận</span>
        </div>
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
              <th className="py-4 px-6">Mã đặt</th>
              <th className="py-4 px-6">Khách hàng</th>
              <th className="py-4 px-6">SĐT</th>
              <th className="py-4 px-6">Phòng</th>
              <th className="py-4 px-6">Bắt đầu</th>
              <th className="py-4 px-6">Kết thúc</th>
              <th className="py-4 px-6">Số người</th>
              <th className="py-4 px-6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">Không có đặt phòng nào đang chờ nhận.</td>
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
                <td className="py-4 px-6 text-slate-400">{b.guestCount}</td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleCheckIn(b.id)}
                    disabled={checkingInId === b.id}
                    className="px-4 py-2 rounded-lg font-label-caps bg-primary-container text-on-primary-container hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    {checkingInId === b.id ? 'Đang xử lý...' : 'Xác nhận check-in'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
