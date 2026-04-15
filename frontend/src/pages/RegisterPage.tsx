import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('reg-username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('reg-password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: 'CLIENT' }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Đăng ký thất bại. Tên đăng nhập hoặc email đã tồn tại.');
      }

      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Left Side: Image / Branding */}
      <div className="hidden md:flex md:w-1/2 relative bg-surface-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-transparent z-10"></div>
        <img alt="Famtaoke Lounge" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzkDgumNEBJkgViLuKxs_3vwoiG2fciD6NaXLgbB5WlcywiXCOUJMld58tmxN9je7RQ7v71GwNu0TL2HAXgWLytVOyrBjtwTu_F-dETDKMoEvyKencqUepaUMYxMG2PPDAP7OY_EVEp1rqojJAReAmVGLra9UATghv3L92qb5ntGpk6-8_5yUXgApHnNnhG1VVPEjOEg0a4GNxxEl_N38kWTAJlZVMA1elYe7NCJLtZe0Xl0pZExW3td4zKXk-yXggcUGqwlcszA" />
        <div className="absolute bottom-16 left-16 z-20 max-w-md">
          <h1 className="font-h1 text-h1 text-primary mb-4 tracking-tight">Famtaoke</h1>
          <p className="font-body-lg text-body-lg text-text-secondary">Trải nghiệm dịch vụ giải trí đẳng cấp với hệ thống quản lý chuyên nghiệp, tinh tế đến từng chi tiết.</p>
        </div>
      </div>
      {/* Right Side: Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-bg-base relative z-10 overflow-y-auto">
        <div className="w-full max-w-xl">
          <div className="mb-10">
            <h2 className="font-h1 text-h1 text-text-primary mb-2">Đăng ký</h2>
            <p className="font-body-md text-body-md text-text-secondary">Tạo tài khoản để tham gia hệ thống quản lý.</p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 font-body-md">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-text-secondary uppercase" htmlFor="fullname">Họ tên</label>
                <input className="bg-surface-secondary border border-border-subtle rounded text-text-primary px-4 py-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full placeholder-text-secondary/50" id="fullname" name="fullname" placeholder="Nguyễn Văn A" type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-text-secondary uppercase" htmlFor="phone">Số điện thoại</label>
                <input className="bg-surface-secondary border border-border-subtle rounded text-text-primary px-4 py-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full placeholder-text-secondary/50" id="phone" name="phone" placeholder="0901234567" type="tel" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-text-secondary uppercase" htmlFor="email">Email</label>
                <input className="bg-surface-secondary border border-border-subtle rounded text-text-primary px-4 py-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full placeholder-text-secondary/50" id="email" name="email" placeholder="example@domain.com" type="email" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-text-secondary uppercase" htmlFor="idcard">CCCD</label>
                <input className="bg-surface-secondary border border-border-subtle rounded text-text-primary px-4 py-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full placeholder-text-secondary/50" id="idcard" name="idcard" placeholder="Nhập số CCCD" type="text" />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="font-label-caps text-label-caps text-text-secondary uppercase" htmlFor="reg-username">Tên đăng nhập</label>
                <input className="bg-surface-secondary border border-border-subtle rounded text-text-primary px-4 py-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full placeholder-text-secondary/50" id="reg-username" name="reg-username" placeholder="Nhập tên đăng nhập" type="text" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-text-secondary uppercase" htmlFor="reg-password">Mật khẩu</label>
                <input className="bg-surface-secondary border border-border-subtle rounded text-text-primary px-4 py-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full placeholder-text-secondary/50" id="reg-password" name="reg-password" placeholder="••••••••" type="password" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-text-secondary uppercase" htmlFor="confirm_password">Xác nhận MK</label>
                <input className="bg-surface-secondary border border-border-subtle rounded text-text-primary px-4 py-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full placeholder-text-secondary/50" id="confirm_password" name="confirm_password" placeholder="••••••••" type="password" required />
              </div>
            </div>
            <div className="pt-6">
              <button className="w-full bg-primary text-on-primary font-body-lg font-bold py-4 rounded hover:bg-primary-fixed transition-colors shadow-sm disabled:opacity-50" type="submit" disabled={loading}>
                {loading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ'}
              </button>
            </div>
            <div className="text-center mt-6">
              <p className="font-body-md text-body-md text-text-secondary">
                Đã có tài khoản? <Link className="text-primary hover:text-primary-fixed transition-colors font-medium" to="/login">Đăng nhập</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
