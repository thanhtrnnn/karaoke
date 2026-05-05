import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

export default function ReportsPage() {
  const [chartType, setChartType] = useState('weekly');
  const [modalContent, setModalContent] = useState<'room' | 'fb' | null>(null);

  const chartData = {
    hourly: [
      { label: '12h', value: 4000000 },
      { label: '14h', value: 7000000 },
      { label: '16h', value: 8000000 },
      { label: '18h', value: 12000000 },
      { label: '20h', value: 19000000 },
      { label: '22h', value: 20000000 },
      { label: '00h', value: 17000000 },
      { label: '02h', value: 9000000 }
    ],
    weekly: [
      { label: 'Thứ 2', value: 15000000 },
      { label: 'Thứ 3', value: 18000000 },
      { label: 'Thứ 4', value: 16000000 },
      { label: 'Thứ 5', value: 25000000 },
      { label: 'Thứ 6', value: 45000000 },
      { label: 'Thứ 7', value: 55000000 },
      { label: 'Chủ nhật', value: 48000000 }
    ],
    monthly: [
      { label: 'Th1', value: 300000000 },
      { label: 'Th2', value: 350000000 },
      { label: 'Th3', value: 280000000 },
      { label: 'Th4', value: 320000000 },
      { label: 'Th5', value: 380000000 },
      { label: 'Th6', value: 420000000 },
      { label: 'Th7', value: 390000000 },
      { label: 'Th8', value: 410000000 },
      { label: 'Th9', value: 450000000 },
      { label: 'Th10', value: 480000000 },
      { label: 'Th11', value: 520000000 },
      { label: 'Th12', value: 650000000 }
    ]
  };

  const currentData = chartData[chartType as keyof typeof chartData];

  const roomData = [
    { name: 'Super VIP', value: 45, color: '#D4AF37' },
    { name: 'Phòng VIP', value: 35, color: '#00FFA3' },
    { name: 'Phòng Thường', value: 20, color: '#3b82f6' },
  ];

  const fbData = [
    { name: 'Bia Heineken', value: 342, color: '#D4AF37' },
    { name: 'Bia Tiger', value: 256, color: '#f59e0b' },
    { name: 'Trái cây (Lớn)', value: 128, color: '#10b981' },
    { name: 'Mực nướng', value: 95, color: '#ef4444' },
    { name: 'Các món khác', value: 215, color: '#64748b' },
  ];

  // Custom Tooltip for Recharts
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

  const transactions = [
    { id: 'HD001', customer: 'Nguyễn Văn A', room: 'VIP 02', amount: '1,305,000đ', status: 'Đã thanh toán' },
    { id: 'HD002', customer: 'Trần Thị B', room: 'P03', amount: '450,000đ', status: 'Đã thanh toán' },
    { id: 'HD003', customer: 'Lê Hoàng C', room: 'P01', amount: '780,000đ', status: 'Chưa thanh toán' },
  ];
  const handleExport = (type: string) => {
    alert(`Đang xuất báo cáo ra định dạng ${type}...`);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="font-h1 text-white">Báo cáo doanh thu</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('PDF')} className="px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 font-label-caps hover:border-primary-container hover:text-primary-container transition-colors">Xuất PDF</button>
          <button onClick={() => handleExport('Excel')} className="px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 font-label-caps hover:border-primary-container hover:text-primary-container transition-colors">Xuất Excel</button>
        </div>
      </div>
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu ngày', value: '45,000,000đ', icon: 'payments', colorClass: 'text-primary-container' },
          { label: 'Tỷ lệ lấp đầy', value: '80%', icon: 'donut_large', colorClass: 'text-status-available' },
          { label: 'Số đơn hàng', value: '120', icon: 'receipt_long', colorClass: 'text-tertiary' },
          { label: 'Lượt khách', value: '300', icon: 'groups', colorClass: 'text-secondary' },
        ].map((m) => (
          <div key={m.label} className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-3 mb-3"><span className={`material-symbols-outlined ${m.colorClass}`}>{m.icon}</span><span className="font-label-caps text-slate-400 uppercase">{m.label}</span></div>
            <p className={`font-h1 ${m.colorClass}`}>{m.value}</p>
          </div>
        ))}
      </div>
      {/* Bar Chart */}
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
            <AreaChart data={currentData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
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

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 flex flex-col">
          <h2 className="font-h2 text-white mb-6">Cơ cấu doanh thu</h2>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-body-md text-slate-300">Tiền giờ hát</span>
                <span className="font-body-md text-primary-container font-semibold">65%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-body-md text-slate-300">Dịch vụ (F&B)</span>
                <span className="font-body-md text-secondary font-semibold">35%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Performance - Donut Chart */}
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-h2 text-white">Tỷ trọng hạng phòng</h2>
            <button onClick={() => setModalContent('room')} className="text-primary-container hover:text-primary transition-colors text-xs font-label-caps uppercase">Xem chi tiết</button>
          </div>
          <p className="text-xs text-slate-400 mb-4">Mức độ đóng góp doanh thu theo loại phòng</p>
          <div className="w-full min-h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={roomData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {roomData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  formatter={(value) => [`${value}%`, 'Doanh thu']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Menu Items - Horizontal Bar Chart */}
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-h2 text-white">Phân bổ tiêu thụ F&B</h2>
            <button onClick={() => setModalContent('fb')} className="text-primary-container hover:text-primary transition-colors text-xs font-label-caps uppercase">Xem tất cả</button>
          </div>
          <p className="text-xs text-slate-400 mb-4">Tổng quát lượng tiêu thụ (bao gồm nhóm Khác)</p>
          <div className="w-full min-h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={fbData}
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#cbd5e1' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  formatter={(value) => [`${value} đơn vị`, 'Đã bán']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {fbData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Transactions Table */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50"><h2 className="font-h2 text-white">Giao dịch gần nhất</h2></div>
        <table className="w-full text-left whitespace-nowrap"><thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low"><th className="py-4 px-6">Mã Bill</th><th className="py-4 px-6">Khách hàng</th><th className="py-4 px-6">Phòng</th><th className="py-4 px-6">Tổng tiền</th><th className="py-4 px-6">Trạng thái</th></tr></thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">{transactions.map((t) => (<tr key={t.id} className="hover:bg-slate-900/30 transition-colors"><td className="py-4 px-6 text-primary-container">{t.id}</td><td className="py-4 px-6 text-white">{t.customer}</td><td className="py-4 px-6">{t.room}</td><td className="py-4 px-6 text-primary-container font-medium">{t.amount}</td><td className="py-4 px-6"><span className={`px-2.5 py-1 rounded-md font-label-caps ${t.status === 'Đã thanh toán' ? 'bg-status-available/10 text-status-available border border-status-available/20' : 'bg-status-cleaning/10 text-status-cleaning border border-status-cleaning/20'}`}>{t.status}</span></td></tr>))}</tbody></table>
      </div>

      {/* Detail Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-slate-700/50 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h2 text-white">
                {modalContent === 'room' ? 'Chi Tiết Hiệu Suất Phòng' : 'Báo Cáo Toàn Bộ Dịch Vụ F&B'}
              </h2>
              <button onClick={() => setModalContent(null)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
                    <th className="py-3 px-4">STT</th>
                    <th className="py-3 px-4">{modalContent === 'room' ? 'Tên Phòng/Loại' : 'Tên Mặt Hàng'}</th>
                    <th className="py-3 px-4 text-right">{modalContent === 'room' ? 'Giờ Hát' : 'Số Lượng'}</th>
                    <th className="py-3 px-4 text-right">Doanh Thu</th>
                  </tr>
                </thead>
                <tbody className="font-body-md divide-y divide-slate-800/50">
                  {modalContent === 'room' ? (
                    <>
                      {[
                        { name: 'VIP 01', hours: 124, rev: 24500000 },
                        { name: 'VIP 03', hours: 98, rev: 18200000 },
                        { name: 'Super VIP (S1)', hours: 85, rev: 32400000 },
                        { name: 'P.02 (Thường)', hours: 76, rev: 10100000 },
                        { name: 'P.05 (Thường)', hours: 64, rev: 8400000 },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-slate-900/30">
                          <td className="py-3 px-4 text-slate-400">{i + 1}</td>
                          <td className="py-3 px-4 text-white font-medium">{item.name}</td>
                          <td className="py-3 px-4 text-right text-slate-300">{item.hours}h</td>
                          <td className="py-3 px-4 text-right text-primary-container">{(item.rev).toLocaleString()}đ</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { name: 'Bia Heineken (Thùng)', qty: 342, rev: 12500000 },
                        { name: 'Bia Tiger (Thùng)', qty: 256, rev: 9800000 },
                        { name: 'Trái cây đĩa (Lớn)', qty: 128, rev: 7500000 },
                        { name: 'Khô mực nướng', qty: 95, rev: 5400000 },
                        { name: 'Nước suối', qty: 120, rev: 1200000 },
                        { name: 'Khăn lạnh', qty: 450, rev: 1800000 },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-slate-900/30">
                          <td className="py-3 px-4 text-slate-400">{i + 1}</td>
                          <td className="py-3 px-4 text-white font-medium">{item.name}</td>
                          <td className="py-3 px-4 text-right text-tertiary">{item.qty}</td>
                          <td className="py-3 px-4 text-right text-primary-container">{(item.rev).toLocaleString()}đ</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => alert('Xuất báo cáo chi tiết thành công!')}
                className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Xuất Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
