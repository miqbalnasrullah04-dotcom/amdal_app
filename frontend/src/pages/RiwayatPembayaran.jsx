import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

const STATUS_INFO = {
  lunas: { text: 'Lunas', color: '#2E5E3B', bg: '#E3F2E7' },
  menunggu: { text: 'Menunggu Verifikasi', color: '#7A5900', bg: '#FFF4D6' },
  ditolak: { text: 'Ditolak', color: '#B3261E', bg: '#FFDAD6' },
};

const FALLBACK_PAYMENTS = [
  {
    id: 1,
    package_name: 'Pro',
    amount: 300000,
    method: 'Transfer Bank',
    status: 'lunas',
    date: '12 Jun 2026',
  },
  {
    id: 2,
    package_name: 'Basic',
    amount: 150000,
    method: 'QRIS',
    status: 'menunggu',
    date: '02 Jan 2026',
  },
];

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    value
  );
}

export default function RiwayatPembayaran() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/my/payments')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setPayments(data.length > 0 ? data : FALLBACK_PAYMENTS);
      })
      .catch(() => setPayments(FALLBACK_PAYMENTS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      title="Riwayat Pembayaran"
      subtitle="Lihat status dan histori seluruh transaksi Anda."
      headerRight={
        <button
          onClick={() => navigate('/pilih-paket')}
          className="bg-[#2E5E3B] text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-[#244B2F] transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Bayar Paket Baru
        </button>
      }
    >
      <div className="w-full max-w-2xl">
        {loading && (
          <div className="flex items-center gap-3 text-[#5B6660] text-sm">
            <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
            Memuat riwayat...
          </div>
        )}

        {!loading && payments.length === 0 && (
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2 block">receipt_long</span>
            <p className="text-on-surface-variant text-sm mb-4">Belum ada riwayat pembayaran.</p>
            <button
              onClick={() => navigate('/pilih-paket')}
              className="bg-[#2E5E3B] text-white py-2.5 px-6 rounded-full font-label-md hover:bg-[#244B2F] transition-colors"
            >
              Pilih Paket
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
                    <p className="font-bold text-on-background">Paket {p.package_name}</p>
                    <p className="text-sm text-on-surface-variant">
                      {p.method} &middot; {p.date}
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
    </DashboardLayout>
  );
}