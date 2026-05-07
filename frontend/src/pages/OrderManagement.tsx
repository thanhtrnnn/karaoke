import { useState, useEffect } from 'react';

interface OrderItem {
  id: string;
  room: string;
  items: string;
  time: string;
  date: string;
  status: string;
  color: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '⏳ Chờ xử lý', color: 'status-cleaning' },
  PREPARING: { label: '🔄 Đang làm', color: 'tertiary' },
  SERVED: { label: '✅ Đã phục vụ', color: 'status-available' },
  CANCELLED: { label: '❌ Đã hủy', color: 'status-occupied' },
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('2026-05-05');
  const [roomFilter, setRoomFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((o: any) => {
            const st = statusMap[o.status] || { label: o.status, color: 'slate-400' };
            const itemNames = (o.items || []).map((i: any) => `${i.name || 'N/A'} x${i.quantity}`).join(', ');
            const dt = o.orderedAt ? new Date(o.orderedAt) : null;
            const time = dt ? dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
            const date = dt ? dt.toISOString().split('T')[0] : '';
            return {
              id: o.id,
              room: o.roomId || o.room?.id || 'N/A',
              items: itemNames,
              time,
              date,
              status: st.label,
              color: st.color,
            };
          });
          setOrders(mapped);
          const rooms = [...new Set(data.map((o: any) => o.roomId || o.room?.id).filter(Boolean))] as string[];
          setAvailableRooms(rooms);
        }
      } catch (e) {
        console.error('Failed to fetch orders:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o =>
    (roomFilter === 'Tất cả' || o.room === roomFilter) &&
    (statusFilter === 'Tất cả' || o.status.includes(statusFilter)) &&
    (!dateFilter || o.date === dateFilter)
  );

  const handleComplete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'SERVED' }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: '✅ Đã phục vụ', color: 'status-available' } : o));
      }
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải danh sách order...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Quản lý order</h1>
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-5 border border-slate-700/50">
        <div className="relative min-w-[200px]">
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="w-full appearance-none bg-none bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-4 pr-10 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all cursor-pointer"
          >
            <option value="Tất cả">Tất cả các phòng</option>
            {availableRooms.map(r => (
              <option key={r} value={r}>Phòng: {r}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
        </div>

        <div className="relative min-w-[200px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none bg-none bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-4 pr-10 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all cursor-pointer"
          >
            <option value="Tất cả">Mọi trạng thái</option>
            <option value="Chờ xử lý">⏳ Chờ xử lý</option>
            <option value="Đang làm">🔄 Đang làm</option>
            <option value="Đã phục vụ">✅ Đã phục vụ</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
        </div>

        <div className="relative min-w-[200px]">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all cursor-pointer"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
              <th className="py-4 px-6">Mã order</th>
              <th className="py-4 px-6">Phòng</th>
              <th className="py-4 px-6">Thời gian</th>
              <th className="py-4 px-6">Món</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {filteredOrders.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">Không có order nào phù hợp.</td></tr>
            )}
            {filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-primary-container font-medium">{o.id}</td>
                <td className="py-4 px-6 text-white">{o.room}</td>
                <td className="py-4 px-6 text-slate-400">{o.time}</td>
                <td className="py-4 px-6">{o.items}</td>
                <td className="py-4 px-6">
                  <span className={`text-${o.color}`}>{o.status}</span>
                </td>
                <td className="py-4 px-6">
                  {!o.status.includes('Đã') && (
                    <button
                      onClick={() => handleComplete(o.id)}
                      className="px-3 py-1.5 bg-status-available/10 text-status-available border border-status-available/20 rounded-lg font-label-caps hover:bg-status-available hover:text-white transition-colors"
                    >
                      ✓ Xong
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-slate-500 font-body-md">Luồng: ⏳ Chờ xử lý → 🔄 Đang làm → ✅ Đã phục vụ</p>
    </div>
  );
}
