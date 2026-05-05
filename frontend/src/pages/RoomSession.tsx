export default function RoomSession() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-room-number text-room-number text-white">P01 - VIP</h1>
            <span className="px-3 py-1 bg-status-occupied/20 text-status-occupied rounded-full font-label-caps border border-status-occupied/30 ml-4">Đang sử dụng</span>
          </div>
          <p className="font-body-lg text-text-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">person</span>
            Khách hàng: <span className="text-white font-medium">Anh Tuấn</span>
            <span className="mx-2 text-slate-600">•</span>
            <span className="material-symbols-outlined text-sm">schedule</span>
            Bắt đầu: 19:30 (Đã hát 2h 15p)
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-lg bg-surface-secondary border border-border-subtle text-text-primary hover:border-primary-container transition-colors font-label-caps flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>Đổi phòng
          </button>
          <button className="px-6 py-3 rounded-lg bg-surface-secondary border border-border-subtle text-text-primary hover:border-primary-container transition-colors font-label-caps flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">update</span>Gia hạn giờ
          </button>
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Table */}
        <div className="lg:col-span-2 bg-surface-primary border border-border-subtle rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-h2 text-white">Dịch vụ đã gọi</h2>
            <button className="px-4 py-2 rounded-lg bg-primary-container/10 text-primary-container border border-primary-container/30 hover:bg-primary-container hover:text-on-primary transition-colors font-label-caps flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>Gọi thêm món
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-label-caps">
                  <th className="py-4 px-4 font-semibold w-1/2">Tên món</th>
                  <th className="py-4 px-4 font-semibold text-center w-1/6">SL</th>
                  <th className="py-4 px-4 font-semibold text-right w-1/6">Đơn giá</th>
                  <th className="py-4 px-4 font-semibold text-right w-1/6">Thành tiền</th>
                  <th className="py-4 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="font-body-md divide-y divide-slate-800/50">
                {[
                  { name: 'Bia Heineken (Thùng)', qty: 2, price: '450,000', total: '900,000' },
                  { name: 'Trái cây dĩa (Lớn)', qty: 1, price: '250,000', total: '250,000' },
                  { name: 'Khăn lạnh', qty: 5, price: '5,000', total: '25,000' },
                  { name: 'Mì xào hải sản', qty: 2, price: '85,000', total: '170,000' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="py-4 px-4 text-white">{item.name}</td>
                    <td className="py-4 px-4 text-center">{item.qty}</td>
                    <td className="py-4 px-4 text-right text-text-secondary">{item.price}</td>
                    <td className="py-4 px-4 text-right text-white font-medium">{item.total}</td>
                    <td className="py-4 px-2 text-center">
                      <button className="text-status-occupied/50 hover:text-status-occupied opacity-0 group-hover:opacity-100 transition-all">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Summary Panel */}
        <div className="bg-surface-primary border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col h-full">
          <h2 className="font-h2 text-white mb-6 border-b border-border-subtle pb-4">Tóm tắt chi phí</h2>
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex justify-between items-center font-body-md">
              <span className="text-text-secondary">Tiền phòng (tạm tính)</span>
              <span className="text-white font-medium">675,000đ</span>
            </div>
            <div className="flex justify-between items-center font-body-md">
              <span className="text-text-secondary">Tiền dịch vụ</span>
              <span className="text-white font-medium">1,345,000đ</span>
            </div>
            <div className="flex justify-between items-center font-body-md">
              <span className="text-text-secondary">Phụ thu</span>
              <span className="text-white font-medium">0</span>
            </div>
            <div className="pt-4 border-t border-border-subtle flex justify-between items-end mt-4">
              <span className="font-label-caps text-text-secondary uppercase">Tổng cộng</span>
              <span className="text-[32px] font-bold text-primary-container leading-none">2,020,000đ</span>
            </div>
          </div>
          <button className="w-full py-4 rounded-xl bg-primary-container text-on-primary font-h2 text-[20px] font-bold hover:bg-primary transition-colors uppercase tracking-wider shadow-md shadow-primary-container/20">
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
