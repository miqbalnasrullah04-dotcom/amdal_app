import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';

const INITIAL_DURATION = 1400; // ms saat pertama kali web dibuka
const ROUTE_DURATION = 1000;    // ms saat pindah halaman

export default function RouteLoader({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Setiap kali rute berubah, set loading ke true
    setLoading(true);

    // Tentukan durasi berdasarkan apakah ini load pertama atau pindah halaman biasa
    // Kita bisa cek apakah performa navigasi bertipe 'reload' atau bukan, 
    // tapi cara paling aman dan simpel adalah mendeteksi via window performance jika diperlukan.
    // Untuk simplifikasi anti-stuck, kita pakai durasi rute standar yang cepat (900ms) agar user tidak menunggu lama.
    const isReload = window.performance && window.performance.getEntriesByType("navigation")[0]?.type === "reload";
    const duration = isReload ? INITIAL_DURATION : ROUTE_DURATION;

    const timer = setTimeout(() => {
      setLoading(false);
    }, duration);

    // Bersihkan timer jika komponen unmount atau rute berubah lagi sebelum timer selesai
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <PageLoader visible={loading} />
      {children}
    </>
  );
}