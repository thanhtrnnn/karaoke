import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportSummary {
  revenue: number;
  rooms: number;
  occupiedRooms: number;
  clients: number;
  products: number;
  orders: number;
  employees: number;
}

interface ChartData {
  label: string;
  value: number;
}

export default function BranchReportPage() {
  const [period, setPeriod] = useState('monthly');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  const fetchReport = () => {
    if (fromDate && toDate && toDate < fromDate) {
      setDateError('Khoảng thời gian không hợp lệ: ngày kết thúc phải >= ngày bắt đầu');
      return;
    }
    setDateError(null);
    setViewing(true);
    setLoading(true);

    const dateParams = [
      fromDate ? `from=${fromDate}` : '',
      toDate ? `to=${toDate}` : '',
    ].filter(Boolean).join('&');
    const sep = dateParams ? '&' : '';

    Promise.allSettled([
      fetch(`/api/reports/summary${dateParams ? '?' + dateParams : ''}`, { headers })
        .then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`/api/reports/revenue?period=${period}${sep}${dateParams}`, { headers })
        .then(r => r.ok ? r.json() : Promise.reject(r.status)),
    ]).then(([summaryResult, revenueResult]) => {
      if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value);
      if (revenueResult.status === 'fulfilled') setChartData(revenueResult.value);
    }).finally(() => { setLoading(false); setViewing(false); });
  };

  const exportCSV = () => {
    if (!summary) return;
    const header = 'Chi so,Gia tri\n';
    const rows = [
      `Doanh thu,${summary.revenue}`,
      `Phong dang dung,${summary.occupiedRooms}/${summary.rooms}`,
      `Don hang,${summary.orders}`,
      `Khach hang,${summary.clients}`,
    ].join('\n');
    const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `bao-cao-chi-nhanh-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const occupancyRate = summary && summary.rooms > 0
    ? ((summary.occupiedRooms / summary.rooms) * 100).toFixed(1) + '%'
    : '0%';

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6 print:p-4">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } }`}</style>
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="font-h1 text-white">Báo cáo chi nhánh</h1>
          <p className="text-slate-400 text-sm mt-1">UC13 — Báo cáo số liệu chi nhánh</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={() => window.print()} className="px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 font-label-caps hover:border-primary-container hover:text-primary-container transition-colors">Xuất PDF</button>
          <button onClick={exportCSV} className="px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 font-label-caps hover:border-primary-container hover:text-primary-container transition-colors">Xuất Excel</button>
        </div>
      </div>

      {/* UC13: Period selector + Date range */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-5 space-y-4 no-print">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase">Kỳ báo cáo</label>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-white text-sm">
              <option value="hourly">Hôm nay (Theo giờ)</option>
              <option value="weekly">Tuần này (Theo ngày)</option>
              <option value="monthly">Tháng này (Theo tháng)</option>
              <option value="quarterly">Quý này (Theo quý)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase">Từ ngày</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase">Đến ngày</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <button onClick={fetchReport}
            className="px-6 py-2 bg-primary-container text-on-primary-container rounded-lg text-sm font-semibold hover:bg-primary transition-colors">
            {viewing ? 'Đang tải...' : 'Xem'}
          </button>
        </div>
        {dateError && <p className="text-red-400 text-xs">{dateError}</p>}
      </div>

      {/* UC13: Summary table */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Doanh thu', value: `${Number(summary.revenue).toLocaleString()}đ`, colorClass: 'text-primary-container' },
            { label: 'Công suất phòng', value: occupancyRate, colorClass: 'text-status-available' },
            { label: 'Lượt khách', value: summary.clients?.toString() || '0', colorClass: 'text-tertiary' },
            { label: 'Doanh số F&B', value: summary.orders?.toString() || '0', colorClass: 'text-secondary' },
          ].map(m => (
            <div key={m.label} className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
              <span className="font-label-caps text-slate-400 uppercase">{m.label}</span>
              <p className={`font-h2 mt-2 ${m.colorClass}`}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue chart */}
      {chartData.length > 0 && (
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
          <h2 className="font-h2 text-white mb-4">Biểu đồ doanh thu</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12}/>
                <YAxis stroke="#94a3b8" fontSize={12}/>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}/>
                <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRevenue)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!viewing && summary && chartData.length === 0 && (
        <div className="text-center py-8 text-slate-500">Không có số liệu trong kỳ đã chọn</div>
      )}

      {loading && <div className="text-center py-8 text-slate-400">Đang tải báo cáo...</div>}
    </div>
  );
}
