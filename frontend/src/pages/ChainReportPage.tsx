import { useState, useEffect } from 'react';

interface Branch {
  id: string;
  name: string;
}

interface BranchStats {
  branchId: string;
  branchName: string;
  revenue: number;
  rooms: number;
  occupiedRooms: number;
  clients: number;
  orders: number;
}

export default function ChainReportPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [results, setResults] = useState<BranchStats[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/branches', { headers })
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        setBranches(data);
        setSelectedBranches(data.map((b: any) => b.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleBranch = (id: string) => {
    setSelectedBranches(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleReport = async () => {
    if (selectedBranches.length === 0) {
      setError('Vui lòng chọn ít nhất 1 chi nhánh.');
      return;
    }
    setError(null);
    setReporting(true);

    try {
      const stats = await Promise.all(
        selectedBranches.map(async branchId => {
          const branchName = branches.find(b => b.id === branchId)?.name || branchId;
          try {
            const res = await fetch(`/api/reports/summary?branchId=${branchId}`, { headers });
            if (res.ok) {
              const data = await res.json();
              return {
                branchId, branchName,
                revenue: data.revenue || 0,
                rooms: data.rooms || 0,
                occupiedRooms: data.occupiedRooms || 0,
                clients: data.clients || 0,
                orders: data.orders || 0,
              } as BranchStats;
            }
          } catch { /* ignore */ }
          return { branchId, branchName, revenue: 0, rooms: 0, occupiedRooms: 0, clients: 0, orders: 0 };
        })
      );
      const sorted = [...stats].sort((a, b) => b.revenue - a.revenue);
      setResults(sorted);
    } finally { setReporting(false); }
  };

  const totalRevenue = results.reduce((sum, r) => sum + r.revenue, 0);

  const exportCSV = () => {
    const header = 'Xếp hạng,Chi nhánh,Doanh thu,Phòng,Công suất (%),Khách,Đơn F&B\n';
    const rows = results.map((r, i) => {
      const occ = r.rooms > 0 ? ((r.occupiedRooms / r.rooms) * 100).toFixed(1) : '0.0';
      return `${i+1},"${r.branchName}",${r.revenue},${r.rooms},${occ}%,${r.clients},${r.orders}`;
    }).join('\n');
    const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `bao-cao-chuoi-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Báo cáo toàn chuỗi</h1>
        <p className="text-slate-400 text-sm mt-1">UC21 — Tổng hợp báo cáo toàn chuỗi (Admin)</p>
      </div>

      {/* Filter panel */}
      <div className="bg-slate-800 rounded-xl p-5 space-y-4">
        {/* Branch multi-select */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs text-slate-400 uppercase">Chọn chi nhánh</label>
            <div className="flex gap-2">
              <button onClick={() => setSelectedBranches(branches.map(b => b.id))}
                className="text-xs text-[#D4AF37] hover:underline">Chọn tất cả</button>
              <span className="text-slate-600">|</span>
              <button onClick={() => setSelectedBranches([])}
                className="text-xs text-slate-400 hover:text-white hover:underline">Bỏ chọn</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {branches.map(b => (
              <button key={b.id} onClick={() => toggleBranch(b.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedBranches.includes(b.id)
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}>
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button onClick={handleReport} disabled={reporting}
            className="px-6 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50">
            {reporting ? 'Đang tổng hợp...' : 'Xem báo cáo'}
          </button>
          {results.length > 0 && (
            <button onClick={exportCSV}
              className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 text-sm">
              Xuất Excel
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-[#D4AF37]/30">
              <p className="text-xs text-slate-400 uppercase mb-1">Tổng doanh thu chuỗi</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{totalRevenue.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase mb-1">Chi nhánh báo cáo</p>
              <p className="text-2xl font-bold text-white">{results.length}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase mb-1">Tổng đơn F&B</p>
              <p className="text-2xl font-bold text-white">{results.reduce((s, r) => s + r.orders, 0)}</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-700 text-slate-300 text-xs uppercase font-semibold flex">
              <span className="w-10">Hạng</span>
              <span className="flex-1">Chi nhánh</span>
              <span className="w-36 text-right">Doanh thu</span>
              <span className="w-24 text-center">Công suất</span>
              <span className="w-24 text-center">Tỷ trọng</span>
            </div>
            {results.map((r, i) => {
              const occ = r.rooms > 0 ? ((r.occupiedRooms / r.rooms) * 100).toFixed(1) : '0.0';
              const share = totalRevenue > 0 ? ((r.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
              return (
                <div key={r.branchId} className="border-t border-slate-700 px-4 py-3 flex items-center hover:bg-slate-750">
                  <span className={`w-10 font-bold text-sm ${i === 0 ? 'text-[#D4AF37]' : 'text-slate-500'}`}>#{i + 1}</span>
                  <span className="flex-1 text-white font-medium">{r.branchName}</span>
                  <span className="w-36 text-right text-[#D4AF37] font-semibold">{r.revenue.toLocaleString('vi-VN')}đ</span>
                  <span className="w-24 text-center text-slate-300">{occ}%</span>
                  <span className="w-24 text-center">
                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mx-2">
                      <div className="absolute left-0 top-0 h-full bg-[#D4AF37] rounded-full" style={{ width: `${share}%` }} />
                    </div>
                    <span className="text-xs text-slate-400">{share}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.length === 0 && !reporting && selectedBranches.length > 0 && (
        <div className="text-center py-12 text-slate-500">Nhấn "Xem báo cáo" để tổng hợp dữ liệu</div>
      )}
    </div>
  );
}
