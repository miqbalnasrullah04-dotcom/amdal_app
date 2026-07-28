import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

export default function AdminPackages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'all';

  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError('');
    api.get('/admin/packages')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAllPackages([...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      })
      .catch(() => setError('Gagal memuat data paket dari server.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const packages = allPackages.filter((pkg) => {
    if (typeParam === 'premium') return pkg.price > 0;
    if (typeParam === 'free') return !pkg.price || pkg.price == 0;
    return true;
  });

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

  const handleToggleActive = async (pkg) => {
    setTogglingId(pkg.id);
    try {
      // TODO: sesuaikan jika backend punya endpoint khusus toggle status
      await api.put(`/admin/packages/${pkg.id}`, { ...pkg, is_active: !pkg.is_active });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status paket.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0284C7]">Kelola Paket</h2>
          <p className="text-[#414844]/80 text-sm mt-1">Atur paket Free dan Premium serta fitur dan harga keanggotaan tenaga ahli.</p>
        </div>
        <Link
          to="/admin/paket/tambah"
          className="flex items-center justify-center gap-2 bg-[#0284C7] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0369A1] transition-colors shadow-sm shadow-[#0284C7]/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah Paket
        </Link>
      </div>

      {error && <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'Semua Paket' },
          { id: 'free', label: 'Free' },
          { id: 'premium', label: 'Premium' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams(tab.id === 'all' ? {} : { type: tab.id })}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              typeParam === tab.id
                ? 'bg-[#0284C7] text-white shadow-sm'
                : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#0284C7]/10 shadow-sm p-6 h-64 animate-pulse">
              <div className="h-4 w-20 bg-[#0284C7]/10 rounded-full mb-4" />
              <div className="h-6 w-32 bg-[#0284C7]/10 rounded mb-3" />
              <div className="h-8 w-24 bg-[#0284C7]/10 rounded mb-6" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-[#0284C7]/10 rounded" />
                <div className="h-3 w-4/5 bg-[#0284C7]/10 rounded" />
                <div className="h-3 w-3/5 bg-[#0284C7]/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#0284C7]/15 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-[#414844]/30 mb-3">workspace_premium</span>
          <p className="text-[#414844]/70 font-medium">Belum ada paket pada kategori ini.</p>
          <Link to="/admin/paket/tambah" className="text-[#0284C7] hover:underline text-sm font-bold mt-2">
            Tambah paket baru
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const isPremium = pkg.price > 0;
            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col bg-white rounded-2xl shadow-sm p-6 border-2 transition-shadow hover:shadow-md ${
                  isPremium ? 'border-[#6B4F3B]/25' : 'border-[#0284C7]/10'
                } ${!pkg.is_active ? 'opacity-60' : ''}`}
              >
                {/* Order badge */}
                <span className="absolute top-4 right-4 text-[10px] font-bold text-[#414844]/40 bg-[#414844]/5 w-6 h-6 rounded-full flex items-center justify-center">
                  {pkg.order ?? '-'}
                </span>

                {/* Type badge */}
                <span
                  className={`self-start text-[10px] font-bold uppercase px-2.5 py-1 rounded-full mb-4 tracking-wide ${
                    isPremium ? 'text-[#6B4F3B] bg-[#6B4F3B]/10' : 'text-[#414844] bg-[#414844]/10'
                  }`}
                >
                  {isPremium ? 'Premium' : 'Free'}
                </span>

                {/* Name + price */}
                <h3 className="text-lg font-bold text-[#1B1C1A] mb-1">{pkg.name}</h3>
                <p className="text-2xl font-extrabold text-[#0284C7] mb-1">
                  {isPremium ? `Rp${Number(pkg.price).toLocaleString('id-ID')}` : 'Gratis'}
                  {isPremium && <span className="text-xs font-medium text-[#414844]/60"> /bulan</span>}
                </p>
                {pkg.description && (
                  <p className="text-xs text-[#414844]/70 mb-4 leading-relaxed">{pkg.description}</p>
                )}

                {/* Benefits */}
                <div className="flex-1 mb-5">
                  {Array.isArray(pkg.benefits) && pkg.benefits.length > 0 ? (
                    <ul className="space-y-2">
                      {pkg.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#414844]">
                          <span className="material-symbols-outlined text-[16px] text-[#0284C7] mt-0.5 shrink-0">check_circle</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#414844]/40 italic">Tidak ada fitur khusus</p>
                  )}
                </div>

                {/* Status + actions */}
                <div className="border-t border-[#0284C7]/10 pt-4 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    disabled={togglingId === pkg.id}
                    title={pkg.is_active ? 'Nonaktifkan paket' : 'Aktifkan paket'}
                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                      pkg.is_active
                        ? 'text-[#0284C7] bg-[#0284C7]/10 hover:bg-[#0284C7]/20'
                        : 'text-[#414844]/60 bg-[#414844]/10 hover:bg-[#414844]/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {pkg.is_active ? 'toggle_on' : 'toggle_off'}
                    </span>
                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/admin/paket/${pkg.id}/edit`}
                      title="Edit paket"
                      className="flex items-center gap-1 text-[#7A5900] bg-[#7A5900]/10 hover:bg-[#7A5900]/20 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(pkg)}
                      title="Hapus paket"
                      className="flex items-center gap-1 text-[#B3261E]/80 bg-[#B3261E]/10 hover:bg-[#B3261E]/20 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Yakin ingin menghapus paket "${deleteTarget?.name}"?`}
      />
    </div>
  );
}