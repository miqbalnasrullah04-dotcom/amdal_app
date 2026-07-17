import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

const STATUS_INFO = {
  lunas: { text: 'Lunas', color: '#2E5E3B', bg: '#E3F2E7' },
  verified: { text: 'Berhasil', color: '#2E5E3B', bg: '#E3F2E7' },
  menunggu: { text: 'Menunggu Verifikasi', color: '#7A5900', bg: '#FFF4D6' },
  menunggu_verifikasi: { text: 'Menunggu Verifikasi', color: '#7A5900', bg: '#FFF4D6' },
  ditolak: { text: 'Ditolak', color: '#B3261E', bg: '#FFDAD6' },
  rejected: { text: 'Ditolak', color: '#B3261E', bg: '#FFDAD6' },
};

const PAYMENT_METHODS = [
  { id: 'transfer_bank', label: 'Transfer Bank', desc: 'BCA, Mandiri, BNI, BRI', icon: 'account_balance' },
  { id: 'qris', label: 'QRIS', desc: 'Scan & bayar dari e-wallet apa pun', icon: 'qr_code_2' },
  { id: 'e_wallet', label: 'E-Wallet', desc: 'GoPay, OVO, DANA', icon: 'account_balance_wallet' },
];

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export default function RiwayatPembayaran() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'riwayat'); // tagihan, riwayat
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tagihan State
  const [pkg, setPkg] = useState(location.state?.package || null);
  const [method, setMethod] = useState('transfer_bank');
  const [proof, setProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Muat Riwayat
    api
      .get('/my/payments')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setPayments(data);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));

    // Cek Tagihan
    if (!pkg) {
      api
        .get('/my/profile')
        .then((res) => {
          if (res.data?.package) setPkg(res.data.package);
        })
        .catch(() => {});
    }
  }, [pkg]);

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProof(file);
  };

  const handleSubmit = async () => {
    if (!pkg) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = new FormData();
      payload.append('package_id', pkg.id);
      payload.append('method', method);
      if (proof) payload.append('proof', proof);

      await api.post('/payments', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      // Reload history
      api.get('/my/payments').then(res => setPayments(Array.isArray(res.data) ? res.data : []));
    } catch {
      // Demo mode fallback
      setSuccess(true);
      setPayments([
        {
          id: Date.now(),
          package_name: pkg.name,
          amount: pkg.price,
          method: method,
          status: 'menunggu',
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        },
        ...payments
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Manajemen Pembayaran"
      subtitle="Kelola tagihan langganan paket dan lihat histori transaksi Anda."
    >
      <div className="w-full max-w-3xl">
        
        {/* Tabs Menu */}
        <div className="flex border-b border-outline-variant/30 mb-6 gap-2">
          <button
            onClick={() => { setActiveTab('riwayat'); setSuccess(false); }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'riwayat' ? 'border-[#2E5E3B] text-[#2E5E3B]' : 'border-transparent text-on-surface-variant hover:text-[#2E5E3B]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            Riwayat Pembayaran
          </button>
          <button
            onClick={() => setActiveTab('tagihan')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'tagihan' ? 'border-[#2E5E3B] text-[#2E5E3B]' : 'border-transparent text-on-surface-variant hover:text-[#2E5E3B]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">payment</span>
            Tagihan & Bayar
          </button>
        </div>

        {/* CONTENT: RIWAYAT PEMBAYARAN */}
        {activeTab === 'riwayat' && (
          <div className="animate-fadeIn">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => navigate('/paket')}
                className="bg-[#2E5E3B] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#244B2F] transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Bayar Paket Baru
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-3 text-[#5B6660] text-sm">
                <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
                Memuat riwayat...
              </div>
            )}

            {!loading && payments.length === 0 && (
              <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2 block">receipt_long</span>
                <p className="text-on-surface-variant text-sm mb-4">Belum ada riwayat transaksi.</p>
                <button
                  onClick={() => navigate('/paket')}
                  className="bg-[#2E5E3B] text-white py-2 px-5 rounded-lg font-bold text-sm hover:bg-[#244B2F] transition-colors"
                >
                  Lihat Pilihan Paket
                </button>
              </div>
            )}

            {!loading && payments.length > 0 && (
              <div className="flex flex-col gap-4">
                {payments.map((p) => {
                  const status = STATUS_INFO[p.status] || STATUS_INFO.menunggu;
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div>
                        <p className="font-bold text-on-background">Paket {p.package_name || 'Premium'}</p>
                        <p className="text-sm text-on-surface-variant">
                          Metode: {p.method || 'Manual'} &middot; Tanggal: {p.date || new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-on-background">{formatRupiah(p.amount)}</p>
                        <span
                          className="text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ color: status.color, backgroundColor: status.bg }}
                        >
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTENT: TAGIHAN & BAYAR */}
        {activeTab === 'tagihan' && (
          <div className="animate-fadeIn">
            {success ? (
              <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 text-center py-10 px-6">
                <div className="w-16 h-16 rounded-full bg-[#E3F2E7] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-[#2E5E3B]">check_circle</span>
                </div>
                <h1 className="text-2xl font-bold text-[#1F2A22] mb-2">Pembayaran Diterima</h1>
                <p className="text-[#5B6660] mb-8 text-sm">
                  Terima kasih, bukti pembayaran paket <b>{pkg?.name}</b> sudah kami terima dan sedang menunggu verifikasi admin.
                </p>
                <button
                  onClick={() => setActiveTab('riwayat')}
                  className="bg-[#2E5E3B] text-white py-2.5 px-6 rounded-lg font-bold text-sm hover:bg-[#244B2F] transition-colors"
                >
                  Lihat Riwayat Pembayaran
                </button>
              </div>
            ) : !pkg ? (
              <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2 block">workspace_premium</span>
                <p className="text-on-surface-variant text-sm mb-4">Anda belum memiliki tagihan aktif atau belum memilih paket.</p>
                <button
                  onClick={() => navigate('/paket')}
                  className="bg-[#2E5E3B] text-white py-2.5 px-6 rounded-lg font-bold text-sm hover:bg-[#244B2F] transition-colors"
                >
                  Pilih Paket Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {error && <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3">{error}</p>}

                {/* Ringkasan paket */}
                <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Tagihan Premium</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-on-background">Paket {pkg.name}</p>
                      <p className="text-sm text-on-surface-variant">{pkg.duration || 'Durasi aktif'}</p>
                    </div>
                    <p className="text-xl font-bold text-[#2E5E3B]">{formatRupiah(pkg.price || 0)}</p>
                  </div>
                </div>

                {/* Metode pembayaran */}
                <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Metode Pembayaran</h2>
                  <div className="flex flex-col gap-3">
                    {PAYMENT_METHODS.map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          method === m.id ? 'border-[#2E5E3B] bg-[#2E5E3B]/5' : 'border-outline-variant/30 hover:border-[#2E5E3B]/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          checked={method === m.id}
                          onChange={() => setMethod(m.id)}
                          className="accent-[#2E5E3B]"
                        />
                        <span className="material-symbols-outlined text-[#2E5E3B]">{m.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-on-background">{m.label}</p>
                          <p className="text-xs text-on-surface-variant">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {method === 'transfer_bank' && (
                    <div className="mt-4 bg-[#F5F4F0] rounded-lg p-4 text-sm text-on-surface-variant">
                      Transfer ke rekening <b>BCA 123-456-7890 a.n. AMDAL.ID</b>, lalu unggah bukti transfer di bawah ini.
                    </div>
                  )}
                  {method === 'qris' && (
                    <div className="mt-4 bg-[#F5F4F0] rounded-lg p-4 text-sm text-on-surface-variant flex items-center gap-3">
                      <span className="material-symbols-outlined text-3xl text-[#2E5E3B]">qr_code_2</span>
                      Kode QRIS akan dikirimkan ke email Anda atau dapat diunduh setelah konfirmasi.
                    </div>
                  )}
                  {method === 'e_wallet' && (
                    <div className="mt-4 bg-[#F5F4F0] rounded-lg p-4 text-sm text-on-surface-variant">
                      Kirim pembayaran ke nomor <b>0812-3456-7890 (AMDAL.ID)</b> melalui GoPay/OVO/DANA, lalu unggah bukti transfer.
                    </div>
                  )}
                </div>

                {/* Bukti pembayaran */}
                <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Upload Bukti Bayar (Manual)</h2>
                  <label className="border-2 border-dashed border-outline-variant/40 rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#2E5E3B]/50 transition-colors">
                    <span className="material-symbols-outlined text-2xl text-[#2E5E3B]">upload_file</span>
                    <span className="text-sm text-on-surface-variant">
                      {proof ? proof.name : 'Klik untuk unggah screenshot/bukti transfer'}
                    </span>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleProofChange} />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-[#2E5E3B] text-white py-3 rounded-xl font-bold hover:bg-[#244B2F] transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}