import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

export default function AdminExperts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'all';
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = () => {
    setLoading(true);
    let apiStatus = statusParam;
    if (statusParam === 'disetujui') apiStatus = 'aktif';
    const params = apiStatus && apiStatus !== 'all' ? { status: apiStatus } : {};
    
    api.get('/admin/experts', { params })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setExperts(data);
      })
      .catch(() => setError('Gagal memuat data dari server.'))
      .finally(() => setLoading(false));
  };

  const handleVerifyExpert = async (id) => {
    try {
      await api.post(`/admin/experts/${id}/verify-profile`);
      setDetailTarget(null);
      loadData();
      alert('Profil berhasil disetujui.');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyetujui profil.');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Tulis alasan penolakan/perbaikan terlebih dahulu.');
      return;
    }
    try {
      await api.post(`/admin/experts/${detailTarget.id}/reject-profile`, { reject_reason: rejectReason });
      setDetailTarget(null);
      setRejecting(false);
      setRejectReason('');
      loadData();
      alert('Permintaan perbaikan telah dikirim ke user.');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menolak profil.');
    }
  };

  useEffect(() => { loadData(); }, [statusParam]);

  const handleToggleDeactivate = async (expert) => {
    try {
      await api.post(`/admin/experts/${expert.id}/deactivate`);
      if (detailTarget && detailTarget.id === expert.id) {
        setDetailTarget({
          ...detailTarget,
          profile_status: detailTarget.profile_status === 'nonaktif' ? 'aktif' : 'nonaktif'
        });
      }
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status akun.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/experts/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  const filtered = experts.filter((e) => {
    const q = keyword.toLowerCase();
    return (e.name || '').toLowerCase().includes(q) || 
           (e.institution || '').toLowerCase().includes(q) || 
           (e.email || '').toLowerCase().includes(q);
  });

  const avatarPalette = ['#0284C7', '#7A5900', '#6B4F3B', '#0EA5E9', '#414844'];
  const getInitials = (name = '') =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
  const getAvatarColor = (id) => avatarPalette[(id || 0) % avatarPalette.length];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0284C7]">Manajemen Tenaga Ahli</h2>
          <p className="text-[#414844]/80 text-sm mt-1">Kelola data, detail profil, dan status keaktifan tenaga ahli TenagaAhli.com.</p>
        </div>
        <Link
          to="/admin/tenaga-ahli/tambah"
          className="flex items-center gap-2 bg-[#0284C7] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0369A1] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Tambah Tenaga Ahli
        </Link>
      </div>

      {error && <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#0284C7]/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#414844]/40 text-[20px]">search</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari nama, email, atau instansi..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#0284C7]/20 rounded-lg focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] focus:outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
              { id: 'disetujui', label: 'Disetujui' },
              { id: 'ditolak', label: 'Ditolak' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ status: tab.id })}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                  statusParam === tab.id
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <div className="px-6 pt-4 text-xs text-[#414844]/60">
            Menampilkan <span className="font-bold text-[#414844]">{filtered.length}</span> dari {experts.length} tenaga ahli
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#0284C7]/5 text-[#414844]">
                <th className="px-6 py-3">Tenaga Ahli</th>
                <th className="px-6 py-3">Instansi</th>
                <th className="px-6 py-3">Status Akun</th>
                <th className="px-6 py-3">Status Profil</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0284C7]/10">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-9 h-9 rounded-full bg-[#0284C7]/10 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/3 bg-[#0284C7]/10 rounded" />
                          <div className="h-2.5 w-1/4 bg-[#0284C7]/10 rounded" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#414844]/70">
                    <span className="material-symbols-outlined text-[40px] text-[#414844]/25 block mb-2">groups</span>
                    Tidak ada data tenaga ahli yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#0284C7]/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: getAvatarColor(exp.id) }}
                        >
                          {getInitials(exp.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0284C7] truncate">{exp.name}</p>
                          <p className="text-xs text-[#414844]/60 truncate">{exp.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.institution || '-'}</td>
                    <td className="px-6 py-4">
                      {exp.profile_status === 'nonaktif' ? (
                        <span className="text-xs font-bold text-[#B3261E] bg-[#FFDAD6] px-2.5 py-1 rounded-full">Nonaktif</span>
                      ) : exp.profile_status === 'aktif' ? (
                        <span className="text-xs font-bold text-[#0284C7] bg-[#E0F2FE] px-2.5 py-1 rounded-full">Aktif</span>
                      ) : (
                        <span className="text-xs font-bold text-[#7A5900] bg-[#FFF4D6] px-2.5 py-1 rounded-full">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {exp.verified ? (
                        <span className="text-xs font-bold text-[#0284C7] flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">verified</span> Terverifikasi
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#414844]/50">Belum Verifikasi</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => setDetailTarget(exp)}
                          title="Lihat detail"
                          className="flex items-center gap-1 text-[#0284C7] bg-[#0284C7]/10 hover:bg-[#0284C7]/20 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          Detail
                        </button>
                        <Link
                          to={`/admin/tenaga-ahli/${exp.id}/edit`}
                          title="Edit data"
                          className="flex items-center gap-1 text-[#7A5900] bg-[#7A5900]/10 hover:bg-[#7A5900]/20 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleDeactivate(exp)}
                          title={exp.profile_status === 'nonaktif' ? 'Aktifkan akun' : 'Nonaktifkan akun'}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            exp.profile_status === 'nonaktif'
                              ? 'text-[#0284C7] bg-[#0284C7]/10 hover:bg-[#0284C7]/20'
                              : 'text-[#B3261E] bg-[#B3261E]/10 hover:bg-[#B3261E]/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {exp.profile_status === 'nonaktif' ? 'toggle_on' : 'toggle_off'}
                          </span>
                          {exp.profile_status === 'nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exp)}
                          title="Hapus data"
                          className="flex items-center gap-1 text-[#B3261E]/80 bg-[#B3261E]/10 hover:bg-[#B3261E]/20 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Profil */}
      {detailTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
              {/* Data Diri Grid */}
              <div>
                <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-3">Data Pribadi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <span className="text-xs text-[#414844]/60 block font-medium">Email</span>
                    <span className="font-semibold text-[#1F2A22]">{detailTarget.email || '-'}</span>
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
                    <span className="text-xs text-[#414844]/60 block font-medium">Kriteria</span>
                    <span className="font-semibold text-[#1F2A22]">{detailTarget.kriteria || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#414844]/60 block font-medium">Alamat</span>
                    <span className="font-semibold text-[#1F2A22]">
                      {detailTarget.alamat_kota ? `${detailTarget.alamat_kota}, ` : ''}
                      {detailTarget.alamat_provinsi || '-'}
                    </span>
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

              {/* Catatan */}
              {detailTarget.catatan && (
                <div>
                  <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-2">Catatan</h4>
                  <p className="bg-[#F5F4EF] p-4 rounded-xl text-xs text-[#414844] leading-relaxed whitespace-pre-line border border-outline-variant/30">
                    {detailTarget.catatan}
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

              {/* Profil Bio */}
              {(detailTarget.tentang_saya || detailTarget.ringkasan_keahlian || detailTarget.kriteria_list?.length > 0) && (
                <div>
                  <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-2">Profil Bio</h4>
                  <div className="space-y-3">
                    {detailTarget.kriteria_list?.length > 0 && (
                      <div>
                        <span className="text-xs text-[#414844]/60 block font-medium">Kriteria Profesional</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {detailTarget.kriteria_list.map((k, i) => (
                            <span key={i} className="text-[10px] bg-[#0284C7]/10 text-[#0284C7] px-2 py-0.5 rounded-full font-bold">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailTarget.tentang_saya && (
                      <div>
                        <span className="text-xs text-[#414844]/60 block font-medium">Tentang Saya</span>
                        <p className="text-xs font-semibold text-[#1F2A22] mt-0.5">{detailTarget.tentang_saya}</p>
                      </div>
                    )}
                    {detailTarget.ringkasan_keahlian && (
                      <div>
                        <span className="text-xs text-[#414844]/60 block font-medium">Ringkasan Keahlian</span>
                        <p className="text-xs font-semibold text-[#1F2A22] mt-0.5">{detailTarget.ringkasan_keahlian}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pengalaman Kerja */}
              {detailTarget.experiences?.length > 0 && (
                <div>
                  <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-2">Pengalaman Kerja</h4>
                  <ul className="space-y-2">
                    {detailTarget.experiences.map((e) => (
                      <li key={e.id} className="text-xs bg-[#F5F4EF] p-2.5 rounded-lg border border-outline-variant/30">
                        <div className="font-bold text-[#1F2A22]">{e.posisi}</div>
                        <div className="text-[#414844]/80">{e.instansi} • {e.tahun_mulai} - {e.tahun_selesai || 'Sekarang'}</div>
                        {e.deskripsi && <div className="mt-1 text-[#414844]/70">{e.deskripsi}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sertifikasi */}
              {detailTarget.certificates?.length > 0 && (
                <div>
                  <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-2">Sertifikasi</h4>
                  <ul className="space-y-2">
                    {detailTarget.certificates.map((c) => (
                      <li key={c.id} className="text-xs bg-[#F5F4EF] p-2.5 rounded-lg border border-outline-variant/30 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#1F2A22]">{c.nama_sertifikat}</div>
                          <div className="text-[#414844]/80">{c.penerbit} • {c.tahun}</div>
                        </div>
                        {c.file_path && (
                           <a href={c.file_path.startsWith('http') ? c.file_path : `/storage/${c.file_path}`} target="_blank" rel="noreferrer" className="text-[#0284C7] hover:underline font-bold">Lihat</a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link Akademik */}
              {(detailTarget.google_scholar_url || detailTarget.scopus_url || detailTarget.sinta_url || detailTarget.orcid_url) && (
                <div>
                  <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-2">Link Akademik</h4>
                  <div className="flex flex-wrap gap-2">
                    {detailTarget.google_scholar_url && (
                      <a href={detailTarget.google_scholar_url} target="_blank" rel="noreferrer" className="text-[11px] text-[#0284C7] hover:underline bg-[#0284C7]/10 px-2.5 py-1 rounded-lg font-bold">Google Scholar</a>
                    )}
                    {detailTarget.scopus_url && (
                      <a href={detailTarget.scopus_url} target="_blank" rel="noreferrer" className="text-[11px] text-[#0284C7] hover:underline bg-[#0284C7]/10 px-2.5 py-1 rounded-lg font-bold">Scopus</a>
                    )}
                    {detailTarget.sinta_url && (
                      <a href={detailTarget.sinta_url} target="_blank" rel="noreferrer" className="text-[11px] text-[#0284C7] hover:underline bg-[#0284C7]/10 px-2.5 py-1 rounded-lg font-bold">SINTA</a>
                    )}
                    {detailTarget.orcid_url && (
                      <a href={detailTarget.orcid_url} target="_blank" rel="noreferrer" className="text-[11px] text-[#0284C7] hover:underline bg-[#0284C7]/10 px-2.5 py-1 rounded-lg font-bold">ORCID</a>
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded Documents */}
              <div>
                <h4 className="font-bold text-[#0284C7] uppercase tracking-wider text-xs border-b border-[#0284C7]/10 pb-1.5 mb-3">Dokumen</h4>
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
                    {(() => {
                      const cvPath = detailTarget.cv_path || detailTarget.documents?.find(d => d.type === 'lainnya' && d.label?.includes('CV'))?.file_path;
                      return cvPath ? (
                        <div className="space-y-2 text-center">
                          <span className="material-symbols-outlined text-[36px] text-red-500">picture_as_pdf</span>
                          <a
                            href={cvPath.startsWith('http') ? cvPath : `/storage/${cvPath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0284C7] hover:underline text-xs font-bold block"
                          >
                            Buka Berkas CV
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-[#414844]/40 font-medium">Tidak ada berkas CV</span>
                      );
                    })()}
                  </div>

                  {/* Bukti Kompetensi */}
                  <div className="bg-[#F5F4EF] rounded-xl p-3 border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-[#414844]/60 uppercase mb-2">Bukti Kompetensi</p>
                    {(() => {
                      const buktiPath = detailTarget.bukti_kompetensi_path || detailTarget.documents?.find(d => d.type === 'lainnya' && d.label?.includes('Bukti'))?.file_path;
                      return buktiPath ? (
                        <div className="space-y-2 text-center">
                          <span className="material-symbols-outlined text-[36px] text-[#0284C7]">verified</span>
                          <a
                            href={buktiPath.startsWith('http') ? buktiPath : `/storage/${buktiPath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0284C7] hover:underline text-xs font-bold block"
                          >
                            Buka Bukti Berkas
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-[#414844]/40 font-medium">Tidak ada berkas bukti</span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Verification & Status Section */}
              {detailTarget.profile_status === 'menunggu_verifikasi' ? (
                <div className="bg-[#FFF4D6] rounded-xl p-4 border border-[#FCD34D] space-y-3">
                  <div>
                    <span className="text-[#7A5900] block font-bold text-xs">Verifikasi Profil Tenaga Ahli</span>
                    <span className="text-[11px] text-[#414844]/70">Tinjau kelengkapan berkas di atas lalu pilih tindakan persetujuan.</span>
                  </div>
                  
                  {rejecting ? (
                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Tulis alasan penolakan / instruksi perbaikan..."
                        className="w-full p-2 border border-red-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-[#B3261E] focus:outline-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleReject}
                          className="bg-[#B3261E] text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-[#93000A] transition-colors"
                        >
                          Kirim Catatan Perbaikan
                        </button>
                        <button
                          onClick={() => { setRejecting(false); setRejectReason(''); }}
                          className="bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyExpert(detailTarget.id)}
                        className="bg-[#0284C7] text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-[#0369A1] transition-colors shadow-sm"
                      >
                        Setujui & Publikasikan
                      </button>
                      <button
                        onClick={() => setRejecting(true)}
                        className="bg-[#B3261E]/10 text-[#B3261E] font-bold px-4 py-2 rounded-lg text-xs hover:bg-[#B3261E]/20 transition-colors"
                      >
                        Tolak (Perlu Perbaikan)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#F5F4EF] rounded-xl p-4 border border-outline-variant/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#414844]/60 block font-medium">Status Akun Saat Ini</span>
                    <span className={`font-bold text-sm ${detailTarget.profile_status === 'nonaktif' ? 'text-[#B3261E]' : 'text-[#0284C7]'}`}>
                      {detailTarget.profile_status === 'nonaktif' ? 'Nonaktif' : 'Aktif'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleToggleDeactivate(detailTarget)}
                    className={`px-4 py-2.5 rounded-xl font-bold transition-all text-xs text-white ${
                      detailTarget.profile_status === 'nonaktif'
                        ? 'bg-[#0284C7] hover:bg-[#0369A1]'
                        : 'bg-[#B3261E] hover:bg-[#93000A]'
                    }`}
                  >
                    {detailTarget.profile_status === 'nonaktif' ? 'Aktifkan Akun' : 'Nonaktifkan Akun'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak bisa dibatalkan.`}
      />
    </div>
  );
}