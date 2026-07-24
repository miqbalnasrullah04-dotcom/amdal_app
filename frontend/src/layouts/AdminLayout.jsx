import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

const menuItems = [
  { to: '/admin', icon: 'home', label: 'Dashboard', end: true },
  { to: '/admin/verifikasi', icon: 'how_to_reg', label: 'Verifikasi Data' },
  { to: '/admin/tenaga-ahli', icon: 'groups', label: 'Data Tenaga Ahli' },
  { to: '/admin/paket', icon: 'credit_card', label: 'Paket' },
  { to: '/admin/pembayaran', icon: 'payments', label: 'Pembayaran' },
  { to: '/admin/laporan', icon: 'bar_chart', label: 'Laporan' },
  { to: '/admin/pengaturan', icon: 'settings', label: 'Pengaturan' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ experts: [], articles: [], partners: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

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

      <main className="ml-64 p-8 min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
}