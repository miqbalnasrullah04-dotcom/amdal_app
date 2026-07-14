import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalExperts: 0,
    menungguVerifikasi: 0,
    aktif: 0,
    ditolak: 0,
    menungguPembayaran: 0,
    articles: 0,
    partners: 0,
  });
  const [recentPending, setRecentPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      api.get('/admin/experts'),
      api.get('/admin/articles'),
      api.get('/admin/partners'),
      api.get('/admin/orders', { params: { status: 'menunggu_verifikasi' } }),
    ])
      .then(([expertsRes, articlesRes, partnersRes, ordersRes]) => {
        if (cancelled) return;

        const experts = expertsRes.status === 'fulfilled' ? expertsRes.value.data : [];
        const articles = articlesRes.status === 'fulfilled' ? articlesRes.value.data : [];
        const partners = partnersRes.status === 'fulfilled' ? partnersRes.value.data : [];
        const pendingOrders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];

        const expertsList = Array.isArray(experts) ? experts : [];

        setStats({
          totalExperts: expertsList.length,
          menungguVerifikasi: expertsList.filter((e) => e.profile_status === 'menunggu_verifikasi').length,
          aktif: expertsList.filter((e) => e.profile_status === 'aktif').length,
          ditolak: expertsList.filter((e) => e.profile_status === 'ditolak').length,
          menungguPembayaran: Array.isArray(pendingOrders) ? pendingOrders.length : 0,
          articles: Array.isArray(articles) ? articles.length : 0,
          partners: Array.isArray(partners) ? partners.length : 0,
        });

        setRecentPending(
          expertsList
            .filter((e) => e.profile_status === 'menunggu_verifikasi')
            .slice(0, 5)
        );

        if (
          expertsRes.status === 'rejected' ||
          articlesRes.status === 'rejected' ||
          partnersRes.status === 'rejected' ||
          ordersRes.status === 'rejected'
        ) {
          setError('Sebagian data gagal dimuat. Cek koneksi ke backend.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = [
    { label: 'Menunggu Verifikasi Profil', value: stats.menungguVerifikasi, icon: 'how_to_reg', accent: '#7A5900' },
    { label: 'Menunggu Verifikasi Pembayaran', value: stats.menungguPembayaran, icon: 'payments', accent: '#7A5900' },
    { label: 'Tenaga Ahli Aktif', value: stats.aktif, icon: 'verified', accent: '#2E5E3B' },
    { label: 'Total Tenaga Ahli', value: stats.totalExperts, icon: 'groups', accent: '#3E2B1F' },
    { label: 'Total Artikel', value: stats.articles, icon: 'newspaper', accent: '#3E2B1F' },
    { label: 'Total Lembaga', value: stats.partners, icon: 'handshake', accent: '#6B4F3B' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#2E5E3B]">Ringkasan Dashboard</h2>
        <p className="text-[#414844]/80 text-sm mt-1">
          Pantau status verifikasi, pembayaran, dan konten AMDAL.ID secara real-time.
        </p>
      </div>

      {error && <div className="mb-6 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-6 rounded-xl border border-[#2E5E3B]/15 shadow-sm border-l-4"
            style={{ borderLeftColor: card.accent }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.accent}1A` }}>
                <span className="material-symbols-outlined" style={{ color: card.accent }}>
                  {card.icon}
                </span>
              </div>
            </div>
            <h3 className="text-sm text-[#414844]/80 mb-1">{card.label}</h3>
            <p className="text-3xl font-bold" style={{ color: card.accent }}>
              {loading ? '...' : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#2E5E3B]/15 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#2E5E3B]/15 flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#2E5E3B] flex items-center gap-2">
            <span className="material-symbols-outlined">pending_actions</span>
            Profil Menunggu Verifikasi
          </h3>
          <Link to="/admin/verifikasi-user" className="text-sm text-[#2E5E3B] font-bold hover:underline">
            Lihat Semua
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#2E5E3B]/5 text-[#414844]">
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Instansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E5E3B]/10">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-[#414844]/70">
                    Memuat data...
                  </td>
                </tr>
              ) : recentPending.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-[#414844]/70">
                    Tidak ada profil yang menunggu verifikasi.
                  </td>
                </tr>
              ) : (
                recentPending.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#2E5E3B]/5">
                    <td className="px-6 py-4 font-semibold text-[#2E5E3B]">{exp.name || '-'}</td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.user?.email || exp.email || '-'}</td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.institution || '-'}</td>
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