import { useState, useEffect } from 'react';

interface Provider {
  id: string;
  tenNCC: string;
  diaChiNCC: string;
  dienThoai: string;
}

export default function ProviderPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({ id: '', tenNCC: '', diaChiNCC: '', dienThoai: '' });

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/providers', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setProviders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ id: '', tenNCC: '', diaChiNCC: '', dienThoai: '' });
    setIsModalOpen(true);
  };

  const openEdit = (p: Provider) => {
    setEditingItem(p);
    setFormData({ id: p.id, tenNCC: p.tenNCC, diaChiNCC: p.diaChiNCC, dienThoai: p.dienThoai });
    setIsModalOpen(true);
  };

  const save = async () => {
    const url = editingItem ? `/api/providers/${editingItem.id}` : '/api/providers';
    const method = editingItem ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers, body: JSON.stringify(formData) });
    if (res.ok) {
      const saved = await res.json();
      if (editingItem) {
        setProviders(prev => prev.map(p => p.id === saved.id ? saved : p));
      } else {
        setProviders(prev => [...prev, saved]);
      }
      setIsModalOpen(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Xóa nhà cung cấp này?')) return;
    const res = await fetch(`/api/providers/${id}`, { method: 'DELETE', headers });
    if (res.ok) setProviders(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return <div className="p-6 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Nhà cung cấp</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-yellow-400">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm NCC
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Mã</th>
              <th className="px-4 py-3 text-left">Tên nhà cung cấp</th>
              <th className="px-4 py-3 text-left">Địa chỉ</th>
              <th className="px-4 py-3 text-left">Điện thoại</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.id} className="border-t border-slate-700 hover:bg-slate-750">
                <td className="px-4 py-3 text-slate-400 font-mono">{p.id}</td>
                <td className="px-4 py-3 text-white font-medium">{p.tenNCC}</td>
                <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{p.diaChiNCC}</td>
                <td className="px-4 py-3 text-slate-300">{p.dienThoai}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-1 text-slate-400 hover:text-[#D4AF37]">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => remove(p.id)} className="p-1 text-slate-400 hover:text-red-400">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {providers.length === 0 && <div className="py-12 text-center text-slate-500">Chưa có nhà cung cấp nào</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">{editingItem ? 'Cập nhật NCC' : 'Thêm nhà cung cấp'}</h2>
            <div className="space-y-4">
              {!editingItem && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Mã NCC</label>
                  <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.id} onChange={e => setFormData(p => ({ ...p, id: e.target.value }))} placeholder="VD: NCC002" />
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên nhà cung cấp</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.tenNCC} onChange={e => setFormData(p => ({ ...p, tenNCC: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Địa chỉ</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.diaChiNCC} onChange={e => setFormData(p => ({ ...p, diaChiNCC: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Điện thoại</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.dienThoai} onChange={e => setFormData(p => ({ ...p, dienThoai: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700">Hủy</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold hover:bg-yellow-400">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
