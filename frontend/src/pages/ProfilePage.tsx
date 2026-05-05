export default function ProfilePage() {
  return (
    <div className="p-8 max-w-3xl mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Thông tin cá nhân</h1>
      {/* Account Info */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-6">Thông tin tài khoản</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-primary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary-container">person</span>
          </div>
          <div>
            <p className="text-white font-h2">Nguyễn Văn A</p>
            <p className="text-primary-container font-label-caps uppercase">Hạng Vàng • 1,250 điểm</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Họ tên</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" defaultValue="Nguyễn Văn A" /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Số điện thoại</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" defaultValue="0901234567" /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Email</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" defaultValue="nguyenvana@email.com" /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">CCCD</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" defaultValue="012345678901" /></div>
        </div>
        <button className="mt-6 px-6 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors">Cập nhật thông tin</button>
      </div>
      {/* Change Password */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Đổi mật khẩu</h2>
        <div className="space-y-4 max-w-md">
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Mật khẩu hiện tại</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" type="password" placeholder="••••••••" /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Mật khẩu mới</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" type="password" placeholder="••••••••" /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Xác nhận mật khẩu</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" type="password" placeholder="••••••••" /></div>
        </div>
        <button className="mt-4 px-6 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors">Đổi mật khẩu</button>
      </div>
      {/* History */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Lịch sử sử dụng</h2>
        <p className="text-primary-container font-body-md mb-4">Điểm tích lũy: 1,250 điểm (Hạng Vàng)</p>
        <table className="w-full text-left whitespace-nowrap"><thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps"><th className="py-3 px-4">Ngày</th><th className="py-3 px-4">Chi nhánh</th><th className="py-3 px-4">Phòng</th><th className="py-3 px-4">Thời gian</th><th className="py-3 px-4">Tổng tiền</th></tr></thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            <tr><td className="py-3 px-4">04/05/2026</td><td className="py-3 px-4">CN-Q1</td><td className="py-3 px-4">P01</td><td className="py-3 px-4">3h 23p</td><td className="py-3 px-4 text-primary-container">947,500đ</td></tr>
            <tr><td className="py-3 px-4">28/04/2026</td><td className="py-3 px-4">CN-Q1</td><td className="py-3 px-4">P05</td><td className="py-3 px-4">2h 00p</td><td className="py-3 px-4 text-primary-container">350,000đ</td></tr>
          </tbody></table>
      </div>
    </div>
  );
}
