import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

const statusInfo = {
  draft: { text: 'Draft — Lengkapi Profil Anda', color: '#7A5900', bg: '#FFF4D6', icon: 'edit_note' },
  menunggu_verifikasi: { text: 'Menunggu Verifikasi Admin', color: '#7A5900', bg: '#FFF4D6', icon: 'hourglass_top' },
  aktif: { text: 'Profil Aktif & Tayang', color: '#2E5E3B', bg: '#E3F2E7', icon: 'verified' },
  ditolak: { text: 'Ditolak — Perlu Diperbaiki', color: '#B3261E', bg: '#FFDAD6', icon: 'error' },
};

function CircularProgress({ percent }) {
  const size = 128;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEEBE2" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2E5E3B"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90 origin-center"
        style={{ fill: '#1F2A22', fontSize: '22px', fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}
      >
        {percent}%
      </text>
    </svg>
  );
}

const QUICK_ACTIONS = [
  {
    to: '/lengkapi-profil',
    label: 'Lengkapi Profil',
    desc: 'Isi data pribadi, pendidikan, hingga dokumen pendukung',
    icon: 'edit_document',
    primary: true,
  },
  {
    to: '/pilih-paket',
    label: 'Pilih Paket',
    desc: 'Aktifkan profil Anda dengan paket keanggotaan',
    icon: 'workspace_premium',
  },
  {
    to: '/riwayat-pembayaran',
    label: 'Riwayat Pembayaran',
    desc: 'Lihat status & histori transaksi Anda',
    icon: 'receipt_long',
  },
  {
    to: '/profil-saya',
    label: 'Pengaturan Akun',
    desc: 'Kelola informasi akun & keamanan',
    icon: 'settings',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/my/profile')
      .then((res) => setExpert(res.data))
      .catch(() => setError('Gagal memuat data profil.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center gap-3 text-[#5B6660]">
          <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
          Memuat data...
        </div>
      </DashboardLayout>
    );
  }

  const status = statusInfo[expert?.profile_status] || statusInfo.draft;
  const steps = [
    { label: 'Data Pribadi & Profesi', done: !!(expert?.name && expert?.institution && expert?.field), to: '/lengkapi-profil' },
    { label: 'Alamat', done: !!expert?.alamat_kota, to: '/lengkapi-profil' },
    { label: 'Pendidikan', done: (expert?.educations?.length || 0) > 0, to: '/lengkapi-profil' },
    { label: 'Pengalaman', done: (expert?.experiences?.length || 0) > 0, to: '/lengkapi-profil' },
    { label: 'Sertifikat', done: (expert?.certificates?.length || 0) > 0, to: '/lengkapi-profil' },
    { label: 'Foto Profil', done: (expert?.documents || []).some((d) => d.type === 'foto_profil'), to: '/lengkapi-profil' },
    { label: 'Dokumen Pendukung', done: (expert?.documents?.length || 0) > 0, to: '/lengkapi-profil' },
    { label: 'Pilih Paket', done: !!expert?.package_id, to: '/pilih-paket' },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const percent = Math.round((completedCount / steps.length) * 100);
  const name = expert?.name || 'Pengguna';

  return (
    <DashboardLayout
      title={`Halo, ${name.split(' ')[0]} `}
      subtitle="Berikut ringkasan status akun dan profil Anda."
      headerRight={
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          <span className="material-symbols-outlined text-[16px]">{status.icon}</span>
          {status.text}
        </span>
      }
    >
      {error && (
        <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3 mb-6">{error}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* MAIN */}
        <div className="flex flex-col gap-6">
          {/* Kartu progres */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <CircularProgress percent={percent} />
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-bold text-[#1F2A22] mb-1">Kelengkapan Profil</h2>
                <p className="text-sm text-[#5B6660] mb-3">
                  {completedCount} dari {steps.length} bagian selesai diisi
                </p>
                {percent < 100 && (
                  <button
                    onClick={() => navigate('/lengkapi-profil')}
                    className="bg-[#2E5E3B] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#244B2F] transition-colors"
                  >
                    Lanjutkan Mengisi
                  </button>
                )}
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {steps.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.to}
                    className="flex items-center gap-2.5 text-sm rounded-lg px-3 py-2.5 hover:bg-[#F5F4EF] transition-colors"
                  >
                    <span
                      className={`material-symbols-outlined text-[19px] shrink-0 ${
                        s.done ? 'text-[#2E5E3B]' : 'text-[#C8C2B4]'
                      }`}
                    >
                      {s.done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={s.done ? 'text-[#1F2A22]' : 'text-[#5B6660]'}>{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {expert?.profile_status === 'ditolak' && expert?.reject_reason && (
            <div className="bg-[#FFDAD6] rounded-2xl p-5">
              <p className="text-sm font-bold text-[#B3261E] mb-1">Profil Anda perlu diperbaiki</p>
              <p className="text-sm text-[#B3261E]">{expert.reject_reason}</p>
            </div>
          )}
        </div>

        {/* SIDEBAR AKSI */}
        <div className="flex flex-col gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className={`group rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                a.primary
                  ? 'bg-[#2E5E3B] border-[#2E5E3B] text-white hover:bg-[#244B2F]'
                  : 'bg-white border-black/5 shadow-sm hover:border-[#2E5E3B]/30 hover:shadow-md'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] shrink-0 ${
                  a.primary ? 'text-white' : 'text-[#2E5E3B]'
                }`}
              >
                {a.icon}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-bold mb-0.5 ${a.primary ? 'text-white' : 'text-[#1F2A22]'}`}>{a.label}</p>
                <p className={`text-xs leading-relaxed ${a.primary ? 'text-white/80' : 'text-[#5B6660]'}`}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}