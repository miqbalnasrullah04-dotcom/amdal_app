import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

const STATIC_PACKAGES = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    duration: 'Selamanya',
    badge: null,
    highlighted: false,
    features: [
      'Profil dasar tampil di direktori',
      '1 kategori keanggotaan',
      'Foto profil & bidang keahlian',
      'Dapat dihubungi via email',
    ],
    note: null,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 300000,
    duration: '12 bulan',
    badge: 'Direkomendasikan',
    highlighted: true,
    features: [
      'Semua fitur Free',
      'Lencana Verified di profil',
      'Hingga 3 kategori keanggotaan',
      'Prioritas tampil di hasil pencarian',
      'Featured di halaman utama (terpilih)',
      'Dukungan prioritas dari tim',
    ],
    note: 'Pembayaran dilakukan setelah akun disetujui oleh admin.',
  },
];

function formatRupiah(value) {
  if (value === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(value);
}

export default function PilihPaket() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState(STATIC_PACKAGES);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/packages')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          const normalised = data.map((pkg) => ({
            ...pkg,
            features: Array.isArray(pkg.features)
              ? pkg.features
              : (pkg.description?.split('\n').filter(Boolean) ?? []),
          }));
          setPackages(normalised);
        }
      })
      .catch(() => {});
  }, []);

  const handleContinue = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      await api.patch('/my/profile', { package_id: selected.id });
    } catch {}
    finally {
      setSubmitting(false);
      if (selected.price === 0) {
        navigate('/dashboard');
      } else {
        navigate('/pembayaran', { state: { package: selected } });
      }
    }
  };

  return (
    <DashboardLayout
      title="Pilih Paket Keanggotaan"
      subtitle="Pilih paket yang sesuai untuk mengaktifkan publikasi profil Anda."
    >
      <div className="w-full max-w-3xl">
        {error && (
          <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3 mb-6">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {packages.map((pkg) => {
            const isSelected = selected?.id === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelected(pkg)}
                className={`text-left rounded-2xl border-2 p-6 flex flex-col gap-4 transition-all bg-white w-full ${
                  isSelected
                    ? 'border-[#0EA5E9] ring-2 ring-[#0EA5E9]/20'
                    : pkg.highlighted
                    ? 'border-[#0EA5E9]/40'
                    : 'border-outline-variant/30 hover:border-[#0EA5E9]/40'
                }`}
              >
                {pkg.badge && (
                  <span className="self-start text-[10px] font-bold uppercase tracking-wide bg-[#0EA5E9] text-white px-2.5 py-1 rounded-full">
                    {pkg.badge}
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-on-background">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-[#0EA5E9] mt-1">
                    {formatRupiah(pkg.price)}
                    {pkg.price > 0 && (
                      <span className="text-sm font-normal text-on-surface-variant"> / {pkg.duration}</span>
                    )}
                  </p>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {(pkg.features ?? []).map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-[#0EA5E9] mt-0.5 shrink-0">check</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                {pkg.note && (
                  <p className="text-xs text-on-surface-variant/70 bg-[#F0F9FF] rounded-lg px-3 py-2 border border-[#0EA5E9]/20">
                    {pkg.note}
                  </p>
                )}
                <div className={`w-full text-center text-sm font-semibold py-2.5 rounded-xl border-2 transition-colors ${
                  isSelected
                    ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]'
                    : 'border-[#0EA5E9]/40 text-[#0EA5E9] hover:bg-[#0EA5E9]/5'
                }`}>
                  {isSelected ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Dipilih
                    </span>
                  ) : 'Pilih Paket Ini'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-[#E0F2FE] rounded-xl p-4 mb-8 flex gap-3 text-sm text-[#075985]">
          <span className="material-symbols-outlined text-[#0284C7] text-[20px] shrink-0 mt-0.5">info</span>
          <div>
            <p className="font-semibold mb-1">Tentang Paket Free & Premium</p>
            <p className="leading-relaxed">
              Paket <strong>Free</strong> langsung aktif tanpa biaya. Paket <strong>Premium</strong> memerlukan
              pembayaran dan akan diaktifkan setelah konfirmasi pembayaran oleh admin.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            disabled={!selected || submitting}
            onClick={handleContinue}
            className="bg-[#0EA5E9] text-white py-3.5 px-12 rounded-full font-bold text-sm hover:bg-[#0284C7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</>
            ) : selected?.price === 0 ? (
              <><span className="material-symbols-outlined text-[18px]">check_circle</span>Aktifkan Paket Free</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">arrow_forward</span>Lanjut ke Pembayaran</>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
