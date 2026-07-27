import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import LevelBadge from '../components/LevelBadge.jsx';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [error, setError] = useState('');
  const [pointsData, setPointsData] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/my/profile').catch(() => ({ data: null })),
      api.get('/orders/history').catch(() => ({ data: [] })),
      api.get('/my/points').catch(() => ({ data: null }))
    ])
      .then(([profileRes, ordersRes, pointsRes]) => {
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
      })
      .catch(() => setError(t('dashboard.error_load_dashboard', 'Gagal memuat data dashboard.')));
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
  const packageName = expert?.package?.name || (isApproved ? 'Free' : t('dashboard.not_selected', 'Belum Dipilih'));
  const isFreePackage = !expert?.package_id || (expert?.package?.price === 0) || (packageName === 'Free');
  
  // Dokumen check (is submission sent?)
  const hasPaidPackage = hasPackage && !hasPendingPayment;
  const needsDocumentUpload = hasPaidPackage && isDraft;
  
  const isPublished = isApproved && hasPackage;

  return (
    <DashboardLayout
      title={t('dashboard.welcome', { name: name.split(' ')[0] })}
      subtitle={t('dashboard.subtitle', 'Kelola profil tenaga ahli Anda dan pantau status publikasi.')}
    >
      {error && (
        <div className="bg-error-container text-on-error-container text-sm rounded-xl p-4 mb-6 flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-6 animate-fadeIn">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STATUS CARDS                                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Status Akun */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl shrink-0 ${
              isApproved ? 'bg-[#E3F2E7] text-[#2E5E3B]' : 
              isRejected ? 'bg-[#FFDAD6] text-[#B3261E]' :
              isPending ? 'bg-[#FFF4D6] text-[#7A5900]' :
              'bg-[#F5F4F0] text-[#5B6660]'
            }`}>
              <span className="material-symbols-outlined text-[28px]">
                {isApproved ? 'check_circle' : isRejected ? 'cancel' : isPending ? 'hourglass_top' : 'edit_note'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">{t('dashboard.account_status')}</p>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isApproved ? 'bg-[#2E5E3B]' : 
                  isRejected ? 'bg-[#B3261E]' :
                  isPending ? 'bg-[#7A5900]' :
                  'bg-[#5B6660]'
                }`}></span>
                <p className="font-bold text-on-background text-sm">
                  {isApproved ? t('profile.approved') : 
                   isRejected ? t('profile.rejected') :
                   isPending ? t('profile.pending') :
                   t('profile.draft')}
                </p>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isApproved ? t('dashboard.account_verified') : 
                 isRejected ? t('dashboard.account_rejected') :
                 isPending ? t('dashboard.account_pending') :
                 needsDocumentUpload ? t('dashboard.need_documents') :
                 hasPendingPayment ? t('dashboard.pending_payment') :
                 t('dashboard.complete_profile')}
              </p>
            </div>
          </div>

          {/* Status Verifikasi / Publikasi */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl shrink-0 ${
              isPublished ? 'bg-[#E0F2FE] text-[#0EA5E9]' : 'bg-[#F5F4F0] text-[#5B6660]'
            }`}>
              <span className="material-symbols-outlined text-[28px]">public</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">{t('dashboard.publication_status', 'Status Publikasi')}</p>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isPublished ? 'bg-[#0EA5E9]' : 'bg-[#B3261E]'
                }`}></span>
                <p className="font-bold text-on-background text-sm">
                  {isPublished ? t('dashboard.published_live', 'Tayang Publik') : t('dashboard.not_published', 'Belum Tayang')}
                </p>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isPublished ? t('dashboard.published_desc', 'Profil tampil di direktori') : t('dashboard.not_published_desc', 'Aktifkan akun & pilih paket')}
              </p>
            </div>
          </div>

          {/* Paket Aktif */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl shrink-0 ${
              hasPackage ? 'bg-[#FFF4E6] text-[#EA580C]' : 'bg-[#F5F4F0] text-[#5B6660]'
            }`}>
              <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">{t('dashboard.active_package', 'Paket Aktif')}</p>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <p className="font-bold text-on-background text-sm truncate">{packageName}</p>
                {hasPackage && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-[#E3F2E7] text-[#2E5E3B] px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[11px]">check_circle</span>
                    {t('dashboard.your_current_package', 'Paket Anda Saat Ini')}
                  </span>
                )}
              </div>
              {hasPackage && isFreePackage ? (
                <Link to="/paket" className="text-xs text-[#0EA5E9] font-bold hover:underline inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">upgrade</span>
                  {t('dashboard.upgrade_now', 'Upgrade Sekarang')}
                </Link>
              ) : hasPackage ? (
                <p className="text-xs text-on-surface-variant">{t('dashboard.active_subscription', 'Langganan aktif')}</p>
              ) : (
                <Link to="/paket" className="text-xs text-[#0EA5E9] font-bold hover:underline inline-flex items-center gap-1">
                  {t('dashboard.choose_package', 'Pilih Paket')} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* POINTS & LEVEL SECTION                                         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {pointsData && (
          <div className="bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">{t('dashboard.your_points_level', 'Poin & Level Anda')}</p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold">{pointsData.total_points}</p>
                  <LevelBadge 
                    level={pointsData.level} 
                    size="lg" 
                    className="bg-white/20 text-white"
                  />
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="material-symbols-outlined text-[32px]">stars</span>
              </div>
            </div>

            {/* Progress Bar */}
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

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold">{pointsData.history?.length || 0}</p>
                <p className="text-xs opacity-75">{t('dashboard.activities', 'Aktivitas')}</p>
              </div>
              <div className="text-center">
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
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ALERT BANNERS                                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* DITOLAK — Perlu Perbaikan */}
        {isRejected && (
          <div className="bg-[#FFDAD6] rounded-2xl p-6 border border-[#FFB4AB] animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#B3261E]/10 shrink-0">
                <span className="material-symbols-outlined text-[28px] text-[#B3261E]">error</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#93000A] text-base mb-2">{t('dashboard.rejected_title', 'Data Pendaftaran Perlu Diperbaiki')}</h3>
                <div className="bg-white/50 rounded-xl p-4 mb-4 border border-[#B3261E]/20">
                  <p className="text-xs font-bold text-[#93000A] uppercase tracking-wide mb-1">{t('dashboard.admin_note', 'Catatan dari Admin:')}</p>
                  <p className="text-sm text-[#410002] leading-relaxed font-medium">
                    {rejectReason || t('dashboard.rejected_desc', 'Data atau dokumen yang diunggah belum memenuhi syarat. Harap periksa kembali.')}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/profil-saya')}
                  className="bg-[#B3261E] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#93000A] transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  {t('dashboard.fix_profile', 'Perbaiki Profil Sekarang')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MENUNGGU VERIFIKASI */}
        {isPending && (
          <div className="bg-[#FFF4D6] rounded-2xl p-6 border border-[#FFE699] animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#7A5900]/10 shrink-0">
                <span className="material-symbols-outlined text-[28px] text-[#7A5900]">schedule</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#5C4A00] text-base mb-2">{t('dashboard.pending_title', 'Menunggu Verifikasi Admin')}</h3>
                <p className="text-sm text-[#5C4A00] leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t('dashboard.pending_desc') }}>
                </p>
                <div className="flex items-center gap-2 text-xs text-[#5C4A00]">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>{t('dashboard.check_email', 'Pastikan Anda memeriksa email secara berkala (termasuk folder spam).')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DRAFT — Lengkapi Profil */}
        {!isProfileComplete && !hasPendingPayment && !needsDocumentUpload && (
          <div className="bg-[#E0F2FE] rounded-2xl p-6 border border-[#BAE6FD] animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 rounded-xl bg-[#0EA5E9]/10 shrink-0">
                  <span className="material-symbols-outlined text-[28px] text-[#0284C7]">edit_note</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#075985] text-base mb-2">{t('dashboard.complete_profile_title', 'Lengkapi Profil Anda')}</h3>
                  <p className="text-sm text-[#0369A1] leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: t('dashboard.complete_profile_desc', { completeness: profileCompleteness }) }}></p>
                  <div className="flex flex-wrap gap-2">
                    {!hasBasicInfo && <span className="text-xs bg-white/60 text-[#075985] px-2.5 py-1 rounded-full border border-[#0EA5E9]/30">{t('dashboard.req_basic_info', 'Data Pribadi')}</span>}
                    {!hasEducation && <span className="text-xs bg-white/60 text-[#075985] px-2.5 py-1 rounded-full border border-[#0EA5E9]/30">{t('dashboard.req_education', 'Pendidikan')}</span>}
                    {!hasPhoto && <span className="text-xs bg-white/60 text-[#075985] px-2.5 py-1 rounded-full border border-[#0EA5E9]/30">{t('dashboard.req_photo', 'Foto Profil')}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/profil-saya')}
                className="bg-[#0EA5E9] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#0284C7] shadow-md transition-colors shrink-0 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                {t('dashboard.complete_now', 'Lengkapi Sekarang')}
              </button>
            </div>
          </div>
        )}

        {/* PROFILE LENGKAP TAPI BELUM PILIH PAKET */}
        {isProfileComplete && !hasPackage && !hasPendingPayment && (
          <div className="bg-gradient-to-br from-[#E0F2FE] to-[#DBEAFE] rounded-2xl p-6 border border-[#0EA5E9]/30 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 rounded-xl bg-white/80 shrink-0">
                  <span className="material-symbols-outlined text-[32px] text-[#0EA5E9]">workspace_premium</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#075985] text-lg mb-2">{t('dashboard.choose_package_title', 'Pilih Paket Keanggotaan')}</h3>
                  <p className="text-sm text-[#0369A1] leading-relaxed">
                    {t('dashboard.choose_package_desc', 'Profil Anda sudah lengkap! Langkah selanjutnya adalah memilih paket keanggotaan (Free atau Premium) agar Anda dapat mengunggah dokumen dan diverifikasi oleh admin.')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/paket')}
                className="bg-[#0EA5E9] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#0284C7] shadow-lg shadow-[#0EA5E9]/20 transition-all hover:shadow-xl shrink-0 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                {t('dashboard.choose_package_btn', 'Pilih Paket')}
              </button>
            </div>
          </div>
        )}

        {/* ADA INVOICE PENDING */}
        {hasPendingPayment && (
          <div className="bg-[#FFF4D6] rounded-2xl p-6 border border-[#FCD34D] animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 rounded-xl bg-[#F59E0B]/10 shrink-0">
                  <span className="material-symbols-outlined text-[28px] text-[#D97706]">receipt_long</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#92400E] text-base mb-2">{t('dashboard.pending_payment_title', 'Segera Lunasi Pembayaran Anda')}</h3>
                  <p className="text-sm text-[#92400E] leading-relaxed mb-1">
                    {t('dashboard.pending_payment_desc', 'Anda memiliki tagihan paket yang belum dibayar. Selesaikan pembayaran sekarang agar Anda dapat melanjutkan ke tahap verifikasi.')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/invoice/${pendingOrders[0].id || pendingOrders[0].reference_code}`)}
                className="bg-[#D97706] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#B45309] shadow-md transition-colors shrink-0 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">payment</span>
                {t('dashboard.pay_now', 'Bayar Sekarang')}
              </button>
            </div>
          </div>
        )}

        {/* SUDAH LUNAS TAPI BELUM UPLOAD DOKUMEN */}
        {needsDocumentUpload && (
          <div className="bg-[#E0F2FE] rounded-2xl p-6 border border-[#BAE6FD] animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 rounded-xl bg-[#0EA5E9]/10 shrink-0">
                  <span className="material-symbols-outlined text-[28px] text-[#0284C7]">upload_file</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#075985] text-base mb-2">{t('dashboard.upload_doc_title', 'Upload Dokumen Pendukung')}</h3>
                  <p className="text-sm text-[#0369A1] leading-relaxed mb-1">
                    {t('dashboard.upload_doc_desc', 'Paket Anda sudah aktif! Silakan unggah dokumen pendukung seperti KTP dan sertifikat agar tim kami dapat segera melakukan verifikasi akun Anda.')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/profil-saya')}
                className="bg-[#0EA5E9] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#0284C7] shadow-md transition-colors shrink-0 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                {t('dashboard.upload_doc_btn', 'Upload Dokumen')}
              </button>
            </div>
          </div>
        )}

        {/* APPROVED + PAKET FREE — Upgrade Prompt */}
        {isApproved && isFreePackage && (
          <div className="bg-gradient-to-br from-[#E0F2FE] to-[#DBEAFE] rounded-2xl p-6 border border-[#0EA5E9]/30 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 rounded-xl bg-white/80 shrink-0">
                  <span className="material-symbols-outlined text-[32px] text-[#0EA5E9]">rocket_launch</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#075985] text-lg mb-2">{t('dashboard.upgrade_premium_title', 'Tingkatkan ke Premium!')}</h3>
                  <p className="text-sm text-[#0369A1] leading-relaxed" dangerouslySetInnerHTML={{ __html: t('dashboard.upgrade_premium_desc') }}></p>
                </div>
              </div>
              <button
                onClick={() => navigate('/paket')}
                className="bg-[#0EA5E9] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#0284C7] shadow-lg shadow-[#0EA5E9]/20 transition-all hover:shadow-xl shrink-0 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                {t('dashboard.upgrade_now_btn', 'Upgrade Sekarang')}
              </button>
            </div>
          </div>
        )}

        {/* PUBLISHED — Success State */}
        {isPublished && (
          <div className="bg-gradient-to-br from-[#E3F2E7] to-[#D1FAE5] rounded-2xl p-6 border border-[#2E5E3B]/20 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white/80 shrink-0">
                <span className="material-symbols-outlined text-[32px] text-[#2E5E3B]">verified</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1C3822] text-lg mb-2 flex items-center gap-2 flex-wrap">
                  {t('dashboard.published_title', 'Profil Anda Sedang Tayang!')}
                  <span className="text-xs font-bold bg-[#2E5E3B] text-white px-2.5 py-1 rounded-full">LIVE</span>
                </h3>
                <p className="text-sm text-[#2E5E3B] leading-relaxed mb-4">
                  {t('dashboard.published_success_desc', 'Profil tenaga ahli Anda sudah aktif dan dapat dilihat oleh publik di direktori website. Pastikan data Anda selalu up-to-date agar mendapat peluang kolaborasi lebih baik.')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/profil-publik"
                    className="bg-white text-[#2E5E3B] border-2 border-[#2E5E3B] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#2E5E3B] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    {t('dashboard.view_public_profile', 'Lihat Profil Publik')}
                  </Link>
                  <Link
                    to="/profil-saya"
                    className="bg-[#2E5E3B]/10 text-[#2E5E3B] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#2E5E3B]/20 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    {t('dashboard.edit_profile', 'Edit Profil')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* QUICK ACTIONS                                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
          <h2 className="text-sm font-bold text-[#1F2A22] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2E5E3B]">apps</span>
            {t('dashboard.quick_access', 'Akses Cepat')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              to="/profil-saya"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-[#2E5E3B] hover:bg-[#2E5E3B]/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-[28px] text-[#2E5E3B] group-hover:scale-110 transition-transform">person</span>
              <span className="text-xs font-semibold text-center text-on-surface-variant group-hover:text-[#2E5E3B]">{t('dashboard.my_profile', 'Profil Saya')}</span>
            </Link>
            <Link
              to="/paket"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-[#2E5E3B] hover:bg-[#2E5E3B]/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-[28px] text-[#2E5E3B] group-hover:scale-110 transition-transform">workspace_premium</span>
              <span className="text-xs font-semibold text-center text-on-surface-variant group-hover:text-[#2E5E3B]">{t('dashboard.packages', 'Paket')}</span>
            </Link>
            <Link
              to="/pembayaran"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-[#2E5E3B] hover:bg-[#2E5E3B]/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-[28px] text-[#2E5E3B] group-hover:scale-110 transition-transform">payments</span>
              <span className="text-xs font-semibold text-center text-on-surface-variant group-hover:text-[#2E5E3B]">{t('dashboard.payments', 'Pembayaran')}</span>
            </Link>
            <Link
              to="/profil-publik"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-[#2E5E3B] hover:bg-[#2E5E3B]/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-[28px] text-[#2E5E3B] group-hover:scale-110 transition-transform">language</span>
              <span className="text-xs font-semibold text-center text-on-surface-variant group-hover:text-[#2E5E3B]">{t('dashboard.public_profile', 'Profil Publik')}</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
