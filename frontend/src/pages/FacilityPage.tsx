import { useState, useEffect } from 'react';

interface Facility {
  id: string;
  name: string;
  compensationPrice: number;
  unit: string;
  stock: number;
  room?: { id: string; name: string };
}

interface Room {
  id: string;
  name: string;
}

export default function FacilityPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Facility | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', compensationPrice: '', unit: 'Cái', stock: '1', roomId: '' });

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // searchFacility(keyword): tìm tài sản theo tên qua API (khớp tài liệu)
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
    Promise.all([
      fetch('/api/facilities', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/rooms', { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([facs, rms]) => {
      setFacilities(facs);
      setRooms(rms.map((r: any) => ({ id: r.id, name: r.name })));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Gọi lại API với keyword khi gõ ô tìm kiếm (debounce nhẹ)
  useEffect(() => {
    const t = setTimeout(() => fetchFacilities(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ id: '', name: '', compensationPrice: '', unit: 'Cái', stock: '1', roomId: rooms[0]?.id || '' });
    setIsModalOpen(true);
  };

  const openEdit = (f: Facility) => {
    setEditingItem(f);
    setFormData({ id: f.id, name: f.name, compensationPrice: String(f.compensationPrice || ''), unit: f.unit || 'Cái', stock: String(f.stock || 1), roomId: f.room?.id || '' });
    setIsModalOpen(true);
  };

  const save = async () => {
    if (!formData.name) { alert('Vui lòng nhập tên tài sản.'); return; }
    const url = editingItem ? `/api/facilities/${editingItem.id}` : '/api/facilities';
    const method = editingItem ? 'PUT' : 'POST';
    const body = {
      name: formData.name,
      compensationPrice: Number(formData.compensationPrice) || 0,
      unit: formData.unit,
      stock: Number(formData.stock) || 0,
      room: formData.roomId ? { id: formData.roomId } : undefined,
    };
    const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
    if (res.ok) {
      const saved = await res.json();
      if (editingItem) setFacilities(prev => prev.map(f => f.id === saved.id ? saved : f));
      else setFacilities(prev => [...prev, saved]);
      setIsModalOpen(false);
    } else alert('Lưu thất bại.');
  };

  if (loading) return <div className="p-6 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Tài sản phòng</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-yellow-400">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm tài sản
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-[#D4AF37] placeholder:text-slate-500"
          placeholder="Tìm tài sản theo tên..."
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Mã</th>
              <th className="px-4 py-3 text-left">Tên tài sản</th>
              <th className="px-4 py-3 text-left">Đơn vị</th>
              <th className="px-4 py-3 text-left">Giá bồi cấp</th>
              <th className="px-4 py-3 text-center">Tồn kho</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map(f => (
              <tr key={f.id} className="border-t border-slate-700 hover:bg-slate-750">
                <td className="px-4 py-3 text-slate-400 font-mono">{f.id}</td>
                <td className="px-4 py-3 text-white font-medium">{f.name}</td>
                <td className="px-4 py-3 text-slate-300">{f.unit}</td>
                <td className="px-4 py-3 text-slate-300">{f.compensationPrice?.toLocaleString()}đ</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${f.stock > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {f.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => openEdit(f)} className="p-1 text-slate-400 hover:text-[#D4AF37]">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {facilities.length === 0 && <div className="py-12 text-center text-slate-500">{search ? 'Không tìm thấy tài sản phù hợp' : 'Chưa có tài sản nào'}</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">{editingItem ? 'Cập nhật tài sản' : 'Thêm tài sản'}</h2>
            <div className="space-y-4">
              {!editingItem && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Mã tài sản</label>
                  <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.id} onChange={e => setFormData(p => ({ ...p, id: e.target.value }))} placeholder="VD: TS004" />
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên tài sản</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Đơn vị</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))} placeholder="Cái, Bộ..." />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Giá bồi cấp (đ)</label>
                <input type="number" className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.compensationPrice} onChange={e => setFormData(p => ({ ...p, compensationPrice: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tồn kho</label>
                <input type="number" className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.stock} onChange={e => setFormData(p => ({ ...p, stock: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Phòng</label>
                <select className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.roomId} onChange={e => setFormData(p => ({ ...p, roomId: e.target.value }))}>
                  <option value="">Không gán phòng</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
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
