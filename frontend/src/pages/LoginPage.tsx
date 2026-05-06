import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: username, password }),
      });

      if (!response.ok) {
        throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <>
      {/* Left: Decorative Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-lowest border-r border-border-subtle shadow-lg">
        <img alt="Luxurious Karaoke Space" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNWtcs6g6WVgqkV9LshXogMObWdZobOlujUhK8EamhlBSotlUM9gH58Qyv-KfhnudTJTmWmp7bA3NqEEGEb3Jre43VetYojimzNGEs9sSX0_A_TvS4hL7LjM-28WE3GaWTdLGYkBtPGXtbmyMpbx3QjmHWgeaB69h2IZwzE9ChRDq4cKanzonezQ6USVYm9k2HwK7-sE8iiih6gXwx9dn-123hjiDQ_toPhkcTRts9jRJmj0yNPhWV0NK_gKxA7kPaJC833EH8Ow" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-transparent"></div>
        <div className="absolute bottom-16 left-16 z-10 max-w-md">
          <h2 className="font-h1 text-h1 text-primary-container tracking-tighter mb-4">Midnight Elegance</h2>
          <p className="font-body-lg text-body-lg text-text-secondary leading-relaxed">Hệ thống quản lý dịch vụ giải trí cao cấp. Đem lại trải nghiệm hoàn hảo, tối ưu hóa quy trình vận hành với sự tinh tế và chuyên nghiệp.</p>
        </div>
      </div>
      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-bg-base p-8 sm:p-16 lg:p-24 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary-container/5 rounded-full blur-[120px]"></div>
        </div>
        <div className="w-full max-w-[420px] relative z-10">
            <div className="mb-12">
              <h1 className="font-h1 text-h1 text-text-primary mb-3 tracking-tight">Chào mừng trở lại</h1>
              <p className="font-body-md text-body-md text-text-secondary">Đăng nhập bằng tài khoản nội bộ để tiếp tục quản lý hệ thống.</p>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 font-body-md">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div className="relative">
                <label className="block font-label-caps text-label-caps text-text-secondary mb-2 uppercase tracking-wider" htmlFor="username">Tên đăng nhập</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-text-secondary">person</span>
                  <input autoComplete="username" className="block w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border-subtle rounded-lg text-text-primary font-body-md focus:outline-none focus:ring-1 focus:ring-primary-container focus:border-primary-container transition-all duration-200 shadow-sm placeholder:text-slate-600" id="username" name="username" placeholder="Nhập tên đăng nhập..." required type="text" />
                </div>
              </div>
              <div className="relative">
                <label className="block font-label-caps text-label-caps text-text-secondary mb-2 uppercase tracking-wider" htmlFor="password">Mật khẩu</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-text-secondary">lock</span>
                  <input autoComplete="current-password" className="block w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border-subtle rounded-lg text-text-primary font-body-md focus:outline-none focus:ring-1 focus:ring-primary-container focus:border-primary-container transition-all duration-200 shadow-sm placeholder:text-slate-600" id="password" name="password" placeholder="••••••••" required type="password" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <input className="h-4 w-4 rounded border-border-subtle bg-surface-secondary text-primary-container focus:ring-primary-container cursor-pointer" id="remember-me" name="remember-me" type="checkbox" />
                <label className="ml-3 block font-body-md text-body-md text-text-secondary cursor-pointer" htmlFor="remember-me">Ghi nhớ đăng nhập</label>
              </div>
              <a className="font-label-caps text-label-caps text-primary-container hover:text-primary transition-colors duration-200" href="#">Quên mật khẩu?</a>
            </div>
            <div className="pt-4">
              <button className="w-full flex justify-center items-center py-4 px-4 bg-primary-container text-on-primary-container font-label-caps rounded-lg hover:bg-primary hover:shadow-lg hover:shadow-primary-container/20 transition-all duration-300 transform active:scale-[0.98]" type="submit">
                ĐĂNG NHẬP
                <span className="material-symbols-outlined ml-2 text-[18px]">login</span>
              </button>
            </div>
          </form>
          <div className="mt-10 text-center border-t border-border-subtle pt-8">
            <p className="font-body-md text-body-md text-text-secondary">
              Bạn chưa có tài khoản? <Link className="font-label-caps text-label-caps text-primary-container hover:text-primary transition-colors duration-200 ml-2" to="/register">Đăng ký tài khoản</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
