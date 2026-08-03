import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext.jsx';
import api from '../../api/client.js';

const AVATAR_PALETTE = [
  { bg: '#0284C71A', fg: '#0284C7' },
  { bg: '#B453091A', fg: '#B45309' },
  { bg: '#6B4F3B1A', fg: '#6B4F3B' },
  { bg: '#0369A11A', fg: '#0369A1' },
  { bg: '#4754451A', fg: '#475545' },
];

function hashColor(str) {
  const s = str || '?';
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total_pendaftar: 0,
    total_tenaga_ahli: 0,
    pending_verifikasi: 0,
    pengguna_free: 0,
    pengguna_premium: 0,
  });
  const [recentPending, setRecentPending] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    Promise.allSettled([
      api.get('/admin/dashboard-stats'),
      api.get('/admin/experts', { params: { status: 'menunggu_verifikasi' } }),
    ]).then(([statsRes, expertsRes]) => {
      if (cancelled) return;

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }

      const experts = expertsRes.status === 'fulfilled' ? expertsRes.value.data : [];
      const expertsList = Array.isArray(experts) ? experts : [];
      setRecentPending(expertsList.slice(0, 5));

      if (statsRes.status === 'rejected' || expertsRes.status === 'rejected') {
        setError('Gagal memuat sebagian data statistik admin.');
      }
      setIsLoading(false);
      setLastUpdated(new Date());
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancel = loadDashboard();
    return cancel;
  }, [loadDashboard]);

  const statCards = [
    { label: 'Total Pendaftar', value: stats.total_pendaftar, icon: 'person_add', accent: '#0284C7' },
    { label: 'Total Tenaga Ahli', value: stats.total_tenaga_ahli, icon: 'groups', accent: '#0369A1' },
    { label: 'Pending Verifikasi', value: stats.pending_verifikasi, icon: 'how_to_reg', accent: '#B45309' },
    { label: 'Pengguna Free', value: stats.pengguna_free, icon: 'person', accent: '#475569' },
    { label: 'Pengguna Premium', value: stats.pengguna_premium, icon: 'workspace_premium', accent: '#6B4F3B' },
  ];

  const flowSteps = [
    {
      icon: 'person_add',
      label: 'Pendaftaran',
      color: '#0EA5E9',
      count: stats.total_pendaftar,
      countLabel: 'total pendaftar',
    },
    {
      icon: 'fact_check',
      label: 'Verifikasi Admin',
      color: '#B45309',
      count: stats.pending_verifikasi,
      countLabel: 'menunggu verifikasi',
    },
    {
      icon: 'workspace_premium',
      label: 'Pilih Paket',
      color: '#0284C7',
      count: null,
      countLabel: null,
    },
    {
      icon: 'payments',
      label: 'Pembayaran',
      color: '#6B4F3B',
      count: stats.pengguna_premium,
      countLabel: 'sudah premium',
    },
    {
      icon: 'public',
      label: 'Profil Tayang',
      color: '#0369A1',
      count: stats.total_tenaga_ahli,
      countLabel: 'profil tayang',
    },
  ];

  const totalPengguna = (stats.pengguna_free || 0) + (stats.pengguna_premium || 0);
  const premiumShare = totalPengguna > 0 ? Math.round((stats.pengguna_premium / totalPengguna) * 100) : 0;
  const freeShare = 100 - premiumShare;

  const formatTime = (d) =>
    d
      ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '';

  return (
    <div className="pb-10">
      {/* ── Hero header ────────────────────────────────────────── */}
      <div className="relative mb-14 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#0C4A6E] p-6 shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('admin.dashboard.overview_title', 'Ringkasan Dashboard')}</h2>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              {t('admin.dashboard.overview_desc', 'Pantau status pendaftaran, verifikasi, dan keanggotaan TenagaAhli.com secara real-time.')}
            </p>
            {lastUpdated && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/70">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                Terakhir diperbarui pukul {formatTime(lastUpdated)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            disabled={isLoading}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#0284C7] shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {isLoading ? t('common.loading', 'Memuat...') : t('common.refresh', 'Segarkan')}
          </button>
        </div>

        {/* ── Floating stat cards ──────────────────────────────── */}
        <div className="relative mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="group rounded-xl bg-white p-5 shadow-md ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${card.accent}14` }}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: card.accent }}>
                  {card.icon}
                </span>
              </div>
              <h3 className="mb-1 text-xs font-medium text-[#414844]/70">{card.label}</h3>
              {isLoading ? (
                <div className="h-7 w-14 animate-pulse rounded bg-[#414844]/10" />
              ) : (
                <p className="text-2xl font-bold tabular-nums" style={{ color: card.accent }}>
                  {card.value?.toLocaleString?.('id-ID') ?? card.value}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-[#FFDAD6] px-4 py-3 text-sm text-[#93000A]">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {/* ── Alur Pendaftaran ───────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-[#0284C7]/10 bg-white p-6 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-[#0F172A]">
          <span className="material-symbols-outlined text-[18px] text-[#0284C7]">route</span>
          {t('admin.dashboard.flow_title', 'Alur Pendaftaran Tenaga Ahli')}
        </h3>
        <div className="flex items-start overflow-x-auto pt-3 pb-2">
          {flowSteps.map((item, i, arr) => (
            <div key={item.label} className="flex flex-1 items-start last:flex-none">
              <div className="flex min-w-[92px] flex-col items-center gap-2">
                <div
                  className="relative flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${item.color}14` }}
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ color: item.color }}>
                    {item.icon}
                  </span>
                  {item.count !== null && item.count !== undefined && (
                    <span
                      className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white px-1 text-[10px] font-bold text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {isLoading ? '' : item.count}
                    </span>
                  )}
                </div>
                <span className="text-center text-[11px] font-semibold leading-tight text-[#414844]/80">
                  {item.label}
                </span>
                {item.countLabel && (
                  <span className="text-center text-[10px] leading-tight text-[#414844]/50">
                    {isLoading ? '···' : `${item.count} ${item.countLabel}`}
                  </span>
                )}
              </div>
              {i < arr.length - 1 && (
                <div className="mx-1 mb-6 mt-6 h-0.5 min-w-[16px] flex-1 rounded-full bg-gradient-to-r from-[#0284C7]/30 to-[#0284C7]/10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Table + distribution panel ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-[#0284C7]/10 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#0284C7]/10 p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
              <span className="material-symbols-outlined text-[#B45309]">pending_actions</span>
              {t('admin.dashboard.pending_experts', 'Profil Menunggu Verifikasi')}
              {stats.pending_verifikasi > 0 && (
                <span className="rounded-full bg-[#B45309]/10 px-2 py-0.5 text-xs font-bold text-[#B45309]">
                  {stats.pending_verifikasi}
                </span>
              )}
            </h3>
            <Link
              to="/admin/verifikasi"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#0284C7] hover:underline"
            >
              Lihat Semua
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#0284C7]/5 text-xs uppercase tracking-wide text-[#414844]/70">
                  <th className="px-6 py-3 font-semibold">{t('admin.dashboard.table_name', 'Nama')}</th>
                  <th className="px-6 py-3 font-semibold">{t('admin.dashboard.table_email', 'Email')}</th>
                  <th className="px-6 py-3 font-semibold">{t('admin.dashboard.table_institution', 'Instansi')}</th>
                  <th className="px-6 py-3 font-semibold">{t('admin.dashboard.table_field', 'Bidang')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0284C7]/10">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(4)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 w-24 animate-pulse rounded bg-[#414844]/10" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentPending.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined mb-2 block text-[32px] text-[#414844]/30">
                        task_alt
                      </span>
                      <p className="text-[#414844]/60">Tidak ada profil yang menunggu verifikasi.</p>
                    </td>
                  </tr>
                ) : (
                  recentPending.map((exp) => {
                    const c = hashColor(exp.name);
                    return (
                      <tr key={exp.id} className="transition-colors hover:bg-[#0284C7]/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{ backgroundColor: c.bg, color: c.fg }}
                            >
                              {(exp.name || '?')
                                .trim()
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((w) => w[0]?.toUpperCase())
                                .join('')}
                            </div>
                            <span className="font-semibold text-[#0F172A]">{exp.name || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#414844]/80">{exp.user?.email || exp.email || '-'}</td>
                        <td className="px-6 py-4 text-[#414844]/80">{exp.institution || '-'}</td>
                        <td className="px-6 py-4">
                          {exp.field ? (
                            <span className="inline-block rounded-full bg-[#6B4F3B]/10 px-2.5 py-1 text-xs font-semibold text-[#6B4F3B]">
                              {exp.field}
                            </span>
                          ) : (
                            <span className="text-[#414844]/50">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Distribusi pengguna ────────────────────────────── */}
        <div className="rounded-xl border border-[#0284C7]/10 bg-white p-6 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-[#0F172A]">
            <span className="material-symbols-outlined text-[#6B4F3B]">donut_large</span>
            {t('admin.dashboard.user_distribution', 'Distribusi Pengguna')}
          </h3>

          {isLoading ? (
            <div className="h-3 w-full animate-pulse rounded-full bg-[#414844]/10" />
          ) : totalPengguna === 0 ? (
            <p className="text-sm text-[#414844]/60">{t('admin.dashboard.no_user_data', 'Belum ada data pengguna.')}</p>
          ) : (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#414844]/10">
                <div
                  className="h-full bg-[#0284C7]"
                  style={{ width: `${freeShare}%` }}
                  title={`Free ${freeShare}%`}
                />
                <div
                  className="h-full bg-[#6B4F3B]"
                  style={{ width: `${premiumShare}%` }}
                  title={`Premium ${premiumShare}%`}
                />
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0284C7]" />
                    <span className="text-sm text-[#414844]/80">Pengguna Free</span>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">
                    {stats.pengguna_free} <span className="text-[#414844]/50">({freeShare}%)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#6B4F3B]" />
                    <span className="text-sm text-[#414844]/80">Pengguna Premium</span>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">
                    {stats.pengguna_premium} <span className="text-[#414844]/50">({premiumShare}%)</span>
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-lg bg-[#0284C7]/5 px-4 py-3">
                <span className="text-xs font-medium text-[#414844]/70">Total Pengguna</span>
                <span className="text-sm font-bold text-[#0284C7]">{totalPengguna.toLocaleString('id-ID')}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}