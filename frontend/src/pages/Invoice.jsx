import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import logo from '../assets/tenaga ahli 2.png';
import { useTranslation } from '../context/LanguageContext.jsx';

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
  const { t } = useTranslation();
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
          <p className="text-gray-500 text-sm font-medium">{t('Memuat invoice...')}</p>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('Invoice Tidak Ditemukan')}</h1>
        <p className="text-gray-500 mb-6 max-w-sm">
          {t('Tagihan yang Anda cari tidak ada atau Anda tidak memiliki akses ke invoice ini.')}
        </p>
        <button
          onClick={() => navigate('/pembayaran')}
          className="bg-[#0EA5E9] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0284C7] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t('Kembali ke Pembayaran')}
        </button>
      </div>
    );
  }

  const status = STATUS_MAP[order?.status] || STATUS_MAP['menunggu_pembayaran'];
  
  const handlePay = () => {
    if (order?.snap_token) {
      const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true' || import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === '1';
      const snapUrl = isProd
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';

      const openSnap = () => {
        window.snap.pay(order.snap_token, {
          onSuccess: () => window.location.reload(),
          onPending: () => window.location.reload(),
          onError: () => alert('Pembayaran gagal, silakan coba lagi.'),
          onClose: () => {}
        });
      };

      if (!window.snap) {
        const script = document.createElement('script');
        script.src = snapUrl;
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
        document.head.appendChild(script);
        script.onload = () => {
          openSnap();
        };
      } else {
        openSnap();
      }
    } else {
      navigate('/pembayaran');
    }
  };

  const isPaid = order.status === 'verified';
  const isPending = order.status === 'menunggu_pembayaran';
  
  // Format dates strictly for the layout
  const rawCreatedAt = new Date(order.created_at);
  const invoiceDateShort = rawCreatedAt.toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  
  const dueRaw = new Date(rawCreatedAt.getTime() + 3 * 24 * 60 * 60 * 1000);
  const dueDateLong = dueRaw.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const invoiceNumber = order.reference_code || order.id;
  const amount = order.amount ?? 0;
  
  const customerName = order.user?.name || user?.name || '[Customer name here]';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { background-color: #F8FAFC !important; margin: 0; }
        .invoice-wrapper {
          font-family: 'Inter', sans-serif;
          color: #111827;
        }
        .invoice-paper {
          background: white;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          width: 100%;
          max-width: 800px;
          margin: 40px auto;
          padding: 48px;
          position: relative;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .invoice-paper { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      <div className="invoice-wrapper min-h-screen py-6 px-4">
        
        {/* Action bar */}
        <div className="no-print max-w-[800px] mx-auto mb-6 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold text-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {t('Kembali')}
          </button>
          <div className="flex gap-2">
            {!isPaid && (
              <button onClick={handlePay} className="bg-[#0284C7] text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors shadow-sm">
                {t('Bayar Sekarang')}
              </button>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors border border-gray-300 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">print</span>
              {t('Cetak')}
            </button>
          </div>
        </div>

        {/* Invoice Paper */}
        <div ref={printRef} className="invoice-paper">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <img src={logo} alt="TenagaAhli.com" className="h-10 w-auto" style={{ filter: 'grayscale(0%)' }} />
            <div className="text-right">
              <h1 className="text-3xl font-extrabold text-[#374151] tracking-tight uppercase">{t('INVOICE')}</h1>
              <p className="text-[#4B5563] text-sm font-semibold mt-1">{invoiceNumber}</p>
            </div>
          </div>

          {/* Due Date Pill */}
          <div className="mb-8">
            <span className="inline-block bg-[#FEF3C7] text-[#92400E] px-4 py-1.5 rounded-full text-sm font-bold">
              {t('Due date:')} {dueDateLong}
            </span>
          </div>

          {/* 3 Columns Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-[13px]">
            {/* From */}
            <div className="pr-4">
              <p className="font-bold text-gray-900 mb-1">{t('From:')}</p>
              <p className="text-gray-700 leading-relaxed">
                {t('TenagaAhli.com')}<br />
                {t('Jl. Contoh Alamat No.123')}<br />
                {t('Jakarta Selatan, 12345')}<br />
                +62 858 83658814<br />
                {t('www.tenagaahli.com')}<br />
                {t('support@tenagaahli.com')}<br />
                {t('NPWP: 10 000 000 0 000 000')}
              </p>
            </div>

            {/* Bill to */}
            <div className="pr-4">
              <p className="font-bold text-gray-900 mb-1">{t('Bill to:')}</p>
              <p className="text-gray-700 leading-relaxed">
                {customerName}<br />
                {order.user?.email || user?.email || '-'}<br />
                {order.user?.phone || '-'}
              </p>
            </div>

            {/* Pay via */}
            <div>
              <div className="bg-[#F3F4F6] rounded-xl p-4 w-full h-full">
                <p className="font-bold text-gray-900 mb-1">{t('Pay via:')}</p>
                {isPaid ? (
                  <p className="text-gray-700 font-medium">{t('LUNAS (Midtrans)')}</p>
                ) : (
                  <p className="text-gray-700 font-medium">{t('Midtrans Payment Link / Snap')}</p>
                )}
                {isPaid && (
                  <div className="mt-2 text-green-600 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {t('PAID')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reference */}
          <div className="mb-8 text-[13px]">
            <span className="font-bold text-gray-900 mr-2">{t('Reference:')}</span>
            <span className="text-gray-700">{t('Invoice for TenagaAhli')} {order.package_name || 'Premium'} {t('Subscription')}</span>
          </div>

          {/* Amount Due Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {t('Total amount due:')} {formatRupiah(amount)}
            </h2>
            <p className="text-sm font-bold text-gray-900">
              {t('Order ID:')} <span className="font-semibold">{invoiceNumber}</span>
            </p>
          </div>

          {/* Table */}
          <div className="w-full text-[13px]">
            {/* Thead */}
            <div className="flex font-bold text-gray-900 py-3 border-b border-gray-200">
              <div className="flex-[4]">{t('Description')}</div>
              <div className="flex-1 text-center">{t('Qty')}</div>
              <div className="flex-[1.5] text-right">{t('Price (Rp)')}</div>
              <div className="flex-[1.5] text-right">{t('Total (Rp)')}</div>
            </div>
            
            {/* Row */}
            <div className="flex text-gray-700 py-3 border-b border-gray-100">
              <div className="flex-[4] pr-4">
                <p className="mb-1">{order.package_name || 'Premium'} {t('Package Subscription')}</p>
                <p className="text-gray-500 text-[12px]">{t('Langganan 1 Tahun TenagaAhli')}</p>
              </div>
              <div className="flex-1 text-center">1</div>
              <div className="flex-[1.5] text-right">{formatRupiah(amount).replace('Rp', '').trim()}</div>
              <div className="flex-[1.5] text-right">{formatRupiah(amount).replace('Rp', '').trim()}</div>
            </div>

            {/* Footer rows */}
            <div className="flex justify-end py-2">
              <div className="font-bold text-gray-900 w-32 text-right pr-6">{t('Subtotal')}</div>
              <div className="text-gray-700 w-24 text-right">{formatRupiah(amount).replace('Rp', '').trim()}</div>
            </div>
            <div className="flex justify-end py-2">
              <div className="text-gray-600 w-32 text-right pr-6">{t('Discount')}</div>
              <div className="text-gray-700 w-24 text-right">0</div>
            </div>
            <div className="flex justify-end py-2">
              <div className="text-gray-600 w-32 text-right pr-6">{t('Tax')}</div>
              <div className="text-gray-700 w-24 text-right">0</div>
            </div>
            <div className="flex justify-end py-2 border-b border-gray-200">
              <div className="text-gray-600 w-32 text-right pr-6">{t('Shipping')}</div>
              <div className="text-gray-700 w-24 text-right">0</div>
            </div>
            <div className="flex justify-end py-3">
              <div className="font-bold text-gray-900 w-48 text-right pr-6">{t('Total amount due')}</div>
              <div className="font-bold text-gray-900 w-24 text-right">{formatRupiah(amount).replace('Rp', '').trim()}</div>
            </div>
          </div>

          {/* Signature area */}
          <div className="flex justify-end mt-12 mb-16 mr-10">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-[13px] text-gray-900">{t('Admin TenagaAhli,')}</p>
                <p className="font-bold text-[13px] text-gray-900">{t('Director')}</p>
              </div>
              {/* Dummy signature drawn with SVG to mimic the blue signature */}
              <svg width="80" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                <path d="M10,40 Q20,10 30,30 T50,20 T70,35 T90,25" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M25,25 Q35,5 45,35 T65,15" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="grid grid-cols-[100px_1fr] gap-4 text-[12px] text-gray-700 mb-6">
            <div className="font-bold text-gray-900">{t('Notes')}</div>
            <div>
              {t('Please pay via payment link or VA number provided. Be sure to pay before the due date mentioned above.')}
            </div>
            <div className="font-bold text-gray-900">{t('Terms &')}<br/>{t('Conditions')}</div>
            <div>
              {t('Access to premium features will be granted immediately upon successful payment verification. Contact support for any billing issues.')}
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="flex justify-between items-center text-[11px] pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1 text-gray-400">
              {t('Powered by')} <span className="font-bold text-[#0EA5E9] ml-1 tracking-tighter text-sm">{t('midtrans')}</span>
            </div>
            <div className="font-bold text-gray-900">{t('Page 1 of 1')}</div>
          </div>

        </div>
      </div>
    </>
  );
}
