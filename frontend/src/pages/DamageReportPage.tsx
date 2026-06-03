import { useState, useEffect } from 'react';

interface DamageReport {
  id: string;
  maBaoCao: string;
  reportTime: string;
  trangThai: string;
  employee?: { id: string; username?: string };
}

interface Facility {
  id: string;
  name: string;
  compensationPrice: number;
  unit?: string;
  stock?: number;
}

interface DamageCartItem {
  facility: Facility;
  quantity: number;
}

export default function DamageReportPage() {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', maBaoCao: '', trangThai: 'Chờ xử lý' });

  // Tìm tài sản bị hỏng (searchFacility) + giỏ chi tiết hư hỏng (damage details)
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitySearch, setFacilitySearch] = useState('');
  const [damageCart, setDamageCart] = useState<DamageCartItem[]>([]);

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

  // searchFacility(keyword): tìm tài sản theo tên qua API (khớp tài liệu); chỉ tải khi mở modal
  const fetchFacilities = (keyword?: string) => {
    const url = keyword && keyword.trim()
      ? `/api/facilities?keyword=${encodeURIComponent(keyword.trim())}`
      : '/api/facilities';
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setFacilities)
      .catch(console.error);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const t = setTimeout(() => fetchFacilities(facilitySearch), 300);
    return () => clearTimeout(t);
  }, [facilitySearch, isModalOpen]);

  const openCreate = () => {
    setFormData({ id: '', maBaoCao: '', trangThai: 'Chờ xử lý' });
    setFacilitySearch('');
    setDamageCart([]);
    setFacilities([]);
    setIsModalOpen(true);
  };

  const addFacilityToCart = (f: Facility) => {
    setDamageCart(prev => {
      const existing = prev.find(d => d.facility.id === f.id);
      if (existing) return prev.map(d => d.facility.id === f.id ? { ...d, quantity: d.quantity + 1 } : d);
      return [...prev, { facility: f, quantity: 1 }];
    });
  };

  const setCartQty = (id: string, qty: number) => {
    setDamageCart(prev => prev.map(d => d.facility.id === id ? { ...d, quantity: Math.max(1, qty) } : d));
  };

  const removeCartItem = (id: string) => setDamageCart(prev => prev.filter(d => d.facility.id !== id));

  const cartTotal = damageCart.reduce((s, d) => s + (d.facility.compensationPrice || 0) * d.quantity, 0);

  const save = async () => {
    const body = {
      ...formData,
      employee: user.id ? { id: user.id } : undefined,
      details: damageCart.map(d => ({ facility: { id: d.facility.id }, quantity: d.quantity })),
    };
    const res = await fetch('/api/damage-reports', { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.ok) {
      const saved = await res.json();
      setReports(prev => [saved, ...prev]);
      setIsModalOpen(false);
      setFormData({ id: '', maBaoCao: '', trangThai: 'Chờ xử lý' });
      setDamageCart([]);
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
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-yellow-400">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Tạo báo cáo hư hỏng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mã báo cáo</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.id} onChange={e => setFormData(p => ({ ...p, id: e.target.value }))} placeholder="VD: BC002" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên/Mô tả báo cáo</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.maBaoCao} onChange={e => setFormData(p => ({ ...p, maBaoCao: e.target.value }))} placeholder="VD: BC-2026-002" />
              </div>
            </div>

            {/* Tìm tài sản bị hỏng (searchFacility) */}
            <div className="mt-5">
              <label className="block text-sm text-slate-400 mb-1">Tìm tài sản bị hỏng</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  value={facilitySearch}
                  onChange={e => setFacilitySearch(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] border border-transparent"
                  placeholder="Nhập tên tài sản (VD: Cốc, Micro)..."
                />
              </div>
              <div className="mt-2 max-h-40 overflow-y-auto border border-slate-700 rounded-lg divide-y divide-slate-700">
                {facilities.length === 0 && (
                  <div className="px-3 py-4 text-center text-slate-500 text-sm">Không có tài sản phù hợp</div>
                )}
                {facilities.map(f => (
                  <div key={f.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-700/50">
                    <div className="text-sm">
                      <span className="text-white">{f.name}</span>
                      <span className="text-slate-500 ml-2">{(f.compensationPrice || 0).toLocaleString()}đ{f.unit ? ` / ${f.unit}` : ''}</span>
                    </div>
                    <button onClick={() => addFacilityToCart(f)} className="text-xs px-2.5 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-black transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">add</span>Thêm
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chi tiết tài sản hỏng (damage details) */}
            <div className="mt-5">
              <label className="block text-sm text-slate-400 mb-1">Chi tiết tài sản hỏng</label>
              {damageCart.length === 0 ? (
                <div className="px-3 py-4 text-center text-slate-500 text-sm border border-slate-700 rounded-lg">Chưa chọn tài sản nào</div>
              ) : (
                <div className="border border-slate-700 rounded-lg divide-y divide-slate-700">
                  {damageCart.map(d => (
                    <div key={d.facility.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="text-white text-sm flex-1 truncate">{d.facility.name}</span>
                      <input
                        type="number"
                        min={1}
                        value={d.quantity}
                        onChange={e => setCartQty(d.facility.id, parseInt(e.target.value) || 1)}
                        className="w-16 bg-slate-700 text-white rounded px-2 py-1 text-sm text-center"
                      />
                      <span className="text-[#D4AF37] text-sm w-24 text-right">{((d.facility.compensationPrice || 0) * d.quantity).toLocaleString()}đ</span>
                      <button onClick={() => removeCartItem(d.facility.id)} className="text-slate-400 hover:text-red-400">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2 bg-slate-700/30">
                    <span className="text-slate-300 text-sm font-medium">Tổng phí đền bù</span>
                    <span className="text-[#D4AF37] text-sm font-semibold">{cartTotal.toLocaleString()}đ</span>
                  </div>
                </div>
              )}
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
