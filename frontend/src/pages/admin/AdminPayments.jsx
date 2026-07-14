import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const statusLabel = {
  menunggu_pembayaran: { text: 'Menunggu Pembayaran', color: '#B3261E' },
  menunggu_verifikasi: { text: 'Menunggu Verifikasi', color: '#7A5900' },
  verified: { text: 'Terverifikasi', color: '#2E5E3B' },
  rejected: { text: 'Ditolak', color: '#B3261E' },
};

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2E5E3B]">Verifikasi Pembayaran</h2>
        <p className="text-[#414844]/80 text-sm mt-1">Kelola order paket pendaftaran tenaga ahli.</p>
      </div>

      {error && <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl border border-[#2E5E3B]/15 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#2E5E3B]/15 flex gap-2">
          {['', 'menunggu_verifikasi', 'verified', 'rejected', 'menunggu_pembayaran'].map((s) => (
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
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Kode Ref</th>
                <th className="px-6 py-3">Nominal</th>
                <th className="px-6 py-3">Bukti</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E5E3B]/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#414844]/70">
                    Memuat data...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#414844]/70">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const s = statusLabel[o.status] || statusLabel.menunggu_pembayaran;
                  return (
                    <tr key={o.id} className="hover:bg-[#2E5E3B]/5">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#2E5E3B]">{o.user?.name}</p>
                        <p className="text-xs text-[#414844]/60">{o.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{o.reference_code}</td>
                      <td className="px-6 py-4">Rp{Number(o.amount).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4">
                        {o.proof_url ? (
                          <button
                            onClick={() => setPreviewImage(o.proof_url)}
                            className="text-[#2E5E3B] hover:underline text-xs font-bold"
                          >
                            Lihat Bukti
                          </button>
                        ) : (
                          <span className="text-xs text-[#414844]/50">Belum ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold" style={{ color: s.color }}>
                          {s.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {o.status === 'menunggu_verifikasi' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(o)}
                              className="text-[#2E5E3B] hover:underline text-xs font-bold"
                            >
                              Verifikasi
                            </button>
                            <button
                              onClick={() => setRejectTarget(o)}
                              className="text-[#B3261E] hover:underline text-xs font-bold"
                            >
                              Tolak
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
          <img src={previewImage} alt="Bukti transfer" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h3 className="font-bold text-[#2E5E3B] mb-4">Tolak Pembayaran</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan (opsional)"
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