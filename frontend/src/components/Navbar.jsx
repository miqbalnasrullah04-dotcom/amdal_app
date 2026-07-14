import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo amdal.png';
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cek status login setiap kali pindah halaman (misal setelah login/logout redirect)
  useEffect(() => {
    const token = localStorage.getItem('amdal_token');
    setIsLoggedIn(!!token);
  }, [location]);

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
      navigate('/sign-in');
    }
  };

  const textColor = scrolled ? 'text-on-background' : 'text-white';
  const mutedColor = scrolled ? 'text-on-surface-variant' : 'text-white/80';

  return (
    <nav
      className={`flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-3 fixed top-0 left-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-white/90 shadow-md' : 'bg-transparent glass-nav'
      }`}
    >
      <Link to="/" className="flex items-center">
        <img
          src={logo}
          alt="AMDAL Indonesia"
          className={`h-14 md:h-16 w-auto transition-all duration-300 ${!scrolled ? 'brightness-0 invert drop-shadow' : ''}`}
        />
      </Link>

      <div className="hidden md:flex items-center gap-gutter">
        <div className="flex gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `font-label-md text-label-md pb-1 transition-colors ${
                  isActive
                    ? `${textColor} border-b-2 border-[#2E5E3B]`
                    : `${mutedColor} hover:${scrolled ? 'text-on-background' : 'text-white'}`
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-4 ml-gutter">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className={`font-label-md text-label-md ${textColor} hover:text-[#B3261E] transition-colors flex items-center gap-1`}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/sign-in"
                className={`font-label-md text-label-md ${textColor} hover:text-[#2E5E3B] transition-colors flex items-center gap-1`}
              >
                <span className="material-symbols-outlined text-sm">person</span>
                Sign in
              </Link>
              <Link
                to="/daftar"
                className="bg-white text-[#2E5E3B] px-6 py-2 rounded-lg font-label-md text-label-md scale-95 active:scale-90 transition-transform hover:bg-surface-container-low"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>

      <button className={`md:hidden ${textColor}`} onClick={() => setMenuOpen((v) => !v)} aria-label="Buka menu">
        <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden flex flex-col p-margin-mobile gap-4 text-on-background">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="font-label-md text-label-md">
              {link.label}
            </NavLink>
          ))}
          <hr className="border-outline-variant" />
          {isLoggedIn ? (
            <button onClick={handleLogout} className="font-label-md text-label-md text-left text-[#B3261E]">
              Logout
            </button>
          ) : (
            <>
              <Link to="/sign-in" onClick={() => setMenuOpen(false)} className="font-label-md text-label-md">
                Sign in
              </Link>
              <Link
                to="/daftar"
                onClick={() => setMenuOpen(false)}
                className="bg-[#2E5E3B] text-white px-6 py-2 rounded-lg font-label-md text-label-md text-center"
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