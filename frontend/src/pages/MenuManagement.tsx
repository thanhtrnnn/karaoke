import { useState } from 'react';
import { mockMenu } from '../data/mockData';

export default function MenuManagement() {
  const [items, setItems] = useState(mockMenu);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Tất cả');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', cat: 'Đồ uống', price: '', stock: '', active: true });

  const filteredItems = items.filter(item => 
    (filterCat === 'Tất cả' || item.cat === filterCat) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, cat: item.cat, price: item.price, stock: item.stock.toString(), active: item.active });
    } else {
      setEditingItem(null);
      setFormData({ name: '', cat: 'Đồ uống', price: '', stock: '', active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Vui lòng điền đủ thông tin tên món, giá và tồn kho.');
      return;
    }

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { 
        ...editingItem, 
        ...formData,
        price: typeof formData.price === 'string' ? parseInt(formData.price.replace(/,/g, '').replace('đ', '')) || 0 : formData.price,
        stock: parseInt(formData.stock) || 0
      } : i));
      alert('Cập nhật món thành công!');
    } else {
      const newId = `SP00${items.length + 1}`;
      setItems([...items, { 
        id: newId, 
        ...formData, 
        price: typeof formData.price === 'string' ? parseInt(formData.price.replace(/,/g, '').replace('đ', '')) || 0 : formData.price,
        stock: parseInt(formData.stock) || 0,
        image: '/images/snack.png'
      }]);
      alert('Thêm món mới thành công!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa món này khỏi Menu?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-h1 text-white">Quản lý menu sản phẩm</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>Thêm món
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-5 border border-slate-700/50">
        <div className="relative min-w-[220px]">
          <select 
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="w-full appearance-none bg-none bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-4 pr-10 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all cursor-pointer"
          >
            <option value="Tất cả">Tất cả danh mục</option>
            <option value="Đồ uống">Đồ uống</option>
            <option value="Đồ ăn">Đồ ăn</option>
            <option value="Trái cây">Trái cây</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
        </div>
        <div className="relative flex-1 min-w-[250px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-11 pr-4 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all placeholder:text-slate-500" 
            placeholder="Tìm kiếm món ăn, đồ uống..." 
          />
        </div>
      </div>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low"><th className="py-4 px-6">Mã</th><th className="py-4 px-6">Tên món</th><th className="py-4 px-6">Danh mục</th><th className="py-4 px-6">Giá</th><th className="py-4 px-6">Tồn kho</th><th className="py-4 px-6">Trạng thái hiển thị</th><th className="py-4 px-6 text-right">Thao tác</th></tr></thead>
        <tbody className="font-body-md divide-y divide-slate-800/50">
          {filteredItems.length === 0 && (
            <tr><td colSpan={7} className="py-8 text-center text-slate-500">Không tìm thấy món nào.</td></tr>
          )}
          {filteredItems.map((item) => (
            <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
              <td className="py-4 px-6 text-slate-400 font-medium">{item.id}</td>
              <td className="py-4 px-6 text-white">{item.name}</td>
              <td className="py-4 px-6">
                <span className="px-2.5 py-1 rounded-md bg-surface-secondary text-slate-300 font-label-caps border border-slate-700/50">{item.cat}</span>
              </td>
              <td className="py-4 px-6 text-primary-container">{item.price}</td>
              <td className="py-4 px-6">{item.stock}</td>
              <td className="py-4 px-6">
                {item.active ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-status-available/10 text-status-available border border-status-available/20 font-label-caps">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>Đang bán
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-status-occupied/10 text-status-occupied border border-status-occupied/20 font-label-caps">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-occupied"></span>Tạm ngưng
                  </span>
                )}
              </td>
              <td className="py-4 px-6 flex justify-end gap-2">
                <button onClick={() => handleOpenModal(item)} className="px-3 py-1.5 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:border-primary-container hover:text-primary-container transition-colors font-label-caps">Sửa</button>
                <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 bg-status-occupied/10 border border-status-occupied/20 rounded-lg text-status-occupied hover:bg-status-occupied hover:text-white transition-colors font-label-caps">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-surface-container border border-slate-700/50 rounded-2xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-fade-in">
            <div className="bg-surface-container-low px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="font-h2 text-white">{editingItem ? 'Sửa thông tin món' : 'Thêm món mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="font-label-caps text-slate-400 uppercase block mb-1">Tên món</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:border-primary-container outline-none" placeholder="Ví dụ: Bia Saigon Special" />
              </div>
              <div>
                <label className="font-label-caps text-slate-400 uppercase block mb-1">Danh mục</label>
                <select value={formData.cat} onChange={e => setFormData({...formData, cat: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:border-primary-container outline-none">
                  <option>Đồ uống</option>
                  <option>Đồ ăn</option>
                  <option>Trái cây</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-slate-400 uppercase block mb-1">Giá bán</label>
                  <input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-primary-container font-body-md focus:border-primary-container outline-none" placeholder="25,000đ" />
                </div>
                <div>
                  <label className="font-label-caps text-slate-400 uppercase block mb-1">Tồn kho ban đầu</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:border-primary-container outline-none" placeholder="100" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-2 bg-surface-secondary p-3 rounded-lg border border-border-subtle hover:border-primary-container/50 transition-colors">
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 accent-primary-container" />
                <span className="text-white font-body-md">Đang bán (Hiển thị cho Lễ tân)</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-slate-700/50 bg-surface-container-low flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-body-md text-slate-300 hover:text-white transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-6 py-2.5 rounded-lg font-body-md font-semibold bg-primary-container text-on-primary-container hover:bg-primary transition-colors">Lưu lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
