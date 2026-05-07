import { useState, useEffect } from 'react';

interface Booking {
  id: string;
  customer: string;
  phone: string;
  room: string;
  date: string;
  time: string;
  status: string;
  color: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'status-cleaning' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'status-available' },
  CHECKED_IN: { label: 'Đã check-in', color: 'tertiary' },
  COMPLETED: { label: 'Hoàn tất', color: 'status-available' },
  CANCELLED: { label: 'Đã hủy', color: 'status-occupied' },
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.map((b: any) => {
            const st = statusMap[b.status] || { label: b.status, color: 'slate-400' };
            const start = b.startTime ? new Date(b.startTime) : null;
            const end = b.endTime ? new Date(b.endTime) : null;
            const dateStr = start ? start.toLocaleDateString('vi-VN') : '';
            const timeStr = start && end ? `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : '';
            return {
              id: b.id,
              customer: b.customer?.fullName || 'N/A',
              phone: b.customer?.phone || '',
              room: `${b.room?.id || ''} - ${b.room?.name || ''}`,
              date: dateStr,
              time: timeStr,
              status: st.label,
              color: st.color,
            };
          }));
        }
      } catch (e) {
        console.error('Failed to fetch bookings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Đã xác nhận', color: 'status-available' } : b));
      }
    } catch (e) {
      console.error('Failed to approve booking:', e);
    }
  };

  const filteredBookings = bookings.filter(b =>
    (statusFilter === 'Tất cả' || b.status === statusFilter) &&
    (!dateFilter || b.date === new Date(dateFilter).toLocaleDateString('vi-VN'))
  );

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải danh sách đặt phòng...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6 flex-1">
      <div className="flex items-center">
        <span className="material-symbols-outlined text-[32px] text-primary-container mr-3">edit_calendar</span>
        <h1 className="font-h1 text-white">Quản lý đặt phòng</h1>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
          style={{ colorScheme: 'dark' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-secondary border border-border-subtle rounded-lg pl-4 pr-10 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container min-w-[180px] appearance-none"
        >
          <option value="Tất cả">Tất cả</option>
          <option value="Đã xác nhận">Đã xác nhận</option>
          <option value="Chờ xác nhận">Chờ xác nhận</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>
      </div>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
              <th className="py-4 px-6">Mã đặt</th>
              <th className="py-4 px-6">Khách hàng</th>
              <th className="py-4 px-6">SĐT</th>
              <th className="py-4 px-6">Phòng</th>
              <th className="py-4 px-6">Ngày</th>
              <th className="py-4 px-6">Giờ</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Không có dữ liệu đặt phòng phù hợp.
                </td>
              </tr>
            )}
            {filteredBookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-primary-container font-medium">{b.id}</td>
                <td className="py-4 px-6 text-white">{b.customer}</td>
                <td className="py-4 px-6">{b.phone}</td>
                <td className="py-4 px-6">{b.room}</td>
                <td className="py-4 px-6 text-slate-300">{b.date}</td>
                <td className="py-4 px-6 text-slate-300">{b.time}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-md font-label-caps bg-${b.color}/10 text-${b.color} border border-${b.color}/20`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex justify-end gap-2">
                  {b.status === 'Chờ xác nhận' && (
                    <button
                      onClick={() => handleApprove(b.id)}
                      className="px-3 py-1.5 bg-status-available/10 text-status-available border border-status-available/20 rounded-lg font-label-caps hover:bg-status-available hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span> Duyệt
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="px-3 py-1.5 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:text-primary-container hover:border-primary-container transition-colors font-label-caps flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span> Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedBooking(null)}
          ></div>

          <div className="bg-surface-container border border-slate-700/50 rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-fade-in">
            <div className="bg-surface-container-low px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
              <div>
                <h2 className="font-h2 text-white">Chi tiết Đặt phòng</h2>
                <p className="text-primary-container font-body-md mt-0.5">{selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 font-label-caps uppercase mb-1">Khách hàng</p>
                  <p className="text-white font-medium">{selectedBooking.customer}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-label-caps uppercase mb-1">Số điện thoại</p>
                  <p className="text-white font-medium">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-label-caps uppercase mb-1">Phòng</p>
                  <p className="text-primary-container font-medium">{selectedBooking.room}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-label-caps uppercase mb-1">Trạng thái</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold bg-${selectedBooking.color}/10 text-${selectedBooking.color}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 font-label-caps uppercase mb-1">Ngày giờ</p>
                  <p className="text-white">{selectedBooking.date}</p>
                  <p className="text-slate-400 text-sm">{selectedBooking.time}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-700/50 bg-surface-container-low flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 rounded-lg font-body-md font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
