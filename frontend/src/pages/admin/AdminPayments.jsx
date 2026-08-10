import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext.jsx';
import api from '../../api/client.js';

export default function AdminPayments() {
  const { t } = useTranslation();

  const statusLabel = {
    menunggu_pembayaran: { text: t('Menunggu Pembayaran'), color: '#414844', bg: '#F5F4F0' },
    menunggu_verifikasi: { text: t('Menunggu Verifikasi'), color: '#7A5900', bg: '#FFF4D6' },
    verified: { text: t('Terverifikasi'), color: '#0284C7', bg: '#E0F2FE' },
    rejected: { text: t('Ditolak'), color: '#B3261E', bg: '#FFDAD6' },
    pending: { text: t('Menunggu Pembayaran'), color: '#7A5900', bg: '#FFF4D6' },
    settlement: { text: t('payment.settlement', 'Lunas (Midtrans)'), color: '#166534', bg: '#DCFCE7' },
    expire: { text: t('payment.expired', 'Kedaluwarsa'), color: '#414844', bg: '#F5F4F0' },
    cancel: { text: t('payment.cancelled', 'Dibatalkan'), color: '#B3261E', bg: '#FFDAD6' },
    deny: { text: t('Ditolak'), color: '#B3261E', bg: '#FFDAD6' },
  };

  const paymentTypeLabel = {
    midtrans: { text: 'Midtrans', icon: 'credit_card', color: '#0EA5E9' },
    manual: { text: t('Transfer Bank'), icon: 'receipt', color: '#5B6660' },
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'all';

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = () => {
    setLoading(true);
    api
      .get('/admin/orders')
      .then((res) => {
        console.log('📦 Orders data received:', res.data);
        console.log('📦 Sample order proof_url:', res.data[0]?.proof_url);
        console.log('📦 Sample order proof_of_payment:', res.data[0]?.proof_of_payment);
        setOrders(res.data);
      })
      .catch(() => setError('Gagal memuat data order.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter orders berdasarkan statusParam dan searchQuery
  useEffect(() => {
    let result = [...orders];

    if (statusParam === 'berhasil') {
      result = result.filter(o => o.status === 'verified' || o.status === 'settlement');
    } else if (statusParam === 'pending') {
      result = result.filter(o => o.status === 'menunggu_pembayaran' || o.status === 'menunggu_verifikasi' || o.status === 'pending');
    } else if (statusParam === 'gagal') {
      result = result.filter(o => o.status === 'rejected' || o.status === 'expire' || o.status === 'cancel' || o.status === 'deny');
    } else if (statusParam === 'refund') {
      result = result.filter(o => o.status === 'refund');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((order) => {
        return (
          order.expert?.name?.toLowerCase().includes(query) ||
          order.expert?.email?.toLowerCase().includes(query) ||
          order.reference_code?.toLowerCase().includes(query) ||
          order.package?.name?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredOrders(result);
  }, [searchQuery, orders, statusParam]);

  // Hitung statistik
  const stats = {
    total: orders.length,
    berhasil: orders.filter(o => o.status === 'verified' || o.status === 'settlement').length,
    pending: orders.filter(o => o.status === 'menunggu_pembayaran' || o.status === 'menunggu_verifikasi' || o.status === 'pending').length,
    gagal: orders.filter(o => o.status === 'rejected' || o.status === 'expire' || o.status === 'cancel' || o.status === 'deny').length,
    totalRevenue: orders.filter(o => o.status === 'verified' || o.status === 'settlement').reduce((sum, o) => sum + Number(o.amount), 0),
  };

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
    { id: 'all', label: 'Semua Transaksi' },
    { id: 'berhasil', label: 'Berhasil' },
    { id: 'pending', label: 'Pending' },
    { id: 'gagal', label: 'Gagal' },
    { id: 'refund', label: 'Refund' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0284C7]">Verifikasi & Riwayat Pembayaran</h2>
        <p className="text-[#414844]/80 text-sm mt-1">Konfirmasi bukti pembayaran premium dan pantau riwayat keuangan pendaftaran.</p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#0284C7]/10 to-[#0284C7]/5 rounded-xl p-4 border border-[#0284C7]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#414844]/70">Total Transaksi</span>
            <span className="material-symbols-outlined text-[#0284C7] text-[20px]">receipt_long</span>
          </div>
          <p className="text-2xl font-bold text-[#0284C7]">{stats.total}</p>
          <p className="text-[10px] text-[#414844]/60 mt-1">Semua waktu</p>
        </div>

        <div className="bg-gradient-to-br from-[#166534]/10 to-[#166534]/5 rounded-xl p-4 border border-[#166534]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#414844]/70">Berhasil</span>
            <span className="material-symbols-outlined text-[#166534] text-[20px]">check_circle</span>
          </div>
          <p className="text-2xl font-bold text-[#166534]">{stats.berhasil}</p>
          <p className="text-[10px] text-[#414844]/60 mt-1">Rp{stats.totalRevenue.toLocaleString('id-ID')} terkumpul</p>
        </div>

        <div className="bg-gradient-to-br from-[#7A5900]/10 to-[#7A5900]/5 rounded-xl p-4 border border-[#7A5900]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#414844]/70">Pending</span>
            <span className="material-symbols-outlined text-[#7A5900] text-[20px]">schedule</span>
          </div>
          <p className="text-2xl font-bold text-[#7A5900]">{stats.pending}</p>
          <p className="text-[10px] text-[#414844]/60 mt-1">Menunggu verifikasi/pembayaran</p>
        </div>

        <div className="bg-gradient-to-br from-[#B3261E]/10 to-[#B3261E]/5 rounded-xl p-4 border border-[#B3261E]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#414844]/70">Gagal</span>
            <span className="material-symbols-outlined text-[#B3261E] text-[20px]">cancel</span>
          </div>
          <p className="text-2xl font-bold text-[#B3261E]">{stats.gagal}</p>
          <p className="text-[10px] text-[#414844]/60 mt-1">Ditolak/expired/dibatalkan</p>
        </div>
      </div>

      {error && <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-[#0284C7]/15">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
            <h3 className="font-bold text-[#0284C7] flex items-center gap-2">
              <span className="material-symbols-outlined">list</span>
              Daftar Transaksi
            </h3>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-[#0284C7]/10 hover:bg-[#0284C7]/20 text-[#0284C7] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
                {loading ? 'progress_activity' : 'refresh'}
              </span>
              {loading ? 'Memuat...' : 'Refresh Data'}
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#414844]/40 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari nama user, kode referensi, atau nama paket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#0284C7]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#414844]/40 hover:text-[#0284C7] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-[#414844]/60 mt-2">
              Menampilkan {filteredOrders.length} dari {orders.length} hasil
            </p>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="p-5 border-b border-[#0284C7]/15 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ status: tab.id })}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                statusParam === tab.id
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1200px]">
            <thead>
              <tr className="bg-[#0284C7]/5 text-[#414844] text-xs font-semibold">
                <th className="px-4 py-3.5 whitespace-nowrap">User / Pendaftar</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Kode Ref</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Paket</th>
                <th className="px-4 py-3.5 whitespace-nowrap text-right">Nominal</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Metode</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Bukti Transfer</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Tanggal</th>
                <th className="px-4 py-3.5 whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0284C7]/10">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0284C7]/20 border-t-[#0284C7]"></div>
                      <p className="text-sm text-[#414844]/70">Memuat data transaksi...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[48px] text-[#414844]/30">receipt_long</span>
                      <p className="text-sm text-[#414844]/70 font-semibold">
                        {searchQuery ? `Tidak ditemukan hasil untuk "${searchQuery}"` : 'Tidak ada data transaksi pada filter ini.'}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-2 px-4 py-2 bg-[#0284C7]/10 hover:bg-[#0284C7]/20 text-[#0284C7] text-xs font-bold rounded-lg transition-all"
                        >
                          Hapus Filter Pencarian
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const s = statusLabel[o.status] || statusLabel.menunggu_pembayaran;
                  const paymentType = o.payment_type || (o.snap_token ? 'midtrans' : 'manual');
                  const pt = paymentTypeLabel[paymentType] || paymentTypeLabel.manual;
                  
                  return (
                    <tr key={o.id} className="hover:bg-[#0284C7]/5 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#0284C7]/10 flex items-center justify-center text-[#0284C7] font-bold text-xs">
                            {o.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0284C7] text-sm">{o.user?.name}</p>
                            <p className="text-xs text-[#414844]/60">{o.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs bg-[#F5F4F0] px-2 py-1 rounded">{o.reference_code}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-[#1F2A22] text-sm">{o.package_name || 'Premium'}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-[#0284C7]">Rp{Number(o.amount).toLocaleString('id-ID')}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${pt.color}15` }}>
                            <span className="material-symbols-outlined text-[16px]" style={{ color: pt.color }}>
                              {pt.icon}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold block" style={{ color: pt.color }}>
                              {pt.text}
                            </span>
                            {o.snap_token && (
                              <span className="text-[9px] text-[#5B6660]/60 block">
                                Token: {o.snap_token.substring(0, 15)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {o.proof_url ? (
                          <button
                            onClick={() => {
                              console.log('🖼️ Opening image preview:', o.proof_url);
                              console.log('📄 Full order data:', o);
                              setPreviewImage(o.proof_url);
                              setImageLoading(true);
                              setImageError(false);
                            }}
                            className="text-[#0284C7] hover:underline text-xs font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">image</span> 
                            <span>Lihat Bukti</span>
                          </button>
                        ) : paymentType === 'midtrans' ? (
                          <span className="text-xs text-[#0EA5E9] italic flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">payment</span>
                            Dibayar via Midtrans
                          </span>
                        ) : (
                          <span className="text-xs text-[#414844]/50 italic flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">hide_image</span>
                            Belum diunggah
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1" style={{ color: s.color, backgroundColor: s.bg }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                          {s.text}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-[#414844]/75">
                          <p className="font-semibold">
                            {new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-[#414844]/50">
                            {new Date(o.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {o.status === 'menunggu_verifikasi' && paymentType === 'manual' && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleVerify(o)}
                              className="bg-[#0284C7]/10 hover:bg-[#0284C7]/20 text-[#0284C7] px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                              title="Setujui Pembayaran"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span className="hidden xl:inline">Setujui</span>
                            </button>
                            <button
                              onClick={() => setRejectTarget(o)}
                              className="bg-[#B3261E]/10 hover:bg-[#B3261E]/20 text-[#B3261E] px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                              title="Tolak Pembayaran"
                            >
                              <span className="material-symbols-outlined text-[16px]">cancel</span>
                              <span className="hidden xl:inline">Tolak</span>
                            </button>
                          </div>
                        )}
                        {paymentType === 'midtrans' && o.status === 'settlement' && (
                          <div className="flex justify-center">
                            <span className="text-[10px] text-[#166534] flex items-center gap-1 bg-[#DCFCE7] px-2 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              <span className="hidden lg:inline">Auto Verified</span>
                            </span>
                          </div>
                        )}
                        {paymentType === 'midtrans' && o.status === 'pending' && (
                          <div className="flex justify-center">
                            <span className="text-[10px] text-[#7A5900] flex items-center gap-1 bg-[#FFF4D6] px-2 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              <span className="hidden lg:inline">Menunggu</span>
                            </span>
                          </div>
                        )}
                        {o.status === 'verified' && !['settlement'].includes(o.status) && paymentType === 'manual' && (
                          <div className="flex justify-center">
                            <span className="text-[10px] text-[#0284C7] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">done_all</span>
                              Terverifikasi
                            </span>
                          </div>
                        )}
                        {o.status === 'rejected' && (
                          <div className="flex justify-center">
                            <span className="text-[10px] text-[#B3261E] flex items-center gap-1" title={o.reject_reason || 'Ditolak'}>
                              <span className="material-symbols-outlined text-[14px]">block</span>
                              Ditolak
                            </span>
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            setPreviewImage(null);
            setImageLoading(false);
            setImageError(false);
          }}
        >
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#0284C7]/10 bg-gradient-to-r from-[#0284C7]/5 to-transparent">
              <h3 className="font-bold text-lg text-[#0284C7] flex items-center gap-2">
                <span className="material-symbols-outlined">receipt_long</span>
                Bukti Pembayaran
              </h3>
              <button
                onClick={() => {
                  setPreviewImage(null);
                  setImageLoading(false);
                  setImageError(false);
                }}
                className="bg-[#B3261E]/10 hover:bg-[#B3261E]/20 text-[#B3261E] rounded-full p-2 transition-all hover:scale-110"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="relative flex items-center justify-center bg-[#F5F4F0] p-4 min-h-[400px] max-h-[80vh] overflow-auto">
              {imageLoading && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#F5F4F0] z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0284C7]/20 border-t-[#0284C7]"></div>
                    <p className="text-sm text-[#414844]/60 font-medium">Memuat gambar...</p>
                  </div>
                </div>
              )}
              
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#FFDAD6]/20 z-10">
                  <div className="flex flex-col items-center gap-3 p-8 text-center max-w-lg">
                    <span className="material-symbols-outlined text-[64px] text-[#B3261E]">broken_image</span>
                    <p className="text-base text-[#B3261E] font-bold">Gagal Memuat Gambar</p>
                    <p className="text-sm text-[#414844]/70">
                      File bukti pembayaran tidak ditemukan di server. Kemungkinan file telah dihapus atau belum diunggah dengan benar.
                    </p>
                    <div className="w-full bg-white rounded-lg p-3 border border-[#0284C7]/10 mt-2">
                      <p className="text-xs text-[#414844]/60 mb-1 font-semibold">Path File:</p>
                      <p className="text-xs text-[#414844]/90 font-mono break-all bg-[#F5F4F0] px-2 py-1 rounded">
                        {previewImage}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          setImageError(false);
                          setImageLoading(true);
                        }}
                        className="px-4 py-2 bg-[#0284C7] text-white text-xs font-bold rounded-lg hover:bg-[#0284C7]/90 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        Muat Ulang
                      </button>
                      <button
                        onClick={() => {
                          setPreviewImage(null);
                          setImageLoading(false);
                          setImageError(false);
                        }}
                        className="px-4 py-2 bg-[#414844]/10 hover:bg-[#414844]/20 text-[#414844] text-xs font-bold rounded-lg transition-colors"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <img 
                src={previewImage} 
                alt="Bukti transfer" 
                className={`w-auto max-w-full h-auto max-h-[70vh] rounded-lg object-contain shadow-lg ${imageLoading || imageError ? 'hidden' : 'block'}`}
                onLoad={() => {
                  console.log('✅ Image loaded successfully:', previewImage);
                  setImageLoading(false);
                }}
                onError={(e) => {
                  console.error('❌ Image failed to load:', previewImage);
                  console.error('Error event:', e);
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </div>
            
            <div className="p-3 bg-[#F5F4F0] border-t border-[#0284C7]/10 text-center">
              <p className="text-xs text-[#414844]/60 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Klik di luar untuk menutup
              </p>
            </div>
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