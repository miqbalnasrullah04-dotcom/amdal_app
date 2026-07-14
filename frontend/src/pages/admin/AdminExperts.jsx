import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

export default function AdminExperts() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
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

  const filtered = experts.filter((e) => {
    const q = keyword.toLowerCase();
    return (e.name || '').toLowerCase().includes(q) || (e.institution || '').toLowerCase().includes(q);
  });

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2E5E3B]">Manajemen Tenaga Ahli</h2>
          <p className="text-[#414844]/80 text-sm mt-1">Kelola data tenaga ahli yang terdaftar di AMDAL.ID.</p>
        </div>
        <Link
          to="/admin/tenaga-ahli/tambah"
          className="flex items-center gap-2 bg-[#2E5E3B] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#244B2F] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Tambah Tenaga Ahli
        </Link>
      </div>

      {error && <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl border border-[#2E5E3B]/15 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#2E5E3B]/15">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari nama atau instansi..."
            className="w-full max-w-sm px-4 py-2 text-sm border border-[#2E5E3B]/30 rounded-lg focus:ring-[#2E5E3B] focus:border-[#2E5E3B]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#2E5E3B]/5 text-[#414844]">
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Instansi</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E5E3B]/10">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#414844]/70">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#414844]/70">Tidak ada data.</td></tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#2E5E3B]/5">
                    <td className="px-6 py-4 font-semibold text-[#2E5E3B]">{exp.name}</td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.institution || '-'}</td>
                    <td className="px-6 py-4 text-[#414844]/80">{exp.email || '-'}</td>
                    <td className="px-6 py-4">
                      {exp.verified ? (
                        <span className="text-xs font-bold text-[#2E5E3B]">Verified</span>
                      ) : (
                        <span className="text-xs font-bold text-[#414844]/50">Belum</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link to={`/admin/tenaga-ahli/${exp.id}/edit`} className="text-[#2E5E3B] hover:underline text-xs font-bold">Edit</Link>
                      <button onClick={() => setDeleteTarget(exp)} className="text-[#B3261E] hover:underline text-xs font-bold">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak bisa dibatalkan.`}
      />
    </div>
  );
}