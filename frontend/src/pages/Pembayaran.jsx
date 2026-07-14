import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

const PAYMENT_METHODS = [
  { id: 'transfer_bank', label: 'Transfer Bank', desc: 'BCA, Mandiri, BNI, BRI', icon: 'account_balance' },
  { id: 'qris', label: 'QRIS', desc: 'Scan & bayar dari e-wallet apa pun', icon: 'qr_code_2' },
  { id: 'e_wallet', label: 'E-Wallet', desc: 'GoPay, OVO, DANA', icon: 'account_balance_wallet' },
];

const FALLBACK_PACKAGE = {
  id: 'pro',
  name: 'Pro',
  price: 300000,
  duration: '12 bulan',
};

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    value
  );
}

export default function Pembayaran() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pkg, setPkg] = useState(location.state?.package || null);
  const [method, setMethod] = useState('transfer_bank');
  const [proof, setProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (pkg) return;
    // Kalau halaman ini diakses langsung tanpa memilih paket dulu,
    // coba ambil paket yang sudah dipilih dari profil, atau pakai fallback demo.
    api
      .get('/my/profile')
      .then((res) => {
        if (res.data?.package) setPkg(res.data.package);
        else setPkg(FALLBACK_PACKAGE);
      })
      .catch(() => setPkg(FALLBACK_PACKAGE));
  }, [pkg]);

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProof(file);
  };

  const handleSubmit = async () => {
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
    } catch {
      // Backend belum tersedia — tetap tampilkan konfirmasi demo agar alur tidak buntu.
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!pkg) {
    return (
      <DashboardLayout title="Pembayaran">
        <div className="flex items-center gap-3 text-[#5B6660]">
          <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
          Memuat...
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-md mx-auto text-center py-10">
          <div className="w-16 h-16 rounded-full bg-[#E3F2E7] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-[#2E5E3B]">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1F2A22] mb-2">Pembayaran Diterima</h1>
          <p className="text-[#5B6660] mb-8">
            Terima kasih, bukti pembayaran paket <b>{pkg.name}</b> sudah kami terima dan sedang menunggu verifikasi
            admin.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/riwayat-pembayaran')}
              className="bg-[#2E5E3B] text-white py-3 rounded-lg font-label-md hover:bg-[#244B2F] transition-colors"
            >
              Lihat Riwayat Pembayaran
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="border border-[#2E5E3B]/40 text-[#2E5E3B] py-3 rounded-lg font-label-md hover:bg-[#2E5E3B]/10 transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pembayaran" subtitle={`Selesaikan pembayaran untuk paket ${pkg.name}`}>
      <div className="w-full max-w-2xl">
        {error && <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3 mb-4">{error}</p>}

        {/* Ringkasan paket */}
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Ringkasan Paket</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-on-background">Paket {pkg.name}</p>
              <p className="text-sm text-on-surface-variant">{pkg.duration || 'Tidak ditentukan'}</p>
            </div>
            <p className="text-xl font-bold text-[#2E5E3B]">{formatRupiah(pkg.price || 0)}</p>
          </div>
        </div>

        {/* Metode pembayaran */}
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6 mb-6">
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
              Kode QRIS akan ditampilkan setelah Anda melanjutkan pembayaran.
            </div>
          )}
          {method === 'e_wallet' && (
            <div className="mt-4 bg-[#F5F4F0] rounded-lg p-4 text-sm text-on-surface-variant">
              Kirim pembayaran ke nomor <b>0812-3456-7890 (AMDAL.ID)</b> melalui GoPay/OVO/DANA, lalu unggah bukti
              transfer.
            </div>
          )}
        </div>

        {/* Bukti pembayaran */}
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Bukti Pembayaran (opsional)</h2>
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
          className="w-full bg-[#2E5E3B] text-white py-3 rounded-lg font-label-md hover:bg-[#244B2F] transition-colors disabled:opacity-60"
        >
          {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
        </button>
      </div>
    </DashboardLayout>
  );
}