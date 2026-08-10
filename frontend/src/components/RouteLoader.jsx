import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';
import { usePageLoading } from '../context/LoadingContext.jsx';

// Loader tetap tampil minimal segini, biar animasinya nggak "kedip"
// walaupun datanya selesai fetch dalam sekejap.
const MIN_DURATION = 600; // ms

// Jaring pengaman: kalau suatu halaman lupa "lapor selesai" atau API
// lambat/gantung, loader tetap akan hilang otomatis setelah durasi ini.
const MAX_DURATION = 6000; // ms

// Halaman-halaman dashboard/member punya layout sendiri dan tidak memanggil
// reportReady(), jadi RouteLoader tidak boleh aktif di sini.
const DASHBOARD_USER_ROUTES = [
  '/dashboard',
  '/profil-saya',
  '/membership',
  '/paket',
  '/pembayaran',
  '/profil-publik',
  '/pengaturan',
  '/lengkapi-profil',
  '/pilih-paket',
  '/riwayat-pembayaran',
  '/pesan',
  '/tiket',
  '/ulasan',
  '/statistik',
  '/invoice',
];

// Admin routes juga tidak butuh RouteLoader
const ADMIN_ROUTES_PREFIX = ['/admin'];

// Function to check if route should skip loader
const shouldSkipLoader = (pathname) => {
  // Exact match untuk dashboard user routes
  if (DASHBOARD_USER_ROUTES.includes(pathname)) return true;
  
  // Pattern match untuk invoice dengan parameter
  if (pathname.startsWith('/invoice/')) return true;
  
  // Pattern match untuk admin routes
  if (ADMIN_ROUTES_PREFIX.some(prefix => pathname.startsWith(prefix))) return true;
  
  // Skip loader untuk semua dashboard user routes yang mungkin ada parameter
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/profil') || 
      pathname.startsWith('/member') ||
      pathname.startsWith('/paket') ||
      pathname.startsWith('/pembayaran')) return true;
      
  return false;
};

export default function RouteLoader({ children }) {
  const location = useLocation();
  const { dataReady, resetReady } = usePageLoading();
  const [visible, setVisible] = useState(true);
  const startedAtRef = useRef(Date.now());

  const shouldSkip = shouldSkipLoader(location.pathname);

  // Setiap kali rute berubah: nyalakan lagi loader, reset status "data siap",
  // dan pasang jaring pengaman durasi maksimum.
  useEffect(() => {
    if (shouldSkip) {
      setVisible(false);
      resetReady();
      return;
    }

    setVisible(true);
    resetReady();
    startedAtRef.current = Date.now();

    const maxTimer = setTimeout(() => {
      setVisible(false);
    }, MAX_DURATION);

    return () => clearTimeout(maxTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Begitu halaman melapor datanya sudah siap (dataReady === true),
  // hitung sisa waktu supaya tetap memenuhi MIN_DURATION, baru sembunyikan.
  useEffect(() => {
    if (!dataReady) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(MIN_DURATION - elapsed, 0);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, remaining);

    return () => clearTimeout(hideTimer);
  }, [dataReady]);

  return (
    <>
      <PageLoader visible={visible} />
      {children}
    </>
  );
}
