import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

export default function AdminExperts() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, aktif, nonaktif
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = () => {
    setLoading(true);
    api.get('/admin/experts')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setExperts(data);
      })
      .catch(() => setError('Gagal memuat data dari server.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

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
    const matchesKeyword = (e.name || '').toLowerCase().includes(q) || (e.institution || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q);
    
    if (statusFilter === 'aktif') {
      return matchesKeyword && e.profile_status === 'aktif';
    } else if (statusFilter === 'nonaktif') {
      return matchesKeyword && e.profile_status === 'nonaktif';
    }
    return matchesKeyword;
  });

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
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari nama, email, atau instansi..."
            className="w-full max-w-sm px-4 py-2 text-sm border border-[#0284C7]/30 rounded-lg focus:ring-[#0284C7] focus:border-[#0284C7]"
          />
          
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'aktif', label: 'Aktif' },
              { id: 'nonaktif', label: 'Nonaktif' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#0284C7]/5 text-[#414844]">
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Instansi</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status Akun</th>
                <th className="px-6 py-3">Status Profil</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0284C7]/10">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#414844]/70">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#414844]/70">Tidak ada data tenaga ahli.</td></tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#0284C7]/5">
                    <td className="px-6 py-4 font-semibold text-[#0284C7]">{exp.name}</td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.institution || '-'}</td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.email || '-'}</td>
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
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setDetailTarget(exp)}
                          className="text-[#0284C7] hover:underline text-xs font-bold flex items-center gap-0.5"
                        >
                          Detail
                        </button>
                        <Link
                          to={`/admin/tenaga-ahli/${exp.id}/edit`}
                          className="text-[#7A5900] hover:underline text-xs font-bold flex items-center gap-0.5"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleDeactivate(exp)}
                          className={`text-xs font-bold hover:underline ${
                            exp.profile_status === 'nonaktif' ? 'text-[#0284C7]' : 'text-[#B3261E]'
                          }`}
                        >
                          {exp.profile_status === 'nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exp)}
                          className="text-[#B3261E]/70 hover:text-[#B3261E] hover:underline text-xs font-bold"
                        >
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

              {/* Status Section */}
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