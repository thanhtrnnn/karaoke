import { useState, useEffect } from 'react';

interface ImportReceipt {
  id: string;
  maPhieu: string;
  importDate: string;
  totalCost: number;
  trangThai: string;
  provider?: { id: string; name?: string };
}

interface Provider {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit?: string;
}

interface ImportCartItem {
  product: Product;
  quantity: number;
  unitCost: number;
}

export default function ImportReceiptPage() {
  const [receipts, setReceipts] = useState<ImportReceipt[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', maPhieu: '', totalCost: 0, trangThai: 'Đã nhận', providerId: '' });

  // Tìm nhà cung cấp (searchProvider) + tìm sản phẩm (searchProduct) + giỏ chi tiết nhập
  const [providerSearch, setProviderSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [importCart, setImportCart] = useState<ImportCartItem[]>([]);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    Promise.all([
      fetch('/api/import-receipts', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      fetch('/api/providers', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
    ]).then(([ir, pv]) => { setReceipts(ir); setProviders(pv); }).finally(() => setLoading(false));
  }, []);

  // searchProvider(keyword): tìm NCC theo tên qua API (khớp tài liệu)
  useEffect(() => {
    if (!isModalOpen) return;
    const t = setTimeout(() => {
      const url = providerSearch.trim()
        ? `/api/providers?keyword=${encodeURIComponent(providerSearch.trim())}`
        : '/api/providers';
      fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setProviders).catch(console.error);
    }, 300);
    return () => clearTimeout(t);
  }, [providerSearch, isModalOpen]);

  // searchProduct(keyword): tìm sản phẩm theo tên qua API (khớp tài liệu)
  useEffect(() => {
    if (!isModalOpen) return;
    const t = setTimeout(() => {
      const url = productSearch.trim()
        ? `/api/products?keyword=${encodeURIComponent(productSearch.trim())}`
        : '/api/products';
      fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setProducts).catch(console.error);
    }, 300);
    return () => clearTimeout(t);
  }, [productSearch, isModalOpen]);

  const openCreate = () => {
    setFormData({ id: '', maPhieu: '', totalCost: 0, trangThai: 'Đã nhận', providerId: providers[0]?.id || '' });
    setProviderSearch('');
    setProductSearch('');
    setImportCart([]);
    setIsModalOpen(true);
  };

  const addProductToCart = (p: Product) => {
    setImportCart(prev => {
      const existing = prev.find(d => d.product.id === p.id);
      if (existing) return prev.map(d => d.product.id === p.id ? { ...d, quantity: d.quantity + 1 } : d);
      return [...prev, { product: p, quantity: 1, unitCost: p.price || 0 }];
    });
  };

  const setCartField = (id: string, field: 'quantity' | 'unitCost', value: number) => {
    setImportCart(prev => prev.map(d => d.product.id === id ? { ...d, [field]: Math.max(field === 'quantity' ? 1 : 0, value) } : d));
  };

  const removeCartItem = (id: string) => setImportCart(prev => prev.filter(d => d.product.id !== id));

  const cartTotal = importCart.reduce((s, d) => s + d.unitCost * d.quantity, 0);

  const save = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const body = {
      ...formData,
      // Nếu có dòng chi tiết, backend tự tính totalCost và cộng tồn kho; nếu không, dùng totalCost nhập tay
      totalCost: importCart.length > 0 ? cartTotal : formData.totalCost,
      provider: formData.providerId ? { id: formData.providerId } : undefined,
      employee: user.id ? { id: user.id } : undefined,
      details: importCart.map(d => ({ product: { id: d.product.id }, quantity: d.quantity, unitCost: d.unitCost })),
    };
    const res = await fetch('/api/import-receipts', { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.ok) {
      const saved = await res.json();
      setReceipts(prev => [saved, ...prev]);
      setIsModalOpen(false);
      setFormData({ id: '', maPhieu: '', totalCost: 0, trangThai: 'Đã nhận', providerId: '' });
      setImportCart([]);
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Nhập kho</h1>
        <button onClick={openCreate}
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
                <td className="px-4 py-3 text-slate-300">{ir.provider?.name || ir.provider?.id || '—'}</td>
                <td className="px-4 py-3 text-slate-300">{ir.importDate ? new Date(ir.importDate).toLocaleDateString('vi-VN') : '—'}</td>
                <td className="px-4 py-3 text-right text-[#D4AF37]">{ir.totalCost?.toLocaleString('vi-VN')}đ</td>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Tạo phiếu nhập kho</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mã phiếu</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.id} onChange={e => setFormData(p => ({ ...p, id: e.target.value }))} placeholder="VD: PN002" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên/Mã nội bộ</label>
                <input className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.maPhieu} onChange={e => setFormData(p => ({ ...p, maPhieu: e.target.value }))} placeholder="VD: PN-2026-002" />
              </div>
            </div>

            {/* Tìm nhà cung cấp (searchProvider) */}
            <div className="mt-4">
              <label className="block text-sm text-slate-400 mb-1">Nhà cung cấp</label>
              <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  value={providerSearch}
                  onChange={e => setProviderSearch(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] border border-transparent"
                  placeholder="Tìm nhà cung cấp theo tên..."
                />
              </div>
              <select className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.providerId} onChange={e => setFormData(p => ({ ...p, providerId: e.target.value }))}>
                <option value="">-- Chọn NCC --</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Tìm sản phẩm (searchProduct) */}
            <div className="mt-4">
              <label className="block text-sm text-slate-400 mb-1">Tìm sản phẩm để nhập</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] border border-transparent"
                  placeholder="Nhập tên sản phẩm..."
                />
              </div>
              <div className="mt-2 max-h-36 overflow-y-auto border border-slate-700 rounded-lg divide-y divide-slate-700">
                {products.length === 0 && (
                  <div className="px-3 py-4 text-center text-slate-500 text-sm">Không có sản phẩm phù hợp</div>
                )}
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-700/50">
                    <div className="text-sm">
                      <span className="text-white">{p.name}</span>
                      <span className="text-slate-500 ml-2">{(p.price || 0).toLocaleString()}đ</span>
                    </div>
                    <button onClick={() => addProductToCart(p)} className="text-xs px-2.5 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-black transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">add</span>Thêm
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chi tiết phiếu nhập (import details) */}
            <div className="mt-4">
              <label className="block text-sm text-slate-400 mb-1">Chi tiết phiếu nhập</label>
              {importCart.length === 0 ? (
                <div className="px-3 py-4 text-center text-slate-500 text-sm border border-slate-700 rounded-lg">
                  Chưa thêm sản phẩm — có thể nhập tổng tiền thủ công bên dưới
                </div>
              ) : (
                <div className="border border-slate-700 rounded-lg divide-y divide-slate-700">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-slate-400 bg-slate-700/30">
                    <span className="col-span-5">Sản phẩm</span>
                    <span className="col-span-2 text-center">SL</span>
                    <span className="col-span-3 text-center">Đơn giá nhập</span>
                    <span className="col-span-2 text-right">Thành tiền</span>
                  </div>
                  {importCart.map(d => (
                    <div key={d.product.id} className="grid grid-cols-12 gap-2 items-center px-3 py-2">
                      <span className="col-span-5 text-white text-sm truncate">{d.product.name}</span>
                      <input
                        type="number" min={1} value={d.quantity}
                        onChange={e => setCartField(d.product.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="col-span-2 bg-slate-700 text-white rounded px-2 py-1 text-sm text-center"
                      />
                      <input
                        type="number" min={0} value={d.unitCost}
                        onChange={e => setCartField(d.product.id, 'unitCost', parseInt(e.target.value) || 0)}
                        className="col-span-3 bg-slate-700 text-white rounded px-2 py-1 text-sm text-center"
                      />
                      <span className="col-span-1 text-[#D4AF37] text-xs text-right">{(d.unitCost * d.quantity).toLocaleString()}đ</span>
                      <button onClick={() => removeCartItem(d.product.id)} className="col-span-1 text-slate-400 hover:text-red-400 flex justify-end">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2 bg-slate-700/30">
                    <span className="text-slate-300 text-sm font-medium">Tổng tiền</span>
                    <span className="text-[#D4AF37] text-sm font-semibold">{cartTotal.toLocaleString()}đ</span>
                  </div>
                </div>
              )}
            </div>

            {importCart.length === 0 && (
              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-1">Tổng tiền (đ) — nhập thủ công</label>
                <input type="number" className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" value={formData.totalCost} onChange={e => setFormData(p => ({ ...p, totalCost: +e.target.value }))} />
              </div>
            )}

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
