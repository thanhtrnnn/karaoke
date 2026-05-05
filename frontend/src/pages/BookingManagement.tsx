import { useState } from 'react';

export default function BookingManagement() {
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const bookings = [
    { id: 'BK001', customer: 'Nguyễn Văn A', phone: '0901234567', room: 'P01 - VIP', date: '04/05/2026', time: '18:00 - 21:00', status: 'Đã xác nhận', color: 'status-available' },
    { id: 'BK002', customer: 'Trần Thị B', phone: '0912345678', room: 'P03 - VIP', date: '04/05/2026', time: '19:00 - 22:00', status: 'Chờ xác nhận', color: 'status-cleaning' },
    { id: 'BK003', customer: 'Lê Hoàng C', phone: '0923456789', room: 'P02 - Thường', date: '05/05/2026', time: '20:00 - 23:00', status: 'Đã hủy', color: 'status-occupied' },
  ];

  const filteredBookings = bookings.filter(b => statusFilter === 'Tất cả' || b.status === statusFilter);

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6 flex-1">
      <div className="flex items-center">
        <span className="material-symbols-outlined text-[32px] text-primary-container mr-3">edit_calendar</span>
        <h1 className="font-h1 text-white">Quản lý đặt phòng</h1>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
        <input 
          type="date" 
          className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container" 
          defaultValue="2026-05-04" 
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
                    <button className="px-3 py-1.5 bg-status-available/10 text-status-available border border-status-available/20 rounded-lg font-label-caps hover:bg-status-available hover:text-white transition-colors flex items-center gap-1">
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
            {/* Modal Header */}
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
            
            {/* Modal Body */}
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
                <div>
                  <p className="text-slate-400 font-label-caps uppercase mb-1">Ghi chú</p>
                  <p className="text-slate-400 italic">Không có ghi chú thêm.</p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-700/50 bg-surface-container-low flex justify-end gap-3">
              <button 
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 rounded-lg font-body-md font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Đóng
              </button>
              {selectedBooking.status === 'Chờ xác nhận' && (
                <button 
                  onClick={() => {
                    alert(`Đã xác nhận đơn đặt phòng ${selectedBooking.id}`);
                    setSelectedBooking(null);
                  }}
                  className="px-6 py-2.5 rounded-lg font-body-md font-semibold bg-primary-container text-on-primary-container hover:bg-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  Duyệt yêu cầu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
