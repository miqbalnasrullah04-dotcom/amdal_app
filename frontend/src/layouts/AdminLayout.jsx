import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

const menuItems = [
  { to: '/admin', icon: 'home', label: 'Dashboard', end: true },
  { to: '/admin/verifikasi', icon: 'how_to_reg', label: 'Verifikasi Pendaftaran' },
  { to: '/admin/tenaga-ahli', icon: 'groups', label: 'Data Tenaga Ahli' },
  { to: '/admin/paket', icon: 'credit_card', label: 'Paket' },
  { to: '/admin/pembayaran', icon: 'payments', label: 'Pembayaran' },
  { to: '/admin/laporan', icon: 'bar_chart', label: 'Laporan' },
  { to: '/admin/pengaturan', icon: 'settings', label: 'Pengaturan' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('amdal_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('amdal_token');
      localStorage.removeItem('amdal_user');
      navigate('/');
    }
  };

  const initials = (user?.name || 'A')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#1B1C1A]">
      <aside className="h-screen w-64 fixed left-0 top-0 bg-white border-r border-[#0284C7]/15 flex flex-col py-6 px-4 z-50 overflow-y-auto">
        <div className="mb-8 px-3">
          <h1 className="text-xl font-bold text-[#0284C7]">TenagaAhli.com</h1>
          <p className="text-xs text-[#414844]/70 tracking-wide">Admin Console</p>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-4 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#0284C7]/10 text-[#0284C7] font-bold border-r-4 border-[#0284C7]'
                    : 'text-[#414844] hover:bg-[#0284C7]/5 hover:text-[#0284C7]'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-[#0284C7]/15">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold text-[#B3261E] hover:bg-[#B3261E]/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <header className="h-16 ml-64 flex items-center justify-between px-8 bg-white border-b border-[#0284C7]/15 sticky top-0 z-40">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#414844]/50 text-[20px]">
            search
          </span>
          <input
            placeholder="Cari data ahli, artikel, atau lembaga..."
            className="w-full pl-10 pr-4 py-2 bg-[#F5F4F0] border-none rounded-full text-sm focus:ring-2 focus:ring-[#0284C7]/40"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-[#0284C7] leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-[10px] uppercase tracking-wider text-[#414844]/60 font-bold">{user?.role || 'admin'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
        </div>
      </header>

      <main className="ml-64 p-8 min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
}