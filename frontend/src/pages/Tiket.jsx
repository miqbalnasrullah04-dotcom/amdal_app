import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const PRIORITIES = {
  rendah: { label: 'Rendah', color: '#2E5E3B', bg: '#E3F2E7' },
  sedang: { label: 'Sedang', color: '#7A5900', bg: '#FFF4D6' },
  tinggi: { label: 'Tinggi', color: '#B3261E', bg: '#FFDAD6' },
};

const STATUS_MAP = {
  baru: { label: 'Baru', color: '#0284C7', bg: '#E0F2FE' },
  diproses: { label: 'Diproses', color: '#7A5900', bg: '#FFF4D6' },
  selesai: { label: 'Selesai', color: '#2E5E3B', bg: '#E3F2E7' },
};

const KATEGORI_OPTIONS = [
  'Masalah Login / Akun',
  'Upload Dokumen Gagal',
  'Status Verifikasi',
  'Pembayaran & Invoice',
  'Perubahan Data Profil',
  'Bug / Error Sistem',
  'Lainnya',
];

const DEMO_TICKETS = [
  {
    id: 'TKT-20260101',
    judul: 'Tidak bisa upload foto profil',
    kategori: 'Upload Dokumen Gagal',
    prioritas: 'sedang',
    status: 'selesai',
    created_at: '2026-07-20T10:30:00',
    updated_at: '2026-07-21T14:15:00',
    pesan: 'Saya sudah coba upload foto profil berkali-kali tapi selalu gagal. File berformat JPG ukuran 500KB.',
    balasan: [
      {
        dari: 'admin',
        nama: 'Admin Support',
        waktu: '2026-07-21T14:15:00',
        pesan: 'Terima kasih laporannya. Masalah sudah kami perbaiki. Silakan coba upload kembali.',
      },
    ],
  },
];

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-black/5 shadow-sm ${className}`}>{children}</div>;
}

function SectionTitle({ icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-[#0284C7] uppercase tracking-wider border-b border-black/5 pb-3 mb-5">
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {children}
    </h3>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Tiket() {
  const [tickets, setTickets] = useState(DEMO_TICKETS);
  const [activeTab, setActiveTab] = useState('daftar'); // daftar | buat
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('semua');

  // Form state
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('');
  const [prioritas, setPrioritas] = useState('sedang');
  const [pesan, setPesan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const filteredTickets = filter === 'semua' ? tickets : tickets.filter((t) => t.status === filter);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!judul.trim() || !kategori || !pesan.trim()) return;
    setSubmitting(true);

    setTimeout(() => {
      const newTicket = {
        id: `TKT-${Date.now().toString().slice(-8)}`,
        judul,
        kategori,
        prioritas,
        status: 'baru',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pesan,
        balasan: [],
      };
      setTickets((prev) => [newTicket, ...prev]);
      setJudul('');
      setKategori('');
      setPrioritas('sedang');
      setPesan('');
      setSubmitting(false);
      setSuccess('Tiket berhasil dikirim! Tim kami akan segera merespons.');
      setTimeout(() => {
        setSuccess('');
        setActiveTab('daftar');
      }, 2500);
    }, 800);
  };

  // Detail View
  if (selectedTicket) {
    const s = STATUS_MAP[selectedTicket.status];
    const p = PRIORITIES[selectedTicket.prioritas];
    return (
      <DashboardLayout
        title="Detail Tiket"
        subtitle={selectedTicket.id}
        headerRight={
          <button
            onClick={() => setSelectedTicket(null)}
            className="text-sm font-bold text-[#0284C7] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Kembali
          </button>
        }
      >
        <div className="space-y-5 animate-fadeIn">
          {/* Ticket Info */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-bold text-[#1F2A22]">{selectedTicket.judul}</h2>
              <div className="flex gap-2 shrink-0">
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ color: s.color, backgroundColor: s.bg }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ color: p.color, backgroundColor: p.bg }}
                >
                  Prioritas {p.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-5">
              <div>
                <span className="text-[#414844]/60 block font-medium">ID Tiket</span>
                <span className="font-bold text-[#1F2A22]">{selectedTicket.id}</span>
              </div>
              <div>
                <span className="text-[#414844]/60 block font-medium">Kategori</span>
                <span className="font-bold text-[#1F2A22]">{selectedTicket.kategori}</span>
              </div>
              <div>
                <span className="text-[#414844]/60 block font-medium">Dibuat</span>
                <span className="font-bold text-[#1F2A22]">{formatDate(selectedTicket.created_at)}</span>
              </div>
              <div>
                <span className="text-[#414844]/60 block font-medium">Update Terakhir</span>
                <span className="font-bold text-[#1F2A22]">{formatDate(selectedTicket.updated_at)}</span>
              </div>
            </div>

            <div className="border-t border-black/5 pt-4">
              <p className="text-xs font-bold text-[#414844]/60 uppercase tracking-wide mb-2">Pesan Anda</p>
              <div className="bg-[#F5F4EF] rounded-xl p-4 text-sm text-[#414844] leading-relaxed">
                {selectedTicket.pesan}
              </div>
            </div>
          </Card>

          {/* Balasan */}
          <Card className="p-6">
            <SectionTitle icon="forum">Balasan</SectionTitle>
            {selectedTicket.balasan.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[40px] text-[#0284C7]/20 mb-2 block">forum</span>
                <p className="text-sm text-[#414844]/60">Belum ada balasan. Tim kami akan segera merespons.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedTicket.balasan.map((b, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-4 border ${
                      b.dari === 'admin'
                        ? 'bg-[#E0F2FE] border-[#0284C7]/20'
                        : 'bg-[#F5F4EF] border-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          b.dari === 'admin' ? 'bg-[#0284C7]' : 'bg-[#2E5E3B]'
                        }`}
                      >
                        {b.dari === 'admin' ? 'A' : 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1F2A22]">{b.nama}</p>
                        <p className="text-[10px] text-[#414844]/60">{formatDate(b.waktu)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#414844] leading-relaxed">{b.pesan}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tiket Bantuan" subtitle="Sampaikan kendala atau pertanyaan teknis ke tim Admin.">
      <div className="space-y-5 animate-fadeIn">
        {/* Tab switch */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('daftar')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'daftar'
                ? 'bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/15'
                : 'bg-white text-[#414844] border border-black/10 hover:bg-[#0284C7]/5'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">list_alt</span>
            Daftar Tiket
          </button>
          <button
            onClick={() => { setActiveTab('buat'); setSuccess(''); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'buat'
                ? 'bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/15'
                : 'bg-white text-[#414844] border border-black/10 hover:bg-[#0284C7]/5'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Buat Tiket Baru
          </button>
        </div>

        {/* ── DAFTAR TIKET ── */}
        {activeTab === 'daftar' && (
          <Card className="overflow-hidden">
            {/* Filter */}
            <div className="p-5 border-b border-black/5 flex gap-2 flex-wrap">
              {['semua', 'baru', 'diproses', 'selesai'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors capitalize ${
                    filter === f
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
                  }`}
                >
                  {f === 'semua' ? 'Semua' : STATUS_MAP[f]?.label || f}
                </button>
              ))}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-[56px] text-[#0284C7]/20 mb-3 block">
                  confirmation_number
                </span>
                <h3 className="text-base font-bold text-[#1F2A22] mb-1">Tidak ada tiket</h3>
                <p className="text-sm text-[#414844]/60 mb-4">
                  Anda belum memiliki tiket bantuan{filter !== 'semua' ? ` dengan status "${STATUS_MAP[filter]?.label}"` : ''}.
                </p>
                <button
                  onClick={() => setActiveTab('buat')}
                  className="text-sm font-bold text-[#0284C7] hover:underline inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Buat tiket baru
                </button>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {filteredTickets.map((ticket) => {
                  const s = STATUS_MAP[ticket.status];
                  const p = PRIORITIES[ticket.prioritas];
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full text-left px-5 py-4 hover:bg-[#0284C7]/3 transition-colors flex items-start gap-4"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {ticket.status === 'selesai'
                            ? 'check_circle'
                            : ticket.status === 'diproses'
                            ? 'pending'
                            : 'fiber_new'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold text-sm text-[#1F2A22] truncate">{ticket.judul}</h4>
                          <span className="text-[9px] font-bold text-[#414844]/50">{ticket.id}</span>
                        </div>
                        <p className="text-xs text-[#414844]/70 mb-2 line-clamp-1">{ticket.pesan}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: s.color, backgroundColor: s.bg }}
                          >
                            {s.label}
                          </span>
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: p.color, backgroundColor: p.bg }}
                          >
                            {p.label}
                          </span>
                          <span className="text-[10px] text-[#414844]/50">{formatDate(ticket.created_at)}</span>
                          {ticket.balasan.length > 0 && (
                            <span className="text-[10px] text-[#0284C7] font-bold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px]">reply</span>
                              {ticket.balasan.length} balasan
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[20px] text-[#414844]/30 shrink-0 mt-2">
                        chevron_right
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* ── BUAT TIKET BARU ── */}
        {activeTab === 'buat' && (
          <Card className="p-6">
            <SectionTitle icon="edit_note">Formulir Tiket Baru</SectionTitle>

            {success && (
              <div className="flex items-start gap-2 bg-[#E3F2E7] text-[#2E5E3B] text-sm rounded-xl p-4 mb-5">
                <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">check_circle</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-[#414844]/60 block mb-1.5">
                  Judul Tiket *
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  required
                  placeholder="Contoh: Gagal upload dokumen CV"
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-[#414844]/60 block mb-1.5">
                    Kategori *
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    required
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] transition-all"
                  >
                    <option value="">Pilih kategori...</option>
                    {KATEGORI_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-[#414844]/60 block mb-1.5">
                    Prioritas
                  </label>
                  <div className="flex gap-2">
                    {Object.entries(PRIORITIES).map(([key, val]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPrioritas(key)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          prioritas === key
                            ? 'border-current shadow-sm'
                            : 'border-transparent bg-black/3 hover:bg-black/5'
                        }`}
                        style={
                          prioritas === key
                            ? { color: val.color, backgroundColor: val.bg, borderColor: val.color + '40' }
                            : {}
                        }
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-[#414844]/60 block mb-1.5">
                  Deskripsi Masalah *
                </label>
                <textarea
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  required
                  rows={5}
                  placeholder="Jelaskan kendala yang Anda alami secara detail..."
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] transition-all resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0284C7] text-white text-sm font-bold px-8 py-3 rounded-xl hover:bg-[#0369A1] disabled:opacity-50 transition-all shadow-md shadow-[#0284C7]/15 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Kirim Tiket
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
