import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface MenuItem {
  id: string;
  name: string;
  cat: string;
  price: number;
  stock: number;
  image: string;
  active: boolean;
}

export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const roomFromUrl = searchParams.get('room') || '';

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState(roomFromUrl);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (e) { /* ignore */ }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/menu-items', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMenuItems(data.map((item: any) => ({
            id: item.id,
            name: item.name,
            cat: item.category,
            price: item.price,
            stock: item.stock,
            image: item.image || '/images/snack.png',
            active: item.active
          })));
        }
      } catch (e) {
        console.error('Failed to fetch menu items:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = ['Tất cả', 'Đồ uống', 'Đồ ăn', 'Trái cây', 'Khác'];

  const filteredProducts = menuItems.filter(p => {
    const matchCategory = activeCategory === 'Tất cả' || p.cat === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch && p.active;
  });

  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleSendOrder = async () => {
    if (cart.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }
    if (!selectedRoom) {
      alert('Vui lòng chọn phòng trước khi gửi order!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          items: cart.map(item => ({ menuItemId: item.id, quantity: item.qty })),
        }),
      });
      if (res.ok) {
        alert('Đã gửi Order xuống bếp/bar thành công!');
        setCart([]);
      } else {
        alert('Gửi order thất bại!');
      }
    } catch (e) {
      console.error('Failed to send order:', e);
      alert('Lỗi kết nối server.');
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải menu...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-h1 text-white">Gọi món</h1>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
        >
          <option value="">-- Chọn phòng --</option>
          {rooms.map((r: any) => (
            <option key={r.id} value={r.id}>{r.id} - {r.name}</option>
          ))}
        </select>
      </div>
      <div className="relative w-full md:w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          className="w-full bg-surface-container border border-slate-700/50 rounded-full py-2.5 pl-10 pr-10 text-sm text-on-surface focus:outline-none focus:border-primary-container placeholder:text-slate-500"
          placeholder="Tìm kiếm món..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-lg font-body-md transition-colors ${activeCategory === c ? 'bg-primary-container/10 border border-primary-container text-primary-container font-medium' : 'bg-transparent border border-slate-700/50 text-slate-400 hover:border-primary-container hover:text-primary-container'}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4 h-fit">
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              Không tìm thấy món nào phù hợp.
            </div>
          )}
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-surface-container rounded-xl border border-slate-700/50 p-4 hover:border-primary-container/50 transition-colors flex flex-col h-full">
              <div className="w-full h-32 rounded-lg bg-surface-container-high mb-3 border border-slate-700/50 overflow-hidden shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-body-md text-white font-medium line-clamp-1">{p.name}</h3>
                <p className="text-primary-container font-semibold mt-1">{p.price.toLocaleString()}đ</p>
                <p className="text-slate-500 text-sm mt-1">Tồn: {p.stock}</p>
                <div className="mt-auto pt-3">
                  <button
                    onClick={() => addToCart(p)}
                    className="w-full py-2 bg-primary-container/10 text-primary-container border border-primary-container/30 rounded-lg font-label-caps hover:bg-primary-container hover:text-on-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>Thêm
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 h-fit">
          <h2 className="font-h2 text-white mb-4">Giỏ hàng</h2>
          <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2">
            {cart.length === 0 && (
              <p className="text-slate-500 text-center py-8">Chưa có món nào trong giỏ.</p>
            )}
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-slate-700/30">
                <div className="flex-1">
                  <p className="text-white font-body-md">{item.name}</p>
                  <p className="text-primary-container text-sm">{(item.price * item.qty).toLocaleString()}đ</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded bg-surface-container-high border border-slate-700/50 text-slate-400 flex items-center justify-center hover:text-white transition-colors">-</button>
                  <span className="w-6 text-center text-white font-medium">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded bg-surface-container-high border border-slate-700/50 text-slate-400 flex items-center justify-center hover:text-white transition-colors">+</button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-1 text-status-occupied/50 hover:text-status-occupied transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-700/50 pt-4 flex justify-between items-center mb-4">
            <span className="font-body-md text-slate-400">Tổng:</span><span className="font-h2 text-primary-container">{cartTotal.toLocaleString()}đ</span>
          </div>
          <button
            onClick={handleSendOrder}
            className="w-full py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
          >
            Gửi order
          </button>
        </div>
      </div>
    </div>
  );
}
