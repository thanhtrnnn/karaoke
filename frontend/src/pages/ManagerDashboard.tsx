export default function ManagerDashboard() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center"><h1 className="font-h1 text-white">Dashboard - Quản lý chi nhánh</h1><p className="text-slate-400 font-body-md">CN1 - Quận 1 • 04/05/2026</p></div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu hôm nay', value: '45,000,000đ', diff: '+12%', color: 'primary-container' },
          { label: 'Phòng hoạt động', value: '18/24', diff: '75%', color: 'status-available' },
          { label: 'Đơn F&B', value: '86', diff: '+23%', color: 'tertiary' },
          { label: 'Nhân viên online', value: '12', diff: '', color: 'secondary' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
            <p className="font-label-caps text-slate-400 uppercase mb-2">{kpi.label}</p>
            <p className={`font-h1 text-${kpi.color} mb-1`}>{kpi.value}</p>
            {kpi.diff && <p className="text-status-available text-sm">{kpi.diff} so với hôm qua</p>}
          </div>
        ))}
      </div>
      {/* Active sessions */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Phiên đang hoạt động</h2>
        <div className="space-y-3">
          {['P01 - VIP', 'P02', 'P04', 'VIP 02'].map((room) => (
            <div key={room} className="flex items-center justify-between py-3 border-b border-slate-700/30">
              <div className="flex items-center gap-4"><span className="font-body-md text-white font-medium">{room}</span><span className="text-slate-400">Khách: Anh Tuấn (4 người)</span></div>
              <div className="flex items-center gap-4"><span className="text-primary-container font-medium">01:23:45</span><button className="px-3 py-1 bg-primary-container/10 text-primary-container border border-primary-container/30 rounded-lg font-label-caps hover:bg-primary-container hover:text-on-primary transition-colors">Chi tiết</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
