import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';
import logo from '../assets/tenaga ahli 2.png';

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/verifikasi', label: 'Verifikasi', icon: 'verified_user' },
  { to: '/admin/pembayaran', label: 'Pembayaran', icon: 'payments' },
  { to: '/admin/membership', label: 'Membership & Point', icon: 'stars' },
  { to: '/admin/tiket', label: 'Tiket', icon: 'support_agent' },
  { to: '/admin/tenaga-ahli', label: 'Tenaga Ahli', icon: 'people' },
  { to: '/admin/paket', label: 'Paket', icon: 'workspace_premium' },
  { to: '/admin/pamflet', label: 'Pamflet', icon: 'campaign' },
  { to: '/admin/laporan', label: 'Laporan', icon: 'bar_chart' },
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: 'settings' },
];

export default function AdminLayout({ title, subtitle, children }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ experts: [], articles: [], partners: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const isDashboardPage = location.pathname === '/admin';

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

  // Search functionality - only on main dashboard
  useEffect(() => {
    if (!isDashboardPage) return;
    
    if (!searchQuery.trim()) {
      setSearchResults({ experts: [], articles: [], partners: [] });
      setShowResults(false);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setSearchLoading(true);
      try {
        // Search experts/tenaga ahli
        const expertsRes = await api.get('/admin/experts', { 
          params: { search: searchQuery, limit: 5 } 
        });
        const experts = expertsRes.data?.data || expertsRes.data || [];

        // For now, we'll focus on experts search since that's most relevant
        // Articles and partners can be added later if needed
        setSearchResults({ 
          experts: experts.slice(0, 5), 
          articles: [], 
          partners: [] 
        });
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults({ experts: [], articles: [], partners: [] });
        setShowResults(true);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(delaySearch);
  }, [searchQuery, isDashboardPage]);

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

  const handleSearchSelect = (type, id) => {
    setSearchQuery('');
    setShowResults(false);
    
    if (type === 'expert') {
      navigate(`/admin/tenaga-ahli/${id}/edit`);
    } else if (type === 'article') {
      navigate(`/admin/artikel/${id}/edit`);
    } else if (type === 'partner') {
      navigate(`/admin/mitra/${id}/edit`);
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
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      
      {/* Sidebar */}
      <aside className={`h-screen fixed left-0 top-0 bg-gradient-to-b from-[#0EA5E9] to-[#1E3A8A] text-white border-r border-[#0284C7]/15 flex flex-col py-6 px-4 z-50 overflow-y-auto no-scrollbar transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
        {/* Header Sidebar */}
        <div className="mb-8 flex items-center justify-between px-2 h-14 shrink-0">
          {isExpanded ? (
            <>
              <div className="flex flex-col items-start gap-1 overflow-hidden transition-all duration-200">
                <img src={logo} alt="TenagaAhli.com" className="h-8 w-auto object-contain shrink-0" />
                <span className="font-extrabold text-[10px] tracking-widest uppercase text-white/60 ml-0.5">Admin</span>
              </div>
              <button onClick={() => setIsExpanded(false)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors">
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 mx-auto shrink-0">
              <button onClick={() => setIsExpanded(true)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors">
                <span className="material-symbols-outlined text-[22px]">menu</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-x-hidden no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              title={!isExpanded ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors mb-1 ${
                  isActive
                    ? 'bg-black/10 text-white font-extrabold border-l-4 border-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                } ${!isExpanded ? 'justify-center px-0 border-l-0' : ''}`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {isExpanded && <span>{t(item.label)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            title="Sign Out"
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider uppercase text-[#FFB4AB] hover:bg-[#FFB4AB]/10 transition-colors ${!isExpanded ? 'justify-center px-0' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-[#0284C7]/15 sticky top-0 z-40">
          {/* Search - Only on main dashboard */}
          {isDashboardPage && (
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#414844]/50 text-[20px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Cari tenaga ahli, artikel, atau mitra..."
                className="w-full pl-10 pr-4 py-2 bg-[#F5F4F0] border-none rounded-full text-sm focus:ring-2 focus:ring-[#0284C7]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#414844]/40 hover:text-[#0284C7] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}

              {/* Search Results Dropdown */}
              {showResults && searchQuery && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-[#0284C7]/15 max-h-96 overflow-y-auto z-50">
                  {searchLoading ? (
                    <div className="p-6 text-center text-[#414844]/70 text-sm">
                      <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                      <p className="mt-2">Mencari...</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {/* Header */}
                      <div className="px-4 py-2 border-b border-[#0284C7]/10">
                        <p className="text-xs text-[#414844]/60 font-semibold">Hasil pencarian untuk "{searchQuery}"</p>
                      </div>
                      
                      {/* Experts Results */}
                      {searchResults.experts.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-[#0284C7]/5">
                            <p className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">Tenaga Ahli</p>
                          </div>
                          {searchResults.experts.map((expert) => (
                            <button
                              key={expert.id}
                              onClick={() => handleSearchSelect('expert', expert.id)}
                              className="w-full px-4 py-3 text-left hover:bg-[#F5F4F0] transition-colors border-b border-[#0284C7]/5 last:border-b-0"
                            >
                              <p className="font-semibold text-[#1F2A22] text-sm">{expert.name}</p>
                              <p className="text-xs text-[#414844]/70">{expert.field || expert.institution}</p>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Articles Results */}
                      {searchResults.articles.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-[#0284C7]/5">
                            <p className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">Artikel</p>
                          </div>
                          {searchResults.articles.map((article) => (
                            <button
                              key={article.id}
                              onClick={() => handleSearchSelect('article', article.id)}
                              className="w-full px-4 py-3 text-left hover:bg-[#F5F4F0] transition-colors border-b border-[#0284C7]/5 last:border-b-0"
                            >
                              <p className="font-semibold text-[#1F2A22] text-sm">{article.title}</p>
                              <p className="text-xs text-[#414844]/70">{article.excerpt || 'Artikel'}</p>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Partners Results */}
                      {searchResults.partners.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-[#0284C7]/5">
                            <p className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">Mitra</p>
                          </div>
                          {searchResults.partners.map((partner) => (
                            <button
                              key={partner.id}
                              onClick={() => handleSearchSelect('partner', partner.id)}
                              className="w-full px-4 py-3 text-left hover:bg-[#F5F4F0] transition-colors border-b border-[#0284C7]/5 last:border-b-0"
                            >
                              <p className="font-semibold text-[#1F2A22] text-sm">{partner.name}</p>
                              <p className="text-xs text-[#414844]/70">{partner.description || 'Mitra'}</p>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No Results */}
                      {searchResults.experts.length === 0 && searchResults.articles.length === 0 && searchResults.partners.length === 0 && (
                        <div className="px-4 py-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-[#F5F4F0] rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#414844]/40 text-[24px]">search_off</span>
                          </div>
                          <p className="text-sm font-semibold text-[#1F2A22] mb-1">Tidak ada hasil</p>
                          <p className="text-xs text-[#414844]/60">Coba gunakan kata kunci yang berbeda</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Page Title */}
          <div className="flex-1">
            {title && (
              <div>
                <h1 className="text-xl font-bold text-[#1F2A22]">{title}</h1>
                {subtitle && <p className="text-sm text-[#414844]/60">{subtitle}</p>}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-2 bg-[#F5F4F0] rounded-full">
              <div className="w-8 h-8 rounded-full bg-[#0284C7] flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <div className="text-sm">
                <p className="font-bold text-[#1F2A22]">{user?.name || 'Admin'}</p>
                <p className="text-xs text-[#414844]/60">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}