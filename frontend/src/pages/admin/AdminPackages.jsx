import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

export default function AdminPackages() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'all';

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = () => {
    setLoading(true);
    api.get('/admin/packages')
      .then((res) => {
        let data = res.data || [];
        if (typeParam === 'premium') {
          data = data.filter(pkg => pkg.price > 0);
        } else if (typeParam === 'free') {
          data = data.filter(pkg => !pkg.price || pkg.price == 0);
        }
        setPackages(data);
      })
      .catch(() => setError('Gagal memuat data paket.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [typeParam]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/packages/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus paket.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0284C7]">Kelola Paket</h2>
          <p className="text-[#414844]/80 text-sm mt-1">Atur paket Free dan Premium serta fitur dan harga keanggotaan tenaga ahli.</p>
        </div>
        <Link
          to="/admin/paket/tambah"
          className="flex items-center gap-2 bg-[#0284C7] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0369A1] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah Paket
        </Link>
      </div>

      {error && <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#0284C7]/5 text-[#414844]">
              <th className="px-6 py-3">Nama Paket</th>
              <th className="px-6 py-3">Tipe</th>
              <th className="px-6 py-3">Harga</th>
              <th className="px-6 py-3">Fitur / Benefits</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Urutan</th>
              <th className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0284C7]/10">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-[#414844]/70">Memuat data...</td></tr>
            ) : packages.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-[#414844]/70">Tidak ada data paket.</td></tr>
            ) : (
              packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-[#0284C7]/5">
                  <td className="px-6 py-4 font-semibold text-[#0284C7]">{pkg.name}</td>
                  <td className="px-6 py-4">
                    {pkg.price > 0 ? (
                      <span className="text-[10px] font-bold text-[#6B4F3B] bg-[#6B4F3B]/10 px-2.5 py-1 rounded-full uppercase">Premium</span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#414844] bg-[#414844]/10 px-2.5 py-1 rounded-full uppercase">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1B1C1A]">
                    {pkg.price > 0 ? `Rp${Number(pkg.price).toLocaleString('id-ID')}` : 'Gratis'}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    {Array.isArray(pkg.benefits) && pkg.benefits.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-[#414844] space-y-0.5">
                        {pkg.benefits.map((b, idx) => (
                          <li key={idx} className="truncate" title={b}>{b}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-[#414844]/50 italic">Tidak ada fitur khusus</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {pkg.is_active ? (
                      <span className="text-xs font-bold text-[#0284C7]">Aktif</span>
                    ) : (
                      <span className="text-xs font-bold text-[#414844]/50">Nonaktif</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#414844]/80">{pkg.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/admin/paket/${pkg.id}/edit`} className="text-[#0284C7] hover:underline text-xs font-bold">Edit</Link>
                      <button onClick={() => setDeleteTarget(pkg)} className="text-[#B3261E] hover:underline text-xs font-bold">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Yakin ingin menghapus paket "${deleteTarget?.name}"?`}
      />
    </div>
  );
}