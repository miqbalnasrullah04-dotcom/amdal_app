import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MembershipLayout from '../layouts/MembershipLayout';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  TagIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon,
  StarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  TrophyIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-black/5 shadow-sm ${className}`}>{children}</div>;
}

function Badge({ level, color }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      <ShieldCheckIcon className="w-3.5 h-3.5" />
      {level}
    </span>
  );
}

function CircularProgress({ percentage, size = 132, strokeWidth = 10, color = '#0284C7', trackColor = 'rgba(2,132,199,0.12)', children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value, accent = '#0284C7' }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-black/5">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1A` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#414844]/60">{label}</p>
        <p className="text-sm font-bold text-[#1F2A22] truncate">{value}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function Membership() {
  const { t } = useTranslation();
  const [membership, setMembership] = useState(null);
  const [pointHistory, setPointHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showExpiredNotif, setShowExpiredNotif] = useState(false);

  const loadMembershipData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statusRes, pointHistoryRes] = await Promise.all([
        api.get('/membership/status'),
        api.get('/membership/point-history?limit=10'),
      ]);

      const membershipData = statusRes.data.data;
      const pointHistoryData = pointHistoryRes.data.data || [];

      if (!membershipData || typeof membershipData.points === 'undefined') {
        throw new Error(t('membership.error.incomplete_data', 'Data membership tidak lengkap'));
      }

      setMembership(membershipData);
      setPointHistory(Array.isArray(pointHistoryData) ? pointHistoryData : []);

      const wasRecentlyExpired = membershipData.package === 'free' &&
                                 membershipData.premium_expires_at &&
                                 new Date(membershipData.premium_expires_at) < new Date() &&
                                 new Date(membershipData.premium_expires_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      setShowExpiredNotif(wasRecentlyExpired);
    } catch (err) {
      console.error('Error loading membership data:', err);
      setError(err.response?.data?.message || err.message || t('membership.error.load_failed', 'Gagal memuat data membership.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembershipData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <MembershipLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#0284C7]/20 border-t-[#0284C7] rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-[#5B6660] font-medium">{t('membership.loading', 'Memuat data membership...')}</p>
        </div>
      </MembershipLayout>
    );
  }

  if (error && !membership) {
    return (
      <MembershipLayout>
        <Card className="p-10 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#DC2626]/10 flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-7 h-7 text-[#DC2626]" />
          </div>
          <h3 className="text-base font-bold text-[#1F2A22] mb-2">{t('membership.error.load_data_failed', 'Gagal Memuat Data')}</h3>
          <p className="text-sm text-[#414844]/60 mb-5">{error}</p>
          <button
            onClick={loadMembershipData}
            className="inline-flex items-center gap-2 bg-[#0284C7] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#0369A1] transition-all"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {t('membership.try_again', 'Coba Lagi')}
          </button>
        </Card>
      </MembershipLayout>
    );
  }

  const accentColor = membership?.level_badge_color || '#0284C7';
  const ringPercentage = membership?.next_level ? (membership.progress_percentage || 0) : 100;
  const formattedPoints = new Intl.NumberFormat('id-ID').format(membership?.points || 0);

  return (
    <MembershipLayout>
      <div className="space-y-5 animate-fadeIn">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1F2A22] tracking-tight">
            {t('Membership & Point')}
          </h1>
          <p className="text-sm text-[#5B6660] mt-1">
            {t('Informasi paket membership dan point Anda')}
          </p>
        </div>

        {/* Premium Expired Notification */}
        {showExpiredNotif && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFF8E6] border border-[#F59E0B]/25 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-[#F59E0B]/15 flex items-center justify-center shrink-0">
              <InformationCircleIcon className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#1F2A22] mb-1">
                {t('Masa Premium Anda Telah Berakhir')}
              </h4>
              <p className="text-sm text-[#414844]/80 mb-1">
                {t('Paket Anda telah otomatis berubah menjadi')} <span className="font-bold">{t('Paket Free')}</span> {t('sejak')} {formatDate(membership.premium_expires_at)}.
              </p>
              <p className="text-xs text-[#414844]/60 mb-3">
                {t('Point Anda tetap tersimpan dan akan digunakan untuk diskon jika Anda upgrade kembali.')}
              </p>
              <Link
                to="/paket"
                className="inline-flex items-center gap-2 bg-[#F59E0B] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#D97706] transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                {t('Upgrade ke Premium')}
              </Link>
            </div>
            <button
              onClick={() => setShowExpiredNotif(false)}
              className="text-[#414844]/40 hover:text-[#414844] transition-colors shrink-0"
              aria-label={t('Tutup')}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Membership Hero Card */}
        <Card className="p-6 md:p-8 relative overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#414844]/50 mb-1">
                  {t('Status Membership')}
                </p>
                <h2 className="text-2xl font-black text-[#1F2A22] tracking-tight">
                  {membership?.package === 'premium' ? t('Paket Premium') : t('Paket Free')}
                </h2>
                <p className="text-sm text-[#414844]/60 mt-1.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${membership?.is_premium ? 'bg-[#059669]' : 'bg-[#9CA3AF]'}`} />
                  {membership?.is_premium ? t('Aktif') : t('Tidak Aktif')}
                </p>
              </div>
              <Badge
                level={membership?.level_display_name || 'Basic'}
                color={accentColor}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center md:items-start">
              {/* Points Ring */}
              <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
                <CircularProgress percentage={ringPercentage} color={accentColor}>
                  <span className="text-2xl font-black text-[#1F2A22]">{formattedPoints}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#414844]/50">{t('Poin')}</span>
                </CircularProgress>

                {membership?.next_level ? (
                  <p className="text-xs text-center text-[#414844]/70 max-w-[160px]">
                    <span className="font-bold text-[#1F2A22]">{membership.points_needed}</span> {t('poin menuju')}{' '}
                    <span className="font-bold" style={{ color: accentColor }}>{membership.next_level}</span>
                  </p>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B]">
                    <TrophyIcon className="w-4 h-4" />
                    {t('Level Tertinggi Tercapai')}
                  </span>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-4 w-full">
                {membership?.is_premium ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatChip icon={CalendarDaysIcon} label={t('Dimulai')} value={formatDate(membership.premium_started_at)} accent={accentColor} />
                    <StatChip icon={ClockIcon} label={t('Berakhir')} value={formatDate(membership.premium_expires_at)} accent={accentColor} />
                    <StatChip icon={SparklesIcon} label={t('Sisa Hari')} value={`${membership.remaining_days} ${t('hari')}`} accent="#F59E0B" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/70 border border-black/5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}1A` }}>
                      <SparklesIcon className="w-6 h-6" style={{ color: accentColor }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1F2A22]">{t('Upgrade ke Premium')}</p>
                      <p className="text-xs text-[#414844]/60">{t('Dapatkan lebih banyak benefit dan point')}</p>
                    </div>
                    <Link
                      to="/paket"
                      className="inline-flex items-center justify-center gap-1.5 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shrink-0"
                      style={{ backgroundColor: accentColor }}
                    >
                      {t('Lihat Paket')}
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/70 border border-black/5">
                  <div className="w-9 h-9 rounded-lg bg-[#0284C7]/10 flex items-center justify-center shrink-0">
                    <TagIcon className="w-5 h-5 text-[#0284C7]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#1F2A22]">
                      {t('Diskon perpanjangan')}: <span className="font-bold text-[#0284C7]">{membership?.discount_percentage || 0}%</span>
                    </p>
                    <p className="text-xs text-[#414844]/60 mt-0.5">
                      {t('Berlaku untuk perpanjangan paket Premium')}
                    </p>
                    {membership?.discount_percentage > 0 && (
                      <Link
                        to="/paket"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] mt-2 transition-colors"
                      >
                        {t('Perpanjang dengan Diskon')}
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Point History Timeline */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#1F2A22]">{t('Riwayat Point')}</h3>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#414844]/50 bg-[#F5F4EF] px-2.5 py-1 rounded-full">
              {t('10 transaksi terakhir')}
            </span>
          </div>

          {pointHistory.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-[#F59E0B]" />
              </div>
              <p className="text-sm font-bold text-[#1F2A22] mb-1">{t('Belum ada riwayat point')}</p>
              <p className="text-xs text-[#414844]/60 mb-5 max-w-xs mx-auto">
                {t('Point didapatkan dari upgrade atau perpanjangan Premium')}
              </p>
              <Link
                to="/paket"
                className="inline-flex items-center gap-2 bg-[#0284C7] text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-[#0369A1] transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                {t('Mulai Dapatkan Point')}
              </Link>
            </div>
          ) : (
            <ol className="relative">
              {pointHistory.map((item, idx) => {
                const isEarned = item.type === 'earned';
                return (
                  <li key={item.id} className="relative pl-11 pb-6 last:pb-0">
                    {idx !== pointHistory.length - 1 && (
                      <span className="absolute left-[15px] top-8 bottom-0 w-px bg-black/10" />
                    )}
                    <span
                      className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isEarned ? 'bg-[#059669]/10' : 'bg-[#DC2626]/10'
                      }`}
                    >
                      {isEarned ? (
                        <ArrowUpCircleIcon className="w-5 h-5 text-[#059669]" />
                      ) : (
                        <ArrowDownCircleIcon className="w-5 h-5 text-[#DC2626]" />
                      )}
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`text-sm font-bold ${isEarned ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                          {isEarned ? '+' : '-'}{item.points} {t('Poin')}
                        </p>
                        <p className="text-xs text-[#414844]/60 mt-0.5">{item.description}</p>
                      </div>
                      <p className="text-xs text-[#414844]/40 shrink-0">{formatDate(item.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>
    </MembershipLayout>
  );
}