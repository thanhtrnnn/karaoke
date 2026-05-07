import { useState, useEffect, useRef } from 'react';

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: string;
  price: string;
  status: string;
  color: string;
  canBook: boolean;
}

export default function RoomManagement() {
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: '', name: '', type: 'VIP', capacity: '', price: '' });
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/rooms', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRoomList(data.map((r: any) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            capacity: `${r.capacity} người`,
            price: `${Number(r.hourlyPrice).toLocaleString()}đ`,
            status: r.status === 'AVAILABLE' ? 'Trống' : r.status === 'OCCUPIED' ? 'Đang dùng' : r.status === 'RESERVED' ? 'Đặt trước' : r.status === 'CLEANING' ? 'Đang dọn' : 'Bảo trì',
            color: r.status === 'AVAILABLE' ? 'status-available' : r.status === 'OCCUPIED' ? 'status-occupied' : 'status-cleaning',
            canBook: r.status === 'AVAILABLE',
          })));
        }
      } catch (e) {
        console.error('Failed to fetch rooms:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({ id: '', name: '', type: 'VIP', capacity: '', price: '' });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEdit = (room: any) => {
    setIsEditing(true);
    setFormData({
      id: room.id,
      name: room.name,
      type: room.type,
      capacity: room.capacity.replace(/\D/g, ''),
      price: room.price
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng ${id} không?`)) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/rooms/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setRoomList(roomList.filter(r => r.id !== id));
        }
      } catch (e) {
        console.error('Failed to delete room:', e);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.capacity || !formData.price) {
      alert('Vui lòng điền đầy đủ thông tin Tên, Sức chứa và Giá.');
      return;
    }

    const body = {
      name: formData.name,
      type: formData.type,
      capacity: parseInt(formData.capacity) || 0,
      hourlyPrice: parseInt(formData.price.replace(/[^0-9]/g, '')) || 0,
    };

    try {
      const token = localStorage.getItem('token');
      if (isEditing) {
        const res = await fetch(`/api/rooms/${formData.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const updated = await res.json();
          setRoomList(roomList.map(r => r.id === formData.id ? {
            ...r,
            name: updated.name,
            type: updated.type,
            capacity: `${updated.capacity} người`,
            price: `${Number(updated.hourlyPrice).toLocaleString()}đ`,
          } : r));
          alert('Cập nhật phòng thành công!');
        }
      } else {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const created = await res.json();
          setRoomList([...roomList, {
            id: created.id,
            name: created.name,
            type: created.type,
            capacity: `${created.capacity} người`,
            price: `${Number(created.hourlyPrice).toLocaleString()}đ`,
            status: 'Trống',
            color: 'status-available',
            canBook: true,
          }]);
          alert('Thêm phòng mới thành công!');
        }
      }
    } catch (e) {
      console.error('Failed to save room:', e);
    }

    setFormData({ id: '', name: '', type: 'VIP', capacity: '', price: '' });
    setIsEditing(false);
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải danh sách phòng...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-h1 text-white">Quản lý phòng hát</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm phòng mới
        </button>
      </div>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full text-left whitespace-nowrap"><thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low"><th className="py-4 px-6">Mã</th><th className="py-4 px-6">Tên</th><th className="py-4 px-6">Loại</th><th className="py-4 px-6">Sức chứa</th><th className="py-4 px-6">Giá/giờ</th><th className="py-4 px-6">Thao tác</th></tr></thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {roomList.map((r) => (
              <tr key={r.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-white font-medium">{r.id}</td>
                <td className="py-4 px-6">{r.name}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-md font-label-caps ${r.type === 'VIP' ? 'bg-primary-container/10 text-primary-container border border-primary-container/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}>
                    {r.type}
                  </span>
                </td>
                <td className="py-4 px-6">{r.capacity}</td>
                <td className="py-4 px-6 text-primary-container">{r.price}</td>
                <td className="py-4 px-6 flex gap-2">
                  <button
                    onClick={() => handleEdit(r)}
                    className="px-3 py-1.5 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:border-primary-container hover:text-primary-container transition-colors font-label-caps"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-3 py-1.5 bg-status-occupied/10 border border-status-occupied/20 rounded-lg text-status-occupied hover:bg-status-occupied hover:text-white transition-colors font-label-caps"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div ref={formRef} className={`bg-surface-container rounded-xl border p-6 transition-colors duration-300 ${isEditing ? 'border-[#D4AF37]' : 'border-slate-700/50'}`}>
        <h2 className="font-h2 text-white mb-4">{isEditing ? `Sửa thông tin phòng ${formData.id}` : 'Thêm phòng mới'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-label-caps text-slate-400 uppercase block mb-2">Tên phòng</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
              placeholder="Ví dụ: VIP 03"
            />
          </div>
          <div>
            <label className="font-label-caps text-slate-400 uppercase block mb-2">Loại</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
            >
              <option value="VIP">VIP</option>
              <option value="Thường">Thường</option>
              <option value="Deluxe">Deluxe</option>
            </select>
          </div>
          <div>
            <label className="font-label-caps text-slate-400 uppercase block mb-2">Sức chứa (Người)</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
              placeholder="15"
            />
          </div>
          <div>
            <label className="font-label-caps text-slate-400 uppercase block mb-2">Giá/giờ</label>
            <input
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
              placeholder="150,000đ"
            />
          </div>
          <div>
            <label className="font-label-caps text-slate-400 uppercase block mb-2">Trạng thái</label>
            <select className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container">
              <option>Hoạt động</option>
              <option>Bảo trì</option>
            </select>
          </div>
          <div className="flex items-end gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
            >
              Lưu
            </button>
            <button
              onClick={() => {
                setFormData({ id: '', name: '', type: 'VIP', capacity: '', price: '' });
                setIsEditing(false);
              }}
              className="flex-1 py-3 bg-transparent border border-slate-700/50 text-slate-400 rounded-lg font-body-md hover:border-status-occupied hover:text-status-occupied transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
