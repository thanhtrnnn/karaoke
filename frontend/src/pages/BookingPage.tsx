import { useState, useEffect } from 'react';

interface Room {
  id: string;
  type: string;
  cap: string;
  price: string;
  status: string;
  color: string;
  canBook: boolean;
}

export default function BookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-05-04');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');
  const [customerPhone, setCustomerPhone] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/rooms', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRooms(data.map((r: any) => ({
            id: r.id,
            type: r.type,
            cap: `${r.capacity} người`,
            price: `${Number(r.hourlyPrice).toLocaleString()}đ`,
            status: r.status === 'AVAILABLE' ? 'Trống' : r.status === 'OCCUPIED' ? 'Đang dùng' : r.status === 'RESERVED' ? 'Đặt trước' : 'Bảo trì',
            color: r.status === 'AVAILABLE' ? 'status-available' : r.status === 'OCCUPIED' ? 'status-occupied' : 'status-cleaning',
            canBook: r.status === 'AVAILABLE',
          })));
        }
      } catch (e) {
        console.error('Failed to fetch rooms:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(r => {
    const matchType = activeFilter === 'Tất cả' || r.type === activeFilter;
    let matchCap = true;
    if (capacityFilter) {
       const roomCap = parseInt(r.cap.replace(/\D/g, ''), 10);
       const reqCap = parseInt(capacityFilter, 10);
       if (!isNaN(reqCap) && !isNaN(roomCap)) {
         matchCap = roomCap >= reqCap;
       }
    }
    return matchType && matchCap;
  });

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải danh sách phòng...</div>;
  }

  const handleBooking = async () => {
    if (!selectedRoom) {
      alert('Vui lòng chọn phòng trước khi đặt!');
      return;
    }
    if (!customerPhone) {
      alert('Vui lòng nhập SĐT khách hàng!');
      return;
    }
    setBooking(true);
    try {
      const token = localStorage.getItem('token');
      // Look up customer by phone
      const custRes = await fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } });
      const customers = await custRes.json();
      const customer = customers.find((c: any) => c.phone === customerPhone);
      if (!customer) {
        alert('Không tìm thấy khách hàng với SĐT này!');
        setBooking(false);
        return;
      }
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          roomId: selectedRoom.id,
          startTime: `${bookingDate}T${startTime}:00`,
          endTime: `${bookingDate}T${endTime}:00`,
          guestCount: parseInt(guestCount) || 2,
        }),
      });
      if (res.ok) {
        alert(`Đã đặt thành công phòng ${selectedRoom.id}!`);
        setSelectedRoom(null);
        setCustomerPhone('');
        setGuestCount('');
        // Refresh rooms
        const roomsRes = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
        if (roomsRes.ok) {
          const data = await roomsRes.json();
          setRooms(data.map((r: any) => ({
            id: r.id,
            type: r.type,
            cap: `${r.capacity} người`,
            price: `${Number(r.hourlyPrice).toLocaleString()}đ`,
            status: r.status === 'AVAILABLE' ? 'Trống' : r.status === 'OCCUPIED' ? 'Đang dùng' : r.status === 'RESERVED' ? 'Đặt trước' : 'Bảo trì',
            color: r.status === 'AVAILABLE' ? 'status-available' : r.status === 'OCCUPIED' ? 'status-occupied' : 'status-cleaning',
            canBook: r.status === 'AVAILABLE',
          })));
        }
      } else {
        alert('Đặt phòng thất bại!');
      }
    } catch (e) {
      console.error('Failed to create booking:', e);
      alert('Lỗi kết nối server.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Đặt phòng</h1>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
        <input type="date" className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
        <div className="flex gap-2">
          {['Tất cả', 'VIP', 'Thường'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg font-body-md transition-colors ${activeFilter === f ? 'bg-primary-container/10 border border-primary-container text-primary-container font-medium' : 'bg-transparent border border-slate-700/50 text-slate-400 hover:border-primary-container hover:text-primary-container'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Số người"
          className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container w-32"
          value={capacityFilter}
          onChange={(e) => setCapacityFilter(e.target.value)}
          min="1"
        />
      </div>
      {/* Room Table */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
            <th className="py-4 px-6">Phòng</th><th className="py-4 px-6">Loại</th><th className="py-4 px-6">Sức chứa</th><th className="py-4 px-6">Giá/giờ</th><th className="py-4 px-6">Trạng thái</th><th className="py-4 px-6">Đặt</th>
          </tr></thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {filteredRooms.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Không có phòng nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
            {filteredRooms.map((r) => (
              <tr key={r.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-slate-200 font-medium">{r.id}</td>
                <td className="py-4 px-6 text-slate-400">{r.type}</td>
                <td className="py-4 px-6 text-slate-400">{r.cap}</td>
                <td className="py-4 px-6 text-slate-400">{r.price}</td>
                <td className="py-4 px-6"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-${r.color}/10 border border-${r.color}/20 text-${r.color} font-label-caps`}><span className={`w-1.5 h-1.5 rounded-full bg-${r.color}`}></span>{r.status}</span></td>
                <td className="py-4 px-6">
                  {r.canBook ? (
                    <button
                      onClick={() => setSelectedRoom(r)}
                      className={`px-4 py-2 rounded-lg font-label-caps transition-colors ${selectedRoom?.id === r.id ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary-container hover:bg-primary'}`}
                    >
                      {selectedRoom?.id === r.id ? 'Đang chọn' : 'Đặt'}
                    </button>
                  ) : (
                    <span className="text-slate-600">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Booking Form */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Form đặt phòng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-label-caps text-slate-400 uppercase block mb-2">Phòng đã chọn</label>
            <input
              className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-primary-container font-body-md"
              readOnly
              value={selectedRoom ? `${selectedRoom.id} - ${selectedRoom.type} (${selectedRoom.price}/giờ)` : 'Vui lòng chọn phòng...'}
            />
          </div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Giờ bắt đầu</label><select value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container"><option>18:00</option><option>19:00</option><option>20:00</option></select></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Giờ kết thúc</label><select value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container"><option>21:00</option><option>22:00</option><option>23:00</option></select></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">SĐT khách hàng</label><input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" placeholder="0901234567" /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Số người</label><input value={guestCount} onChange={e => setGuestCount(e.target.value)} type="number" className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" placeholder="8" /></div>
          <div className="flex items-end">
            <button
              onClick={handleBooking}
              disabled={booking}
              className="w-full py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors disabled:opacity-50"
            >
              {booking ? 'Đang xử lý...' : 'Xác nhận đặt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
