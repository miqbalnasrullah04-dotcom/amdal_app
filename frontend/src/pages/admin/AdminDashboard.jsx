import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/client.js';

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

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      api.get('/admin/dashboard-stats'),
      api.get('/admin/experts', { params: { status: 'menunggu_verifikasi' } }),
    ])
      .then(([statsRes, expertsRes]) => {
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
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = [
    { label: 'Total Pendaftar', value: stats.total_pendaftar, icon: 'person_add', accent: '#3E2B1F' },
    { label: 'Total Tenaga Ahli', value: stats.total_tenaga_ahli, icon: 'groups', accent: '#0284C7' },
    { label: 'Pending Verifikasi', value: stats.pending_verifikasi, icon: 'how_to_reg', accent: '#7A5900' },
    { label: 'Pengguna Free', value: stats.pengguna_free, icon: 'person', accent: '#414844' },
    { label: 'Pengguna Premium', value: stats.pengguna_premium, icon: 'workspace_premium', accent: '#6B4F3B' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0284C7]">Ringkasan Dashboard</h2>
        <p className="text-[#414844]/80 text-sm mt-1">
          Pantau status pendaftaran, verifikasi, dan keanggotaan TenagaAhli.com secara real-time.
        </p>
      </div>

      {error && <div className="mb-6 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-5 rounded-xl border border-[#0284C7]/15 shadow-sm border-l-4 hover:shadow-md transition-shadow"
            style={{ borderLeftColor: card.accent }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.accent}1A` }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: card.accent }}>
                  {card.icon}
                </span>
              </div>
            </div>
            <h3 className="text-xs text-[#414844]/80 mb-1">{card.label}</h3>
            <p className="text-xl font-bold truncate" style={{ color: card.accent }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Alur Pendaftaran Diagram ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-bold text-[#0284C7] flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px]">route</span>
          Alur Pendaftaran Tenaga Ahli
        </h3>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {[
            { icon: 'person_add', label: 'Pendaftaran', color: '#0EA5E9' },
            { icon: 'fact_check', label: 'Verifikasi Admin', color: '#7A5900' },
            { icon: 'workspace_premium', label: 'Pilih Paket', color: '#0284C7' },
            { icon: 'payments', label: 'Pembayaran', color: '#6B4F3B' },
            { icon: 'public', label: 'Profil Tayang', color: '#0284C7' },
          ].map((item, i, arr) => (
            <div key={item.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-[56px]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}1A` }}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ color: item.color }}>
                    {item.icon}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-center text-[#414844]/70">{item.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-6 rounded-full bg-[#0284C7]/20 min-w-[12px]">
                  <div className="h-full rounded-full bg-[#0284C7] w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#0284C7]/15 flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#0284C7] flex items-center gap-2">
            <span className="material-symbols-outlined">pending_actions</span>
            Profil Menunggu Verifikasi
          </h3>
          <Link to="/admin/verifikasi" className="text-sm text-[#0284C7] font-bold hover:underline">
            Lihat Semua
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#0284C7]/5 text-[#414844]">
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Instansi</th>
                <th className="px-6 py-3">Bidang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0284C7]/10">
              {recentPending.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#414844]/70">
                    Tidak ada profil yang menunggu verifikasi.
                  </td>
                </tr>
              ) : (
                recentPending.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#0284C7]/5">
                    <td className="px-6 py-4 font-semibold text-[#0284C7]">{exp.name || '-'}</td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.user?.email || exp.email || '-'}</td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.institution || '-'}</td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.field || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}