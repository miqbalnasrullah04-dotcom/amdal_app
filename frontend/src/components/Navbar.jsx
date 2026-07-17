import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-tenaga-ahli.png';
import api from '../api/client.js';

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
    const onScroll = () => setScrolled(window.scrollY > 50);
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
        console.error("Error parsing user data", e);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      navigate('/'); // Kembali ke Halaman Utama setelah logout
    }
  };

  const textColor = scrolled ? 'text-on-background' : 'text-white';
  const mutedColor = scrolled ? 'text-on-surface-variant' : 'text-white/80';

  return (
    <nav
      className={`flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-3 fixed top-0 left-0 z-50 transition-all duration-300 shadow-none ${
        scrolled 
          ? 'bg-[#14B8A6]/20 backdrop-blur-xl backdrop-saturate-150 border-b border-[#14B8A6]/20' 
          : 'bg-[#14B8A6]/10 backdrop-blur-lg border-b border-white/10'
      }`}
    >
      <Link to="/" className="flex items-center">
        <img
          src={logo}
          alt="TenagaAhli.com"
          className="h-14 md:h-16 w-auto transition-all duration-300"
        />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-gutter">
        <div className="flex gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `font-label-md text-label-md pb-1 transition-colors ${
                  isActive
                    ? `${textColor} border-b-2 ${scrolled ? 'border-on-background' : 'border-white'}`
                    : `${mutedColor} hover:${textColor}`
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        
        <div className="flex items-center gap-4 ml-gutter">
          {isLoggedIn ? (
            /* FOTO PROFIL DROPDOWN (DESKTOP) */
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-0.5 transition-all"
              >
                <img 
                  src={userData?.avatar_url || userData?.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border border-white bg-surface"
                />
              </button>

              {/* Box Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#14B8A6]/15 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-[#14B8A6]/20 py-2 z-50 text-on-background transition-all shadow-none">
                  <div className="px-4 py-2 border-b border-outline-variant/40">
                    <p className="font-label-md text-sm font-semibold truncate">{userData?.name || userData?.nama || 'User TenagaAhli'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{userData?.email || ''}</p>
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">dashboard</span>
                    Dashboard
                  </Link>
                  
                  <Link 
                    to="/profil-saya" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">person</span>
                    Profil Saya
                  </Link>

                  <hr className="border-outline-variant/40 my-1" />

                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#B3261E] hover:bg-error-container/20 transition-colors text-left font-medium"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/sign-in"
                className={`font-label-md text-label-md ${textColor} hover:opacity-80 transition-opacity flex items-center gap-1`}
              >
                <span className="material-symbols-outlined text-sm">person</span>
                Sign in
              </Link>
              <Link
                to="/daftar"
                className={`${
                  scrolled ? 'bg-on-background text-white' : 'bg-[#14B8A6]/20 backdrop-blur-lg text-white border border-white/30'
                } px-6 py-2 rounded-lg font-label-md text-label-md scale-95 active:scale-90 transition-all hover:opacity-90 shadow-none`}
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button className={`md:hidden ${textColor}`} onClick={() => setMenuOpen((v) => !v)} aria-label="Buka menu">
        <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#14B8A6]/20 backdrop-blur-xl backdrop-saturate-150 md:hidden flex flex-col p-margin-mobile gap-4 text-on-background z-50 border-t border-[#14B8A6]/20 shadow-none">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="font-label-md text-label-md">
              {link.label}
            </NavLink>
          ))}
          <hr className="border-outline-variant/40" />
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 px-1 py-1">
                <img 
                  src={userData?.avatar_url || userData?.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <p className="font-label-md text-sm font-semibold truncate">{userData?.name || userData?.nama || 'User TenagaAhli'}</p>
                  <p className="text-xs text-on-surface-variant truncate">{userData?.email || ''}</p>
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="font-label-md text-label-md flex items-center gap-2">
                <span className="material-symbols-outlined text-base">dashboard</span> Dashboard
              </Link>
              <Link to="/profil-saya" onClick={() => setMenuOpen(false)} className="font-label-md text-label-md flex items-center gap-2">
                <span className="material-symbols-outlined text-base">person</span> Profil Saya
              </Link>
              <button onClick={handleLogout} className="font-label-md text-label-md text-left text-[#B3261E] flex items-center gap-2 pt-2 border-t border-outline-variant/40">
                <span className="material-symbols-outlined text-base">logout</span> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-in" onClick={() => setMenuOpen(false)} className="font-label-md text-label-md">
                Sign in
              </Link>
              <Link
                to="/daftar"
                onClick={() => setMenuOpen(false)}
                className="bg-[#14B8A6] text-white px-6 py-2 rounded-lg font-label-md text-label-md text-center shadow-none"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}