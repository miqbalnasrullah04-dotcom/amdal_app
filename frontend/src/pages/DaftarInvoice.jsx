import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout';

const getSTATUSMAP = (t) => ({
  pending:               { label: t('invoice.status.pending', 'Belum Bayar'),          color: '#7A5900', bg: '#FFF4D6', icon: 'schedule' },
  menunggu_verifikasi:   { label: t('invoice.status.awaiting_verification', 'Menunggu Verifikasi'),  color: '#7A5900', bg: '#FFF4D6', icon: 'hourglass_top' },
  verified:              { label: t('invoice.status.paid', 'Lunas'),                color: '#2E5E3B', bg: '#E3F2E7', icon: 'check_circle' },
  rejected:              { label: t('invoice.status.rejected', 'Ditolak'),              color: '#B3261E', bg: '#FFDAD6', icon: 'cancel' },
  expired:               { label: t('invoice.status.expired', 'Kedaluwarsa'),          color: '#414844', bg: '#F5F4F0', icon: 'timer_off' },
});

function formatRupiah(v) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v ?? 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-black/5 shadow-sm ${className}`}>{children}</div>;
}

export default function DaftarInvoice() {
  const { t } = useTranslation();
  const STATUS_MAP = getSTATUSMAP(t);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('semua');

  useEffect(() => {
    api
      .get('/orders/history')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setOrders(data);
      })
      .catch(() => {
        setOrders([
          {
            id: 1001,
            order_number: 'INV-20260715-001',
            package_name: 'Premium',
            amount: 250000,
            status: 'verified',
            payment_method: 'Transfer Bank',
            created_at: '2026-07-15T10:30:00',
            verified_at: '2026-07-15T14:00:00',
          },
          {
            id: 1002,
            order_number: 'INV-20260701-002',
            package_name: 'Premium',
            amount: 250000,
            status: 'menunggu_verifikasi',
            payment_method: 'QRIS',
            created_at: '2026-07-01T08:00:00',
            verified_at: null,
          },
          {
            id: 1003,
            order_number: 'INV-20260601-003',
            package_name: 'Premium Plus',
            amount: 500000,
            status: 'expired',
            payment_method: null,
            created_at: '2026-06-01T12:00:00',
            verified_at: null,
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders =
    filter === 'semua' ? orders : orders.filter((o) => o.status === filter);

  const totalPaid = orders
    .filter((o) => o.status === 'verified')
    .reduce((s, o) => s + (o.amount || 0), 0);
  const pendingCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'menunggu_verifikasi'
  ).length;

  if (loading) {
    return (
      <DashboardLayout title={t('invoice.title', 'Invoice')} subtitle={t('invoice.subtitle', 'Riwayat tagihan dan transaksi langganan Anda.')}>
        <div className="flex items-center gap-3 text-[#5B6660] py-12 justify-center">
          <span className="w-5 h-5 rounded-full border-2 border-[#0284C7]/30 border-t-[#0284C7] animate-spin" />
          {t('invoice.loading', 'Memuat riwayat invoice...')}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('invoice.title', 'Invoice')} subtitle={t('invoice.subtitle', 'Riwayat tagihan dan transaksi langganan Anda.')}>
      <div className="space-y-5 animate-fadeIn">
        {/* Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#E0F2FE] text-[#0284C7] shrink-0">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
            <div>
              <p className="text-xs text-[#414844]/60 font-medium">{t('invoice.total_invoice', 'Total Invoice')}</p>
              <p className="text-xl font-bold text-[#1F2A22]">{orders.length}</p>
            </div>
          </Card>
          <Card className="p-5 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#E3F2E7] text-[#2E5E3B] shrink-0">
              <span className="material-symbols-outlined text-[22px]">paid</span>
            </div>
            <div>
              <p className="text-xs text-[#414844]/60 font-medium">{t('invoice.total_paid', 'Total Terbayar')}</p>
              <p className="text-xl font-bold text-[#2E5E3B]">{formatRupiah(totalPaid)}</p>
            </div>
          </Card>
          <Card className="p-5 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFF4D6] text-[#7A5900] shrink-0">
              <span className="material-symbols-outlined text-[22px]">pending</span>
            </div>
            <div>
              <p className="text-xs text-[#414844]/60 font-medium">{t('invoice.pending', 'Menunggu')}</p>
              <p className="text-xl font-bold text-[#7A5900]">{pendingCount}</p>
            </div>
          </Card>
        </div>

        {/* Invoice Table */}
        <Card className="overflow-hidden">
          {/* Filter */}
          <div className="p-5 border-b border-black/5 flex gap-2 flex-wrap">
            {['semua', 'verified', 'menunggu_verifikasi', 'pending', 'rejected', 'expired'].map((f) => {
              const cnt = f === 'semua' ? orders.length : orders.filter((o) => o.status === f).length;
              if (f !== 'semua' && cnt === 0) return null;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    filter === f
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
                  }`}
                >
                  {f === 'semua' ? t('invoice.filter_all', 'Semua') : STATUS_MAP[f]?.label || f} ({cnt})
                </button>
              );
            })}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-[56px] text-[#0284C7]/20 mb-3 block">
                receipt_long
              </span>
              <h3 className="text-base font-bold text-[#1F2A22] mb-1">{t('invoice.empty_title', 'Tidak ada invoice')}</h3>
              <p className="text-sm text-[#414844]/60 mb-4">
                {t('invoice.empty_desc', 'Anda belum memiliki riwayat transaksi')}{filter !== 'semua' ? t('invoice.with_this_status', ' dengan status ini') : ''}.
              </p>
              <Link
                to="/paket"
                className="text-sm font-bold text-[#0284C7] hover:underline inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                {t('invoice.choose_package', 'Pilih Paket')}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#0284C7]/5 text-[#414844]">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('invoice.col_number', 'No. Invoice')}</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('invoice.col_package', 'Paket')}</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('invoice.col_amount', 'Jumlah')}</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('invoice.col_method', 'Metode')}</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('invoice.col_date', 'Tanggal')}</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('invoice.col_status', 'Status')}</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('invoice.col_action', 'Aksi')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredOrders.map((order) => {
                    const s = STATUS_MAP[order.status] || STATUS_MAP.pending;
                    return (
                      <tr key={order.id} className="hover:bg-[#0284C7]/[0.03] transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-bold text-[#0284C7] text-xs">
                            {order.order_number || `INV-${order.id}`}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#1F2A22] font-semibold text-xs">
                          {order.package_name || order.package?.name || '-'}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#1F2A22] text-xs">
                          {formatRupiah(order.amount)}
                        </td>
                        <td className="px-5 py-4 text-[#414844]/70 text-xs">
                          {order.payment_method || '-'}
                        </td>
                        <td className="px-5 py-4 text-[#414844]/70 text-xs">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                            style={{ color: s.color, backgroundColor: s.bg }}
                          >
                            <span className="material-symbols-outlined text-[11px]">{s.icon}</span>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            to={`/invoice/${order.id}`}
                            className="text-xs font-bold text-[#0284C7] hover:underline inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            {t('invoice.view', 'Lihat')}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
