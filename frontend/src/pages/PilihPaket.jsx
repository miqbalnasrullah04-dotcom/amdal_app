import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

// ---------------------------------------------------------------------------
// Design tokens — satu sumber warna, dipakai konsisten di seluruh halaman.
// ---------------------------------------------------------------------------
const BRAND = {
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  navy: '#1E3A8A',
  green: '#2E5E3B',
  greenBg: '#E3F2E7',
  greenText: '#1C3822',
  amber: '#F59E0B',
  amberBg: '#FFF4D6',
  amberText: '#7A5900',
  neutralBg: '#F5F4F0',
  textMuted: '#5B6660',
  textDark: '#1F2A22',
  infoBg: '#E0F2FE',
  infoText: '#075985',
};

const getPAYMENTMETHODS = (t) => [
  {
    icon: 'qr_code_2',
    title: t('package.payment.qris', 'QRIS'),
    body: t('package.payment.qris_desc', 'Bayar langsung dengan scan QR dari semua e-wallet dan mobile banking'),
  },
  {
    icon: 'account_balance',
    title: t('package.payment.bank_transfer', 'Transfer Bank'),
    items: [
      t('package.payment.bca_va', 'BCA Virtual Account'), 
      t('package.payment.bni_va', 'BNI Virtual Account'), 
      t('package.payment.mandiri_va', 'Mandiri Virtual Account'), 
      t('package.payment.bri_va', 'BRI Virtual Account')
    ],
  },
  {
    icon: 'wallet',
    title: t('package.payment.ewallet', 'E-Wallet'),
    items: ['GoPay', 'ShopeePay', 'DANA', 'OVO'],
  },
  {
    icon: 'credit_card',
    title: t('package.payment.credit_card', 'Kartu Kredit/Debit'),
    items: ['Visa', 'Mastercard', 'JCB'],
  },
];

function formatRupiah(value, t) {
  if (value === 0) return t('package.free', 'Gratis');
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Sub-komponen presentasional kecil — mengurangi duplikasi markup di bawah.
// ---------------------------------------------------------------------------

function StatTile({ label, value, valueColor }) {
  return (
    <div className="bg-white/80 rounded-xl p-4">
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: BRAND.textMuted }}>
        {label}
      </p>
      <p className="text-2xl font-black" style={{ color: valueColor ?? BRAND.textDark }}>
        {value}
      </p>
    </div>
  );
}

function InfoBanner({ icon, iconColor, bg, textColor, title, children }) {
  return (
    <div className="rounded-xl px-4 py-3 flex items-start gap-2.5" style={{ backgroundColor: bg }}>
      <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ color: iconColor }}>
        {icon}
      </span>
      <div className="text-sm leading-relaxed" style={{ color: textColor }}>
        {title && <p className="font-semibold mb-1">{title}</p>}
        {children}
      </div>
    </div>
  );
}

function PaymentMethodCard({ icon, title, body, items }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: BRAND.neutralBg }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-[20px]" style={{ color: BRAND.primary }}>
          {icon}
        </span>
        <p className="font-bold text-sm" style={{ color: BRAND.textDark }}>{title}</p>
      </div>
      {body && <p className="text-xs leading-relaxed" style={{ color: BRAND.textMuted }}>{body}</p>}
      {items && (
        <ul className="text-xs space-y-1" style={{ color: BRAND.textMuted }}>
          {items.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: BRAND.primary }} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PilihPaket() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [expert, setExpert] = useState(null);
  const [membership, setMembership] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load packages dari database, expert profile, dan membership status
    Promise.all([
      api.get('/packages'),
      api.get('/my/profile'),
      api.get('/membership/status'),
      api.get('/membership/pricing'),
    ])
      .then(([packagesRes, profileRes, membershipRes, pricingRes]) => {
        const data = Array.isArray(packagesRes.data) ? packagesRes.data : [];

        // Normalize data dari database
        const normalizedPackages = data.map((pkg) => ({
          ...pkg,
          features: Array.isArray(pkg.benefits)
            ? pkg.benefits
            : Array.isArray(pkg.features)
            ? pkg.features
            : (pkg.description ? pkg.description.split('\n').filter(Boolean) : []),
          duration: pkg.duration || '12 bulan',
          highlighted: pkg.is_highlighted || pkg.name?.toLowerCase() === 'premium',
          badge: pkg.badge || (pkg.name?.toLowerCase() === 'premium' ? t('package.recommended', 'Direkomendasikan') : null),
        }));

        setPackages(normalizedPackages);
        setExpert(profileRes.data);
        setMembership(membershipRes.data.data);
        setPricing(pricingRes.data.data);
      })
      .catch((err) => {
        console.error('Error loading packages:', err);
        setError(t('package.error.load_failed', 'Gagal memuat data paket. Silakan refresh halaman.'));
      })
      .finally(() => setLoading(false));
  }, []);

  const activePackageId = expert?.package_id || 'free';
  const activePackage = packages.find((p) => p.id === activePackageId);
  const isFreePackageActive = activePackage && activePackage.price === 0;
  const canUpgrade = !expert?.package_id || isFreePackageActive;

  const handleContinue = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      if (selected.price === 0) {
        // Paket Free - gunakan endpoint lama
        await api.post('/my/choose-package', { package_id: selected.id });
        navigate('/dashboard', { state: { message: t('package.free_activated', 'Paket Free berhasil diaktifkan!') } });
      } else {
        // Paket Premium - gunakan endpoint membership baru
        const response = membership?.is_premium
          ? await api.post('/membership/renew')
          : await api.post('/membership/upgrade');

        // Arahkan ke halaman pembayaran
        const transaction = response.data.data;
        navigate(transaction?.id ? `/invoice/${transaction.id}` : '/pembayaran');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('package.error.process_failed', 'Gagal memproses paket. Coba lagi.'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title={t('package.choose_title', 'Pilih Paket')}
        subtitle={t('package.choose_subtitle', 'Pilih paket yang sesuai untuk mengaktifkan publikasi profil Anda.')}
      >
        <div className="flex items-center gap-3" style={{ color: BRAND.textMuted }}>
          <span
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: `${BRAND.primary}4D`, borderTopColor: BRAND.primary }}
          />
          {t('package.loading', 'Memuat data paket...')}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('package.choose_title', 'Pilih Paket')}
      subtitle={t('package.choose_subtitle', 'Pilih paket yang sesuai untuk mengaktifkan publikasi profil Anda.')}
    >
      <div className="w-full max-w-3xl flex flex-col gap-8">

        {error && (
          <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Membership Info */}
        {membership && (
          <section
            className="rounded-2xl border p-6 flex flex-col gap-4"
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary}1A, ${BRAND.navy}1A)`,
              borderColor: `${BRAND.primaryDark}33`,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${BRAND.primaryDark}1A` }}
                >
                  <span className="material-symbols-outlined text-[28px]" style={{ color: BRAND.primaryDark }}>
                    stars
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: BRAND.textDark }}>{t('package.membership_info', 'Membership Info')}</h3>
                  <p className="text-sm" style={{ color: BRAND.textMuted }}>{t('package.membership_desc', 'Level & benefit Anda')}</p>
                </div>
              </div>
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: membership.level_badge_color || '#9CA3AF' }}
              >
                {membership.level_display_name || 'Basic'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatTile label={t('package.stats.total_points', 'Total Point')} value={membership.points || 0} />
              <StatTile label={t('package.stats.your_discount', 'Diskon Anda')} value={`${membership.discount_percentage || 0}%`} valueColor={BRAND.primaryDark} />
              <StatTile
                label={membership.is_premium ? t('package.stats.remaining_days', 'Sisa Hari') : t('package.stats.status', 'Status')}
                value={membership.is_premium ? t('package.stats.days_left', '{days} hari').replace('{days}', membership.remaining_days) : t('package.stats.free', 'Free')}
                valueColor={BRAND.amber}
              />
            </div>

            {pricing && pricing.discount_percentage > 0 && (
              <InfoBanner icon="celebration" iconColor={BRAND.amber} bg={BRAND.amberBg} textColor={BRAND.amberText}>
                <span className="font-bold">{t('package.discount.congratulations', 'Selamat!')}</span> {t('package.discount.message', 'Anda mendapatkan diskon')}{' '}
                <span className="font-bold">{pricing.discount_percentage}%</span> {t('package.discount.for_renewal', 'untuk perpanjangan Premium. Harga:')}{' '}
                <span className="line-through opacity-70">{formatRupiah(pricing.original_price, t)}</span>{' '}
                <span className="font-bold" style={{ color: BRAND.primaryDark }}>
                  {formatRupiah(pricing.total_price, t)}
                </span>
              </InfoBanner>
            )}
          </section>
        )}

        {/* Daftar Paket */}
        {packages.length === 0 ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-5xl block mb-3" style={{ color: `${BRAND.textMuted}4D` }}>
              inventory_2
            </span>
            <p className="mb-4" style={{ color: BRAND.textMuted }}>{t('package.no_packages', 'Belum ada paket yang tersedia.')}</p>
            <button
              onClick={() => window.location.reload()}
              className="font-semibold text-sm hover:underline"
              style={{ color: BRAND.primary }}
            >
              {t('package.reload', 'Muat ulang')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => {
              const isSelected = selected?.id === pkg.id;
              const isActive = activePackageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => !isActive && setSelected(pkg)}
                  disabled={isActive}
                  className={`text-left rounded-2xl border-2 p-6 flex flex-col gap-4 h-full bg-white w-full transition-all duration-150 ${
                    isActive
                      ? 'ring-2 cursor-default'
                      : isSelected
                      ? 'ring-2 shadow-sm'
                      : 'hover:shadow-sm'
                  }`}
                  style={{
                    borderColor: isActive
                      ? BRAND.green
                      : isSelected
                      ? BRAND.primary
                      : pkg.highlighted
                      ? `${BRAND.primary}66`
                      : 'rgba(0,0,0,0.08)',
                    ...(isActive && { boxShadow: `0 0 0 4px ${BRAND.green}33` }),
                    ...(isSelected && !isActive && { boxShadow: `0 0 0 4px ${BRAND.primary}33` }),
                  }}
                >
                  <div className="min-h-[22px]">
                    {pkg.badge && !isActive && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide text-white px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: BRAND.primary }}
                      >
                        {pkg.badge}
                      </span>
                    )}
                    {isActive && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide text-white px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                        style={{ backgroundColor: BRAND.green }}
                      >
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        {t('package.status.active', 'Aktif')}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold" style={{ color: BRAND.textDark }}>{pkg.name}</h3>
                    <p className="text-2xl font-bold mt-1" style={{ color: BRAND.primary }}>
                      {formatRupiah(pkg.price, t)}
                      {pkg.price > 0 && (
                        <span className="text-sm font-normal" style={{ color: BRAND.textMuted }}> / {pkg.duration}</span>
                      )}
                    </p>
                  </div>

                  <ul className="flex flex-col gap-2 flex-1">
                    {(pkg.features ?? []).map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm" style={{ color: BRAND.textMuted }}>
                        <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0" style={{ color: BRAND.primary }}>
                          check
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.note && !isActive && (
                    <p
                      className="text-xs rounded-lg px-3 py-2 border"
                      style={{ backgroundColor: '#F0F9FF', borderColor: `${BRAND.primary}33`, color: BRAND.textMuted }}
                    >
                      {pkg.note}
                    </p>
                  )}

                  {isActive ? (
                    <div
                      className="w-full text-center text-sm font-semibold py-2.5 rounded-xl border-2 flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: BRAND.greenBg, color: BRAND.green, borderColor: BRAND.green }}
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      {t('package.current_package', 'Paket Saat Ini')}
                    </div>
                  ) : (
                    <div
                      className="w-full text-center text-sm font-semibold py-2.5 rounded-xl border-2 transition-colors flex items-center justify-center gap-1.5"
                      style={
                        isSelected
                          ? { backgroundColor: BRAND.primary, color: 'white', borderColor: BRAND.primary }
                          : { borderColor: `${BRAND.primary}66`, color: BRAND.primary }
                      }
                    >
                      {isSelected ? (
                        <>
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          {t('package.selected', 'Dipilih')}
                        </>
                      ) : (
                        pkg.id === 'premium' ? t('package.upgrade_now', 'Upgrade Sekarang') : t('package.choose_this', 'Pilih Paket Ini')
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <InfoBanner icon="info" iconColor={BRAND.primaryDark} bg={BRAND.infoBg} textColor={BRAND.infoText}
          title={t('package.info.title', 'Tentang Paket Free & Premium')}>
          <p dangerouslySetInnerHTML={{ __html: t('package.info.description', 'Paket Free langsung aktif tanpa biaya. Paket Premium memerlukan pembayaran dan akan diaktifkan setelah konfirmasi pembayaran oleh admin.') }} />
        </InfoBanner>

        {/* Metode Pembayaran */}
        <section className="bg-white rounded-xl border p-6 flex flex-col gap-5" style={{ borderColor: `${BRAND.primaryDark}33` }}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-[24px]" style={{ color: BRAND.primaryDark }}>payment</span>
              <h3 className="text-lg font-bold" style={{ color: BRAND.textDark }}>{t('package.payment_methods', 'Metode Pembayaran')}</h3>
            </div>
            <p className="text-sm" style={{ color: BRAND.textMuted }}>
              {t('package.payment_description', 'Kami menyediakan berbagai pilihan metode pembayaran yang aman dan mudah:')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getPAYMENTMETHODS(t).map((method) => (
              <PaymentMethodCard key={method.title} {...method} />
            ))}
          </div>

          <InfoBanner icon="verified_user" iconColor={BRAND.amberText} bg={BRAND.amberBg} textColor={BRAND.amberText}>
            <p
              className="text-xs"
              dangerouslySetInnerHTML={{ __html: t('package.security_info', 'Semua transaksi dilindungi dengan enkripsi SSL dan diproses melalui gateway pembayaran Midtrans yang telah tersertifikasi PCI DSS Level 1.') }}
            />
          </InfoBanner>
        </section>

        {/* Aksi */}
        {canUpgrade ? (
          <div className="flex justify-center">
            <button
              type="button"
              disabled={!selected || submitting}
              onClick={handleContinue}
              className="text-white py-3.5 px-12 rounded-full font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: BRAND.primary }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = BRAND.primaryDark; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BRAND.primary; }}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('package.processing', 'Memproses...')}
                </>
              ) : selected?.price === 0 ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {t('package.activate_free', 'Aktifkan Paket Free')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  {isFreePackageActive ? t('package.upgrade_premium', 'Upgrade ke Premium') : t('package.continue_payment', 'Lanjut ke Pembayaran')}
                </>
              )}
            </button>
          </div>
        ) : (
          <InfoBanner icon="info" iconColor={BRAND.green} bg={BRAND.greenBg} textColor={BRAND.greenText}
            title={t('package.already_active_title', 'Paket Sudah Aktif')}>
            {t('package.already_active_desc', 'Anda sudah memiliki paket premium yang aktif. Jika ingin mengganti paket, silakan hubungi admin.')}
          </InfoBanner>
        )}
      </div>
    </DashboardLayout>
  );
}