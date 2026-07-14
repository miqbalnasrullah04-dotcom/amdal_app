import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo amdal.png';
import api from '../api/client.js';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
  { to: '/lengkapi-profil', label: 'Lengkapi Profil', icon: 'edit_document' },
  { to: '/pilih-paket', label: 'Pilih Paket', icon: 'workspace_premium' },
  { to: '/riwayat-pembayaran', label: 'Riwayat Pembayaran', icon: 'receipt_long' },
  { to: '/profil-saya', label: 'Pengaturan Akun', icon: 'settings' },
];

function SidebarContent({ user, onNavigate, onLogout }) {
  return (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <img src={logo} alt="AMDAL Indonesia" className="h-10 w-auto bg-white rounded-lg p-1 shrink-0" />
        <div className="min-w-0">
          <p className="font-bold leading-tight tracking-tight truncate">AMDAL.ID</p>
          <p className="text-[11px] text-white/55 uppercase tracking-wider">Member Area</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-[#20402A] shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold shrink-0">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name || 'Pengguna'}</p>
            <p className="text-xs text-white/55 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
        <Link
          to="/"
          onClick={onNavigate}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Kembali
        </Link>
      </div>
    </>
  );
}

export default function DashboardLayout({ title, subtitle, headerRight, children }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('amdal_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore malformed cache */
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {
      /* ignore — proceed to clear session locally regardless */
    } finally {
      localStorage.removeItem('amdal_token');
      localStorage.removeItem('amdal_user');
      navigate('/sign-in');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-gradient-to-b from-[#2E5E3B] to-[#1C3822] text-white">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Topbar — mobile */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-40 bg-[#2E5E3B] text-white flex items-center justify-between px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <img src={logo} alt="AMDAL Indonesia" className="h-8 w-auto bg-white rounded-md p-0.5" />
          <span className="font-bold text-sm">AMDAL.ID</span>
        </div>
        <button onClick={() => setDrawerOpen(true)} aria-label="Buka menu" className="p-1">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Drawer — mobile */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setDrawerOpen(false)}>
          <aside
            className="w-72 h-full bg-gradient-to-b from-[#2E5E3B] to-[#1C3822] text-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-3">
              <button onClick={() => setDrawerOpen(false)} aria-label="Tutup menu">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 flex flex-col -mt-3">
              <SidebarContent user={user} onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
            </div>
          </aside>
        </div>
      )}

      {/* Konten utama */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12">
          {(title || headerRight) && (
            <header className="flex items-start justify-between gap-4 flex-wrap mb-8">
              <div>
                {title && (
                  <h1 className="text-2xl md:text-3xl font-bold text-[#1F2A22] tracking-tight">{title}</h1>
                )}
                {subtitle && <p className="text-sm text-[#5B6660] mt-1">{subtitle}</p>}
              </div>
              {headerRight && <div className="shrink-0">{headerRight}</div>}
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}