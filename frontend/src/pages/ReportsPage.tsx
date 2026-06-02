import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { todayGMT7, formatTime } from '../config/constants';

const orderStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'status-cleaning' },
  PREPARING: { label: 'Đang chuẩn bị', color: 'tertiary' },
  SERVED: { label: 'Đã phục vụ', color: 'status-available' },
  CANCELLED: { label: 'Đã hủy', color: 'status-occupied' },
};

export default function ReportsPage() {
  const [chartType, setChartType] = useState('weekly');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UC13: đọc branchId từ user đang đăng nhập
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const branchId = storedUser.branchId || '';

  const fetchReports = () => {
    if (fromDate && toDate && toDate < fromDate) {
      setDateError('Khoảng thời gian không hợp lệ: ngày kết thúc phải >= ngày bắt đầu');
      return;
    }
    setDateError(null);
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const dateParams = [
      fromDate ? `from=${fromDate}` : '',
      toDate ? `to=${toDate}` : '',
      branchId ? `branchId=${branchId}` : '',
    ].filter(Boolean).join('&');
    const sep = dateParams ? '&' : '';

    Promise.allSettled([
      fetch(`/api/reports/summary${dateParams ? '?' + dateParams : ''}`, { headers }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`/api/orders${dateParams ? '?' + dateParams : ''}`, { headers }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`/api/reports/revenue?period=${chartType}${sep}${dateParams}`, { headers }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
    ])
      .then(([summaryResult, ordersResult, revenueResult]) => {
        if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value);
        if (ordersResult.status === 'fulfilled') {
          setOrders(ordersResult.value.map((o: any) => {
            const total = o.items?.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0) || 0;
            const st = orderStatusMap[o.status] || { label: o.status, color: 'slate-400' };
            return { id: o.id, room: o.roomName || o.roomId || 'N/A', itemCount: o.items?.length || 0, total, status: st.label, color: st.color, time: o.orderTime ? formatTime(new Date(o.orderTime)) : '' };
          }));
        }
        if (revenueResult.status === 'fulfilled') setChartData(revenueResult.value);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [chartType]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-high border border-slate-700 p-4 rounded-lg shadow-xl">
          <p className="font-label-caps text-slate-400 mb-1">{label}</p>
          <p className="font-body-lg text-[#D4AF37] font-semibold">
            {payload[0].value.toLocaleString()}đ
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải báo cáo...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6 print:p-4">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } }`}</style>
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="font-h1 text-white">Báo cáo doanh thu</h1>
        <div className="flex gap-2 no-print">
          <button onClick={() => window.print()} className="px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 font-label-caps hover:border-primary-container hover:text-primary-container transition-colors">Xuất PDF</button>
          <button onClick={() => {
            const header = 'Mã Order,Phòng,Số món,Tổng tiền,Giờ đặt,Trạng thái\n';
            const rows = orders.map(o => `${o.id},${o.room},${o.itemCount},${o.total.toLocaleString()}đ,${o.time},${o.status}`).join('\n');
            const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bao-cao-doanh-thu-${todayGMT7()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }} className="px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 font-label-caps hover:border-primary-container hover:text-primary-container transition-colors">Xuất Excel</button>
        </div>
      </div>
      {/* Metric Cards - using real data from /api/reports/summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu', value: summary?.revenue ? `${Number(summary.revenue).toLocaleString()}đ` : '0đ', icon: 'payments', colorClass: 'text-primary-container' },
          // UC13: công suất phòng = occupiedRooms/rooms * 100
          { label: 'Công suất phòng', value: summary ? `${summary.rooms > 0 ? ((summary.occupiedRooms / summary.rooms) * 100).toFixed(1) : 0}% (${summary.occupiedRooms || 0}/${summary.rooms || 0})` : '0%', icon: 'donut_large', colorClass: 'text-status-available' },
          { label: 'Doanh số F&B', value: summary?.orders ? `${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}đ` : '0đ', icon: 'receipt_long', colorClass: 'text-tertiary' },
          { label: 'Khách hàng', value: (summary?.clients ?? summary?.customers ?? 0).toString(), icon: 'groups', colorClass: 'text-secondary' },
        ].map((m) => (
          <div key={m.label} className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-3 mb-3"><span className={`material-symbols-outlined ${m.colorClass}`}>{m.icon}</span><span className="font-label-caps text-slate-400 uppercase">{m.label}</span></div>
            <p className={`font-h1 ${m.colorClass}`}>{m.value}</p>
          </div>
        ))}
      </div>
      {/* Bar Chart - using real data from /api/reports/revenue */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
          <h2 className="font-h2 text-white">Biểu đồ doanh thu</h2>
          {/* UC13: date-range filter + period selector */}
          <div className="flex flex-wrap gap-2 items-center">
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-container" />
            <span className="text-slate-500 text-sm">—</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-container" />
            <select value={chartType} onChange={(e) => setChartType(e.target.value)}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-white font-body-md focus:outline-none focus:border-primary-container">
              <option value="hourly">Hôm nay (Theo giờ)</option>
              <option value="weekly">Tuần này (Theo ngày)</option>
              <option value="monthly">Năm nay (Theo tháng)</option>
              <option value="quarterly">Quý này (Theo tháng)</option>
            </select>
            <button onClick={fetchReports}
              className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg text-sm font-semibold hover:bg-primary transition-colors">
              Xem
            </button>
          </div>
        </div>
        {dateError && <p className="text-red-400 text-xs mb-3">{dateError}</p>}
        {chartData.length === 0 && summary?.revenue === 0 && (
          <div className="text-center py-8 text-slate-500">Không có số liệu trong kỳ đã chọn</div>
        )}
        <div className="h-[350px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}tr` : `${val / 1000}k`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 8, fill: '#00FFA3', stroke: '#00FFA3', strokeWidth: 2, strokeOpacity: 0.5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Orders Table - using real data from /api/orders */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50"><h2 className="font-h2 text-white">Đơn hàng gần nhất</h2></div>
        <table className="w-full text-left whitespace-nowrap"><thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low"><th className="py-4 px-6">Mã Order</th><th className="py-4 px-6">Phòng</th><th className="py-4 px-6">Số món</th><th className="py-4 px-6">Tổng tiền</th><th className="py-4 px-6">Giờ đặt</th><th className="py-4 px-6">Trạng thái</th></tr></thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">{orders.map((o) => (<tr key={o.id} className="hover:bg-slate-900/30 transition-colors"><td className="py-4 px-6 text-primary-container font-medium">{o.id}</td><td className="py-4 px-6 text-white">{o.room}</td><td className="py-4 px-6">{o.itemCount}</td><td className="py-4 px-6 text-primary-container font-medium">{o.total.toLocaleString()}đ</td><td className="py-4 px-6 text-slate-300">{o.time}</td><td className="py-4 px-6"><span className={`px-2.5 py-1 rounded-md font-label-caps bg-${o.color}/10 text-${o.color} border border-${o.color}/20`}>{o.status}</span></td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
