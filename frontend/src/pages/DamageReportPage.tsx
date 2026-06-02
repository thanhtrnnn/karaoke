import { useState, useEffect } from 'react';

interface DamageReport {
  id: string;
  maBaoCao: string;
  reportTime: string;
  trangThai: string;
  employee?: { id: string; username?: string };
}

export default function DamageReportPage() {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', maBaoCao: '', trangThai: 'Chờ xử lý' });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/damage-reports', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const body = { ...formData, employee: user.id ? { id: user.id } : undefined };
    const res = await fetch('/api/damage-reports', { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.ok) {
      const saved = await res.json();
      setReports(prev => [saved, ...prev]);
      setIsModalOpen(false);
      setFormData({ id: '', maBaoCao: '', trangThai: 'Chờ xử lý' });
    }
  };

  const updateStatus = async (id: string, trangThai: string) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;
    const res = await fetch(`/api/damage-reports/${id}`, {
      method: 'PUT', headers, body: JSON.stringify({ ...report, trangThai })
    });
    if (res.ok) {
      const saved = await res.json();
      setReports(prev => prev.map(r => r.id === id ? saved : r));
    }
  };

  const statusColor = (s: string) => {
    if (s === 'Đã xử lý') return 'bg-green-900 text-green-300';
    if (s === 'Chờ xử lý') return 'bg-yellow-900 text-yellow-300';
    return 'bg-blue-900 text-blue-300';
  };

  if (loading) return <div className="p-6 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Báo cáo Hư hỏng</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-yellow-400">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo báo cáo
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Mã BC</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="border-t border-slate-700">
                <td className="px-4 py-3 text-white font-medium">{r.maBaoCao || r.id}</td>
                <td className="px-4 py-3 text-slate-300">{r.reportTime ? new Date(r.reportTime).toLocaleString('vi-VN') : '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColor(r.trangThai)}`}>{r.trangThai}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {r.trangThai !== 'Đã xử lý' && (
                    <button onClick={() => updateStatus(r.id, 'Đã xử lý')} className="text-xs px-3 py-1 bg-green-800 text-green-200 rounded-lg hover:bg-green-700">
                      Đánh dấu đã xử lý
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && <div className="py-12 text-center text-slate-500">Chưa có báo cáo hư hỏng</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Tạo báo cáo hư hỏng</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mã báo cáo</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.id} onChange={e => setFormData(p => ({ ...p, id: e.target.value }))} placeholder="VD: BC002" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên/Mô tả báo cáo</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.maBaoCao} onChange={e => setFormData(p => ({ ...p, maBaoCao: e.target.value }))} placeholder="VD: BC-2026-002" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700">Hủy</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold hover:bg-yellow-400">Tạo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
