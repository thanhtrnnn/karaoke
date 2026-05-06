import { useState, useEffect, useMemo } from 'react';
import { mockCustomers } from '../data/mockData';

export default function ReceptionDashboard() {
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/rooms', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const mappedRooms = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            status: r.status === 'AVAILABLE' ? 'available' : r.status === 'OCCUPIED' ? 'occupied' : 'cleaning',
            time: r.status === 'OCCUPIED' ? '01:23:45' : '',
            customer: null,
            guests: r.capacity || 2
          }));
          setRooms(mappedRooms);
        } else if (res.status === 403 || res.status === 401) {
          // Fallback to mock data if not authenticated for demo purposes
          generateMockRooms();
        }
      } catch (e) {
        generateMockRooms();
      }
    };

    const generateMockRooms = () => {
      const list = [];
      let occupiedCount = 0;
      let cleaningCount = 0;
      for (let i = 1; i <= 24; i++) {
        let status = 'available';
        if (occupiedCount < 8) { status = 'occupied'; occupiedCount++; }
        else if (cleaningCount < 4) { status = 'cleaning'; cleaningCount++; }
        
        const isVip = i % 5 === 0;
        list.push({
          id: `R${i.toString().padStart(3, '0')}`,
          name: isVip ? `VIP ${i}` : `Phòng 1${i.toString().padStart(2, '0')}`,
          type: isVip ? 'VIP' : 'Standard',
          status: status,
          time: status === 'occupied' ? `0${(i % 3) + 1}:${(i * 7) % 60}:${(i * 13) % 60}` : '',
          customer: status === 'occupied' ? mockCustomers[i % mockCustomers.length] : null,
          guests: (i % 8) + 2
        });
      }
      setRooms(list);
    };

    fetchRooms();
  }, []);

  const counts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length
  };

  const getBtnClass = (val: string, baseClass: string, activeClass: string, hoverClass: string) => {
    return filter === val 
      ? `${baseClass} ${activeClass}` 
      : `${baseClass} border-slate-700/50 ${hoverClass}`;
  };

  const filteredRooms = rooms
    .filter(r => filter === 'all' || r.status === filter)
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

  return (
    <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Filters & Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setFilter('all')}
            className={getBtnClass('all', 'px-4 py-2 rounded-lg font-body-md transition-colors border', 'bg-primary-container/10 border-primary-container text-primary-container font-medium', 'hover:border-slate-500 text-slate-400')}
          >
            Tất cả ({counts.all})
          </button>
          <button 
            onClick={() => setFilter('available')}
            className={getBtnClass('available', 'px-4 py-2 rounded-lg font-body-md transition-colors border flex items-center gap-2', 'bg-status-available/10 border-status-available text-status-available font-medium', 'hover:border-status-available hover:text-status-available text-slate-400')}
          >
            <span className="w-2 h-2 rounded-full bg-status-available"></span>
            Trống ({counts.available})
          </button>
          <button 
            onClick={() => setFilter('occupied')}
            className={getBtnClass('occupied', 'px-4 py-2 rounded-lg font-body-md transition-colors border flex items-center gap-2', 'bg-status-occupied/10 border-status-occupied text-status-occupied font-medium', 'hover:border-status-occupied hover:text-status-occupied text-slate-400')}
          >
            <span className="w-2 h-2 rounded-full bg-status-occupied animate-pulse"></span>
            Đang hát ({counts.occupied})
          </button>
          <button 
            onClick={() => setFilter('cleaning')}
            className={getBtnClass('cleaning', 'px-4 py-2 rounded-lg font-body-md transition-colors border flex items-center gap-2', 'bg-status-cleaning/10 border-status-cleaning text-status-cleaning font-medium', 'hover:border-status-cleaning hover:text-status-cleaning text-slate-400')}
          >
            <span className="w-2 h-2 rounded-full bg-status-cleaning"></span>
            Chờ dọn ({counts.cleaning})
          </button>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
            <span className="font-body-md">Sắp xếp {sortOrder === 'asc' ? '(Tăng)' : '(Giảm)'}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary-fixed-dim transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Khách mới
          </button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="flex flex-wrap gap-4 [&>*]:w-full sm:[&>*]:w-[calc(50%-8px)] lg:[&>*]:w-[calc(33.333%-11px)] xl:[&>*]:w-[calc(25%-12px)]">
        {filteredRooms.map(room => (
          <div key={room.id} className={`group relative bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden hover:border-[#D4AF37]/50 transition-colors duration-300 flex flex-col min-h-[220px]`}>
            <div className="p-5 flex-1 flex flex-col relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`font-h2 text-white ${room.type === 'VIP' ? 'text-primary-container' : ''}`}>{room.name} {room.type === 'VIP' && '⭐'}</h3>
                  <p className="font-label-caps text-slate-400 mt-1">{room.type} • Tầng {room.id.charAt(room.id.length-1) || '1'}</p>
                </div>
                {room.status === 'occupied' && (
                  <div className="bg-status-occupied/10 px-2.5 py-1 rounded-md border border-status-occupied/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-occupied"></span>
                    <span className="font-label-caps text-status-occupied">Đang hát</span>
                  </div>
                )}
                {room.status === 'available' && (
                  <div className="bg-status-available/10 px-2.5 py-1 rounded-md border border-status-available/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                    <span className="font-label-caps text-status-available">Trống</span>
                  </div>
                )}
                {room.status === 'cleaning' && (
                  <div className="bg-status-cleaning/10 px-2.5 py-1 rounded-md border border-status-cleaning/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-cleaning"></span>
                    <span className="font-label-caps text-status-cleaning">Chờ dọn</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center py-2">
                {room.status === 'occupied' && room.customer ? (
                  <>
                    <p className="font-room-number text-white tracking-tight">{room.time}</p>
                    <p className="font-body-md text-slate-400 mt-1">
                      Khách: <span className="text-slate-300 font-medium">{room.customer.salutation} {room.customer.firstName}</span> ({room.guests} người)
                    </p>
                  </>
                ) : room.status === 'available' ? (
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <span className="material-symbols-outlined text-[40px] text-slate-400">meeting_room</span>
                    <span className="font-body-md text-slate-400">Sẵn sàng phục vụ</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <span className="material-symbols-outlined text-[40px] text-slate-400">cleaning_services</span>
                    <span className="font-body-md text-slate-400">NV: Hoàng Anh</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            {room.status === 'occupied' && (
              <div className="w-full h-1 bg-slate-800 relative z-10">
                <div className="h-full bg-status-occupied" style={{ width: `${Math.random() * 50 + 20}%` }}></div>
              </div>
            )}
            {room.status === 'cleaning' && (
              <div className="w-full h-1 bg-slate-800 relative z-10">
                <div className="h-full bg-status-cleaning" style={{ width: '80%' }}></div>
              </div>
            )}

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-surface-container/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3 p-4 z-20">
              {room.status === 'available' && (
                <button className="w-full py-2.5 bg-status-available/10 text-status-available border border-status-available rounded-lg font-body-md font-semibold hover:bg-status-available hover:text-slate-950 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Nhận khách
                </button>
              )}
              {room.status === 'occupied' && (
                <>
                  <button className="w-full py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">room_service</span>
                    Order dịch vụ
                  </button>
                  <button className="w-full py-2.5 bg-transparent border border-slate-600 text-slate-300 rounded-lg font-body-md font-medium hover:bg-slate-800 transition-colors">
                    Thanh toán
                  </button>
                </>
              )}
              {room.status === 'cleaning' && (
                <button className="w-full py-2.5 bg-transparent border border-status-cleaning text-status-cleaning rounded-lg font-body-md font-semibold hover:bg-status-cleaning hover:text-slate-950 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  Dọn xong
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm fade-in">
          <div className="bg-surface-container rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl">
            <h2 className="text-white text-xl font-h2 mb-4">Thêm Khách Mới</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 font-label-caps mb-1">Tên khách hàng</label>
                <input type="text" className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg p-2.5 text-white focus:border-primary-container focus:outline-none" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-slate-400 font-label-caps mb-1">Số điện thoại</label>
                <input type="text" className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg p-2.5 text-white focus:border-primary-container focus:outline-none" placeholder="VD: 0901234567" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => { setIsModalOpen(false); alert('Đã thêm khách mới!'); }}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-semibold hover:bg-primary-fixed-dim transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
