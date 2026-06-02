import { useState, useEffect } from 'react';

interface Facility {
  id: string;
  tenTaiSan: string;
  loai: string;
  trangThai: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Facility | null>(null);
  const [formData, setFormData] = useState({ id: '', tenTaiSan: '', loai: '', trangThai: 'Bình thường', roomId: '' });

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    Promise.all([
      fetch('/api/facilities', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
    ]).then(([f, r]) => { setFacilities(f); setRooms(r); }).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ id: '', tenTaiSan: '', loai: '', trangThai: 'Bình thường', roomId: rooms[0]?.id || '' });
    setIsModalOpen(true);
  };

  const openEdit = (f: Facility) => {
    setEditingItem(f);
    setFormData({ id: f.id, tenTaiSan: f.tenTaiSan, loai: f.loai, trangThai: f.trangThai, roomId: f.room?.id || '' });
    setIsModalOpen(true);
  };

  const save = async () => {
    const body = { ...formData, room: formData.roomId ? { id: formData.roomId } : undefined };
    const url = editingItem ? `/api/facilities/${editingItem.id}` : '/api/facilities';
    const method = editingItem ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
    if (res.ok) {
      const saved = await res.json();
      if (editingItem) {
        setFacilities(prev => prev.map(f => f.id === saved.id ? saved : f));
      } else {
        setFacilities(prev => [...prev, saved]);
      }
      setIsModalOpen(false);
    }
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

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Mã</th>
              <th className="px-4 py-3 text-left">Tên tài sản</th>
              <th className="px-4 py-3 text-left">Loại</th>
              <th className="px-4 py-3 text-left">Phòng</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map(f => (
              <tr key={f.id} className="border-t border-slate-700 hover:bg-slate-750">
                <td className="px-4 py-3 text-slate-400 font-mono">{f.id}</td>
                <td className="px-4 py-3 text-white font-medium">{f.tenTaiSan}</td>
                <td className="px-4 py-3 text-slate-300">{f.loai}</td>
                <td className="px-4 py-3 text-slate-300">{f.room?.name || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${f.trangThai === 'Bình thường' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {f.trangThai}
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
        {facilities.length === 0 && <div className="py-12 text-center text-slate-500">Chưa có tài sản nào</div>}
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
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.tenTaiSan} onChange={e => setFormData(p => ({ ...p, tenTaiSan: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Loại</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.loai} onChange={e => setFormData(p => ({ ...p, loai: e.target.value }))} placeholder="VD: Thiết bị âm thanh" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Phòng</label>
                <select className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.roomId} onChange={e => setFormData(p => ({ ...p, roomId: e.target.value }))}>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Trạng thái</label>
                <select className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.trangThai} onChange={e => setFormData(p => ({ ...p, trangThai: e.target.value }))}>
                  <option>Bình thường</option>
                  <option>Hư hỏng</option>
                  <option>Đang sửa</option>
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
