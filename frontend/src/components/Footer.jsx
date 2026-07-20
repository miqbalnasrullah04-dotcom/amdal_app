import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/tenaga ahli 2.png';

/* ── Social icons ──────────────────────────────────────────────────────── */
function IconFacebook() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function IconYouTube() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function IconTikTok() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

/* ── Nav data ──────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Beranda',               to: '/' },
  { label: 'Tentang Kami',          to: '/tentang-kami' },
  { label: 'Direktori Tenaga Ahli', to: '/tenaga-ahli' },
  { label: 'Daftar Tenaga Ahli',    to: '/daftar' },
  { label: 'Paket Keanggotaan',     to: '/paket' },
  { label: 'Berita & Artikel',      to: '/articles' },
];

const SERVICE_LINKS = [
  { label: 'Cari Tenaga Ahli',      to: '/search' },
  { label: 'Verifikasi Keahlian',   to: '/daftar' },
  { label: 'Konsultasi Profesional',to: '/tentang-kami' },
  { label: 'Pelatihan & Sertifikasi', to: '/instruktur-pengajar' },
  { label: 'Publikasi Profil Ahli', to: '/daftar' },
  { label: 'Kemitraan',             to: '/tentang-kami' },
];

const HELP_LINKS = [
  { label: 'FAQ',                   to: '/tentang-kami' },
  { label: 'Cara Mendaftar',        to: '/daftar' },
  { label: 'Panduan Verifikasi',    to: '/tentang-kami' },
  { label: 'Kebijakan Privasi',     to: '/tentang-kami' },
  { label: 'Syarat & Ketentuan',    to: '/tentang-kami' },
  { label: 'Hubungi Kami',          to: '/tentang-kami' },
];

const SOCIALS = [
  { label: 'Facebook',  href: 'https://facebook.com',  icon: <IconFacebook /> },
  { label: 'Instagram', href: 'https://instagram.com', icon: <IconInstagram /> },
  { label: 'LinkedIn',  href: 'https://linkedin.com',  icon: <IconLinkedIn /> },
  { label: 'YouTube',   href: 'https://youtube.com',   icon: <IconYouTube /> },
  { label: 'TikTok',    href: 'https://tiktok.com',    icon: <IconTikTok /> },
];

/* ── Helper: column of links ───────────────────────────────────────────── */
function LinkColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-white font-bold text-sm mb-4 tracking-wide">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-white/80 text-sm hover:text-white transition-colors leading-snug"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */
export default function Footer() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <footer className="bg-[#0EA5E9] text-white">
        {/* ── Main grid ─────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* ── Kolom 1: Brand ──────────────────────────────────── */}
            <div className="lg:col-span-1">
              {/* Logo image */}
              <div className="mb-5">
                <Link to="/">
                  <img
                    src={logo}
                    alt="TenagaAhli.com"
                    className="h-14 w-auto"
                  />
                </Link>
              </div>

              <p className="text-white/85 text-sm leading-relaxed mb-6">
                TenagaAhli.com menghubungkan masyarakat, instansi pemerintah, perusahaan, dan
                organisasi dengan tenaga ahli profesional yang telah melalui proses verifikasi
                sesuai bidang keahliannya.
              </p>

              {/* Kontak */}
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:info@tenagaahli.com"
                    className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-white">mail</span>
                    info@tenagaahli.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+6281234567890"
                    className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-white">phone</span>
                    +62 8xxx xxxx xxxx
                  </a>
                </li>
              </ul>
            </div>

            {/* ── Kolom 2: Navigasi ────────────────────────────────── */}
            <LinkColumn title="Navigasi" links={NAV_LINKS} />

            {/* ── Kolom 3: Layanan ─────────────────────────────────── */}
            <LinkColumn title="Layanan" links={SERVICE_LINKS} />

            {/* ── Kolom 4: Bantuan ─────────────────────────────────── */}
            <LinkColumn title="Bantuan" links={HELP_LINKS} />
          </div>
        </div>

        {/* ── Divider ───────────────────────────────────────────────── */}
        <div className="border-t border-white/20" />

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/70 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} TenagaAhli.com. Seluruh Hak Cipta Dilindungi.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white hover:text-[#0EA5E9] transition-all"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Scroll-to-top FAB ─────────────────────────────────────────── */}
      <button
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
        className={`fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#0EA5E9] hover:text-white hover:border-[#0EA5E9] transition-all duration-300 ${
          showScroll ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </>
  );
}
