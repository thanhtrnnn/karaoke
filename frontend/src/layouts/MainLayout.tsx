import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen bg-surface pb-20 md:pb-0">
        <TopAppBar />
        <div className="flex-1 w-full relative">
          <Outlet />
        </div>
      </main>
      <BottomNavBar />
    </div>
  );
}
