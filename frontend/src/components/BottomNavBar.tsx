import { Link } from 'react-router-dom';

export default function BottomNavBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-4 pb-safe bg-slate-950 border-t border-slate-700/50 shadow-lg">
      <Link to="/" className="flex flex-col items-center justify-center text-[#D4AF37] bg-[#D4AF37]/10 rounded-xl px-3 py-1 transition-transform active:bg-slate-800">
        <span className="material-symbols-outlined text-[24px] mb-1">meeting_room</span>
        <span className="font-label-caps text-[10px] uppercase font-semibold text-[#D4AF37]">Phòng</span>
      </Link>
      <Link to="/orders" className="flex flex-col items-center justify-center text-slate-500 rounded-xl px-3 py-1 transition-transform active:bg-slate-800">
        <span className="material-symbols-outlined text-[24px] mb-1">restaurant_menu</span>
        <span className="font-label-caps text-[10px] uppercase font-semibold text-slate-500">Gọi món</span>
      </Link>
      <Link to="/tasks" className="flex flex-col items-center justify-center text-slate-500 rounded-xl px-3 py-1 transition-transform active:bg-slate-800">
        <span className="material-symbols-outlined text-[24px] mb-1">assignment</span>
        <span className="font-label-caps text-[10px] uppercase font-semibold text-slate-500">Nhiệm vụ</span>
      </Link>
      <Link to="/profile" className="flex flex-col items-center justify-center text-slate-500 rounded-xl px-3 py-1 transition-transform active:bg-slate-800">
        <span className="material-symbols-outlined text-[24px] mb-1">person</span>
        <span className="font-label-caps text-[10px] uppercase font-semibold text-slate-500">Cá nhân</span>
      </Link>
    </nav>
  );
}
