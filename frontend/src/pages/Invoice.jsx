import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import logo from '../assets/tenaga ahli 2.png';

/* ─── helpers ─────────────────────────────────────────────────── */
function formatRupiah(v) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v ?? 0);
}

function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...opts,
  });
}

const STATUS_MAP = {
  menunggu_pembayaran: {
    label: 'Menunggu Pembayaran',
    color: '#92400E',
    bg: '#FEF3C7',
    border: '#FCD34D',
    icon: 'schedule',
    dot: '#F59E0B',
  },
  menunggu_verifikasi: {
    label: 'Menunggu Verifikasi',
    color: '#1E40AF',
    bg: '#DBEAFE',
    border: '#93C5FD',
    icon: 'pending',
    dot: '#3B82F6',
  },
  verified: {
    label: 'LUNAS',
    color: '#065F46',
    bg: '#D1FAE5',
    border: '#6EE7B7',
    icon: 'verified',
    dot: '#10B981',
  },
  rejected: {
    label: 'Dibatalkan',
    color: '#991B1B',
    bg: '#FEE2E2',
    border: '#FCA5A5',
    icon: 'cancel',
    dot: '#EF4444',
  },
};

/* ─── StatusPill ───────────────────────────────────────────────── */
function StatusPill({ status }) {
  const d = STATUS_MAP[status] || {
    label: status,
    color: '#374151',
    bg: '#F3F4F6',
    border: '#D1D5DB',
    icon: 'info',
    dot: '#6B7280',
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest"
      style={{ color: d.color, backgroundColor: d.bg, border: `1px solid ${d.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: d.dot }} />
      {d.label}
    </span>
  );
}

/* ─── InfoRow ──────────────────────────────────────────────────── */
function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{label}</span>
      <span className={`text-sm font-semibold text-gray-800 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────── */
export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('amdal_user');
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }

    api
      .get('/orders/history')
      .then((res) => {
        const orders = Array.isArray(res.data) ? res.data : [];
        const found = orders.find((o) => String(o.id) === id || o.reference_code === id);
        setOrder(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4F8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#0EA5E9] animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Memuat invoice...</p>
        </div>
      </div>
    );
  }

  /* ── Not Found ── */
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#F0F4F8' }}>
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-4xl text-gray-400">receipt_long</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Invoice Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-6 max-w-sm">
          Tagihan yang Anda cari tidak ada atau Anda tidak memiliki akses ke invoice ini.
        </p>
        <button
          onClick={() => navigate('/pembayaran')}
          className="bg-[#0EA5E9] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0284C7] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Pembayaran
        </button>
      </div>
    );
  }

  const status = STATUS_MAP[order?.status] || STATUS_MAP['menunggu_pembayaran'];
  
  const handlePay = () => {
    if (order?.snap_token) {
      if (!window.snap) {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
        document.head.appendChild(script);
        script.onload = () => {
          window.snap.pay(order.snap_token, {
            onSuccess: () => window.location.reload(),
            onPending: () => window.location.reload(),
            onError: () => alert('Pembayaran gagal, silakan coba lagi.'),
            onClose: () => {}
          });
        };
      } else {
        window.snap.pay(order.snap_token, {
          onSuccess: () => window.location.reload(),
          onPending: () => window.location.reload(),
          onError: () => alert('Pembayaran gagal, silakan coba lagi.'),
          onClose: () => {}
        });
      }
    } else {
      navigate('/pembayaran');
    }
  };
  const isPaid = order.status === 'verified';
  const isPending = order.status === 'menunggu_pembayaran';
  
  // Format dates strictly for the new layout
  const rawCreatedAt = new Date(order.created_at);
  const invoiceDateShort = rawCreatedAt.toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }); // 24/07/2026
  
  const dueRaw = new Date(rawCreatedAt.getTime() + 3 * 24 * 60 * 60 * 1000);
  const dueDateLong = dueRaw.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  }); // 24 July 2026

  const invoiceNumber = order.reference_code || order.id;
  const amount = order.amount ?? 0;
  
  const customerName = order.user?.name || user?.name || '[Customer name here]';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { background-color: #F8FAFC !important; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
      `}</style>

      <div className="min-h-screen py-10 px-4" style={{ fontFamily: "'Inter', sans-serif", color: '#1F2937' }}>
        
        {/* Action bar (no print) */}
        <div className="no-print max-w-4xl mx-auto mb-6 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold text-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors border border-gray-300">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Cetak
          </button>
        </div>

        {/* Invoice Paper */}
        <div ref={printRef} className="print-page max-w-4xl mx-auto bg-white rounded-[24px] p-10 sm:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <img src={logo} alt="TenagaAhli.com" className="h-10 w-auto" />
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-900 tracking-wide uppercase">Invoice Pembayaran</h1>
              <p className="text-sm text-gray-500 mt-1">{invoiceNumber}</p>
              <p className="text-sm text-gray-500">Invoice date: {invoiceDateShort}</p>
            </div>
          </div>

          {/* Due Date Pill */}
          <div className="mb-8">
            <span className="inline-block bg-[#FFF7ED] text-[#9A3412] px-4 py-1.5 rounded-full text-[15px] font-bold">
              Due date: {dueDateLong}
            </span>
          </div>

          {/* 3 Columns Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* From */}
            <div>
              <p className="font-bold text-sm text-gray-900 mb-1">From:</p>
              <div className="text-sm text-gray-600 leading-relaxed">
                <p>+62 858 83658814</p>
                <p>support@tenagaahli.com</p>
                <p>NPWP: 100000000000001</p>
              </div>
            </div>

            {/* Bill to */}
            <div>
              <p className="font-bold text-sm text-gray-900 mb-1">Bill to:</p>
              <div className="text-sm text-gray-600 leading-relaxed">
                <p>{customerName}</p>
              </div>
            </div>

            {/* Pay via */}
            <div>
              <div className="bg-gray-100 rounded-2xl p-5 w-full h-full">
                <p className="font-bold text-sm text-gray-900 mb-2">Pay via:</p>
                {isPaid ? (
                  <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    LUNAS
                  </p>
                ) : (
                  <button onClick={handlePay} className="no-print bg-[#0EA5E9] text-white hover:bg-[#0284C7] font-bold text-sm py-2 px-4 rounded-xl w-full text-center transition-colors shadow-sm">
                    Bayar Sekarang (Midtrans)
                  </button>
                )}
                {isPending && <p className="text-xs text-gray-500 mt-2 block print:hidden text-center">Klik untuk bayar</p>}
              </div>
            </div>
          </div>

          {/* Amount Due & Order ID */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Total amount due: {formatRupiah(amount)}
            </h2>
            <p className="text-sm font-bold text-gray-700">
              Order ID: <span className="font-mono font-normal text-gray-600 ml-2">{invoiceNumber}</span>
            </p>
          </div>

          {/* Table */}
          <div className="w-full text-sm border-t-2 border-gray-800">
            {/* Thead */}
            <div className="flex font-bold text-gray-900 py-3 border-b border-gray-200">
              <div className="flex-[4]">Description</div>
              <div className="flex-1 text-center">Qty</div>
              <div className="flex-[1.5] text-center">Price (Rp)</div>
              <div className="flex-1 text-center">Disc</div>
              <div className="flex-[1.5] text-right">Total (Rp)</div>
            </div>
            
            {/* Row */}
            <div className="flex text-gray-700 py-4 border-b border-gray-200">
              <div className="flex-[4] pr-4">Langganan Paket {order.package_name || 'Premium'} (1 Tahun)</div>
              <div className="flex-1 text-center">1</div>
              <div className="flex-[1.5] text-center">{formatRupiah(amount).replace('Rp', '').trim()}</div>
              <div className="flex-1 text-center">-</div>
              <div className="flex-[1.5] text-right">{formatRupiah(amount).replace('Rp', '').trim()}</div>
            </div>

            {/* Footer rows */}
            <div className="flex justify-end py-3 border-b border-gray-200">
              <div className="font-bold text-gray-900 w-48 text-right pr-12">Subtotal</div>
              <div className="text-gray-700 w-32 text-right">{formatRupiah(amount).replace('Rp', '').trim()}</div>
            </div>
            <div className="flex justify-end py-3 border-b border-gray-300">
              <div className="font-bold text-gray-900 w-48 text-right pr-12">Total amount due</div>
              <div className="font-bold text-gray-900 w-32 text-right">{formatRupiah(amount).replace('Rp', '').trim()}</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
