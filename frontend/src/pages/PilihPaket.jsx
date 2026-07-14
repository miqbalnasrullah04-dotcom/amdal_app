import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

const FALLBACK_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    price: 150000,
    duration: '6 bulan',
    features: ['Tampil di listing pencarian', 'Profil dasar (tanpa lencana verified)', '1 kategori keanggotaan'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 300000,
    duration: '12 bulan',
    features: [
      'Semua fitur Basic',
      'Lencana verified di profil',
      'Hingga 3 kategori keanggotaan',
      'Prioritas tampil di hasil pencarian',
    ],
    highlighted: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500000,
    duration: '12 bulan',
    features: [
      'Semua fitur Pro',
      'Featured di halaman utama',
      'Kategori keanggotaan tanpa batas',
      'Dukungan prioritas',
    ],
  },
];

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    value
  );
}

export default function PilihPaket() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/packages')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setPackages(data.length > 0 ? data : FALLBACK_PACKAGES);
      })
      .catch(() => setPackages(FALLBACK_PACKAGES))
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      await api.patch('/my/profile', { package_id: selected.id });
    } catch {
      // Backend belum tersedia — tetap lanjut ke pembayaran dalam mode demo.
    } finally {
      setSubmitting(false);
      navigate('/pembayaran', { state: { package: selected } });
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Pilih Paket">
        <div className="flex items-center gap-3 text-[#5B6660]">
          <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
          Memuat paket...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Pilih Paket Keanggotaan"
      subtitle="Pilih paket yang sesuai kebutuhan Anda untuk mengaktifkan profil."
    >
      <div className="w-full">
        {error && <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3 mb-6">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {packages.map((pkg) => {
            const isSelected = selected?.id === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelected(pkg)}
                className={`text-left rounded-2xl border-2 p-6 flex flex-col gap-4 transition-all bg-white ${
                  isSelected
                    ? 'border-[#2E5E3B] shadow-lg scale-[1.02]'
                    : pkg.highlighted
                    ? 'border-[#2E5E3B]/40 shadow-md'
                    : 'border-outline-variant/30 hover:border-[#2E5E3B]/40'
                }`}
              >
                {pkg.highlighted && (
                  <span className="self-start text-[10px] font-bold uppercase tracking-wide bg-[#2E5E3B] text-white px-2.5 py-1 rounded-full">
                    Paling Populer
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-on-background">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-[#2E5E3B] mt-1">
                    {formatRupiah(pkg.price)}
                    <span className="text-sm font-normal text-on-surface-variant"> / {pkg.duration}</span>
                  </p>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {pkg.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-[#2E5E3B] mt-0.5">check</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className={`w-full text-center text-sm font-semibold py-2 rounded-lg border ${
                    isSelected
                      ? 'bg-[#2E5E3B] text-white border-[#2E5E3B]'
                      : 'border-[#2E5E3B]/40 text-[#2E5E3B]'
                  }`}
                >
                  {isSelected ? 'Dipilih' : 'Pilih Paket Ini'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            disabled={!selected || submitting}
            onClick={handleContinue}
            className="bg-[#2E5E3B] text-white py-3 px-10 rounded-full font-label-md hover:bg-[#244B2F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}