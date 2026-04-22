import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="bg-bg-base text-text-primary antialiased h-screen w-full flex overflow-hidden">
      <Outlet />
    </div>
  );
}
