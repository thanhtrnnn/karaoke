import { useState } from 'react';

export default function BookingPage() {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);



  const initialRooms = [
    { id: 'P01', type: 'VIP', cap: '15 người', price: '150,000đ', status: 'Trống', color: 'status-available', canBook: true },
    { id: 'P02', type: 'Thường', cap: '10 người', price: '100,000đ', status: 'Đang dùng', color: 'status-occupied', canBook: false },
    { id: 'P03', type: 'VIP', cap: '15 người', price: '150,000đ', status: 'Đặt trước', color: 'status-cleaning', canBook: false },
    { id: 'P04', type: 'Thường', cap: '10 người', price: '100,000đ', status: 'Trống', color: 'status-available', canBook: true },
    { id: 'P05', type: 'VIP', cap: '20 người', price: '200,000đ', status: 'Trống', color: 'status-available', canBook: true },
  ];

  const filteredRooms = initialRooms.filter(r => {
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

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Đặt phòng</h1>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
        <select className="bg-surface-secondary border border-border-subtle rounded-lg pl-4 pr-10 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container min-w-[140px]">
          <option>CN1 - Quận 1</option><option>CN2 - Quận 3</option><option>CN3 - Quận 7</option>
        </select>
        <input type="date" className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container" defaultValue="2026-05-04" />
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
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Giờ bắt đầu</label><select className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container"><option>18:00</option><option>19:00</option><option>20:00</option></select></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Giờ kết thúc</label><select className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container"><option>21:00</option><option>22:00</option><option>23:00</option></select></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">SĐT khách hàng</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" placeholder="0901234567" /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Ghi chú</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" placeholder="Ghi chú..." /></div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                if (!selectedRoom) alert('Vui lòng chọn phòng trước khi đặt!');
                else alert(`Đã đặt thành công phòng ${selectedRoom.id}!`);
              }}
              className="w-full py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
            >
              Xác nhận đặt
            </button>
          </div>
        </div>
        <p className="mt-3 text-slate-400 font-body-md">Số giờ: 3h → Tổng tạm tính: <span className="text-primary-container font-semibold">450,000đ</span></p>
      </div>
    </div>
  );
}
