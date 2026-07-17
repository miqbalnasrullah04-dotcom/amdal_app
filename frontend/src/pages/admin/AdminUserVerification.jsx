import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const statusLabel = {
  draft: { text: 'Draft', color: '#414844', bg: '#F5F4F0' },
  menunggu_verifikasi: { text: 'Menunggu Verifikasi', color: '#7A5900', bg: '#FFF4D6' },
  aktif: { text: 'Disetujui', color: '#0284C7', bg: '#E0F2FE' },
  ditolak: { text: 'Ditolak', color: '#B3261E', bg: '#FFDAD6' },
};

export default function AdminUserVerification() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('menunggu_verifikasi');
  const [detailTarget, setDetailTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState('');

  const loadData = () => {
    setLoading(true);
    api
      .get('/admin/experts', { params: filter ? { status: filter } : {} })
      .then((res) => setExperts(res.data))
      .catch(() => setError('Gagal memuat data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleVerify = async (id) => {
    setActionError('');
    try {
      await api.post(`/admin/experts/${id}/verify-profile`);
      setDetailTarget(null);
      loadData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Gagal memverifikasi.');
      if (err.response?.data?.missing) {
        setActionError(
          `${err.response.data.message} (${err.response.data.missing.join(', ')})`
        );
      }
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await api.post(`/admin/experts/${rejectTarget.id}/reject-profile`, { reject_reason: rejectReason });
      setRejectTarget(null);
      setRejectReason('');
      setDetailTarget(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menolak.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0284C7]">Verifikasi Pendaftaran</h2>
        <p className="text-[#414844]/80 text-sm mt-1">Periksa kelengkapan berkas dan data pendaftar baru sebelum diaktifkan.</p>
      </div>

      {error && <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#0284C7]/15 flex gap-2 overflow-x-auto">
          {['menunggu_verifikasi', 'aktif', 'ditolak'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                filter === s ? 'bg-[#0284C7] text-white shadow-sm' : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
              }`}
            >
              {statusLabel[s].text}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#0284C7]/5 text-[#414844]">
                <th className="px-6 py-3">Nama Lengkap</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">No. HP</th>
                <th className="px-6 py-3">Bidang Keahlian</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0284C7]/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#414844]/70">
                    Memuat data...
                  </td>
                </tr>
              ) : experts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#414844]/70">
                    Tidak ada pendaftar pada status ini.
                  </td>
                </tr>
              ) : (
                experts.map((exp) => {
                  const s = statusLabel[exp.profile_status] || statusLabel.draft;
                  return (
                    <tr key={exp.id} className="hover:bg-[#0284C7]/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#0284C7]">{exp.name}</td>
                      <td className="px-6 py-4 text-[#414844]/80">{exp.user?.email || exp.email}</td>
                      <td className="px-6 py-4 text-[#414844]/80">{exp.phone || '-'}</td>
                      <td className="px-6 py-4 text-[#414844]/80">{exp.field || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
                          {s.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setDetailTarget(exp)}
                          className="bg-[#0284C7]/10 hover:bg-[#0284C7]/20 text-[#0284C7] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Verifikasi */}
      {detailTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#0284C7]/15">
              <div>
                <h3 className="text-xl font-bold text-[#0284C7]">{detailTarget.name}</h3>
                <p className="text-xs text-[#414844]/60 mt-0.5">ID Tenaga Ahli: #{detailTarget.id}</p>
              </div>
              <button onClick={() => setDetailTarget(null)} className="text-[#414844]/60 hover:text-[#0284C7] p-1.5 rounded-full hover:bg-[#F5F4EF] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-sm">
              {actionError && <div className="bg-[#FFDAD6] text-[#93000A] rounded-xl p-4 font-bold">{actionError}</div>}

              {/* Data Diri Grid */}
              <div>
                <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-3">Data Pribadi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <span className="text-xs text-[#414844]/60 block font-medium">Email</span>
                    <span className="font-semibold text-[#1F2A22]">{detailTarget.user?.email || detailTarget.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#414844]/60 block font-medium">No. HP / WhatsApp</span>
                    <span className="font-semibold text-[#1F2A22]">{detailTarget.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#414844]/60 block font-medium">Institusi</span>
                    <span className="font-semibold text-[#1F2A22]">{detailTarget.institution || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#414844]/60 block font-medium">Bidang Keahlian</span>
                    <span className="font-semibold text-[#1F2A22]">{detailTarget.field || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#414844]/60 block font-medium">Tempat, Tanggal Lahir</span>
                    <span className="font-semibold text-[#1F2A22]">
                      {detailTarget.tempat_lahir ? `${detailTarget.tempat_lahir}, ` : ''}
                      {detailTarget.tanggal_lahir ? new Date(detailTarget.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#414844]/60 block font-medium">Pendidikan Terakhir (Form)</span>
                    <span className="font-semibold text-[#1F2A22]">{detailTarget.pendidikan || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Ringkasan Pengalaman */}
              {detailTarget.pengalaman && (
                <div>
                  <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-2">Ringkasan Pengalaman</h4>
                  <p className="bg-[#F5F4EF] p-4 rounded-xl text-xs text-[#414844] leading-relaxed whitespace-pre-line border border-outline-variant/30">
                    {detailTarget.pengalaman}
                  </p>
                </div>
              )}

              {/* Riwayat Pendidikan detail */}
              {detailTarget.educations?.length > 0 && (
                <div>
                  <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-2">Pendidikan Detail</h4>
                  <ul className="space-y-1.5">
                    {detailTarget.educations.map((e) => (
                      <li key={e.id} className="text-xs bg-[#0284C7]/5 p-2 rounded-lg border border-[#0284C7]/10">
                        🎓 <strong>{e.jenjang}</strong> — {e.institusi} {e.tahun_lulus ? `(Lulus ${e.tahun_lulus})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Uploaded Documents */}
              <div>
                <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-3">Dokumen Pendaftaran</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Pas Foto */}
                  <div className="bg-[#F5F4EF] rounded-xl p-3 border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-[#414844]/60 uppercase mb-2">Pas Foto</p>
                    {detailTarget.photo ? (
                      <div className="space-y-2">
                        <img
                          src={detailTarget.photo.startsWith('http') ? detailTarget.photo : `/storage/${detailTarget.photo}`}
                          alt="Foto Profil"
                          className="w-20 h-20 rounded-lg object-cover border border-[#0284C7]/20 mx-auto"
                        />
                        <a
                          href={detailTarget.photo.startsWith('http') ? detailTarget.photo : `/storage/${detailTarget.photo}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0284C7] hover:underline text-xs font-bold block"
                        >
                          Lihat Foto
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-[#414844]/40 font-medium">Tidak ada foto</span>
                    )}
                  </div>

                  {/* CV */}
                  <div className="bg-[#F5F4EF] rounded-xl p-3 border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-[#414844]/60 uppercase mb-2">Curriculum Vitae (CV)</p>
                    {detailTarget.cv_path ? (
                      <div className="space-y-2 text-center">
                        <span className="material-symbols-outlined text-[36px] text-red-500">picture_as_pdf</span>
                        <a
                          href={`/storage/${detailTarget.cv_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0284C7] hover:underline text-xs font-bold block"
                        >
                          Buka Berkas CV
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-[#414844]/40 font-medium">Tidak ada berkas CV</span>
                    )}
                  </div>

                  {/* Bukti Kompetensi */}
                  <div className="bg-[#F5F4EF] rounded-xl p-3 border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-[#414844]/60 uppercase mb-2">Bukti Kompetensi</p>
                    {detailTarget.bukti_kompetensi_path ? (
                      <div className="space-y-2 text-center">
                        <span className="material-symbols-outlined text-[36px] text-[#0284C7]">verified</span>
                        <a
                          href={`/storage/${detailTarget.bukti_kompetensi_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0284C7] hover:underline text-xs font-bold block"
                        >
                          Buka Bukti Berkas
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-[#414844]/40 font-medium">Tidak ada berkas bukti</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-[#F5F4EF] rounded-xl p-4 border border-outline-variant/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#414844]/60 block font-medium">Status Pendaftaran Saat Ini</span>
                  <span className="font-bold text-sm" style={{ color: statusLabel[detailTarget.profile_status]?.color }}>
                    {statusLabel[detailTarget.profile_status]?.text}
                  </span>
                </div>
                {detailTarget.reject_reason && (
                  <div className="text-right max-w-xs">
                    <span className="text-[#414844]/60 block font-medium">Alasan Penolakan</span>
                    <span className="font-bold text-[#B3261E]">{detailTarget.reject_reason}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {detailTarget.profile_status === 'menunggu_verifikasi' && (
                <div className="flex gap-3 pt-4 border-t border-[#0284C7]/10">
                  <button
                    onClick={() => handleVerify(detailTarget.id)}
                    className="flex-1 bg-[#0284C7] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#0369A1] active:scale-[0.99] transition-all shadow-md shadow-[#0284C7]/10 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Setujui & Aktifkan Akun
                  </button>
                  <button
                    onClick={() => setRejectTarget(detailTarget)}
                    className="flex-1 bg-[#B3261E] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#93000A] active:scale-[0.99] transition-all shadow-md shadow-[#B3261E]/10 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">cancel</span>
                    Tolak / Butuh Perbaikan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fadeIn">
            <h3 className="font-bold text-lg text-[#0284C7] mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-red-500">cancel</span>
              Tolak & Minta Perbaikan
            </h3>
            <p className="text-xs text-[#414844]/70 mb-4 leading-relaxed">
              Berikan alasan penolakan atau petunjuk perbaikan dokumen agar user tahu bagian mana yang harus diperbaiki.
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Lampiran CV belum berformat PDF, harap unggah berkas terbaru."
              className="w-full border border-[#0284C7]/30 rounded-xl px-3.5 py-3 text-xs mb-4 focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] focus:outline-none transition-all resize-none"
            />
            <div className="flex justify-end gap-3 border-t border-black/5 pt-4">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#414844] hover:bg-[#F5F4EF] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#B3261E] text-white hover:bg-[#93000A] shadow-md shadow-[#B3261E]/10 transition-colors"
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}