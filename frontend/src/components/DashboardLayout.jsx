import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
import logo from "../assets/tenaga ahli 2.png";
import api from '../api/client.js';

function SidebarContent({ user, onNavigate, onLogout, isExpanded, onToggle }) {
  const { t } = useTranslation();
  const NAV_ITEMS = [
    { to: '/dashboard',    label: t('Dashboard'),       icon: 'space_dashboard' },
    { to: '/profil-saya',  label: t('Profil Saya'),     icon: 'person' },
    { to: '/membership',   label: t('Membership'),      icon: 'stars' },
    { to: '/paket',        label: t('Paket'),            icon: 'workspace_premium' },
    { to: '/invoice',      label: t('Invoice'),          icon: 'receipt_long' },
    { to: '/pembayaran',   label: t('Pembayaran'),       icon: 'payments' },
    { to: '/tiket',        label: t('Tiket'),            icon: 'support_agent' },
    { to: '/ulasan',       label: t('Ulasan'),           icon: 'star' },
    { to: '/statistik',    label: t('Statistik'),        icon: 'bar_chart' },
    { to: '/profil-publik',label: t('Profil Publik'),    icon: 'language' },
    { to: '/pengaturan',   label: t('Pengaturan'),       icon: 'settings' },
  ];
  return (
    <div className="flex flex-col h-full">
      {/* Header Sidebar */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 h-16 shrink-0 bg-[#0ea5e9]">
        {isExpanded ? (
          <>
            <div className="flex flex-col items-start gap-1 overflow-hidden transition-all duration-200">
              <img src={logo} alt="TenagaAhli.com" className="h-10 w-auto shrink-0" />
          <span className="font-extrabold text-[10px] tracking-widest uppercase text-white/60 ml-0.5">{t('Member')}</span>
            </div>
            <button onClick={onToggle} className="text-white/85 hover:text-white p-1 hover:bg-white/10 rounded transition-colors">
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          </>
        ) : (
          <button onClick={onToggle} className="text-white/85 hover:text-white p-1 hover:bg-white/10 rounded transition-colors mx-auto">
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        )}
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={!isExpanded ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3.5 py-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                isActive 
                  ? 'bg-black/10 text-white border-l-4 border-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              } ${!isExpanded ? 'justify-center px-0 border-l-0' : ''}`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {isExpanded && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bagian Bawah User & Aksi Keluar */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-1.5 shrink-0">
        {isExpanded && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 overflow-hidden bg-white/5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold shrink-0">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{user?.name || 'Pengguna'}</p>
              <p className="text-[10px] text-white/55 truncate">{user?.email || ''}</p>
            </div>
          </div>
        )}

        {/* Tombol Menuju Web Utama Publik */}
        <Link
          to="/"
          onClick={onNavigate}
          title={t('Lihat Web Utama')}
          className={`flex items-center gap-4 px-3.5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase text-white/70 hover:bg-white/10 hover:text-white transition-colors ${!isExpanded ? 'justify-center px-0' : ''}`}
        >
          <span className="material-symbols-outlined text-[20px]">language</span>
          {isExpanded && <span>{t('Web Utama')}</span>}
        </Link>

        {/* Tombol Aksi Logout */}
        <button
          onClick={onLogout}
          title={t('Logout')}
          className={`flex items-center gap-4 px-3.5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase text-[#FFB4AB] hover:bg-[#FFB4AB]/10 transition-colors ${!isExpanded ? 'justify-center px-0' : ''}`}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {isExpanded && <span>{t('Logout')}</span>}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ title, subtitle, headerRight, children }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

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
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      {/* Sidebar — desktop */}
      <aside className={`hidden lg:flex lg:flex-col lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-gradient-to-b from-[#0EA5E9] to-[#1E3A8A] text-white transition-all duration-300 no-scrollbar ${isExpanded ? 'lg:w-64' : 'lg:w-20'}`}>
        <SidebarContent 
          user={user} 
          onLogout={handleLogout} 
          isExpanded={isExpanded} 
          onToggle={() => setIsExpanded(!isExpanded)} 
        />
      </aside>

      {/* Topbar — mobile */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-40 bg-[#0EA5E9] text-white flex items-center justify-between px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <img src={logo} alt="TenagaAhli.com" className="h-8 w-auto bg-white rounded-md p-0.5" />
          <span className="font-bold text-sm">TenagaAhli.com</span>
        </div>
        <button onClick={() => setDrawerOpen(true)} aria-label="Buka menu" className="p-1">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Drawer — mobile */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setDrawerOpen(false)}>
          <aside
            className="w-64 h-full bg-gradient-to-b from-[#0EA5E9] to-[#1E3A8A] text-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-3">
              <button onClick={() => setDrawerOpen(false)} aria-label="Tutup menu">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 flex flex-col -mt-3">
              <SidebarContent 
                user={user} 
                onNavigate={() => setDrawerOpen(false)} 
                onLogout={handleLogout} 
                isExpanded={true} 
              />
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
