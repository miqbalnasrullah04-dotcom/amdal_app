import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

const BACKEND_URL = 'http://localhost:8000';

const BANK_ACCOUNTS = [
  { bank: 'BCA',     norek: '1234567890', atas_nama: 'TenagaAhli.com' },
  { bank: 'Mandiri', norek: '9876543210', atas_nama: 'TenagaAhli.com' },
  { bank: 'BNI',     norek: '1122334455', atas_nama: 'TenagaAhli.com' },
  { bank: 'BRI',     norek: '5544332211', atas_nama: 'TenagaAhli.com' },
];

const EWALLET_ACCOUNTS = [
  { name: 'GoPay', number: '0812-3456-7890', atas_nama: 'TenagaAhli.com' },
  { name: 'OVO',   number: '0812-3456-7890', atas_nama: 'TenagaAhli.com' },
  { name: 'DANA',  number: '0812-3456-7890', atas_nama: 'TenagaAhli.com' },
];

const PAYMENT_METHODS = [
  { id: 'qris',          label: 'QRIS',         desc: 'Scan QR dari e-wallet atau m-banking apa pun', icon: 'qr_code_2'              },
  { id: 'transfer_bank', label: 'Transfer Bank', desc: 'BCA, Mandiri, BNI, BRI',                      icon: 'account_balance'        },
  { id: 'e_wallet',      label: 'E-Wallet',      desc: 'GoPay, OVO, DANA',                            icon: 'account_balance_wallet' },
];

function formatRupiah(v) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(v ?? 0);
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1 text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-colors shrink-0"
    >
      <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
      {copied ? 'Disalin!' : 'Salin'}
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    menunggu_pembayaran: { label: 'Menunggu Pembayaran', color: '#7A5900', bg: '#FFF4D6' },
    menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: '#0369A1', bg: '#E0F2FE' },
    verified:            { label: 'Disetujui',           color: '#166534', bg: '#DCFCE7' },
    rejected:            { label: 'Ditolak',             color: '#B3261E', bg: '#FFDAD6' },
  };
  const d = map[status] || { label: status, color: '#414844', bg: '#F5F4F0' };
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ color: d.color, backgroundColor: d.bg }}>
      {d.label}
    </span>
  );
}

export default function Pembayaran() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const proofRef  = useRef(null);

  const [pkg,          setPkg]          = useState(location.state?.package ?? null);
  const [order,        setOrder]        = useState(null);
  const [method,       setMethod]       = useState('qris');
  const [proof,        setProof]        = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [step,         setStep]         = useState('choose');
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');
  const [history,      setHistory]      = useState([]);
  const [tab,          setTab]          = useState('pay');

  useEffect(() => {
    if (!pkg) {
      api.get('/my/profile')
        .then(r => { if (r.data?.package) setPkg(r.data.package); })
        .catch(() => {});
    }
    api.get('/orders/history')
      .then(r => setHistory(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
    api.get('/orders/mine')
      .then(r => {
        if (r.data?.status === 'menunggu_pembayaran') {
          setOrder(r.data);
          setStep('confirm');
        }
      })
      .catch(() => {});
  }, []);

  const handleChooseMethod = async () => {
    if (!pkg) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/my/choose-package', { package_id: pkg.id });
      if (res.data?.order) {
        setOrder(res.data.order);
        setStep('confirm');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal membuat order. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proof || !order) return;
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('proof', proof);
      await api.post(`/orders/${order.id}/upload-proof`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStep('success');
      api.get('/orders/history').then(r => setHistory(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal mengunggah bukti. Format JPG/PNG/PDF maks 5MB.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!pkg && tab === 'pay') {
    return (
      <DashboardLayout title="Pembayaran">
        <div className="flex items-center gap-3 text-[#5B6660]">
          <span className="w-5 h-5 rounded-full border-2 border-[#0EA5E9]/30 border-t-[#0EA5E9] animate-spin" />
          Memuat...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pembayaran" subtitle="Kelola pembayaran paket keanggotaan Anda.">

      {/* Tabs */}
      <div className="flex gap-1 border-b border-outline-variant/20 mb-6">
        {[
          { id: 'pay',     label: 'Bayar Sekarang',     icon: 'payments'     },
          { id: 'history', label: 'Riwayat Pembayaran', icon: 'receipt_long' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.id ? 'border-[#0EA5E9] text-[#0EA5E9]' : 'border-transparent text-[#5B6660] hover:text-[#0EA5E9]'
            }`}>
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: RIWAYAT */}
      {tab === 'history' && (
        <div className="w-full max-w-2xl">
          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/5 p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-[#5B6660]/30 block mb-3">receipt_long</span>
              <p className="text-sm text-[#5B6660]">Belum ada riwayat pembayaran.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(ord => (
                <div key={ord.id} className="bg-white rounded-2xl border border-black/5 p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-[#1F2A22] text-sm">{ord.package_name || 'Paket Premium'}</p>
                      <p className="text-xs text-[#5B6660] mt-0.5 font-mono">{ord.reference_code}</p>
                    </div>
                    <StatusBadge status={ord.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-[#0EA5E9]">{formatRupiah(ord.amount)}</span>
                    <span className="text-xs text-[#5B6660]">
                      {ord.created_at ? new Date(ord.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </span>
                  </div>
                  {ord.reject_reason && (
                    <p className="mt-2 text-xs text-[#B3261E] bg-[#FFDAD6] rounded-lg px-3 py-2">Ditolak: {ord.reject_reason}</p>
                  )}
                  {ord.proof_of_payment && (
                    <a href={`${BACKEND_URL}/storage/${ord.proof_of_payment}`} target="_blank" rel="noreferrer"
                      className="mt-2 text-xs text-[#0284C7] hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">image</span>Lihat Bukti Transfer
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: BAYAR */}
      {tab === 'pay' && (
        <div className="w-full max-w-2xl">
          {error && (
            <div className="bg-[#FFDAD6] text-[#93000A] text-sm rounded-xl p-4 mb-5 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-4xl text-[#166534]">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1F2A22] mb-2">Bukti Pembayaran Dikirim!</h2>
              <p className="text-sm text-[#5B6660] mb-8 max-w-sm mx-auto leading-relaxed">
                Bukti transfer sedang diverifikasi oleh admin. Notifikasi dikirim setelah dikonfirmasi.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => setTab('history')}
                  className="bg-[#0EA5E9] text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-[#0284C7] transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>Lihat Riwayat
                </button>
                <button onClick={() => navigate('/dashboard')}
                  className="border border-[#0EA5E9]/40 text-[#0EA5E9] py-3 px-6 rounded-xl font-bold text-sm hover:bg-[#0EA5E9]/5 transition-colors">
                  Ke Dashboard
                </button>
              </div>
            </div>
          )}

          {/* CHOOSE METHOD */}
          {step === 'choose' && pkg && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-black/5 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5B6660] mb-3">Ringkasan Paket</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1F2A22]">Paket {pkg.name}</p>
                    <p className="text-sm text-[#5B6660]">{pkg.duration || '12 bulan'}</p>
                  </div>
                  <p className="text-xl font-bold text-[#0EA5E9]">{formatRupiah(pkg.price)}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/5 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5B6660] mb-3">Metode Pembayaran</p>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(m => (
                    <label key={m.id}
                      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
                        method === m.id ? 'border-[#0EA5E9] bg-[#E0F2FE]/50' : 'border-outline-variant/30 hover:border-[#0EA5E9]/40'
                      }`}>
                      <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[#0EA5E9]" />
                      <span className="material-symbols-outlined text-[22px] text-[#0EA5E9]">{m.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-[#1F2A22]">{m.label}</p>
                        <p className="text-xs text-[#5B6660]">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="button" onClick={handleChooseMethod} disabled={submitting}
                className="w-full bg-[#0EA5E9] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#0284C7] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</>
                  : <><span className="material-symbols-outlined text-[18px]">arrow_forward</span>Lanjut ke Pembayaran</>}
              </button>
            </div>
          )}

          {/* CONFIRM + UPLOAD */}
          {step === 'confirm' && order && (
            <div className="space-y-5">
              <div className="bg-[#E0F2FE] rounded-2xl border border-[#0EA5E9]/30 p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0369A1]">Order Dibuat</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="font-mono text-sm font-bold text-[#075985]">{order.reference_code}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-[#0369A1]">Total Pembayaran</span>
                  <span className="font-bold text-[#0EA5E9] text-lg">{formatRupiah(order.amount)}</span>
                </div>
              </div>

              {method === 'qris' && (
                <div className="bg-white rounded-2xl border border-black/5 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5B6660] mb-4">Scan QRIS untuk Bayar</p>
                  {/* Ganti div ini dengan: <img src="/images/qris-tenagaahli.png" className="w-52 h-52 rounded-xl object-contain mx-auto mb-4" /> */}
                  <div className="w-52 h-52 mx-auto bg-[#F5F4F0] border-2 border-dashed border-[#0EA5E9]/30 rounded-2xl flex flex-col items-center justify-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-6xl text-[#0EA5E9]/40">qr_code_2</span>
                    <p className="text-[10px] text-[#5B6660] text-center px-4 leading-relaxed">Tambahkan gambar QRIS<br />merchant di sini</p>
                  </div>
                  <div className="bg-[#F0F9FF] rounded-xl p-4 text-left text-xs text-[#075985] space-y-1.5">
                    <p className="font-bold mb-1">Cara Bayar dengan QRIS:</p>
                    <p>1. Buka e-wallet atau m-banking (GoPay, OVO, DANA, BCA, dll)</p>
                    <p>2. Pilih <strong>Scan QR</strong> atau <strong>Bayar</strong></p>
                    <p>3. Arahkan kamera ke kode QR di atas</p>
                    <p>4. Pastikan nominal <strong>{formatRupiah(order.amount)}</strong> benar</p>
                    <p>5. Konfirmasi pembayaran lalu screenshot buktinya</p>
                  </div>
                </div>
              )}

              {method === 'transfer_bank' && (
                <div className="bg-white rounded-2xl border border-black/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5B6660] mb-4">Rekening Tujuan</p>
                  <div className="space-y-3">
                    {BANK_ACCOUNTS.map(b => (
                      <div key={b.bank} className="flex items-center justify-between bg-[#F5F4F0] rounded-xl px-4 py-3">
                        <div>
                          <p className="text-xs font-bold uppercase text-[#5B6660]">{b.bank}</p>
                          <p className="font-mono font-bold text-[#1F2A22] text-sm">{b.norek}</p>
                          <p className="text-xs text-[#5B6660]">a.n. {b.atas_nama}</p>
                        </div>
                        <CopyButton text={b.norek} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-[#FFF4D6] rounded-xl px-4 py-3 text-xs text-[#7A5900]">
                    Transfer tepat <strong>{formatRupiah(order.amount)}</strong> ke salah satu rekening, lalu unggah bukti di bawah.
                  </div>
                </div>
              )}

              {method === 'e_wallet' && (
                <div className="bg-white rounded-2xl border border-black/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5B6660] mb-4">Nomor Tujuan</p>
                  <div className="space-y-3">
                    {EWALLET_ACCOUNTS.map(w => (
                      <div key={w.name} className="flex items-center justify-between bg-[#F5F4F0] rounded-xl px-4 py-3">
                        <div>
                          <p className="text-xs font-bold uppercase text-[#5B6660]">{w.name}</p>
                          <p className="font-bold text-[#1F2A22] text-sm">{w.number}</p>
                          <p className="text-xs text-[#5B6660]">a.n. {w.atas_nama}</p>
                        </div>
                        <CopyButton text={w.number} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-[#FFF4D6] rounded-xl px-4 py-3 text-xs text-[#7A5900]">
                    Kirim tepat <strong>{formatRupiah(order.amount)}</strong> ke salah satu nomor, lalu unggah bukti.
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-black/5 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5B6660] mb-3">
                  Upload Bukti Pembayaran <span className="text-red-500">*</span>
                </p>
                <input type="file" accept="image/*,.pdf" className="hidden" ref={proofRef}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setProof(f);
                    setProofPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
                  }} />
                {proof ? (
                  <div className="flex items-center gap-4 bg-[#E0F2FE] rounded-xl px-4 py-3">
                    {proofPreview && (
                      <img src={proofPreview} alt="Bukti" className="w-16 h-16 rounded-lg object-cover border border-[#0EA5E9]/20 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0284C7] truncate">{proof.name}</p>
                      <p className="text-xs text-[#5B6660]">{(proof.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" className="text-xs text-red-500 hover:underline shrink-0"
                      onClick={() => { setProof(null); setProofPreview(null); if (proofRef.current) proofRef.current.value = ''; }}>
                      Hapus
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => proofRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#0EA5E9]/30 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-[#0EA5E9]/60 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-[#0EA5E9]/50">upload_file</span>
                    <span className="text-sm text-[#5B6660]">Klik untuk unggah screenshot bukti transfer</span>
                    <span className="text-xs text-[#5B6660]/60">JPG, PNG, atau PDF — maks. 5MB</span>
                  </button>
                )}
              </div>

              <button type="button" onClick={handleUploadProof} disabled={!proof || submitting}
                className="w-full bg-[#0EA5E9] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#0284C7] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengirim...</>
                  : <><span className="material-symbols-outlined text-[18px]">send</span>Kirim Bukti Pembayaran</>}
              </button>

              <button type="button" onClick={() => setStep('choose')}
                className="w-full text-[#5B6660] text-sm py-2 hover:text-[#1F2A22] transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Ganti Metode Pembayaran
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
