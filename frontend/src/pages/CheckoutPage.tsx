export default function CheckoutPage() {
  return (
    <div className="p-8 flex-1 flex gap-6 max-w-[1600px] mx-auto w-full">
      {/* Left: Invoice Detail */}
      <section className="w-full lg:w-[60%] flex flex-col gap-6">
        <div className="bg-surface-primary rounded-xl border border-slate-700/50 p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div><h1 className="font-h1 text-white mb-1">Thanh toán</h1><p className="text-slate-400 font-body-md">Mã Bill: <span className="text-primary-container font-medium">#BILL-8902</span></p></div>
            <div className="text-right">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-surface-container-high border border-slate-700/50 mb-2"><span className="font-h2 text-primary-container">VIP 02</span></div>
              <p className="text-slate-400 font-body-md flex items-center justify-end gap-2"><span className="material-symbols-outlined text-sm">person</span>Nguyễn Văn A</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-primary rounded-xl border border-slate-700/50 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-surface-container-low flex justify-between items-center">
            <span className="font-label-caps text-slate-400 uppercase">Hạng mục</span>
            <span className="font-label-caps text-slate-400 uppercase">Thành tiền</span>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-label-caps text-primary-container mb-4 uppercase flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span>Tiền giờ hát</h3>
              <div className="flex justify-between items-center py-2"><div><p className="font-body-lg text-white">Phòng VIP 02</p><p className="font-body-md text-slate-400">2.5 giờ x 300,000đ/giờ</p></div><span className="font-h2 text-white">750,000đ</span></div>
            </div>
            <div className="border-b border-dashed border-slate-700/50 my-6"></div>
            <div>
              <h3 className="font-label-caps text-primary-container mb-4 uppercase flex items-center gap-2"><span className="material-symbols-outlined text-sm">room_service</span>Dịch vụ</h3>
              <div className="flex flex-col gap-4">
                {[
                  { icon: 'sports_bar', name: 'Heineken', desc: '1 x 350,000đ', total: '350,000đ' },
                  { icon: 'nutrition', name: 'Trái cây tổng hợp', desc: '2 x 100,000đ', total: '200,000đ' },
                  { icon: 'restaurant', name: 'Khô mực nướng', desc: '1 x 150,000đ', total: '150,000đ' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center border border-slate-700/50 text-slate-400"><span className="material-symbols-outlined">{item.icon}</span></div>
                      <div><p className="font-body-lg text-white">{item.name}</p><p className="font-body-md text-slate-400">{item.desc}</p></div>
                    </div>
                    <span className="font-body-lg text-white font-medium">{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Right: Summary & Payment */}
      <section className="w-full lg:w-[40%] flex flex-col gap-6">
        <div className="bg-surface-primary rounded-xl border border-slate-700/50 p-6 shadow-sm">
          <h3 className="font-label-caps text-slate-400 mb-4 uppercase">Mã Khuyến Mãi</h3>
          <div className="flex gap-2 mb-3">
            <input className="flex-1 bg-surface border border-slate-700/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container uppercase font-medium placeholder-slate-500" placeholder="Nhập mã voucher..." type="text" />
            <button className="bg-surface-container-high border border-slate-700/50 text-white px-6 py-3 rounded-lg font-label-caps hover:bg-slate-800 transition-colors">ÁP DỤNG</button>
          </div>
          <div className="flex items-center gap-2 text-status-available bg-status-available/10 px-4 py-2 rounded-lg border border-status-available/20"><span className="material-symbols-outlined text-sm">check_circle</span><span className="font-body-md">Đã áp dụng mã <strong>VIP10</strong> giảm 10%</span></div>
        </div>
        <div className="bg-surface-primary rounded-xl border border-slate-700/50 p-6 shadow-sm flex-1 flex flex-col">
          <h3 className="font-label-caps text-slate-400 mb-6 uppercase border-b border-slate-700/50 pb-2">Tổng Kết</h3>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center"><span className="font-body-lg text-slate-400">Tạm tính</span><span className="font-body-lg text-white">1,450,000đ</span></div>
            <div className="flex justify-between items-center text-status-available"><span className="font-body-lg">Giảm giá (10%)</span><span className="font-body-lg">-145,000đ</span></div>
            <div className="mt-auto pt-6 border-t border-slate-700/50 flex flex-col items-end">
              <span className="font-label-caps text-slate-400 mb-2 uppercase">Tổng cộng</span>
              <span className="font-room-number text-primary-container">1,305,000đ</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-primary rounded-xl border border-slate-700/50 p-6 shadow-sm">
          <h3 className="font-label-caps text-slate-400 mb-4 uppercase">Phương thức thanh toán</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700/50 bg-surface-container-high hover:border-primary-container text-slate-400 hover:text-primary-container gap-2 transition-all"><span className="material-symbols-outlined text-2xl">payments</span><span className="font-label-caps">Tiền mặt</span></button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-primary-container bg-primary-container/10 text-primary-container gap-2"><span className="material-symbols-outlined text-2xl">account_balance</span><span className="font-label-caps">Chuyển khoản</span></button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700/50 bg-surface-container-high hover:border-primary-container text-slate-400 hover:text-primary-container gap-2 transition-all"><span className="material-symbols-outlined text-2xl">credit_card</span><span className="font-label-caps">Thẻ</span></button>
          </div>
          <button className="w-full bg-primary-container text-on-primary-fixed py-5 rounded-xl font-h2 uppercase tracking-wide hover:bg-primary transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">receipt_long</span>HOÀN TẤT THANH TOÁN
          </button>
        </div>
      </section>
    </div>
  );
}
