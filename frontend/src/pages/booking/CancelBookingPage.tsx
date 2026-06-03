import { useState, useEffect } from 'react';
import { formatDateTime } from '../../config/constants';

// CancelBookingPage — Màn hình module Đặt phòng (UC06 — Hủy đặt phòng)
// Ô tìm (tên/SĐT/mã) lọc trên GET /api/bookings + nút "Hủy" gọi PUT /api/bookings/{id}/cancel.

interface BookingRow {
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

function mapBooking(b: any): BookingRow {
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

export default function CancelBookingPage(): React.ReactElement {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data: any[] = await res.json();
        setBookings(data.map(mapBooking));
      }
    } catch (e) {
      console.error('Failed to fetch bookings:', e);
    }
  };

  useEffect(() => {
    fetchBookings().finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string): Promise<void> => {
    if (!window.confirm(`Bạn có chắc muốn hủy đặt phòng ${id}?`)) return;
    setCancellingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const updated: any = await res.json();
        const mapped = mapBooking(updated);
        alert(`Đã hủy đặt phòng ${id}.`);
        setBookings((prev) => prev.map((b) => (b.id === id ? mapped : b)));
      } else {
        alert('Hủy đặt phòng thất bại! Vui lòng thử lại.');
      }
    } catch (e) {
      console.error('Failed to cancel booking:', e);
      alert('Lỗi kết nối server.');
    } finally {
      setCancellingId(null);
    }
  };

  const kw = keyword.trim().toLowerCase();
  const filtered = bookings.filter((b) => {
    if (!kw) return true;
    return (
      b.id.toLowerCase().includes(kw) ||
      b.customerName.toLowerCase().includes(kw) ||
      b.customerPhone.toLowerCase().includes(kw)
    );
  });

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải danh sách đặt phòng...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Hủy đặt phòng</h1>
      <div className="flex flex-wrap items-end gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
        <div className="flex-1 min-w-[240px]">
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Tìm theo tên / SĐT / mã đặt</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập tên, số điện thoại hoặc mã đặt..."
            className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
          />
        </div>
        <span className="font-body-md text-slate-400 ml-auto">{filtered.length} kết quả</span>
      </div>

      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
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
              <th className="py-4 px-6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">Không tìm thấy đặt phòng phù hợp.</td>
              </tr>
            )}
            {filtered.map((b) => {
              const canCancel = b.status === 'CONFIRMED' || b.status === 'CHECKED_IN';
              return (
                <tr key={b.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-4 px-6 text-slate-200 font-medium">{b.id}</td>
                  <td className="py-4 px-6 text-slate-200">{b.customerName}</td>
                  <td className="py-4 px-6 text-slate-400">{b.customerPhone}</td>
                  <td className="py-4 px-6 text-primary-container font-medium">{b.roomId}</td>
                  <td className="py-4 px-6 text-slate-400">{b.startTime ? formatDateTime(b.startTime) : '--'}</td>
                  <td className="py-4 px-6 text-slate-400">{b.endTime ? formatDateTime(b.endTime) : '--'}</td>
                  <td className="py-4 px-6 text-slate-400">{STATUS_LABEL[b.status] ?? b.status}</td>
                  <td className="py-4 px-6">
                    {canCancel ? (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="px-4 py-2 rounded-lg font-label-caps bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === b.id ? 'Đang hủy...' : 'Hủy'}
                      </button>
                    ) : (
                      <span className="text-slate-600">--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
