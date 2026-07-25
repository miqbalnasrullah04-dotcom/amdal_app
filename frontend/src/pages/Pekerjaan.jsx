import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const STATUS_MAP = {
  baru: { label: 'Baru', color: '#0284C7', bg: '#E0F2FE', icon: 'fiber_new' },
  diterima: { label: 'Diterima', color: '#7A5900', bg: '#FFF4D6', icon: 'handshake' },
  berlangsung: { label: 'Berlangsung', color: '#0284C7', bg: '#E0F2FE', icon: 'sync' },
  selesai: { label: 'Selesai', color: '#2E5E3B', bg: '#E3F2E7', icon: 'check_circle' },
};

const DEMO_JOBS = [
  {
    id: 'PRJ-001',
    judul: 'Konsultasi Analisis Dampak Lingkungan',
    klien: 'PT Bangun Nusantara',
    lokasi: 'Jakarta Selatan',
    status: 'berlangsung',
    tanggal_mulai: '2026-07-15',
    tanggal_selesai: '2026-08-15',
    deskripsi: 'Melakukan analisis dampak lingkungan untuk proyek pembangunan gedung perkantoran di area seluas 2 hektar.',
    anggaran: 'Rp 15.000.000',
    kategori: 'Konsultasi',
  },
  {
    id: 'PRJ-002',
    judul: 'Penyusunan Dokumen AMDAL',
    klien: 'CV Maju Bersama',
    lokasi: 'Bandung',
    status: 'baru',
    tanggal_mulai: '2026-08-01',
    tanggal_selesai: '2026-09-30',
    deskripsi: 'Penyusunan dokumen AMDAL lengkap untuk proyek perumahan skala menengah di area Bandung Timur.',
    anggaran: 'Rp 25.000.000',
    kategori: 'Penyusunan Dokumen',
  },
  {
    id: 'PRJ-003',
    judul: 'Pelatihan Manajemen Lingkungan',
    klien: 'Dinas Lingkungan Hidup Kota Bogor',
    lokasi: 'Bogor',
    status: 'selesai',
    tanggal_mulai: '2026-06-01',
    tanggal_selesai: '2026-06-30',
    deskripsi: 'Menjadi narasumber pelatihan manajemen lingkungan hidup untuk staf pemerintah daerah selama 4 sesi.',
    anggaran: 'Rp 8.000.000',
    kategori: 'Pelatihan',
  },
];

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-black/5 shadow-sm ${className}`}>{children}</div>;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Pekerjaan() {
  const [filter, setFilter] = useState('semua');
  const [selectedJob, setSelectedJob] = useState(null);

  const filteredJobs = filter === 'semua' ? DEMO_JOBS : DEMO_JOBS.filter((j) => j.status === filter);

  // Detail View
  if (selectedJob) {
    const s = STATUS_MAP[selectedJob.status];
    return (
      <DashboardLayout
        title="Detail Pekerjaan"
        subtitle={selectedJob.id}
        headerRight={
          <button
            onClick={() => setSelectedJob(null)}
            className="text-sm font-bold text-[#0284C7] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Kembali
          </button>
        }
      >
        <div className="space-y-5 animate-fadeIn">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#1F2A22] mb-1">{selectedJob.judul}</h2>
                <p className="text-xs text-[#414844]/60">{selectedJob.id}</p>
              </div>
              <span
                className="text-[10px] font-bold px-3 py-1.5 rounded-full shrink-0 self-start flex items-center gap-1"
                style={{ color: s.color, backgroundColor: s.bg }}
              >
                <span className="material-symbols-outlined text-[12px]">{s.icon}</span>
                {s.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs mb-6">
              <div>
                <span className="text-[#414844]/60 block font-medium mb-0.5">Klien</span>
                <span className="font-bold text-[#1F2A22]">{selectedJob.klien}</span>
              </div>
              <div>
                <span className="text-[#414844]/60 block font-medium mb-0.5">Lokasi</span>
                <span className="font-bold text-[#1F2A22] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#0284C7]">location_on</span>
                  {selectedJob.lokasi}
                </span>
              </div>
              <div>
                <span className="text-[#414844]/60 block font-medium mb-0.5">Kategori</span>
                <span className="font-bold text-[#1F2A22]">{selectedJob.kategori}</span>
              </div>
              <div>
                <span className="text-[#414844]/60 block font-medium mb-0.5">Periode</span>
                <span className="font-bold text-[#1F2A22]">
                  {formatDate(selectedJob.tanggal_mulai)} — {formatDate(selectedJob.tanggal_selesai)}
                </span>
              </div>
              <div>
                <span className="text-[#414844]/60 block font-medium mb-0.5">Estimasi Anggaran</span>
                <span className="font-bold text-[#2E5E3B] text-sm">{selectedJob.anggaran}</span>
              </div>
            </div>

            <div className="border-t border-black/5 pt-5">
              <p className="text-xs font-bold text-[#414844]/60 uppercase tracking-wide mb-2">Deskripsi Proyek</p>
              <div className="bg-[#F5F4EF] rounded-xl p-4 text-sm text-[#414844] leading-relaxed">
                {selectedJob.deskripsi}
              </div>
            </div>
          </Card>

          {/* Timeline Proyek */}
          <Card className="p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0284C7] uppercase tracking-wider border-b border-black/5 pb-3 mb-5">
              <span className="material-symbols-outlined text-[18px]">timeline</span>
              Timeline Proyek
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#E3F2E7] text-[#2E5E3B] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1F2A22]">Proyek Dimulai</p>
                  <p className="text-xs text-[#414844]/60">{formatDate(selectedJob.tanggal_mulai)}</p>
                </div>
              </div>
              {selectedJob.status === 'selesai' && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#E3F2E7] text-[#2E5E3B] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1F2A22]">Proyek Selesai</p>
                    <p className="text-xs text-[#414844]/60">{formatDate(selectedJob.tanggal_selesai)}</p>
                  </div>
                </div>
              )}
              {selectedJob.status !== 'selesai' && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FFF4D6] text-[#7A5900] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1F2A22]">Target Selesai</p>
                    <p className="text-xs text-[#414844]/60">{formatDate(selectedJob.tanggal_selesai)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pekerjaan / Proyek" subtitle="Kelola pekerjaan dan proyek yang Anda terima dari klien.">
      <div className="space-y-5 animate-fadeIn">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Proyek', value: DEMO_JOBS.length, icon: 'work', color: '#0284C7', bg: '#E0F2FE' },
            { label: 'Berlangsung', value: DEMO_JOBS.filter((j) => j.status === 'berlangsung').length, icon: 'sync', color: '#0284C7', bg: '#E0F2FE' },
            { label: 'Tawaran Baru', value: DEMO_JOBS.filter((j) => j.status === 'baru').length, icon: 'fiber_new', color: '#7A5900', bg: '#FFF4D6' },
            { label: 'Selesai', value: DEMO_JOBS.filter((j) => j.status === 'selesai').length, icon: 'check_circle', color: '#2E5E3B', bg: '#E3F2E7' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 flex items-start gap-3">
              <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: stat.bg, color: stat.color }}>
                <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs text-[#414844]/60 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-[#1F2A22]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Job List */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-black/5 flex gap-2 flex-wrap">
            {['semua', 'baru', 'berlangsung', 'selesai'].map((f) => (
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

          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-[56px] text-[#0284C7]/20 mb-3 block">work_off</span>
              <h3 className="text-base font-bold text-[#1F2A22] mb-1">Tidak ada pekerjaan</h3>
              <p className="text-sm text-[#414844]/60">
                Belum ada proyek dengan status ini. Pastikan profil Anda lengkap dan menarik!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {filteredJobs.map((job) => {
                const s = STATUS_MAP[job.status];
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="w-full text-left px-5 py-5 hover:bg-[#0284C7]/3 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-sm text-[#1F2A22] truncate">{job.judul}</h4>
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                            style={{ color: s.color, backgroundColor: s.bg }}
                          >
                            {s.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#414844]/70 mb-2 line-clamp-1">{job.deskripsi}</p>
                        <div className="flex items-center gap-3 flex-wrap text-[10px] text-[#414844]/50">
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">business</span>
                            {job.klien}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">location_on</span>
                            {job.lokasi}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                            {formatDate(job.tanggal_mulai)}
                          </span>
                          <span className="font-bold text-[#2E5E3B]">{job.anggaran}</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[20px] text-[#414844]/30 shrink-0 mt-3">
                        chevron_right
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
