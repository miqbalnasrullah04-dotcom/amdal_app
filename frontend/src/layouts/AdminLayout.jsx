import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';
import logo from '../assets/tenaga ahli 2.png';

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/verifikasi', label: 'Verifikasi', icon: 'verified_user' },
  { to: '/admin/pembayaran', label: 'Pembayaran', icon: 'payments' },
  { to: '/admin/tenaga-ahli', label: 'Tenaga Ahli', icon: 'people' },
  { to: '/admin/paket', label: 'Paket', icon: 'workspace_premium' },
  { to: '/admin/laporan', label: 'Laporan', icon: 'bar_chart' },
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: 'settings' },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ experts: [], articles: [], partners: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

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

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ experts: [], articles: [], partners: [] });
      setShowResults(false);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [expertsRes, articlesRes, partnersRes] = await Promise.allSettled([
          api.get('/admin/experts', { params: { keyword: searchQuery } }),
          api.get('/admin/articles'),
          api.get('/admin/partners'),
        ]);

        // Filter experts
        const allExperts = expertsRes.status === 'fulfilled' ? expertsRes.value.data : [];
        const experts = allExperts.slice(0, 5);

        // Filter articles locally
        const allArticles = articlesRes.status === 'fulfilled' ? articlesRes.value.data : [];
        const articles = allArticles
          .filter((a) => a.title?.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 5);

        // Filter partners locally
        const allPartners = partnersRes.status === 'fulfilled' ? partnersRes.value.data : [];
        const partners = allPartners
          .filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 5);

        setSearchResults({ experts, articles, partners });
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

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

  const toggleMenu = (label) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const [isExpanded, setIsExpanded] = useState(true);

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

        <nav className="flex-1 space-y-1.5 overflow-x-hidden no-scrollbar">
          {menuItems.map((item) => {
            if (item.children) {
              const isExpandedGroup = expandedMenus[item.label];
              const isActiveGroup = item.children.some(child => window.location.pathname.startsWith(child.to.split('?')[0]) && child.to !== '/admin/pembayaran');
              
              return (
                <div key={item.label} className="mb-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    title={!isExpanded ? item.label : undefined}
                    className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors ${
                      isActiveGroup
                        ? 'bg-black/10 text-white font-bold'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    } ${!isExpanded ? 'justify-center px-0' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {isExpanded && <span>{t(item.label)}</span>}
                    </div>
                    {isExpanded && (
                      <span className="material-symbols-outlined text-[18px] transition-transform duration-200" style={{ transform: isExpandedGroup ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        expand_more
                      </span>
                    )}
                  </button>
                  
                  {isExpanded && isExpandedGroup && (
                    <div className="mt-1 ml-4 border-l-2 border-white/20 pl-2 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.label}
                          to={child.to}
                          end={child.end}
                          className={({ isActive }) =>
                            `block py-2 px-4 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors ${
                              isActive
                                ? 'bg-white/15 text-white font-extrabold border-l-2 border-white'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`
                          }
                        >
                          {t(child.label)}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
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
            );
          })}
        </nav>

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

      <header className={`h-16 flex items-center justify-between px-8 bg-white border-b border-[#0284C7]/15 sticky top-0 z-40 transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#414844]/50 text-[20px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder=""
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
                <>
                  {/* Experts Results */}
                  {searchResults.experts.length > 0 && (
                    <div className="border-b border-[#0284C7]/10">
                      <div className="px-4 py-2 bg-[#0284C7]/5">
                        <p className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">Tenaga Ahli</p>
                      </div>
                      {searchResults.experts.map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => handleSearchSelect('expert', exp.id)}
                          className="w-full px-4 py-3 hover:bg-[#0284C7]/5 transition-colors text-left flex items-center gap-3"
                        >
                          <span className="material-symbols-outlined text-[#0284C7] text-[20px]">person</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1F2A22] truncate">{exp.name}</p>
                            <p className="text-xs text-[#414844]/60 truncate">{exp.email || exp.institution}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Articles Results */}
                  {searchResults.articles.length > 0 && (
                    <div className="border-b border-[#0284C7]/10">
                      <div className="px-4 py-2 bg-[#0284C7]/5">
                        <p className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">Artikel</p>
                      </div>
                      {searchResults.articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleSearchSelect('article', article.id)}
                          className="w-full px-4 py-3 hover:bg-[#0284C7]/5 transition-colors text-left flex items-center gap-3"
                        >
                          <span className="material-symbols-outlined text-[#0284C7] text-[20px]">article</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1F2A22] truncate">{article.title}</p>
                            <p className="text-xs text-[#414844]/60">
                              {article.published_at ? new Date(article.published_at).toLocaleDateString('id-ID') : 'Draft'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Partners Results */}
                  {searchResults.partners.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-[#0284C7]/5">
                        <p className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">Lembaga</p>
                      </div>
                      {searchResults.partners.map((partner) => (
                        <button
                          key={partner.id}
                          onClick={() => handleSearchSelect('partner', partner.id)}
                          className="w-full px-4 py-3 hover:bg-[#0284C7]/5 transition-colors text-left flex items-center gap-3"
                        >
                          <span className="material-symbols-outlined text-[#0284C7] text-[20px]">handshake</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1F2A22] truncate">{partner.name}</p>
                            <p className="text-xs text-[#414844]/60 truncate">{partner.type}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchResults.experts.length === 0 && 
                   searchResults.articles.length === 0 && 
                   searchResults.partners.length === 0 && (
                    <div className="p-6 text-center text-[#414844]/70 text-sm">
                      <span className="material-symbols-outlined text-[40px] text-[#414844]/30">search_off</span>
                      <p className="mt-2">Tidak ditemukan hasil untuk "{searchQuery}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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

      <main className={`p-8 min-h-[calc(100vh-64px)] transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}>
        <Outlet />
      </main>
    </div>
  );
}
