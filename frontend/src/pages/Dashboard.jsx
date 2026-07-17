import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

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

  const name = expert?.name || 'Pengguna';
  const profileStatus = expert?.profile_status || 'draft';
  const isAccountActive = profileStatus === 'aktif';
  
  // Status Profil Tayang / Belum Tayang
  const isProfileLive = isAccountActive && !!expert?.package_id;

  // Package Information
  const activePackageName = expert?.package ? expert.package.name : (expert?.package_id ? 'Premium' : 'Belum Memilih Paket');

  return (
    <DashboardLayout
      title={`Selamat Datang, ${name.split(' ')[0]} `}
      subtitle="Kelola profil tenaga ahli Anda dan pantau status publikasi di website."
    >
      {error && (
        <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3 mb-6">{error}</p>
      )}

      <div className="flex flex-col gap-6 animate-fadeIn">
        {/* Status grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Akun */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#2E5E3B]/10 shrink-0 text-[#2E5E3B]">
              <span className="material-symbols-outlined text-[28px]">shield</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Status Akun</p>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isAccountActive ? 'bg-[#2E5E3B]' : 'bg-[#7A5900]'}`}></span>
                <p className="font-bold text-on-background">{isAccountActive ? 'Aktif' : 'Menunggu Aktif'}</p>
              </div>
              <p className="text-xs text-on-surface-variant">
                {isAccountActive 
                  ? 'Akun Anda disetujui oleh admin' 
                  : 'Menunggu persetujuan data dari admin'}
              </p>
            </div>
          </div>

          {/* Status Verifikasi / Tayang */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#0EA5E9]/10 shrink-0 text-[#0EA5E9]">
              <span className="material-symbols-outlined text-[28px]">public</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Status Verifikasi</p>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isProfileLive ? 'bg-[#2E5E3B]' : 'bg-[#B3261E]'}`}></span>
                <p className="font-bold text-on-background">{isProfileLive ? 'Tayang' : 'Belum Tayang'}</p>
              </div>
              <p className="text-xs text-on-surface-variant">
                {isProfileLive 
                  ? 'Profil tampil di direktori website' 
                  : 'Pilih paket keanggotaan agar profil tayang'}
              </p>
            </div>
          </div>

          {/* Paket Aktif */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#6B4F3B]/10 shrink-0 text-[#6B4F3B]">
              <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Paket Aktif</p>
              <p className="font-bold text-on-background mb-1.5 truncate">{activePackageName}</p>
              {expert?.package_id ? (
                <p className="text-xs text-on-surface-variant">Langganan aktif berjalan</p>
              ) : (
                <Link to="/paket" className="text-xs text-[#2E5E3B] font-bold hover:underline">
                  Pilih Paket Sekarang &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Ditolak warning */}
        {profileStatus === 'ditolak' && (
          <div className="bg-[#FFDAD6] text-[#93000A] rounded-2xl p-5 border border-[#FFB4AB]">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">error</span>
              <div>
                <p className="font-bold text-sm mb-1">Data Pendaftaran Perlu Diperbaiki</p>
                <p className="text-sm leading-relaxed mb-3">
                  Admin menolak berkas Anda karena: <strong>{expert.reject_reason || 'Data tidak sesuai persyaratan.'}</strong>
                </p>
                <button
                  onClick={() => navigate('/lengkapi-profil')}
                  className="bg-[#B3261E] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#93000A] transition-colors"
                >
                  Perbaiki Profil Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prompt pilih paket */}
        {isAccountActive && !expert?.package_id && (
          <div className="bg-[#E0F2FE] text-[#0369A1] rounded-2xl p-6 border border-[#BAE6FD] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[28px] shrink-0 text-[#0EA5E9] mt-0.5">rocket_launch</span>
              <div>
                <h3 className="font-bold text-base text-[#075985] mb-1">Satu Langkah Lagi! Aktifkan Profil Publik Anda</h3>
                <p className="text-sm text-[#0369A1] leading-relaxed">
                  Akun Anda telah diaktifkan oleh admin. Silakan pilih paket keanggotaan (Free atau Premium) agar profil keahlian Anda tayang di direktori publik kami.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/paket')}
              className="bg-[#0EA5E9] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#0284C7] shadow-md shrink-0 transition-colors"
            >
              Pilih Paket Sekarang
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}