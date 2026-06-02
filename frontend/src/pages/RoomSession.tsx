import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface RoomData {
  id: string;
  name: string;
  type: string;
  capacity: number;
  hourlyPrice: number;
  status: string;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  roomId: string;
  roomName: string;
  orderedAt: string;
  status: string;
  items: OrderItem[];
}

const statusLabel: Record<string, string> = {
  AVAILABLE: 'Trống',
  OCCUPIED: 'Đang sử dụng',
  RESERVED: 'Đã đặt',
  MAINTENANCE: 'Bảo trì',
};

export default function RoomSession() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<{ id: string; endTime: string } | null>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [newEndTime, setNewEndTime] = useState('');
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const [roomRes, ordersRes, bookingsRes] = await Promise.all([
          fetch(`/api/rooms/${roomId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        if (roomRes.ok) {
          const data = await roomRes.json();
          setRoom({
            id: data.id,
            name: data.name,
            type: data.type,
            capacity: data.capacity,
            hourlyPrice: data.hourlyPrice,
            status: data.status,
          });
        }
        if (ordersRes.ok) {
          const allOrders: Order[] = await ordersRes.json();
          setOrders(allOrders.filter(o => o.roomId === roomId));
        }
        if (bookingsRes.ok) {
          const allBookings = await bookingsRes.json();
          const active = allBookings.find((b: any) => b.room?.id === roomId && (b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'));
          if (active) setActiveBooking({ id: active.id, endTime: active.endTime });
        }
      } catch (e) {
        console.error('Failed to fetch room session data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  // Collect all items across all orders for this room
  const allItems = orders.flatMap(o =>
    o.items.map(item => ({
      orderId: o.id,
      productId: item.productId,
      name: item.name,
      qty: item.quantity,
      unitPrice: item.unitPrice,
      total: item.unitPrice * item.quantity,
    }))
  );

  const serviceTotal = allItems.reduce((sum, item) => sum + item.total, 0);
  const roomTotal = room?.hourlyPrice ? room.hourlyPrice * 2 : 0; // Estimate 2 hours
  const grandTotal = roomTotal + serviceTotal;

  const handleExtend = async () => {
    if (!activeBooking || !newEndTime) return;
    setExtending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${activeBooking.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ endTime: newEndTime, guestCount: 0 }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveBooking({ id: updated.id, endTime: updated.endTime });
        alert('Gia hạn giờ thành công!');
        setShowExtendModal(false);
      } else {
        alert('Gia hạn thất bại.');
      }
    } catch (e) {
      console.error('Failed to extend booking:', e);
      alert('Lỗi khi gia hạn.');
    } finally {
      setExtending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải thông tin phòng...</div>;
  }

  if (!room) {
    return <div className="p-8 text-slate-400">Không tìm thấy phòng.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-room-number text-room-number text-white">{room.id} - {room.name}</h1>
            <span className="px-3 py-1 bg-status-occupied/20 text-status-occupied rounded-full font-label-caps border border-status-occupied/30 ml-4">
              {statusLabel[room.status] || room.status}
            </span>
          </div>
          <p className="font-body-lg text-text-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">meeting_room</span>
            Loại: <span className="text-white font-medium">{room.type}</span>
            <span className="mx-2 text-slate-600">•</span>
            <span className="material-symbols-outlined text-sm">group</span>
            Sức chứa: <span className="text-white font-medium">{room.capacity} người</span>
            <span className="mx-2 text-slate-600">•</span>
            <span className="material-symbols-outlined text-sm">payments</span>
            <span className="text-white font-medium">{room.hourlyPrice.toLocaleString()}đ/giờ</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/rooms')} className="px-6 py-3 rounded-lg bg-surface-secondary border border-border-subtle text-text-primary hover:border-primary-container transition-colors font-label-caps flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>Đổi phòng
          </button>
          <button onClick={() => {
            if (!activeBooking) { alert('Không tìm thấy đặt phòng đang hoạt động cho phòng này.'); return; }
            setNewEndTime(activeBooking.endTime ? activeBooking.endTime.slice(0, 16) : '');
            setShowExtendModal(true);
          }} className="px-6 py-3 rounded-lg bg-surface-secondary border border-border-subtle text-text-primary hover:border-primary-container transition-colors font-label-caps flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">update</span>Gia hạn giờ
          </button>
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Table */}
        <div className="lg:col-span-2 bg-surface-primary border border-border-subtle rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-h2 text-white">Dịch vụ đã gọi ({orders.length} order)</h2>
            <button onClick={() => navigate(`/orders?room=${roomId}`)} className="px-4 py-2 rounded-lg bg-primary-container/10 text-primary-container border border-primary-container/30 hover:bg-primary-container hover:text-on-primary transition-colors font-label-caps flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>Gọi thêm món
            </button>
          </div>
          {allItems.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Chưa có dịch vụ nào được gọi cho phòng này.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-label-caps">
                    <th className="py-4 px-4 font-semibold w-1/2">Tên món</th>
                    <th className="py-4 px-4 font-semibold text-center w-1/6">SL</th>
                    <th className="py-4 px-4 font-semibold text-right w-1/6">Đơn giá</th>
                    <th className="py-4 px-4 font-semibold text-right w-1/6">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="font-body-md divide-y divide-slate-800/50">
                  {allItems.map((item, i) => (
                    <tr key={`${item.orderId}-${item.productId}-${i}`} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 px-4 text-white">{item.name}</td>
                      <td className="py-4 px-4 text-center">{item.qty}</td>
                      <td className="py-4 px-4 text-right text-text-secondary">{item.unitPrice.toLocaleString()}đ</td>
                      <td className="py-4 px-4 text-right text-white font-medium">{item.total.toLocaleString()}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Summary Panel */}
        <div className="bg-surface-primary border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col h-full">
          <h2 className="font-h2 text-white mb-6 border-b border-border-subtle pb-4">Tóm tắt chi phí</h2>
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex justify-between items-center font-body-md">
              <span className="text-text-secondary">Tiền phòng (tạm tính)</span>
              <span className="text-white font-medium">{roomTotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center font-body-md">
              <span className="text-text-secondary">Tiền dịch vụ</span>
              <span className="text-white font-medium">{serviceTotal.toLocaleString()}đ</span>
            </div>
            <div className="pt-4 border-t border-border-subtle flex justify-between items-end mt-4">
              <span className="font-label-caps text-text-secondary uppercase">Tổng cộng</span>
              <span className="text-[32px] font-bold text-primary-container leading-none">{grandTotal.toLocaleString()}đ</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="w-full py-4 rounded-xl bg-primary-container text-on-primary font-h2 text-[20px] font-bold hover:bg-primary transition-colors uppercase tracking-wider shadow-md shadow-primary-container/20">
            Thanh toán
          </button>
        </div>
      </div>

      {/* Extend Time Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowExtendModal(false)}>
          <div className="bg-surface-container border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-h2 text-white mb-4">Gia hạn giờ</h2>
            <p className="text-slate-400 font-body-md mb-4">
              Đặt phòng: <span className="text-primary-container font-medium">{activeBooking?.id}</span>
            </p>
            <div className="mb-4">
              <label className="font-label-caps text-slate-400 uppercase block mb-2">Giờ kết thúc mới</label>
              <input
                type="datetime-local"
                value={newEndTime}
                onChange={e => setNewEndTime(e.target.value)}
                className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-white font-body-md focus:outline-none focus:border-primary-container"
                style={{ colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' }}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleExtend}
                disabled={extending || !newEndTime}
                className="flex-1 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {extending ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 py-3 bg-transparent border border-slate-700 text-slate-400 rounded-lg font-body-md hover:border-status-occupied hover:text-status-occupied transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
