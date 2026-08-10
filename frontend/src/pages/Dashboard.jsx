import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import LevelBadge from '../components/LevelBadge.jsx';

// ---------------------------------------------------------------------------
// Design tokens — satu sumber warna & nuansa untuk seluruh halaman.
// ---------------------------------------------------------------------------
const TONE = {
  neutral: { fg: '#5B6660', bg: '#F5F4F0', dot: '#5B6660' },
  info: { fg: '#0284C7', bg: '#E0F2FE', dot: '#0EA5E9', border: '#BAE6FD', text: '#075985', textSoft: '#0369A1' },
  success: { fg: '#2E5E3B', bg: '#E3F2E7', dot: '#2E5E3B', border: '#2E5E3B33', text: '#1C3822', textSoft: '#2E5E3B' },
  warning: { fg: '#7A5900', bg: '#FFF4D6', dot: '#7A5900', border: '#FCD34D', text: '#5C4A00', textSoft: '#5C4A00' },
  danger: { fg: '#B3261E', bg: '#FFDAD6', dot: '#B3261E', border: '#FFB4AB', text: '#93000A', textSoft: '#410002' },
  amber: { fg: '#D97706', bg: '#FFF4E6', dot: '#D97706', border: '#FCD34D', text: '#92400E', textSoft: '#92400E' },
};

const BRAND_PRIMARY = '#0EA5E9';
const BRAND_PRIMARY_DARK = '#0284C7';
const BRAND_GREEN = '#2E5E3B';

// ---------------------------------------------------------------------------
// Sub-komponen presentasional — dipakai berulang di bawah supaya konsisten.
// ---------------------------------------------------------------------------

function StatCard({ icon, tone, label, value, dot, desc, extra }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: tone.bg, color: tone.fg }}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">{label}</p>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {dot && <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
          <p className="font-bold text-on-background text-sm truncate">{value}</p>
        </div>
        {extra}
        {desc && <p className="text-xs text-on-surface-variant leading-relaxed">{desc}</p>}
      </div>
    </div>
  );
}

function AlertBanner({ tone, icon, elevated, title, badge, children, action, secondaryAction }) {
  return (
    <div
      className="rounded-2xl p-6 border animate-fadeIn"
      style={{ backgroundColor: tone.bg, borderColor: tone.border }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="rounded-xl shrink-0 flex items-center justify-center"
            style={elevated
              ? { backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px' }
              : { backgroundColor: `${tone.fg}1A`, padding: '10px' }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: elevated ? 32 : 28, color: tone.fg }}
            >
              {icon}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="font-bold text-base mb-2 flex items-center gap-2 flex-wrap"
              style={{ color: tone.text }}
            >
              {title}
              {badge && (
                <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ backgroundColor: tone.fg }}>
                  {badge}
                </span>
              )}
            </h3>
            <div className="text-sm leading-relaxed" style={{ color: tone.textSoft }}>
              {children}
            </div>
          </div>
        </div>
        {(action || secondaryAction) && (
          <div className="flex flex-wrap gap-3 shrink-0">
            {secondaryAction}
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon, children, onClick, tone = BRAND_PRIMARY, toneDark = BRAND_PRIMARY_DARK, pill = true, elevated = true, as: Comp = 'button', to }) {
  const commonProps = {
    className: `text-white text-sm font-bold px-6 py-3 ${pill ? 'rounded-full' : 'rounded-xl'} transition-all flex items-center gap-2 shrink-0 hover:brightness-[0.92] ${elevated ? 'shadow-md hover:shadow-lg' : ''}`,
    style: { backgroundColor: tone },
  };
  const content = (
    <>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {children}
    </>
  );
  if (Comp === Link) {
    return <Link to={to} {...commonProps}>{content}</Link>;
  }
  return <button type="button" onClick={onClick} {...commonProps}>{content}</button>;
}

function QuickAction({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-outline-variant/30 hover:border-[#2E5E3B] hover:bg-[#2E5E3B]/5 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <span className="material-symbols-outlined text-[26px] text-[#2E5E3B] group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-xs font-semibold text-center text-on-surface-variant group-hover:text-[#2E5E3B]">{label}</span>
    </Link>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pointsData, setPointsData] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [profileRes, ordersRes, pointsRes] = await Promise.all([
          api.get('/my/profile').catch(() => ({ data: null })),
          api.get('/orders/history').catch(() => ({ data: [] })),
          api.get('/my/points').catch(() => ({ data: null }))
        ]);

        if (profileRes.data) {
          setExpert(profileRes.data);
        } else {
          setError(t('dashboard.error_load_profile', 'Gagal memuat data profil.'));
        }

        const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.data || []);
        setOrders(ordersData);

        if (pointsRes.data) {
          setPointsData(pointsRes.data);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(t('dashboard.error_load_dashboard', 'Gagal memuat data dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [t]);

  const name = expert?.name || t('dashboard.default_user', 'Pengguna');
  const profileStatus = expert?.profile_status || 'draft';
  const rejectReason = expert?.reject_reason;

  // Status definitions
  const isApproved = profileStatus === 'aktif';
  const isRejected = profileStatus === 'ditolak';
  const isPending = profileStatus === 'menunggu_verifikasi';
  const isDraft = profileStatus === 'draft';

  // Profile completeness check
  const hasBasicInfo = expert?.name && expert?.phone && expert?.institution && expert?.field;
  const hasEducation = expert?.educations && expert?.educations.length > 0;
  const hasPhoto = !!expert?.photo;
  const profileCompleteness = [hasBasicInfo, hasEducation, hasPhoto].filter(Boolean).length;
  const isProfileComplete = profileCompleteness >= 2; // Minimum: basic info + at least one more

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'menunggu_pembayaran');
  const hasPendingPayment = pendingOrders.length > 0;

  // Package & publication status
  const hasPackage = !!expert?.package_id || isApproved;
  const packageName = expert?.package?.name || (isApproved ? t('dashboard.package.free', 'Free') : t('dashboard.not_selected', 'Belum Dipilih'));
  const isFreePackage = !expert?.package_id || (expert?.package?.price === 0) || (packageName === t('dashboard.package.free', 'Free'));

  // Dokumen check (is submission sent?)
  const hasPaidPackage = hasPackage && !hasPendingPayment;
  const needsDocumentUpload = hasPaidPackage && isDraft;

  const isPublished = isApproved && hasPackage;

  // ---- Derived display data for the status cards ----
  const accountStatusTone = isApproved ? TONE.success : isRejected ? TONE.danger : isPending ? TONE.warning : TONE.neutral;
  const accountStatusIcon = isApproved ? 'check_circle' : isRejected ? 'cancel' : isPending ? 'hourglass_top' : 'edit_note';
  const accountStatusLabel = isApproved ? t('dashboard.status.approved', 'Disetujui') : isRejected ? t('dashboard.status.rejected', 'Ditolak') : isPending ? t('dashboard.status.pending', 'Menunggu Verifikasi') : t('dashboard.status.draft', 'Draf');
  const accountStatusDesc = isApproved
    ? t('dashboard.status.approved_desc', 'Akun telah diverifikasi admin')
    : isRejected
    ? t('dashboard.status.rejected_desc', 'Perlu perbaikan data')
    : isPending
    ? t('dashboard.status.pending_desc', 'Sedang ditinjau admin')
    : needsDocumentUpload
    ? t('dashboard.status.need_upload_desc', 'Perlu upload dokumen')
    : hasPendingPayment
    ? t('dashboard.status.pending_payment_desc', 'Menunggu pembayaran')
    : t('dashboard.status.complete_profile_desc', 'Lengkapi profil Anda');

  const welcomeTitle = t('dashboard.welcome', 'Halo, {name}!').replace('{name}', name.split(' ')[0]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title={t('dashboard.title', 'Dashboard')}
        subtitle={t('dashboard.subtitle', 'Kelola profil tenaga ahli Anda dan pantau status publikasi.')}
      >
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-[#5B6660] font-medium">{t('dashboard.loading', 'Memuat data dashboard...')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={welcomeTitle}
      subtitle={t('dashboard.subtitle', 'Kelola profil tenaga ahli Anda dan pantau status publikasi.')}
    >
      {error && (
        <div className="bg-error-container text-on-error-container text-sm rounded-xl p-4 mb-6 flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-6 animate-fadeIn">

        {/* STATUS CARDS ------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            icon={accountStatusIcon}
            tone={accountStatusTone}
            dot={accountStatusTone.dot}
            label={t('dashboard.account_status', 'Status Akun')}
            value={accountStatusLabel}
            desc={accountStatusDesc}
          />

          <StatCard
            icon="public"
            tone={isPublished ? TONE.info : TONE.neutral}
            dot={isPublished ? BRAND_PRIMARY : TONE.danger.dot}
            label={t('dashboard.publication_status', 'Status Publikasi')}
            value={isPublished ? t('dashboard.published_live', 'Tayang Publik') : t('dashboard.not_published', 'Belum Tayang')}
            desc={isPublished ? t('dashboard.published_desc', 'Profil tampil di direktori') : t('dashboard.not_published_desc', 'Aktifkan akun & pilih paket')}
          />

          <StatCard
            icon="workspace_premium"
            tone={hasPackage ? TONE.amber : TONE.neutral}
            label={t('dashboard.active_package', 'Paket Aktif')}
            value={packageName}
            extra={hasPackage && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-[#E3F2E7] text-[#2E5E3B] px-2 py-0.5 rounded-full mb-1.5">
                <span className="material-symbols-outlined text-[11px]">check_circle</span>
                {t('dashboard.your_current_package', 'Paket Anda Saat Ini')}
              </span>
            )}
            desc={
              hasPackage && isFreePackage ? (
                <Link to="/paket" className="text-xs text-[#0EA5E9] font-bold hover:underline inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">upgrade</span>
                  {t('dashboard.upgrade_now', 'Upgrade Sekarang')}
                </Link>
              ) : hasPackage ? (
                <span className="text-xs text-on-surface-variant">{t('dashboard.active_subscription', 'Langganan aktif')}</span>
              ) : (
                <Link to="/paket" className="text-xs text-[#0EA5E9] font-bold hover:underline inline-flex items-center gap-1">
                  {t('dashboard.choose_package', 'Pilih Paket')} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              )
            }
          />
        </div>

        {/* POINTS & LEVEL ------------------------------------------------ */}
        {pointsData && (
          <div className="relative overflow-hidden rounded-2xl shadow-lg text-white" style={{ background: `linear-gradient(135deg, ${BRAND_PRIMARY}, ${BRAND_PRIMARY_DARK})` }}>
            {/* dekorasi lingkaran halus di background */}
            <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -right-6 bottom-0 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

            <div className="relative p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-sm opacity-90 mb-1">{t('dashboard.your_points_level', 'Poin & Level Anda')}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-4xl font-black tracking-tight">{pointsData.total_points}</p>
                    <LevelBadge
                      level={pointsData.level}
                      size="lg"
                      className="bg-white/20 text-white"
                    />
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[32px]">stars</span>
                </div>
              </div>

              {pointsData.progress && pointsData.progress.next_level && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-90">{t('dashboard.progress_to', 'Progress ke')} {pointsData.progress.next_level}</span>
                    <span className="font-bold">{pointsData.progress.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${pointsData.progress.progress}%` }}
                    />
                  </div>
                  <p className="text-xs opacity-75">
                    {pointsData.progress.points_needed} {t('dashboard.points_needed', 'poin lagi untuk naik level')}
                  </p>
                </div>
              )}

              {pointsData.progress && !pointsData.progress.next_level && (
                <div className="bg-white/10 rounded-xl p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                  <p className="text-sm font-semibold">{t('dashboard.max_level_reached', 'Anda sudah di level maksimal: Diamond!')}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20">
                <div className="text-center">
                  <p className="text-2xl font-bold">{pointsData.history?.length || 0}</p>
                  <p className="text-xs opacity-75">{t('dashboard.activities', 'Aktivitas')}</p>
                </div>
                <div className="text-center border-x border-white/20">
                  <p className="text-2xl font-bold">{pointsData.level?.min || 0}</p>
                  <p className="text-xs opacity-75">{t('dashboard.min_points', 'Min Poin')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {pointsData.level?.max === Number.MAX_SAFE_INTEGER ? '∞' : pointsData.level?.max || 0}
                  </p>
                  <p className="text-xs opacity-75">{t('dashboard.max_points', 'Max Poin')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALERT BANNERS -------------------------------------------------- */}

        {/* DITOLAK — Perlu Perbaikan */}
        {isRejected && (
          <AlertBanner
            tone={TONE.danger}
            icon="error"
            title={t('dashboard.rejected_title', 'Data Pendaftaran Perlu Diperbaiki')}
          >
            <div className="bg-white/50 rounded-xl p-4 mb-4 border" style={{ borderColor: `${TONE.danger.fg}33` }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: TONE.danger.text }}>
                {t('dashboard.admin_note', 'Catatan dari Admin:')}
              </p>
              <p className="text-sm leading-relaxed font-medium" style={{ color: TONE.danger.textSoft }}>
                {rejectReason || t('dashboard.rejected_desc', 'Data atau dokumen yang diunggah belum memenuhi syarat. Harap periksa kembali.')}
              </p>
            </div>
            <ActionButton icon="edit" onClick={() => navigate('/profil-saya')} tone={TONE.danger.fg} toneDark={TONE.danger.text} pill={false}>
              {t('dashboard.fix_profile', 'Perbaiki Profil Sekarang')}
            </ActionButton>
          </AlertBanner>
        )}

        {/* MENUNGGU VERIFIKASI */}
        {isPending && (
          <AlertBanner tone={TONE.warning} icon="schedule" title={t('dashboard.pending_title', 'Menunggu Verifikasi Admin')}>
            <p
              className="mb-3"
              dangerouslySetInnerHTML={{ __html: t('dashboard.pending_verification_message', 'Terima kasih telah mendaftar! Data Anda sedang dalam proses verifikasi oleh tim kami. Harap bersabar, proses ini biasanya <strong>memakan waktu 1-3 hari kerja</strong>.') }}
            />
            <div className="flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>{t('dashboard.check_email', 'Pastikan Anda memeriksa email secara berkala (termasuk folder spam).')}</span>
            </div>
          </AlertBanner>
        )}

        {/* DRAFT — Lengkapi Profil */}
        {!isProfileComplete && !hasPendingPayment && !needsDocumentUpload && (
          <AlertBanner
            tone={TONE.info}
            icon="edit_note"
            title={t('dashboard.complete_profile_title', 'Lengkapi Profil Anda')}
            action={
              <ActionButton icon="arrow_forward" onClick={() => navigate('/profil-saya')}>
                {t('dashboard.complete_now', 'Lengkapi Sekarang')}
              </ActionButton>
            }
          >
            <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('dashboard.complete_profile_desc', { completeness: profileCompleteness }) }} />
            <div className="flex flex-wrap gap-2">
              {!hasBasicInfo && <span className="text-xs bg-white/60 px-2.5 py-1 rounded-full border" style={{ borderColor: `${BRAND_PRIMARY}4D`, color: TONE.info.text }}>{t('dashboard.req_basic_info', 'Data Pribadi')}</span>}
              {!hasEducation && <span className="text-xs bg-white/60 px-2.5 py-1 rounded-full border" style={{ borderColor: `${BRAND_PRIMARY}4D`, color: TONE.info.text }}>{t('dashboard.req_education', 'Pendidikan')}</span>}
              {!hasPhoto && <span className="text-xs bg-white/60 px-2.5 py-1 rounded-full border" style={{ borderColor: `${BRAND_PRIMARY}4D`, color: TONE.info.text }}>{t('dashboard.req_photo', 'Foto Profil')}</span>}
            </div>
          </AlertBanner>
        )}

        {/* PROFIL LENGKAP TAPI BELUM PILIH PAKET */}
        {isProfileComplete && !hasPackage && !hasPendingPayment && (
          <AlertBanner
            tone={TONE.info}
            icon="workspace_premium"
            elevated
            title={t('dashboard.choose_package_title', 'Pilih Paket Keanggotaan')}
            action={
              <ActionButton icon="arrow_forward" onClick={() => navigate('/paket')}>
                {t('dashboard.choose_package_btn', 'Pilih Paket')}
              </ActionButton>
            }
          >
            {t('dashboard.choose_package_desc', 'Profil Anda sudah lengkap! Langkah selanjutnya adalah memilih paket keanggotaan (Free atau Premium) agar Anda dapat mengunggah dokumen dan diverifikasi oleh admin.')}
          </AlertBanner>
        )}

        {/* ADA INVOICE PENDING */}
        {hasPendingPayment && (
          <AlertBanner
            tone={TONE.amber}
            icon="receipt_long"
            title={t('dashboard.pending_payment_title', 'Segera Lunasi Pembayaran Anda')}
            action={
              <ActionButton icon="payment" onClick={() => navigate(`/invoice/${pendingOrders[0].id || pendingOrders[0].reference_code}`)} tone={TONE.amber.fg} toneDark={TONE.amber.text}>
                {t('dashboard.pay_now', 'Bayar Sekarang')}
              </ActionButton>
            }
          >
            {t('dashboard.pending_payment_desc', 'Anda memiliki tagihan paket yang belum dibayar. Selesaikan pembayaran sekarang agar Anda dapat melanjutkan ke tahap verifikasi.')}
          </AlertBanner>
        )}

        {/* SUDAH LUNAS TAPI BELUM UPLOAD DOKUMEN */}
        {needsDocumentUpload && (
          <AlertBanner
            tone={TONE.info}
            icon="upload_file"
            title={t('dashboard.upload_doc_title', 'Upload Dokumen Pendukung')}
            action={
              <ActionButton icon="cloud_upload" onClick={() => navigate('/profil-saya')}>
                {t('dashboard.upload_doc_btn', 'Upload Dokumen')}
              </ActionButton>
            }
          >
            {t('dashboard.upload_doc_desc', 'Paket Anda sudah aktif! Silakan unggah dokumen pendukung seperti KTP dan sertifikat agar tim kami dapat segera melakukan verifikasi akun Anda.')}
          </AlertBanner>
        )}

        {/* APPROVED + PAKET FREE — Upgrade Prompt */}
        {isApproved && isFreePackage && (
          <AlertBanner
            tone={TONE.info}
            icon="rocket_launch"
            elevated
            title={t('dashboard.upgrade_premium_title', 'Tingkatkan ke Premium!')}
            action={
              <ActionButton icon="workspace_premium" onClick={() => navigate('/paket')}>
                {t('dashboard.upgrade_now_btn', 'Upgrade Sekarang')}
              </ActionButton>
            }
          >
            <span dangerouslySetInnerHTML={{ __html: t('dashboard.upgrade_premium_description', 'Dapatkan visibilitas lebih tinggi, badge premium, dan fitur unggulan lainnya dengan upgrade ke paket <strong>Premium</strong>.') }} />
          </AlertBanner>
        )}

        {/* PUBLISHED — Success State */}
        {isPublished && (
          <AlertBanner
            tone={TONE.success}
            icon="verified"
            elevated
            title={t('dashboard.published_title', 'Profil Anda Sedang Tayang!')}
            badge={t('dashboard.live_badge', 'LIVE')}
            action={
              <Link
                to="/profil-publik"
                className="bg-white border-2 text-sm font-bold px-5 py-2.5 rounded-xl hover:text-white transition-colors flex items-center gap-2 shrink-0"
                style={{ color: BRAND_GREEN, borderColor: BRAND_GREEN }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = BRAND_GREEN; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                {t('dashboard.view_public_profile', 'Lihat Profil Publik')}
              </Link>
            }
            secondaryAction={
              <Link
                to="/profil-saya"
                className="text-sm font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shrink-0"
                style={{ backgroundColor: `${BRAND_GREEN}1A`, color: BRAND_GREEN }}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                {t('dashboard.edit_profile', 'Edit Profil')}
              </Link>
            }
          >
            {t('dashboard.published_success_desc', 'Profil tenaga ahli Anda sudah aktif dan dapat dilihat oleh publik di direktori website. Pastikan data Anda selalu up-to-date agar mendapat peluang kolaborasi lebih baik.')}
          </AlertBanner>
        )}

        {/* QUICK ACTIONS ---------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
          <h2 className="text-sm font-bold text-[#1F2A22] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2E5E3B]">apps</span>
            {t('dashboard.quick_access', 'Akses Cepat')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickAction to="/profil-saya" icon="person" label={t('dashboard.my_profile', 'Profil Saya')} />
            <QuickAction to="/paket" icon="workspace_premium" label={t('dashboard.packages', 'Paket')} />
            <QuickAction to="/pembayaran" icon="payments" label={t('dashboard.payments', 'Pembayaran')} />
            <QuickAction to="/profil-publik" icon="language" label={t('dashboard.public_profile', 'Profil Publik')} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}