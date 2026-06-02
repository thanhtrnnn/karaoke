import { useState, useEffect } from 'react';

interface RoomType {
  id: string;
  tenLoai: string;
  sucChua: number;
  giaCuoc: number;
  trangThai: boolean;
}

export default function RoomTypePage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState({ id: '', tenLoai: '', sucChua: 10, giaCuoc: 100000, trangThai: true });

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/room-types', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setRoomTypes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ id: '', tenLoai: '', sucChua: 10, giaCuoc: 100000, trangThai: true });
    setIsModalOpen(true);
  };

  const openEdit = (rt: RoomType) => {
    setEditingItem(rt);
    setFormData({ id: rt.id, tenLoai: rt.tenLoai, sucChua: rt.sucChua, giaCuoc: rt.giaCuoc, trangThai: rt.trangThai });
    setIsModalOpen(true);
  };

  const save = async () => {
    const url = editingItem ? `/api/room-types/${editingItem.id}` : '/api/room-types';
    const method = editingItem ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers, body: JSON.stringify(formData) });
    if (res.ok) {
      const saved = await res.json();
      if (editingItem) {
        setRoomTypes(prev => prev.map(r => r.id === saved.id ? saved : r));
      } else {
        setRoomTypes(prev => [...prev, saved]);
      }
      setIsModalOpen(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Xóa loại phòng này?')) return;
    const res = await fetch(`/api/room-types/${id}`, { method: 'DELETE', headers });
    if (res.ok) setRoomTypes(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return <div className="p-6 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Loại phòng</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm loại phòng
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Mã</th>
              <th className="px-4 py-3 text-left">Tên loại</th>
              <th className="px-4 py-3 text-right">Sức chứa</th>
              <th className="px-4 py-3 text-right">Giá/giờ</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.map(rt => (
              <tr key={rt.id} className="border-t border-slate-700 hover:bg-slate-750">
                <td className="px-4 py-3 text-slate-400 font-mono">{rt.id}</td>
                <td className="px-4 py-3 text-white font-medium">{rt.tenLoai}</td>
                <td className="px-4 py-3 text-right text-slate-300">{rt.sucChua} người</td>
                <td className="px-4 py-3 text-right text-[#D4AF37]">{rt.giaCuoc?.toLocaleString('vi-VN')}đ</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${rt.trangThai ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                    {rt.trangThai ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(rt)} className="p-1 text-slate-400 hover:text-[#D4AF37]">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => remove(rt.id)} className="p-1 text-slate-400 hover:text-red-400">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roomTypes.length === 0 && (
          <div className="py-12 text-center text-slate-500">Chưa có loại phòng nào</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">{editingItem ? 'Cập nhật loại phòng' : 'Thêm loại phòng'}</h2>
            <div className="space-y-4">
              {!editingItem && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Mã loại phòng</label>
                  <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.id} onChange={e => setFormData(p => ({ ...p, id: e.target.value }))} placeholder="VD: LR004" />
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên loại phòng</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.tenLoai} onChange={e => setFormData(p => ({ ...p, tenLoai: e.target.value }))} placeholder="VD: VIP, Thường, Deluxe" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Sức chứa (người)</label>
                <input type="number" className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.sucChua} onChange={e => setFormData(p => ({ ...p, sucChua: +e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Giá/giờ (đ)</label>
                <input type="number" className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.giaCuoc} onChange={e => setFormData(p => ({ ...p, giaCuoc: +e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="trangThai" checked={formData.trangThai} onChange={e => setFormData(p => ({ ...p, trangThai: e.target.checked }))} />
                <label htmlFor="trangThai" className="text-sm text-slate-300">Đang hoạt động</label>
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
