import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const statusLabel = {
  menunggu_pembayaran: { text: 'Menunggu Pembayaran', color: '#414844', bg: '#F5F4F0' },
  menunggu_verifikasi: { text: 'Menunggu Konfirmasi', color: '#7A5900', bg: '#FFF4D6' },
  verified: { text: 'Berhasil', color: '#0284C7', bg: '#E0F2FE' },
  rejected: { text: 'Ditolak', color: '#B3261E', bg: '#FFDAD6' },
};

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('menunggu_verifikasi'); // Default filter matches the first tab
  const [previewImage, setPreviewImage] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = () => {
    setLoading(true);
    api
      .get('/admin/orders', { params: filter ? { status: filter } : {} })
      .then((res) => setOrders(res.data))
      .catch(() => setError('Gagal memuat data order.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleVerify = async (order) => {
    try {
      await api.post(`/admin/orders/${order.id}/verify`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memverifikasi.');
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await api.post(`/admin/orders/${rejectTarget.id}/reject`, { reject_reason: rejectReason });
      setRejectTarget(null);
      setRejectReason('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menolak order.');
    }
  };

  const tabs = [
    { id: 'menunggu_verifikasi', label: 'Menunggu Konfirmasi' },
    { id: 'verified', label: 'Berhasil' },
    { id: 'rejected', label: 'Ditolak' },
    { id: '', label: 'Riwayat Pembayaran' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0284C7]">Verifikasi & Riwayat Pembayaran</h2>
        <p className="text-[#414844]/80 text-sm mt-1">Konfirmasi bukti pembayaran premium dan pantau riwayat keuangan pendaftaran.</p>
      </div>

      {error && <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#0284C7]/15 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#0284C7]/5 text-[#414844]">
                <th className="px-6 py-3">User / Pendaftar</th>
                <th className="px-6 py-3">Kode Ref</th>
                <th className="px-6 py-3">Paket</th>
                <th className="px-6 py-3">Nominal</th>
                <th className="px-6 py-3">Bukti Transfer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0284C7]/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#414844]/70">
                    Memuat data...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#414844]/70">
                    Tidak ada data transaksi pada filter ini.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const s = statusLabel[o.status] || statusLabel.menunggu_pembayaran;
                  return (
                    <tr key={o.id} className="hover:bg-[#0284C7]/5">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#0284C7]">{o.user?.name}</p>
                        <p className="text-xs text-[#414844]/60">{o.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{o.reference_code}</td>
                      <td className="px-6 py-4 font-semibold text-[#1F2A22]">{o.package_name || 'Premium'}</td>
                      <td className="px-6 py-4 font-bold">Rp{Number(o.amount).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4">
                        {o.proof_url ? (
                          <button
                            onClick={() => setPreviewImage(o.proof_url)}
                            className="text-[#0284C7] hover:underline text-xs font-bold flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span> Lihat Bukti
                          </button>
                        ) : (
                          <span className="text-xs text-[#414844]/50 italic">Belum diunggah</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
                          {s.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#414844]/75">
                        {new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        {o.status === 'menunggu_verifikasi' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(o)}
                              className="bg-[#0284C7]/10 hover:bg-[#0284C7]/20 text-[#0284C7] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> Setujui
                            </button>
                            <button
                              onClick={() => setRejectTarget(o)}
                              className="bg-[#B3261E]/10 hover:bg-[#B3261E]/20 text-[#B3261E] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[14px]">cancel</span> Tolak
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white p-2 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <img src={previewImage} alt="Bukti transfer" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg text-[#0284C7] mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-red-500">cancel</span>
              Tolak Pembayaran
            </h3>
            <p className="text-xs text-[#414844]/70 mb-4 leading-relaxed">
              Berikan alasan mengapa pembayaran ini ditolak agar pengguna dapat mengunggah bukti yang benar.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Bukti transfer tidak jelas atau nominal tidak sesuai."
              className="w-full border border-[#0284C7]/30 rounded-xl px-3 py-2 text-xs mb-4 focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-3 pt-2 border-t border-black/5">
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