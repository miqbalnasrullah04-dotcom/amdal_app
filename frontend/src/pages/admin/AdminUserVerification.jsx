import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const statusLabel = {
  draft: { text: 'Draft', color: '#414844' },
  menunggu_verifikasi: { text: 'Menunggu Verifikasi', color: '#7A5900' },
  aktif: { text: 'Aktif', color: '#2E5E3B' },
  ditolak: { text: 'Ditolak', color: '#B3261E' },
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
        <h2 className="text-2xl font-bold text-[#2E5E3B]">Verifikasi Profil User</h2>
        <p className="text-[#414844]/80 text-sm mt-1">Periksa kelengkapan profil tenaga ahli sebelum tayang.</p>
      </div>

      {error && <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl border border-[#2E5E3B]/15 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#2E5E3B]/15 flex gap-2">
          {['', 'menunggu_verifikasi', 'aktif', 'ditolak', 'draft'].map((s) => (
            <button
              key={s || 'semua'}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === s ? 'bg-[#2E5E3B] text-white' : 'bg-[#2E5E3B]/5 text-[#414844]'
              }`}
            >
              {s ? statusLabel[s].text : 'Semua'}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#2E5E3B]/5 text-[#414844]">
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E5E3B]/10">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#414844]/70">
                    Memuat data...
                  </td>
                </tr>
              ) : experts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#414844]/70">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                experts.map((exp) => {
                  const s = statusLabel[exp.profile_status] || statusLabel.draft;
                  return (
                    <tr key={exp.id} className="hover:bg-[#2E5E3B]/5">
                      <td className="px-6 py-4 font-semibold text-[#2E5E3B]">{exp.name}</td>
                      <td className="px-6 py-4 text-[#414844]/80">{exp.user?.email || exp.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold" style={{ color: s.color }}>
                          {s.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setDetailTarget(exp)}
                          className="text-[#2E5E3B] hover:underline text-xs font-bold"
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

      {/* Modal Detail */}
      {detailTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#2E5E3B]/15">
              <h3 className="text-lg font-bold text-[#2E5E3B]">{detailTarget.name}</h3>
              <button onClick={() => setDetailTarget(null)} className="text-[#414844]/60 hover:text-[#2E5E3B]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {actionError && <div className="bg-[#FFDAD6] text-[#93000A] rounded-lg p-3">{actionError}</div>}

              <p><strong>Instansi:</strong> {detailTarget.institution || '-'}</p>
              <p><strong>Bidang:</strong> {detailTarget.field || '-'}</p>
              <p><strong>Kriteria:</strong> {detailTarget.kriteria || '-'}</p>
              <p><strong>Kota:</strong> {detailTarget.alamat_kota || '-'}</p>
              <p><strong>Paket:</strong> {detailTarget.package_id ? `Package #${detailTarget.package_id}` : 'Belum pilih'}</p>

              {detailTarget.educations?.length > 0 && (
                <div>
                  <p className="font-bold mb-1">Pendidikan:</p>
                  <ul className="list-disc list-inside">
                    {detailTarget.educations.map((e) => (
                      <li key={e.id}>{e.jenjang} - {e.institusi}</li>
                    ))}
                  </ul>
                </div>
              )}

              {detailTarget.documents?.length > 0 && (
                <div>
                  <p className="font-bold mb-1">Dokumen:</p>
                  <ul className="space-y-1">
                    {detailTarget.documents.map((d) => (
                      <li key={d.id}>
                        <a href={d.file_url} target="_blank" rel="noreferrer" className="text-[#2E5E3B] hover:underline">
                          {d.label || d.type}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detailTarget.profile_status === 'menunggu_verifikasi' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleVerify(detailTarget.id)}
                    className="flex-1 bg-[#2E5E3B] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#244B2F]"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => setRejectTarget(detailTarget)}
                    className="flex-1 bg-[#B3261E] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#93000A]"
                  >
                    Tolak
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h3 className="font-bold text-[#2E5E3B] mb-4">Tolak Profil</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan"
              className="w-full border border-[#2E5E3B]/30 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-[#2E5E3B] focus:border-[#2E5E3B]"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-lg text-sm font-bold text-[#414844] hover:bg-[#414844]/10"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-[#B3261E] text-white hover:bg-[#93000A]"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}