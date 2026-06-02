import { useState, useEffect } from 'react';

interface ImportReceipt {
  id: string;
  maPhieu: string;
  ngayNhap: string;
  tongTien: number;
  trangThai: string;
  provider?: { id: string; tenNCC?: string };
}

interface Provider {
  id: string;
  tenNCC: string;
}

export default function ImportReceiptPage() {
  const [receipts, setReceipts] = useState<ImportReceipt[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', maPhieu: '', tongTien: 0, trangThai: 'Đã nhận', providerId: '' });

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    Promise.all([
      fetch('/api/import-receipts', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      fetch('/api/providers', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
    ]).then(([ir, pv]) => { setReceipts(ir); setProviders(pv); }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const body = { ...formData, provider: formData.providerId ? { id: formData.providerId } : undefined };
    const res = await fetch('/api/import-receipts', { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.ok) {
      const saved = await res.json();
      setReceipts(prev => [saved, ...prev]);
      setIsModalOpen(false);
      setFormData({ id: '', maPhieu: '', tongTien: 0, trangThai: 'Đã nhận', providerId: '' });
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Nhập kho</h1>
        <button onClick={() => { setFormData({ id: '', maPhieu: '', tongTien: 0, trangThai: 'Đã nhận', providerId: providers[0]?.id || '' }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-yellow-400">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo phiếu nhập
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Mã phiếu</th>
              <th className="px-4 py-3 text-left">Nhà cung cấp</th>
              <th className="px-4 py-3 text-left">Ngày nhập</th>
              <th className="px-4 py-3 text-right">Tổng tiền</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map(ir => (
              <tr key={ir.id} className="border-t border-slate-700">
                <td className="px-4 py-3 text-white font-medium font-mono">{ir.maPhieu || ir.id}</td>
                <td className="px-4 py-3 text-slate-300">{ir.provider?.tenNCC || ir.provider?.id || '—'}</td>
                <td className="px-4 py-3 text-slate-300">{ir.ngayNhap ? new Date(ir.ngayNhap).toLocaleDateString('vi-VN') : '—'}</td>
                <td className="px-4 py-3 text-right text-[#D4AF37]">{ir.tongTien?.toLocaleString('vi-VN')}đ</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-300">{ir.trangThai}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {receipts.length === 0 && <div className="py-12 text-center text-slate-500">Chưa có phiếu nhập kho</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Tạo phiếu nhập kho</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mã phiếu</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.id} onChange={e => setFormData(p => ({ ...p, id: e.target.value }))} placeholder="VD: PN002" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên/Mã nội bộ</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.maPhieu} onChange={e => setFormData(p => ({ ...p, maPhieu: e.target.value }))} placeholder="VD: PN-2026-002" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nhà cung cấp</label>
                <select className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.providerId} onChange={e => setFormData(p => ({ ...p, providerId: e.target.value }))}>
                  <option value="">-- Chọn NCC --</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.tenNCC}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tổng tiền (đ)</label>
                <input type="number" className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.tongTien} onChange={e => setFormData(p => ({ ...p, tongTien: +e.target.value }))} />
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
