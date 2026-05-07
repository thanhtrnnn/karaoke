import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [chartType, setChartType] = useState('weekly');
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    Promise.all([
      fetch('/api/reports/summary', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/invoices', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/reports/revenue?period=${chartType}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([summaryData, invoicesData, revenueData]) => {
        setSummary(summaryData);
        setTransactions(invoicesData.map((inv: any) => ({
          id: inv.id,
          customer: inv.booking?.customer?.fullName || 'N/A',
          room: inv.booking?.room?.name || 'N/A',
          amount: `${Number(inv.grandTotal).toLocaleString()}đ`,
          status: inv.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán',
        })));
        setChartData(revenueData);
      })
      .catch(e => {
        console.error('Failed to fetch reports:', e);
      })
      .finally(() => setLoading(false));
  }, [token, chartType]);

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
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="font-h1 text-white">Báo cáo doanh thu</h1>
        <div className="flex gap-2">
          <button onClick={() => alert('Đang xuất báo cáo ra định dạng PDF...')} className="px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 font-label-caps hover:border-primary-container hover:text-primary-container transition-colors">Xuất PDF</button>
          <button onClick={() => alert('Đang xuất báo cáo ra định dạng Excel...')} className="px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 font-label-caps hover:border-primary-container hover:text-primary-container transition-colors">Xuất Excel</button>
        </div>
      </div>
      {/* Metric Cards - using real data from /api/reports/summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu', value: summary?.revenue ? `${Number(summary.revenue).toLocaleString()}đ` : '0đ', icon: 'payments', colorClass: 'text-primary-container' },
          { label: 'Phòng đang dùng', value: summary ? `${summary.occupiedRooms || 0}/${summary.rooms || 0}` : '0/0', icon: 'donut_large', colorClass: 'text-status-available' },
          { label: 'Tổng đặt phòng', value: summary?.bookings?.toString() || '0', icon: 'receipt_long', colorClass: 'text-tertiary' },
          { label: 'Khách hàng', value: summary?.customers?.toString() || '0', icon: 'groups', colorClass: 'text-secondary' },
        ].map((m) => (
          <div key={m.label} className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-3 mb-3"><span className={`material-symbols-outlined ${m.colorClass}`}>{m.icon}</span><span className="font-label-caps text-slate-400 uppercase">{m.label}</span></div>
            <p className={`font-h1 ${m.colorClass}`}>{m.value}</p>
          </div>
        ))}
      </div>
      {/* Bar Chart - using real data from /api/reports/revenue */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-h2 text-white">Biểu đồ doanh thu</h2>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
          >
            <option value="hourly">Hôm nay (Theo giờ)</option>
            <option value="weekly">Tuần này (Theo ngày)</option>
            <option value="monthly">Năm nay (Theo tháng)</option>
          </select>
        </div>
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
      {/* Transactions Table - using real data from /api/invoices */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50"><h2 className="font-h2 text-white">Giao dịch gần nhất</h2></div>
        <table className="w-full text-left whitespace-nowrap"><thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low"><th className="py-4 px-6">Mã Bill</th><th className="py-4 px-6">Khách hàng</th><th className="py-4 px-6">Phòng</th><th className="py-4 px-6">Tổng tiền</th><th className="py-4 px-6">Trạng thái</th></tr></thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">{transactions.map((t) => (<tr key={t.id} className="hover:bg-slate-900/30 transition-colors"><td className="py-4 px-6 text-primary-container">{t.id}</td><td className="py-4 px-6 text-white">{t.customer}</td><td className="py-4 px-6">{t.room}</td><td className="py-4 px-6 text-primary-container font-medium">{t.amount}</td><td className="py-4 px-6"><span className={`px-2.5 py-1 rounded-md font-label-caps ${t.status === 'Đã thanh toán' ? 'bg-status-available/10 text-status-available border border-status-available/20' : 'bg-status-cleaning/10 text-status-cleaning border border-status-cleaning/20'}`}>{t.status}</span></td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
