import { useState, useEffect } from 'react';

export default function ManagerDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/reports/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (e) {
        console.error('Failed to fetch summary:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải dashboard...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center"><h1 className="font-h1 text-white">Dashboard - Quản lý chi nhánh</h1><p className="text-slate-400 font-body-md">07/05/2026</p></div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu', value: summary?.revenue ? `${Number(summary.revenue).toLocaleString()}đ` : '0đ', icon: 'payments', color: 'primary-container' },
          { label: 'Phòng hoạt động', value: summary ? `${summary.occupiedRooms || 0}/${summary.rooms || 0}` : '0/0', icon: 'meeting_room', color: 'status-available' },
          { label: 'Đơn F&B', value: summary?.bookings?.toString() || '0', icon: 'receipt_long', color: 'tertiary' },
          { label: 'Nhân viên', value: summary?.employees?.toString() || '0', icon: 'groups', color: 'secondary' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className={`material-symbols-outlined text-${kpi.color}`}>{kpi.icon}</span>
              <p className="font-label-caps text-slate-400 uppercase">{kpi.label}</p>
            </div>
            <p className={`font-h1 text-${kpi.color} mb-1`}>{kpi.value}</p>
          </div>
        ))}
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
          <p className="font-label-caps text-slate-400 uppercase mb-2">Tổng khách hàng</p>
          <p className="font-h1 text-white">{summary?.customers || 0}</p>
        </div>
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
          <p className="font-label-caps text-slate-400 uppercase mb-2">Menu items</p>
          <p className="font-h1 text-white">{summary?.menuItems || 0}</p>
        </div>
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
          <p className="font-label-caps text-slate-400 uppercase mb-2">Tổng đặt phòng</p>
          <p className="font-h1 text-white">{summary?.bookings || 0}</p>
        </div>
      </div>
    </div>
  );
}
