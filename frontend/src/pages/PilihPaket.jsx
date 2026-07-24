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
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load packages dan expert profile
    Promise.all([
      api.get('/packages'),
      api.get('/my/profile'),
    ])
      .then(([packagesRes, profileRes]) => {
        const data = Array.isArray(packagesRes.data) ? packagesRes.data : [];
        if (data.length > 0) {
          const normalised = data.map((pkg) => ({
            ...pkg,
            features: Array.isArray(pkg.benefits)
              ? pkg.benefits
              : Array.isArray(pkg.features)
              ? pkg.features
              : (pkg.description?.split('\n').filter(Boolean) ?? []),
          }));
          setPackages(normalised);
        }
        setExpert(profileRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activePackageId = expert?.package_id || 'free';
  const activePackage = packages.find(p => p.id === activePackageId);
  const isFreePackageActive = activePackage && activePackage.price === 0;
  const canUpgrade = !expert?.package_id || isFreePackageActive;

  const handleContinue = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      // Gunakan endpoint /my/choose-package yang sudah ada
      const res = await api.post('/my/choose-package', { package_id: selected.id });

      if (selected.price === 0) {
        // Paket Free langsung aktif
        navigate('/dashboard');
      } else {
        // Paket Premium - buka Midtrans Snap
        if (res.data?.snap_token) {
          // Load Midtrans Snap script jika belum ada
          if (!window.snap) {
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'your-client-key');
            document.head.appendChild(script);
            
            script.onload = () => {
              window.snap.pay(res.data.snap_token, {
                onSuccess: function(result) {
                  console.log('Payment success:', result);
                  navigate('/dashboard', { state: { message: 'Pembayaran berhasil! Paket Premium Anda akan segera diaktifkan.' } });
                },
                onPending: function(result) {
                  console.log('Payment pending:', result);
                  navigate('/pembayaran', { state: { order: res.data.order } });
                },
                onError: function(result) {
                  console.log('Payment error:', result);
                  setError('Pembayaran gagal. Silakan coba lagi.');
                  setSubmitting(false);
                },
                onClose: function() {
                  console.log('Payment popup closed');
                  setSubmitting(false);
                }
              });
            };
          } else {
            // Snap sudah loaded, langsung panggil
            window.snap.pay(res.data.snap_token, {
              onSuccess: function(result) {
                console.log('Payment success:', result);
                navigate('/dashboard', { state: { message: 'Pembayaran berhasil! Paket Premium Anda akan segera diaktifkan.' } });
              },
              onPending: function(result) {
                console.log('Payment pending:', result);
                navigate('/pembayaran', { state: { order: res.data.order } });
              },
              onError: function(result) {
                console.log('Payment error:', result);
                setError('Pembayaran gagal. Silakan coba lagi.');
                setSubmitting(false);
              },
              onClose: function() {
                console.log('Payment popup closed');
                setSubmitting(false);
              }
            });
          }
        } else {
          // Fallback ke halaman pembayaran manual
          navigate('/pembayaran', { state: { order: res.data.order } });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memilih paket. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Pilih Paket Keanggotaan"
        subtitle="Pilih paket yang sesuai untuk mengaktifkan publikasi profil Anda."
      >
        <div className="flex items-center gap-3 text-[#5B6660]">
          <span className="w-5 h-5 rounded-full border-2 border-[#0EA5E9]/30 border-t-[#0EA5E9] animate-spin" />
          Memuat data paket...
        </div>
      </DashboardLayout>
    );
  }

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
            const isActive = activePackageId === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => !isActive && setSelected(pkg)}
                disabled={isActive}
                className={`text-left rounded-2xl border-2 p-6 flex flex-col gap-4 transition-all bg-white w-full ${
                  isActive
                    ? 'border-[#2E5E3B] ring-2 ring-[#2E5E3B]/20 cursor-default'
                    : isSelected
                    ? 'border-[#0EA5E9] ring-2 ring-[#0EA5E9]/20'
                    : pkg.highlighted
                    ? 'border-[#0EA5E9]/40 hover:border-[#0EA5E9]'
                    : 'border-outline-variant/30 hover:border-[#0EA5E9]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {pkg.badge && !isActive && (
                    <span className="self-start text-[10px] font-bold uppercase tracking-wide bg-[#0EA5E9] text-white px-2.5 py-1 rounded-full">
                      {pkg.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="self-start text-[10px] font-bold uppercase tracking-wide bg-[#2E5E3B] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      Paket Aktif
                    </span>
                  )}
                </div>
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
                {pkg.note && !isActive && (
                  <p className="text-xs text-on-surface-variant/70 bg-[#F0F9FF] rounded-lg px-3 py-2 border border-[#0EA5E9]/20">
                    {pkg.note}
                  </p>
                )}
                {isActive ? (
                  <div className="w-full text-center text-sm font-semibold py-2.5 rounded-xl border-2 bg-[#E3F2E7] text-[#2E5E3B] border-[#2E5E3B]">
                    <span className="flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Paket Anda Saat Ini
                    </span>
                  </div>
                ) : (
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
                    ) : (pkg.id === 'premium' ? 'Upgrade Sekarang' : 'Pilih Paket Ini')}
                  </div>
                )}
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

        {canUpgrade && (
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
                <><span className="material-symbols-outlined text-[18px]">arrow_forward</span>{isFreePackageActive ? 'Upgrade ke Premium' : 'Lanjut ke Pembayaran'}</>
              )}
            </button>
          </div>
        )}

        {!canUpgrade && (
          <div className="bg-[#E3F2E7] rounded-xl p-5 flex items-start gap-3 text-sm text-[#1C3822]">
            <span className="material-symbols-outlined text-[#2E5E3B] text-[20px] shrink-0 mt-0.5">info</span>
            <div>
              <p className="font-semibold mb-1">Paket Sudah Aktif</p>
              <p className="leading-relaxed">
                Anda sudah memiliki paket premium yang aktif. Jika ingin mengganti paket, silakan hubungi admin atau tunggu masa berlaku paket saat ini berakhir.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}