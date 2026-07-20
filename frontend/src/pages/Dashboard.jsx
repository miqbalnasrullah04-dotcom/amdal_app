import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/my/profile')
      .then((res) => setExpert(res.data))
      .catch(() => setError('Gagal memuat data profil.'));
  }, []);

  const name = expert?.name || 'Pengguna';
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
  
  // Package & publication status
  const hasPackage = !!expert?.package_id;
  const packageName = expert?.package?.name || 'Belum Dipilih';
  const isPublished = isApproved && hasPackage;

  return (
    <DashboardLayout
      title={`Selamat Datang, ${name.split(' ')[0]}`}
      subtitle="Kelola profil tenaga ahli Anda dan pantau status publikasi."
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
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Status Akun</p>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isApproved ? 'bg-[#2E5E3B]' : 
                  isRejected ? 'bg-[#B3261E]' :
                  isPending ? 'bg-[#7A5900]' :
                  'bg-[#5B6660]'
                }`}></span>
                <p className="font-bold text-on-background text-sm">
                  {isApproved ? 'Aktif & Disetujui' : 
                   isRejected ? 'Ditolak' :
                   isPending ? 'Menunggu Verifikasi' :
                   'Draft'}
                </p>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isApproved ? 'Akun telah diverifikasi admin' : 
                 isRejected ? 'Perlu perbaikan data' :
                 isPending ? 'Sedang ditinjau admin' :
                 'Lengkapi profil Anda'}
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
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Status Publikasi</p>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isPublished ? 'bg-[#0EA5E9]' : 'bg-[#B3261E]'
                }`}></span>
                <p className="font-bold text-on-background text-sm">
                  {isPublished ? 'Tayang Publik' : 'Belum Tayang'}
                </p>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isPublished ? 'Profil tampil di direktori' : 'Aktifkan akun & pilih paket'}
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
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Paket Aktif</p>
              <p className="font-bold text-on-background text-sm mb-1.5 truncate">{packageName}</p>
              {hasPackage ? (
                <p className="text-xs text-on-surface-variant">Langganan aktif</p>
              ) : (
                <Link to="/paket" className="text-xs text-[#0EA5E9] font-bold hover:underline inline-flex items-center gap-1">
                  Pilih Paket <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              )}
            </div>
          </div>
        </div>

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
                <h3 className="font-bold text-[#93000A] text-base mb-2">Data Pendaftaran Perlu Diperbaiki</h3>
                <div className="bg-white/50 rounded-xl p-4 mb-4 border border-[#B3261E]/20">
                  <p className="text-xs font-bold text-[#93000A] uppercase tracking-wide mb-1">Catatan dari Admin:</p>
                  <p className="text-sm text-[#410002] leading-relaxed font-medium">
                    {rejectReason || 'Data atau dokumen yang diunggah belum memenuhi syarat. Harap periksa kembali.'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/profil-saya')}
                  className="bg-[#B3261E] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#93000A] transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Perbaiki Profil Sekarang
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
                <h3 className="font-bold text-[#5C4A00] text-base mb-2">Menunggu Verifikasi Admin</h3>
                <p className="text-sm text-[#5C4A00] leading-relaxed mb-4">
                  Data pendaftaran Anda sedang ditinjau oleh tim kami. Proses verifikasi biasanya memakan waktu <strong>1–3 hari kerja</strong>. 
                  Kami akan mengirimkan notifikasi via email setelah akun disetujui atau jika ada perbaikan yang diperlukan.
                </p>
                <div className="flex items-center gap-2 text-xs text-[#5C4A00]">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>Pastikan Anda memeriksa email secara berkala (termasuk folder spam).</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DRAFT — Lengkapi Profil */}
        {isDraft && !isProfileComplete && (
          <div className="bg-[#E0F2FE] rounded-2xl p-6 border border-[#BAE6FD] animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 rounded-xl bg-[#0EA5E9]/10 shrink-0">
                  <span className="material-symbols-outlined text-[28px] text-[#0284C7]">edit_note</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#075985] text-base mb-2">Lengkapi Profil Anda</h3>
                  <p className="text-sm text-[#0369A1] leading-relaxed mb-3">
                    Profil Anda baru <strong>{profileCompleteness}/3 bagian</strong> terisi. Lengkapi data pribadi, pendidikan, 
                    dan unggah foto profil agar akun dapat diverifikasi admin.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {!hasBasicInfo && <span className="text-xs bg-white/60 text-[#075985] px-2.5 py-1 rounded-full border border-[#0EA5E9]/30">Data Pribadi</span>}
                    {!hasEducation && <span className="text-xs bg-white/60 text-[#075985] px-2.5 py-1 rounded-full border border-[#0EA5E9]/30">Pendidikan</span>}
                    {!hasPhoto && <span className="text-xs bg-white/60 text-[#075985] px-2.5 py-1 rounded-full border border-[#0EA5E9]/30">Foto Profil</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/profil-saya')}
                className="bg-[#0EA5E9] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#0284C7] shadow-md transition-colors shrink-0 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                Lengkapi Sekarang
              </button>
            </div>
          </div>
        )}

        {/* APPROVED + BELUM PILIH PAKET */}
        {isApproved && !hasPackage && (
          <div className="bg-gradient-to-br from-[#E0F2FE] to-[#DBEAFE] rounded-2xl p-6 border border-[#0EA5E9]/30 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 rounded-xl bg-white/80 shrink-0">
                  <span className="material-symbols-outlined text-[32px] text-[#0EA5E9]">rocket_launch</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#075985] text-lg mb-2">Satu Langkah Lagi!</h3>
                  <p className="text-sm text-[#0369A1] leading-relaxed">
                    Selamat, akun Anda telah <strong>disetujui oleh admin</strong>. Sekarang pilih paket keanggotaan 
                    (Free atau Premium) agar profil keahlian Anda tayang di direktori publik.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/paket')}
                className="bg-[#0EA5E9] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#0284C7] shadow-lg shadow-[#0EA5E9]/20 transition-all hover:shadow-xl shrink-0 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                Pilih Paket Sekarang
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
                  Profil Anda Sedang Tayang!
                  <span className="text-xs font-bold bg-[#2E5E3B] text-white px-2.5 py-1 rounded-full">LIVE</span>
                </h3>
                <p className="text-sm text-[#2E5E3B] leading-relaxed mb-4">
                  Profil tenaga ahli Anda sudah aktif dan dapat dilihat oleh publik di direktori website. 
                  Pastikan data Anda selalu up-to-date agar mendapat peluang kolaborasi lebih baik.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/profil-publik"
                    className="bg-white text-[#2E5E3B] border-2 border-[#2E5E3B] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#2E5E3B] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    Lihat Profil Publik
                  </Link>
                  <Link
                    to="/profil-saya"
                    className="bg-[#2E5E3B]/10 text-[#2E5E3B] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#2E5E3B]/20 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Profil
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
            Akses Cepat
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              to="/profil-saya"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-[#2E5E3B] hover:bg-[#2E5E3B]/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-[28px] text-[#2E5E3B] group-hover:scale-110 transition-transform">person</span>
              <span className="text-xs font-semibold text-center text-on-surface-variant group-hover:text-[#2E5E3B]">Profil Saya</span>
            </Link>
            <Link
              to="/paket"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-[#2E5E3B] hover:bg-[#2E5E3B]/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-[28px] text-[#2E5E3B] group-hover:scale-110 transition-transform">workspace_premium</span>
              <span className="text-xs font-semibold text-center text-on-surface-variant group-hover:text-[#2E5E3B]">Paket</span>
            </Link>
            <Link
              to="/pembayaran"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-[#2E5E3B] hover:bg-[#2E5E3B]/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-[28px] text-[#2E5E3B] group-hover:scale-110 transition-transform">payments</span>
              <span className="text-xs font-semibold text-center text-on-surface-variant group-hover:text-[#2E5E3B]">Pembayaran</span>
            </Link>
            <Link
              to="/profil-publik"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-[#2E5E3B] hover:bg-[#2E5E3B]/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-[28px] text-[#2E5E3B] group-hover:scale-110 transition-transform">language</span>
              <span className="text-xs font-semibold text-center text-on-surface-variant group-hover:text-[#2E5E3B]">Profil Publik</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
