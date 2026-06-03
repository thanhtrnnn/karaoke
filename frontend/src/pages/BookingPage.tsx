import { useState, useEffect } from 'react';
import { todayGMT7 } from '../config/constants';

interface Room {
  id: string;
  type: string;
  cap: string;
  price: string;
  status: string;
  color: string;
  canBook: boolean;
}

function mapRoom(r: any): Room {
  return {
    id: r.id,
    type: r.roomType?.nameType || r.type || 'N/A',
    cap: `${r.capacity} người`,
    price: `${Number(r.price).toLocaleString()}đ`,
    status: r.status === 'AVAILABLE' ? 'Trống' : r.status === 'OCCUPIED' ? 'Đang dùng' : r.status === 'RESERVED' ? 'Đặt trước' : 'Bảo trì',
    color: r.status === 'AVAILABLE' ? 'status-available' : r.status === 'OCCUPIED' ? 'status-occupied' : 'status-cleaning',
    canBook: r.status === 'AVAILABLE',
  };
}

export default function BookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingDate, setBookingDate] = useState(todayGMT7());
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');
  const [customerPhone, setCustomerPhone] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [booking, setBooking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCustomer, setPendingCustomer] = useState<any>(null);
  // UC05 — Tìm phòng trống theo giờ (SearchFreeRoomForm)
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [branchId, setBranchId] = useState('');
  const [searchingFree, setSearchingFree] = useState(false);
  const [freeSearchDone, setFreeSearchDone] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const fetchRooms = async () => {
      try {
        const [roomsRes, branchesRes] = await Promise.all([
          fetch('/api/rooms', { headers }),
          fetch('/api/branches', { headers }),
        ]);
        if (roomsRes.ok) {
          const data = await roomsRes.json();
          setRooms(data.map(mapRoom));
        }
        if (branchesRes.ok) {
          const bdata = await branchesRes.json();
          setBranches(bdata.map((b: any) => ({ id: b.id, name: b.name })));
        }
      } catch (e) {
        console.error('Failed to fetch rooms:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // UC05 — SearchFreeRoomForm.btnSearchClick(): GET /api/bookings/search-free
  const handleSearchFree = async () => {
    setSearchingFree(true);
    setSelectedRoom(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (branchId) params.set('branchId', branchId);
      if (bookingDate && startTime) params.set('startTime', `${bookingDate}T${startTime}:00`);
      if (bookingDate && endTime) params.set('endTime', `${bookingDate}T${endTime}:00`);
      const res = await fetch(`/api/bookings/search-free?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.map(mapRoom));
        setFreeSearchDone(true);
      } else {
        alert('Không thể tìm phòng trống. Vui lòng thử lại.');
      }
    } catch (e) {
      console.error('Failed to search free rooms:', e);
      alert('Lỗi kết nối server.');
    } finally {
      setSearchingFree(false);
    }
  };

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
    if (!selectedRoom) { alert('Vui lòng chọn phòng trước khi đặt!'); return; }
    if (!customerPhone) { alert('Vui lòng nhập SĐT khách hàng!'); return; }
    setBooking(true);
    try {
      const token = localStorage.getItem('token');
      const custRes = await fetch('/api/clients', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!custRes.ok) { alert('Không thể tải danh sách khách hàng!'); setBooking(false); return; }
      const customers = await custRes.json();
      const customer = customers.find((c: any) => c.phone === customerPhone);
      if (!customer) { alert('Không tìm thấy khách hàng với SĐT này!'); setBooking(false); return; }
      // UC05: Hiện ConfirmBookingModal trước khi tạo booking
      setPendingCustomer(customer);
      setBooking(false);
      setShowConfirm(true);
    } catch (e) { console.error(e); alert('Lỗi kết nối server.'); setBooking(false); }
  };

  const confirmBooking = async () => {
    if (!selectedRoom || !pendingCustomer) return;
    setBooking(true);
    setShowConfirm(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: pendingCustomer.id,
          roomId: selectedRoom.id,
          startTime: `${bookingDate}T${startTime}:00`,
          endTime: `${bookingDate}T${endTime}:00`,
          guestCount: parseInt(guestCount) || 2,
        }),
      });
      if (res.ok) {
        alert(`Đặt phòng ${selectedRoom.id} thành công!`);
        setSelectedRoom(null); setCustomerPhone(''); setGuestCount(''); setPendingCustomer(null);
        const roomsRes = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
        if (roomsRes.ok) {
          const data = await roomsRes.json();
          setRooms(data.map(mapRoom));
          setFreeSearchDone(false);
        }
      } else { alert('Đặt phòng thất bại! Kiểm tra thông tin và thử lại.'); }
    } catch (e) { console.error(e); alert('Lỗi kết nối server.'); } finally { setBooking(false); }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Đặt phòng</h1>
      {/* SearchFreeRoomForm (UC05) — Tìm phòng trống theo giờ */}
      <div className="flex flex-wrap items-end gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
        <div>
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Ngày</label>
          <input type="date" className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
        </div>
        <div>
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Từ giờ</label>
          <select value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container">
            {['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Đến giờ</label>
          <select value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container">
            {['11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Chi nhánh</label>
          <select value={branchId} onChange={e => setBranchId(e.target.value)} className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container min-w-[160px]">
            <option value="">Tất cả</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <button
          onClick={handleSearchFree}
          disabled={searchingFree}
          className="px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          {searchingFree ? 'Đang tìm...' : 'Tìm phòng trống'}
        </button>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
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
        {freeSearchDone && (
          <span className="font-body-md text-status-available ml-auto">Kết quả: {filteredRooms.length} phòng trống</span>
        )}
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
                  {freeSearchDone ? 'Không có phòng trống trong khung giờ này.' : 'Không có phòng nào phù hợp với bộ lọc.'}
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

      {/* UC05 ConfirmBookingModal */}
      {showConfirm && selectedRoom && pendingCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm shadow-2xl border border-slate-600">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D4AF37]">event_available</span>
              Xác nhận đặt phòng
            </h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Phòng</span>
                <span className="text-white font-semibold">{selectedRoom.id} ({selectedRoom.type})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Khách hàng</span>
                <span className="text-white">{pendingCustomer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SĐT</span>
                <span className="text-white">{pendingCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian</span>
                <span className="text-white">{bookingDate} | {startTime} — {endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số người</span>
                <span className="text-white">{guestCount || 2} người</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Đơn giá</span>
                <span className="text-[#D4AF37] font-semibold">{selectedRoom.price}/giờ</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowConfirm(false); setPendingCustomer(null); }}
                className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700">
                Huỷ
              </button>
              <button onClick={confirmBooking} disabled={booking}
                className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold hover:bg-yellow-400 disabled:opacity-50">
                {booking ? 'Đang đặt...' : 'Đặt phòng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
