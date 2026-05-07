import { useState, useEffect, useRef } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  cat: string;
  stock: number;
  unit: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Tất cả');
  const [filterStock, setFilterStock] = useState('Tất cả');

  const [importRows, setImportRows] = useState([{ id: 1, productId: '', qty: '', price: '' }]);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/menu-items', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            cat: p.category,
            stock: p.stock,
            unit: p.category === 'Đồ uống' ? 'Lon/Chai' : 'Đĩa',
          })));
        }
      } catch (e) {
        console.error('Failed to fetch inventory:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = filterCat === 'Tất cả' || p.cat === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStock = filterStock === 'Tất cả' || (filterStock === 'Sắp hết' && p.stock <= 15);
    return matchCat && matchSearch && matchStock;
  });

  const handleAddRow = () => {
    setImportRows([...importRows, { id: Date.now(), productId: '', qty: '', price: '' }]);
  };

  const handleRowChange = (id: number, field: string, value: string) => {
    setImportRows(importRows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleRemoveRow = (id: number) => {
    if (importRows.length > 1) {
      setImportRows(importRows.filter(row => row.id !== id));
    }
  };

  const handleSaveImport = async () => {
    const validRows = importRows.filter(r => r.productId && r.qty);
    if (validRows.length === 0) {
      alert('Vui lòng chọn sản phẩm và nhập số lượng.');
      return;
    }

    const token = localStorage.getItem('token');
    let successCount = 0;

    for (const row of validRows) {
      const product = products.find(p => p.id === row.productId);
      if (!product) continue;

      const newStock = product.stock + (parseInt(row.qty) || 0);
      try {
        const res = await fetch(`/api/menu-items/${row.productId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: product.id,
            name: product.name,
            category: product.cat,
            price: 0,
            stock: newStock,
            active: true,
          }),
        });
        if (res.ok) successCount++;
      } catch (e) {
        console.error(`Failed to update stock for ${row.productId}:`, e);
      }
    }

    if (successCount > 0) {
      // Refresh products
      const res = await fetch('/api/menu-items', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          cat: p.category,
          stock: p.stock,
          unit: p.category === 'Đồ uống' ? 'Lon/Chai' : 'Đĩa',
        })));
      }
      alert(`Nhập kho thành công ${successCount}/${validRows.length} sản phẩm!`);
    } else {
      alert('Nhập kho thất bại!');
    }
    setImportRows([{ id: Date.now(), productId: '', qty: '', price: '' }]);
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải dữ liệu kho...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-h1 text-white">Quản lý kho</h1>
        <button
          onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>Nhập kho
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-5 border border-slate-700/50">
        <div className="relative flex-1 min-w-[250px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-11 pr-4 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all placeholder:text-slate-500"
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>
        <div className="relative min-w-[220px]">
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="w-full appearance-none bg-none bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-4 pr-10 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all cursor-pointer"
          >
            <option value="Tất cả">Tất cả danh mục</option>
            <option value="Đồ uống">Đồ uống</option>
            <option value="Đồ ăn">Đồ ăn</option>
            <option value="Trái cây">Trái cây</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
        </div>
        <div className="relative min-w-[220px]">
          <select
            value={filterStock}
            onChange={e => setFilterStock(e.target.value)}
            className="w-full appearance-none bg-none bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-4 pr-10 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all cursor-pointer"
          >
            <option value="Tất cả">Tất cả trạng thái tồn</option>
            <option value="Sắp hết">Sắp hết (≤ 15)</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
        </div>
      </div>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
              <th className="py-4 px-6">Mã SP</th>
              <th className="py-4 px-6">Tên sản phẩm</th>
              <th className="py-4 px-6">Tồn kho</th>
              <th className="py-4 px-6">Đơn vị</th>
              <th className="py-4 px-6">Cảnh báo</th>
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-slate-400">{p.id}</td>
                <td className="py-4 px-6 text-white font-medium">{p.name}</td>
                <td className="py-4 px-6">{p.stock}</td>
                <td className="py-4 px-6">{p.unit}</td>
                <td className="py-4 px-6">
                  {p.stock <= 15 && (
                    <span className="text-status-cleaning flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">warning</span>Sắp hết
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div ref={formRef} className="bg-surface-container rounded-xl border border-slate-700/50 p-6 mt-8">
        <h2 className="font-h2 text-white mb-4">Phiếu nhập kho</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input type="date" className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="space-y-3">
            {importRows.map((row) => (
              <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4">
                  <select
                    value={row.productId}
                    onChange={(e) => handleRowChange(row.id, 'productId', e.target.value)}
                    className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) => handleRowChange(row.id, 'qty', e.target.value)}
                    className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
                    placeholder="Số lượng"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    type="number"
                    value={row.price}
                    onChange={(e) => handleRowChange(row.id, 'price', e.target.value)}
                    className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
                    placeholder="Đơn giá nhập"
                  />
                </div>
                <div className="md:col-span-2 flex items-center text-primary-container font-medium">
                  {row.qty && row.price ? (parseInt(row.qty) * parseInt(row.price)).toLocaleString() + 'đ' : '(tự tính)'}
                </div>
                <div className="md:col-span-1">
                  <button
                    onClick={() => handleRemoveRow(row.id)}
                    className="text-status-occupied hover:bg-status-occupied/10 p-2 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddRow}
            className="text-primary-container font-label-caps hover:text-primary transition-colors flex items-center gap-1 mt-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>Thêm dòng
          </button>

          <div className="flex gap-3 pt-6 border-t border-slate-700/50 mt-6">
            <button
              onClick={handleSaveImport}
              className="px-8 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
            >
              Lưu Phiếu Nhập
            </button>
            <button
              onClick={() => setImportRows([{ id: Date.now(), productId: '', qty: '', price: '' }])}
              className="px-8 py-3 bg-transparent border border-slate-700/50 text-slate-400 rounded-lg font-body-md hover:border-status-occupied hover:text-status-occupied transition-colors"
            >
              Làm lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
