import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-tenaga-ahli.png';
import api from '../api/client.js';

// Brand tokens — same blue used across the rest of the site.
const BRAND_BLUE = '#1479D6';
const BRAND_BLUE_HOVER = '#0F63B0';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/tentang-kami', label: 'Tentang Kami' },
  { to: '/member', label: 'Member' },
  { to: '/peraturan-amdal', label: 'Peraturan AMDAL' },
  { to: '/pamflet', label: 'Pamflet' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cek status login & ambil data user dari localStorage
  useEffect(() => {
    const token = localStorage.getItem('amdal_token');
    const user = localStorage.getItem('amdal_user');

    setIsLoggedIn(!!token);
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, [location]);

  // Menutup dropdown profil jika klik di luar area menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Menutup menu mobile otomatis saat pindah halaman
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('amdal_token');
      localStorage.removeItem('amdal_user');
      setIsLoggedIn(false);
      setMenuOpen(false);
      setProfileOpen(false);
      setUserData(null);
      navigate('/');
    }
  };

  // Neutral frosted glass: backdrop-blur only, no tinted/colored glow and
  // no box-shadow. Separation from content below comes from a hairline
  // border, not a shadow.
  const isDark = !scrolled;
  const textColor = isDark ? 'text-white' : 'text-gray-800';
  const mutedColor = isDark ? 'text-white/75' : 'text-gray-500';

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full backdrop-blur-md transition-colors duration-300 ${
        scrolled ? 'bg-white/70 border-b border-gray-100' : 'bg-black/20 border-b border-white/10'
      }`}
    >
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-3">
        <Link to="/" className="flex items-center shrink-0">
          <img src={logo} alt="TenagaAhli.com" className="h-12 md:h-14 w-auto transition-all duration-300" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative font-label-md text-label-md py-1.5 transition-colors ${
                    isActive ? textColor + ' font-semibold' : `${mutedColor} hover:${textColor}`
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className="absolute left-0 -bottom-0.5 h-[2px] rounded-full transition-all duration-200"
                      style={{
                        width: isActive ? '100%' : '0%',
                        backgroundColor: isDark ? '#FFFFFF' : BRAND_BLUE,
                      }}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4 pl-4 border-l" style={{ borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#E5E7EB' }}>
            {isLoggedIn ? (
              /* FOTO PROFIL DROPDOWN (DESKTOP) */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ '--tw-ring-color': BRAND_BLUE }}
                >
                  <img
                    src={
                      userData?.avatar_url ||
                      userData?.foto ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                    }
                    alt="Profile"
                    className={`w-10 h-10 rounded-full object-cover border-2 ${isDark ? 'border-white/80' : 'border-gray-200'}`}
                  />
                </button>

                {/* Box Dropdown — solid card, hairline border, no blur/glow */}
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 py-2 z-50 text-gray-800">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="font-label-md text-sm font-semibold truncate">
                        {userData?.name || userData?.nama || 'User TenagaAhli'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{userData?.email || ''}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-gray-400">dashboard</span>
                      Dashboard
                    </Link>

                    <Link
                      to="/profil-saya"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-gray-400">person</span>
                      Profil Saya
                    </Link>

                    <hr className="border-gray-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#B3261E] hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className={`font-label-md text-label-md ${textColor} hover:opacity-75 transition-opacity flex items-center gap-1.5`}
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Sign in
                </Link>
                <Link
                  to="/daftar"
                  className="px-5 py-2 rounded-lg font-label-md text-label-md text-white transition-colors"
                  style={{ backgroundColor: BRAND_BLUE }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_BLUE_HOVER)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND_BLUE)}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className={`md:hidden ${textColor} w-9 h-9 flex items-center justify-center rounded-lg`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Buka menu"
          aria-expanded={menuOpen}
        >
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu — solid panel, no blur/glow */}
      {menuOpen && (
        <div className="md:hidden w-full bg-white/85 backdrop-blur-md border-t border-gray-100 flex flex-col px-margin-mobile py-5 gap-1 text-gray-800">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `font-label-md text-label-md py-3 border-b border-gray-50 ${isActive ? 'font-semibold' : 'text-gray-600'}`
              }
              style={({ isActive }) => (isActive ? { color: BRAND_BLUE } : undefined)}
            >
              {link.label}
            </NavLink>
          ))}

          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 py-4">
                <img
                  src={
                    userData?.avatar_url ||
                    userData?.foto ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                  }
                  alt="Profile"
                  className="w-11 h-11 rounded-full object-cover border border-gray-200"
                />
                <div className="min-w-0">
                  <p className="font-label-md text-sm font-semibold truncate">
                    {userData?.name || userData?.nama || 'User TenagaAhli'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{userData?.email || ''}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="font-label-md text-label-md flex items-center gap-2.5 py-3 border-b border-gray-50 text-gray-700"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-400">dashboard</span>
                Dashboard
              </Link>
              <Link
                to="/profil-saya"
                onClick={() => setMenuOpen(false)}
                className="font-label-md text-label-md flex items-center gap-2.5 py-3 border-b border-gray-50 text-gray-700"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-400">person</span>
                Profil Saya
              </Link>
              <button
                onClick={handleLogout}
                className="font-label-md text-label-md text-left text-[#B3261E] flex items-center gap-2.5 py-3 font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-4">
              <Link
                to="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="font-label-md text-label-md flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-gray-700"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Sign in
              </Link>
              <Link
                to="/daftar"
                onClick={() => setMenuOpen(false)}
                className="text-white px-6 py-2.5 rounded-lg font-label-md text-label-md text-center"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}