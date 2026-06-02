import { useState, useEffect } from 'react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
}

export default function BranchPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', address: '', phone: '', active: true });

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/branches', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ id: '', name: '', address: '', phone: '', active: true });
    setIsModalOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditingItem(b);
    setFormData({ id: b.id, name: b.name, address: b.address, phone: b.phone, active: b.active });
    setIsModalOpen(true);
  };

  const save = async () => {
    if (!formData.name) { alert('Vui lòng nhập tên chi nhánh.'); return; }
    const url = editingItem ? `/api/branches/${editingItem.id}` : '/api/branches';
    const method = editingItem ? 'PUT' : 'POST';
    const body = editingItem
      ? { name: formData.name, address: formData.address, phone: formData.phone, active: formData.active }
      : { id: formData.id || `CN${crypto.randomUUID().slice(0, 6).toUpperCase()}`, name: formData.name, address: formData.address, phone: formData.phone, active: formData.active };
    const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
    if (res.ok) {
      const saved = await res.json();
      if (editingItem) {
        setBranches(prev => prev.map(b => b.id === saved.id ? saved : b));
      } else {
        setBranches(prev => [...prev, saved]);
      }
      setIsModalOpen(false);
    } else {
      alert('Lưu thất bại. Kiểm tra dữ liệu và thử lại.');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Xóa chi nhánh này? Thao tác không thể hoàn tác.')) return;
    const res = await fetch(`/api/branches/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      setBranches(prev => prev.filter(b => b.id !== id));
    } else {
      alert('Không thể xóa. Chi nhánh có thể đang có phòng hoặc nhân viên liên kết.');
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Chi nhánh</h1>
          <p className="text-slate-400 text-sm mt-1">UC16 — Quản lý hệ thống chi nhánh</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-yellow-400">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm chi nhánh
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Mã CN</th>
              <th className="px-4 py-3 text-left">Tên chi nhánh</th>
              <th className="px-4 py-3 text-left">Địa chỉ</th>
              <th className="px-4 py-3 text-left">Điện thoại</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {branches.map(b => (
              <tr key={b.id} className="border-t border-slate-700 hover:bg-slate-750">
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{b.id}</td>
                <td className="px-4 py-3 text-white font-medium">{b.name}</td>
                <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{b.address || '—'}</td>
                <td className="px-4 py-3 text-slate-300">{b.phone || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${b.active !== false ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                    {b.active !== false ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(b)} className="p-1 text-slate-400 hover:text-[#D4AF37]">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => remove(b.id)} className="p-1 text-slate-400 hover:text-red-400">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {branches.length === 0 && <div className="py-12 text-center text-slate-500">Chưa có chi nhánh nào</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">{editingItem ? 'Cập nhật chi nhánh' : 'Thêm chi nhánh'}</h2>
            <div className="space-y-4">
              {!editingItem && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Mã chi nhánh</label>
                  <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                    value={formData.id} onChange={e => setFormData(p => ({ ...p, id: e.target.value }))}
                    placeholder="VD: CN002 (để trống tự sinh)" />
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên chi nhánh <span className="text-red-400">*</span></label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                  value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="VD: Famtaoke Quận 3" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Địa chỉ</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                  value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                  placeholder="VD: 456 Lê Lợi, Quận 3, TP.HCM" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Điện thoại</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                  value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="VD: 02898765432" />
              </div>
              <div className="flex items-center gap-3">
                <label className="block text-sm text-slate-400">Hoạt động</label>
                <button onClick={() => setFormData(p => ({ ...p, active: !p.active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.active ? 'bg-green-600' : 'bg-slate-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
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
