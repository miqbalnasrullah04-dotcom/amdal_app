import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';
import LevelBadge from '../components/LevelBadge.jsx';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------------------------
// TenagaAhli.com Brand Colors - Matching the website's design system
// Updated from AMDAL.id to TenagaAhli.com branding
// ---------------------------------------------------------------------------
const BRAND_BLUE = '#0EA5E9';     // Primary sky blue from TenagaAhli.com
const NAVY_DARK = '#0B2A4D';      // Deep navy for contrast
const ACCENT_SKY = '#1479D6';     // Darker blue for verification badges
const STAR_GOLD = '#F59E0B';      // Rating star color (kept distinct from brand blue)

// Demo data used only if /api/experts/:slug is unreachable.
const FALLBACK_PROFILE = {
  slug: 'dr-irman-firmansyah-s-hut-m-si',
  name: 'Dr. Irman Firmansyah, S.Hut, M.Si',
  gelar: 'Dr., S.Hut, M.Si',
  profesi: 'Peneliti & Konsultan Lingkungan',
  institution: 'PSL - IPB University',
  verified: true,
  activeSince: 2011,
  photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  cover: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1400',
  email: 'irmanf@gmail.com',
  ketersediaan: { status: 'tersedia', label: 'Tersedia untuk kerja sama baru' },

  // ---- Profil Bio -----------------------------------------------------
  tentangSaya:
    'Bekerja pada irisan antara ilmu kehutanan, lingkungan, dan pemodelan sistem dinamik untuk mendukung perencanaan pembangunan yang berkelanjutan. Selama lebih dari satu dekade terlibat dalam penyusunan KLHS, kajian daya dukung lingkungan, dan pendampingan kebijakan tata ruang di berbagai daerah di Indonesia.',
  ringkasanKeahlian:
    'Pemodelan sistem dinamik dan analisis spasial untuk kajian lingkungan hidup strategis serta perencanaan tata ruang berbasis daya dukung.',
  bidangUtama: ['Kajian Lingkungan Hidup Strategis (KLHS)', 'Perencanaan Tata Ruang', 'Pemodelan Sistem Dinamik'],
  pengalaman:
    'Lebih dari 10 tahun sebagai peneliti, konsultan, dan tenaga ahli pendamping kebijakan pada berbagai kajian lingkungan hidup strategis dan tata ruang di lebih dari 15 kabupaten/kota di Indonesia.',

  // ---- Kategori Profesional --------------------------------------------
  kategoriProfesional: ['Tenaga Ahli / Konsultan', 'Peneliti', 'Narasumber', 'Akademisi'],

  // ---- Bidang Keahlian ---------------------------------------------------
  keahlian: ['Ilmu Kehutanan', 'Ilmu Lingkungan', 'System Dynamics', 'Spasial Dynamics'],
  spesialisasi: ['KLHS RDTR & RPJMD', 'System Dynamics Modelling', 'Analisis Daya Dukung Lingkungan'],
  kompetensi: ['Powersim / Vensim', 'GIS & Penginderaan Jauh', 'Fasilitasi Multi-pihak'],

  // ---- Pengalaman Kerja ---------------------------------------------------
  pengalamanKerja: [
    {
      jabatan: 'Peneliti & Dosen',
      institusi: 'Pusat Studi Lingkungan (PSL), IPB University',
      periode: '2011 — Sekarang',
      deskripsi:
        'Mengampu riset dan pengajaran pada bidang perencanaan lingkungan, dengan fokus pemodelan sistem dinamik untuk kajian daya dukung wilayah.',
    },
    {
      jabatan: 'Konsultan Lingkungan Independen',
      institusi: 'Freelance / Berbagai Pemerintah Daerah',
      periode: '2013 — Sekarang',
      deskripsi:
        'Menyusun dan memfasilitasi Kajian Lingkungan Hidup Strategis (KLHS) untuk RTRW, RDTR, dan RPJMD di lebih dari 15 kabupaten/kota.',
    },
    {
      jabatan: 'Tenaga Ahli Pendamping',
      institusi: 'Kementerian Lingkungan Hidup dan Kehutanan',
      periode: '2016 — 2020',
      deskripsi: 'Mendampingi penyusunan pedoman teknis integrasi KLHS ke dalam dokumen rencana tata ruang daerah.',
    },
  ],

  // ---- Pengalaman Proyek ---------------------------------------------------
  pengalamanProyek: [
    {
      nama: 'Kajian Sistem Dinamik untuk KLHS RPJMD Kota Manado',
      peran: 'Ketua Tim Ahli',
      tahun: '2021',
      lokasi: 'Manado',
      deskripsi: 'Membangun model sistem dinamik untuk memproyeksikan dampak skenario pembangunan terhadap daya dukung lingkungan kota.',
    },
    {
      nama: 'KLHS RDTR Kecamatan Selaawi–Banyuresmi',
      peran: 'Tenaga Ahli Lingkungan',
      tahun: '2022',
      lokasi: 'Garut',
      deskripsi: 'Mengidentifikasi materi kebijakan, rencana, dan program (KRP) serta merumuskan isu pembangunan berkelanjutan paling strategis.',
    },
    {
      nama: 'Analisis Daya Dukung DAS Cimanuk Hulu',
      peran: 'Anggota Tim Peneliti',
      tahun: '2019',
      lokasi: 'Garut',
      deskripsi: 'Menghitung daya tampung dan daya dukung lingkungan sub-DAS untuk mendukung rekomendasi tata guna lahan.',
    },
  ],

  // ---- Sertifikasi Keahlian ---------------------------------------------------
  sertifikasi: [
    {
      nama: 'Ahli Kajian Lingkungan Hidup Strategis (KLHS)',
      lembaga: 'Kementerian Lingkungan Hidup dan Kehutanan',
      nomor: 'KLHS-2019-00871',
      tahun: '2019',
      berlakuHingga: '2027',
      dokumen: '#',
    },
    {
      nama: 'Fasilitator Pemodelan Sistem Dinamik',
      lembaga: 'System Dynamics Society Indonesia',
      nomor: 'SDI-0456',
      tahun: '2020',
      berlakuHingga: '2026',
      dokumen: '#',
    },
    {
      nama: 'Ahli Madya Perencanaan Wilayah dan Kota',
      lembaga: 'Lembaga Pengembangan Jasa Konstruksi (LPJK)',
      nomor: 'AMPWK-33812',
      tahun: '2021',
      berlakuHingga: '2027',
      dokumen: '#',
    },
  ],

  // ---- Riwayat Pendidikan ---------------------------------------------------
  pendidikan: [
    { jenjang: 'S3 · Doktor', institusi: 'IPB University', prodi: 'Ilmu Pengetahuan Kehutanan', gelar: 'Dr.', tahun: '2018' },
    { jenjang: 'S2 · Magister', institusi: 'IPB University', prodi: 'Ilmu Lingkungan', gelar: 'M.Si', tahun: '2010' },
    { jenjang: 'S1 · Sarjana', institusi: 'IPB University', prodi: 'Kehutanan', gelar: 'S.Hut', tahun: '2006' },
  ],

  // ---- Organisasi ---------------------------------------------------
  organisasi: [
    { nama: 'Ikatan Ahli Perencanaan Indonesia (IAP)', jabatan: 'Anggota', periode: '2015 — Sekarang', kontribusi: 'Kontributor diskusi kebijakan tata ruang berkelanjutan.' },
    { nama: 'Masyarakat Ekonomi Lingkungan Indonesia (MELI)', jabatan: 'Pengurus Bidang Riset', periode: '2019 — Sekarang', kontribusi: 'Mengoordinasikan kajian valuasi ekonomi lingkungan.' },
  ],

  // ---- Profil Akademik (Old format - fallback) ---------------------------------------------------
  profilAkademik: {
    scopus: { url: 'https://www.scopus.com', label: 'Scopus', metrik: 'H-index 8 · 24 dokumen' },
    googleScholar: { url: 'https://scholar.google.com', label: 'Google Scholar', metrik: '312 sitasi' },
    sinta: { url: 'https://sinta.kemdikbud.go.id', label: 'SINTA', metrik: 'Skor SINTA 3 · S3' },
    orcid: { url: 'https://orcid.org', label: 'ORCID', metrik: '0000-0002-XXXX-XXXX' },
    researchGate: { url: 'https://www.researchgate.net', label: 'ResearchGate', metrik: 'RG Score 18.4' },
  },

  // ---- Link Akademik (New format dari database) ---------------------------------------------------
  scopus_url: 'https://www.scopus.com/authid/detail.uri?authorId=57220867183',
  scopus_metrics: 'H-index 8 · 24 dokumen',
  google_scholar_url: 'https://scholar.google.com/citations?user=aBcDeFgHiJk',
  google_scholar_metrics: '312 sitasi',
  sinta_url: 'https://sinta.kemdikbud.go.id/authors/profile/6008450',
  sinta_metrics: 'Skor SINTA 3 · S3',
  orcid_url: 'https://orcid.org/0000-0002-1234-5678',
  orcid_metrics: '0000-0002-1234-5678',
  researchgate_url: 'https://www.researchgate.net/profile/Irman-Firmansyah',
  researchgate_metrics: 'RG Score 18.4',

  // ---- Reviewer Jurnal ---------------------------------------------------
  reviewerJurnal: [
    { nama: 'Jurnal Ilmu Lingkungan Indonesia', institusi: 'Universitas Diponegoro', bidang: 'Perencanaan Lingkungan', periode: '2020 — Sekarang' },
    { nama: 'Journal of Regional and City Planning', institusi: 'Institut Teknologi Bandung', bidang: 'Tata Ruang & Sistem Dinamik', periode: '2021 — Sekarang' },
  ],

  // ---- Publikasi ---------------------------------------------------
  publikasi: [
    { jenis: 'Jurnal', judul: 'Model Sistem Dinamik untuk Proyeksi Daya Dukung Lingkungan Perkotaan', penerbit: 'Jurnal Ilmu Lingkungan Indonesia', tahun: '2022', link: '#' },
    { jenis: 'Prosiding', judul: 'Integrasi KLHS dalam Penyusunan RDTR: Studi Kasus Kabupaten Garut', penerbit: 'Seminar Nasional Perencanaan Wilayah', tahun: '2021', link: '#' },
    { jenis: 'Buku', judul: 'Dasar-Dasar Pemodelan Sistem Dinamik untuk Kebijakan Lingkungan', penerbit: 'IPB Press', tahun: '2019', link: '#' },
  ],

  // ---- Narasumber ---------------------------------------------------
  narasumber: [
    { title: 'Identifikasi materi KRP & analisis pengaruh KLHS RDTR Kec. Selaawi–Banyuresmi', penyelenggara: 'Dinas Lingkungan Hidup Kab. Garut', tempat: 'Garut', tanggal: '15 Nov 2022' },
    { title: 'Penyepakatan isu pembangunan berkelanjutan strategis KLHS RDTR Kec. Selaawi–Banyuresmi', penyelenggara: 'Dinas Lingkungan Hidup Kab. Garut', tempat: 'Garut', tanggal: '21 Sep 2022' },
    { title: 'Perumusan isu pembangunan berkelanjutan paling strategis KLHS RDTR Kec. Selaawi–Banyuresmi', penyelenggara: 'Dinas Lingkungan Hidup Kab. Garut', tempat: 'Garut', tanggal: '13 Sep 2022' },
  ],

  // ---- Instruktur / Trainer ---------------------------------------------------
  instruktur: [
    { nama: 'Pelatihan Penyusunan KLHS bagi Aparatur Daerah', materi: 'Metode Pemodelan Sistem Dinamik', penyelenggara: 'BPSDM Provinsi Jawa Barat', peran: 'Instruktur Utama', tahun: '2022' },
    { nama: 'Workshop Analisis Daya Dukung Lingkungan', materi: 'Perhitungan Daya Tampung Lahan', penyelenggara: 'PSL IPB University', peran: 'Fasilitator', tahun: '2020' },
  ],

  // ---- Portofolio ---------------------------------------------------
  portofolio: {
    cv: '#',
    sertifikat: ['Sertifikat Ahli KLHS.pdf', 'Sertifikat Fasilitator Sistem Dinamik.pdf'],
    dokumentasi: ['Dokumentasi KLHS Kota Manado.pdf', 'Dokumentasi Workshop BPSDM Jabar.pdf'],
    dokumenProyek: ['Laporan Akhir KLHS RDTR Garut.pdf'],
    video: '#',
  },

  // ---- Ulasan / Reviews ---------------------------------------------------
  // Data awal (demo). Ulasan baru yang dikirim pengguna akan ditambahkan
  // di atas daftar ini secara lokal, dan (jika API tersedia) disimpan ke server.
  ulasan: [
    {
      nama: 'Ahmad Fauzi',
      rating: 5,
      komentar:
        'Sangat membantu dalam penyusunan KLHS RDTR di daerah kami. Penjelasannya detail dan mudah dipahami, baik oleh tim teknis maupun pemangku kepentingan non-teknis. Rekomendasi terbaik untuk kajian lingkungan hidup strategis.',
      tanggal: '2 minggu lalu',
    },
    {
      nama: 'Siti Rahmawati',
      rating: 5,
      komentar: 'Profesional dan responsif sejak konsultasi awal. Hasil pemodelan sistem dinamiknya sangat membantu pengambilan keputusan di daerah kami.',
      tanggal: '1 bulan lalu',
    },
    {
      nama: 'Budi Santoso',
      rating: 4,
      komentar: 'Kompeten di bidangnya dan komunikasi lancar selama proyek berjalan. Hanya perlu sedikit penyesuaian jadwal di tahap awal.',
      tanggal: '2 bulan lalu',
    },
    {
      nama: 'Dewi Lestari',
      rating: 5,
      komentar:
        'Narasumber yang sangat menguasai materi KLHS dan mampu menjelaskan konsep yang cukup rumit dengan bahasa yang sederhana dan mudah diikuti peserta pelatihan.',
      tanggal: '3 bulan lalu',
    },
  ],

  alamat: {
    lengkap: 'Komplek IPB 2, Blok C No. 4 Sindang Barang, Bogor 16117',
    kota: 'Kota Bogor',
    provinsi: 'Jawa Barat',
  },
  lokasi: {
    label: 'Jl. Mercurius No.4, RW.5, Ciherang, Kec. Dramaga, Kabupaten Bogor, Jawa Barat 16680',
    lat: -6.5622,
    lng: 106.7297,
  },
  sosial: [
    { label: 'Instagram', type: 'instagram', url: 'https://www.instagram.com/dr.irman/' },
    { label: 'Facebook', type: 'facebook', url: 'https://www.facebook.com/wearecase27/' },
    { label: 'YouTube', type: 'youtube', url: 'https://www.youtube.com/channel/UCva2ULajnzEhorlabr_yDpA' },
    { label: 'Twitter', type: 'twitter', url: 'https://twitter.com/collective27' },
  ],
  kriteria: [
    { label: 'Narasumber/Pembicara', to: '/narasumber' },
    { label: 'Instruktur Pengajar', to: '/instruktur-pengajar' },
  ],
};

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function SocialIcon({ type }) {
  if (type === 'instagram') {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    );
  }
  if (type === 'facebook') {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (type === 'youtube') {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (type === 'twitter') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return null;
}

// Section shell: eyebrow label + heading + optional description, consistent
// spacing/rhythm reused across every block on the page.
function SectionHeading({ eyebrow, title, id }) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <h2 className="font-headline-lg text-lg md:text-xl font-bold text-gray-900">{title}</h2>
      {eyebrow && <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{eyebrow}</span>}
    </div>
  );
}

function Chip({ children, tone = 'blue' }) {
  const tones = {
    blue: 'bg-[#0EA5E9]/10 text-[#0EA5E9]',
    sky: 'bg-[#1479D6]/10 text-[#1479D6]',
    gray: 'bg-gray-100 text-gray-600',
  };
  return <span className={`inline-flex items-center text-sm font-medium px-3.5 py-1.5 rounded-full ${tones[tone]}`}>{children}</span>;
}

function StatBlock({ icon, value, label }) {
  return (
    <div className="flex flex-col items-start gap-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <span className="material-symbols-outlined text-[20px] text-[#0EA5E9]">{icon}</span>
      <span className="text-xl font-bold text-gray-900 leading-none">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

// A vertical rail timeline item — used for real chronological data only
// (work history, projects, education) where order genuinely carries meaning.
function TimelineItem({ isLast, period, title, subtitle, description, tag }) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-0 top-1 w-3 h-3 rounded-full bg-[#0EA5E9] ring-4 ring-[#0EA5E9]/15" />
      {!isLast && <span className="absolute left-[5px] top-4 bottom-[-1.5rem] w-px bg-gray-200" />}
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-[#0EA5E9] tracking-wide">{period}</span>
        {tag && <Chip tone="gray">{tag}</Chip>}
      </div>
      <h4 className="text-sm font-bold text-gray-900">{title}</h4>
      {subtitle && <p className="text-sm text-gray-600 mb-1">{subtitle}</p>}
      {description && <p className="text-sm text-gray-500 leading-relaxed">{description}</p>}
    </div>
  );
}

function Card({ children, className = '' }) {
  return <div className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm ${className}`}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Ulasan (Reviews & Ratings) building blocks
// ---------------------------------------------------------------------------

// Compact row of star glyphs. Pass `onRate` to make it an interactive picker.
function StarRow({ rating = 0, size = 16, onRate }) {
  return (
    <div className={`flex items-center gap-0.5 ${onRate ? 'select-none' : ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={onRate ? () => onRate(n) : undefined}
          className={`material-symbols-outlined ${onRate ? 'cursor-pointer' : ''}`}
          style={{
            fontSize: size,
            fontVariationSettings: n <= rating ? "'FILL' 1" : "'FILL' 0",
            color: n <= rating ? STAR_GOLD : '#D1D5DB',
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

// One line of the rating distribution (e.g. "5 ★ ▬▬▬▬▬ 18").
function RatingBar({ label, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="w-3 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right shrink-0 tabular-nums">{count}</span>
    </div>
  );
}

// A single review — kept compact with a clamp + "read more" so long reviews
// don't blow out the page height.
function ReviewCard({ review }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isLong = review.komentar.length > 160;
  const textToDisplay = expanded || !isLong ? review.komentar : `${review.komentar.slice(0, 160).trim()}…`;
  const displayText = t(textToDisplay);
  const initials = review.nama
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 shrink-0 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-bold flex items-center justify-center">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
            <span className="text-sm font-semibold text-gray-900">{review.nama}</span>
            <span className="text-xs text-gray-400 shrink-0">{t(review.tanggal)}</span>
          </div>
          <div className="mt-0.5 mb-1.5">
            <StarRow rating={review.rating} size={14} />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{displayText}</p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs font-semibold text-[#0EA5E9] hover:underline mt-1"
            >
              {expanded ? t('expert_profile.review.hide', 'Sembunyikan') : t('expert_profile.review.read_more', 'Baca selengkapnya')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline, collapsible review form — opens in place of the "Tulis Ulasan"
// button so it never needs a modal or extra page real estate.
function ReviewForm({ onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [nama, setNama] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama.trim() || !komentar.trim() || rating === 0) {
      setError(t('expert_profile.review.error', 'Mohon isi nama, rating, dan ulasan sebelum mengirim.'));
      return;
    }
    setError('');
    setSubmitting(true);
    await onSubmit({ nama: nama.trim(), rating, komentar: komentar.trim() });
    setSubmitting(false);
    setNama('');
    setRating(0);
    setKomentar('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAFBF9] border border-gray-200 rounded-xl p-4 mb-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900">{t('expert_profile.review.write', 'Tulis Ulasan')}</h4>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600" aria-label={t('expert_profile.review.close_aria', 'Tutup form ulasan')}>
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">{t('expert_profile.review.your_rating', 'Rating Anda:')}</span>
        <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onMouseEnter={() => setHoverRating(n)}
              onClick={() => setRating(n)}
              className="material-symbols-outlined cursor-pointer"
              style={{
                fontSize: 22,
                fontVariationSettings: n <= (hoverRating || rating) ? "'FILL' 1" : "'FILL' 0",
                color: n <= (hoverRating || rating) ? STAR_GOLD : '#D1D5DB',
              }}
            >
              star
            </span>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder={t('expert_profile.review.name_placeholder', 'Nama Anda')}
        maxLength={80}
        className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40"
      />
      <textarea
        value={komentar}
        onChange={(e) => setKomentar(e.target.value)}
        placeholder={t('expert_profile.review.comment_placeholder', 'Bagikan pengalaman Anda bekerja sama dengan tenaga ahli ini...')}
        rows={3}
        maxLength={600}
        className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-gray-500 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {t('expert_profile.review.cancel', 'Batal')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-semibold text-white bg-[#0EA5E9] px-5 py-2 rounded-full hover:bg-[#0284C7] transition-colors disabled:opacity-60"
        >
          {submitting ? t('expert_profile.review.submitting', 'Mengirim...') : t('expert_profile.review.submit', 'Kirim Ulasan')}
        </button>
      </div>
    </form>
  );
}

const getNavSections = (t) => [
  { id: 'profil', label: t('expert_profile.nav.profile', 'Profil') },
  { id: 'pengalaman', label: t('expert_profile.nav.experience', 'Pengalaman') },
  { id: 'kredensial', label: t('expert_profile.nav.credentials', 'Sertifikasi & Pendidikan') },
  { id: 'akademik', label: t('expert_profile.nav.academic', 'Akademik') },
  { id: 'ulasan', label: t('expert_profile.nav.reviews', 'Ulasan') },
  { id: 'portofolio', label: t('expert_profile.nav.portfolio', 'Portofolio') },
];

export default function ProfilAhli() {
  const { t } = useTranslation();
  const NAV_SECTIONS = getNavSections(t);
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('profil');
  const sectionRefs = useRef({});

  // Ulasan / reviews state — separate from `profile` so a newly submitted
  // review can be reflected instantly without waiting on a refetch.
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (!el) return;
    const navHeight = 56; // height of sticky nav
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(true);
    api
      .get(`/experts/${slug}`)
      .then((res) => {
        console.log('Expert data loaded:', res.data);
        setProfile(res.data);
      })
      .catch((error) => {
        console.error('Failed to load expert data:', error);
        // Fallback to demo data if API fails
        setProfile(FALLBACK_PROFILE);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Sync local reviews state whenever a (new) profile loads.
  useEffect(() => {
    setReviews(profile?.ulasan || []);
    setShowAllReviews(false);
  }, [profile]);

  useEffect(() => {
    if (!profile?.lokasi) return;
    const instance = L.map('profil-ahli-map', { zoomControl: false, scrollWheelZoom: false }).setView(
      [profile.lokasi.lat, profile.lokasi.lng],
      14
    );
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO',
    }).addTo(instance);

    L.circleMarker([profile.lokasi.lat, profile.lokasi.lng], {
      radius: 9,
      color: BRAND_BLUE,
      fillColor: BRAND_BLUE,
      fillOpacity: 0.9,
      weight: 3,
    }).addTo(instance);
    return () => instance.remove();
  }, [profile]);

  // Lightweight scrollspy so the anchor tab bar tracks reading position.
  useEffect(() => {
    if (!profile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [profile]);

  const yearsActive = useMemo(() => {
    if (!profile) return null;
    return new Date().getFullYear() - (profile.activeSince || new Date().getFullYear());
  }, [profile]);

  const statistik = useMemo(() => {
    if (!profile) return null;
    return {
      tahunPengalaman: yearsActive ?? 0,
      jumlahProyek: profile.pengalamanProyek?.length || 0,
      jumlahPublikasi: profile.publikasi?.length || 0,
      jumlahSertifikasi: profile.sertifikasi?.length || 0,
      jumlahKegiatan: (profile.narasumber?.length || 0) + (profile.instruktur?.length || 0),
    };
  }, [profile, yearsActive]);

  // Aggregate rating summary (average + 5→1 star distribution) derived
  // straight from the current reviews list.
  const ratingStats = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = total ? sum / total : 0;
    const dist = [5, 4, 3, 2, 1].map((n) => ({
      label: n,
      count: reviews.filter((r) => r.rating === n).length,
    }));
    return { total, avg, dist };
  }, [reviews]);

  const handleAddReview = async ({ nama, rating, komentar }) => {
    const entry = { nama, rating, komentar, tanggal: t('Baru saja') };
    try {
      // Best-effort sync to the backend; the UI updates locally regardless
      // so the person always sees their review appear immediately.
      await api.post(`/experts/${slug}/reviews`, { nama, rating, komentar });
    } catch (error) {
      console.error('Failed to save review to server, kept locally:', error);
    }
    setReviews((prev) => [entry, ...prev]);
    setShowReviewForm(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: profile?.name, url });
        return;
      }
    } catch {
      /* ignore */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <span className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#0EA5E9] animate-spin block" />
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-medium">{t('expert_profile.loading.title', 'Memuat profil tenaga ahli...')}</p>
            <p className="text-gray-500 text-sm mt-1">{t('expert_profile.loading.desc', 'Menghubungkan ke database TenagaAhli.com')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-600 text-[24px]">person_off</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('expert_profile.not_found.title', 'Profil Tidak Ditemukan')}</h2>
          <p className="text-gray-600 mb-4">{t('expert_profile.not_found.desc', 'Tenaga ahli yang Anda cari tidak dapat ditemukan atau belum terverifikasi.')}</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-[#0EA5E9] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0284C7] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            {t('expert_profile.not_found.back', 'Kembali ke Beranda')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ---------- 1. HERO / HEADER PROFIL ---------- */}
      <div className="relative h-80 md:h-[26rem] w-full overflow-hidden bg-on-background">
        <img src={profile.cover} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="flex items-end gap-5">
              <div className="relative shrink-0">
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white object-cover shadow-2xl"
                />
                {profile.verified && (
                  <span
                    className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                    style={{ backgroundColor: ACCENT_SKY }}
                    title={t('Kredensial terverifikasi')}
                  >
                    <span className="material-symbols-outlined text-white text-[18px]">verified</span>
                  </span>
                )}
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-white break-words drop-shadow-md">
                    {profile.name}
                  </h1>
                  {profile.level && (
                    <LevelBadge 
                      level={profile.level} 
                      size="md" 
                      className="bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm"
                    />
                  )}
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/30 shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-green-400">check_circle</span>
                      {t('Terverifikasi')}
                    </span>
                  )}
                </div>
                <p className="text-white/90 text-sm md:text-base mt-1.5 font-medium drop-shadow-sm">{t(profile.profesi)}</p>
                <p className="text-white/70 text-sm mt-0.5 drop-shadow-sm">{t(profile.institution)}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2.5 text-white/75 text-xs md:text-sm">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">location_on</span>
                    {t(profile.alamat?.kota)}, {t(profile.alamat?.provinsi)}
                  </span>
                  {ratingStats.total > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1", color: STAR_GOLD }}>
                        star
                      </span>
                      {ratingStats.avg.toFixed(1)} ({ratingStats.total} {t('ulasan')})
                    </span>
                  )}
                  {profile.ketersediaan && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${profile.ketersediaan.status === 'tersedia' ? 'bg-green-400' : 'bg-amber-400'}`}
                      />
                      {t(profile.ketersediaan.label)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`mailto:${profile.email}`}
                className="bg-[#0EA5E9] text-white h-10 px-5 rounded-full flex items-center gap-1.5 font-semibold text-sm hover:bg-[#0284C7] transition-colors whitespace-nowrap shadow-lg"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                {t('Hubungi')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- STICKY ANCHOR NAV ---------- */}
      <div className="border-b border-outline-variant/40 sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-sm">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between overflow-x-auto">
          <nav className="flex">
            {NAV_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.id)}
                className={`font-semibold text-sm px-4 py-4 border-b-2 whitespace-nowrap transition-colors ${
                  activeSection === s.id
                    ? 'text-[#0EA5E9] border-[#0EA5E9]'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 py-2.5 pl-3 shrink-0">
            <div className="relative">
              <button
                onClick={handleShare}
                className="h-9 w-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label={t('Bagikan profil')}
              >
                <span className="material-symbols-outlined text-gray-600 text-[16px]">share</span>
              </button>
              {copied && (
                <span className="absolute top-full mt-2 right-0 z-10 bg-black text-white text-[11px] px-2 py-1 rounded whitespace-nowrap shadow-md">
                  {t('Link disalin')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- STATISTIK PROFIL ---------- */}
      {statistik && (
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <StatBlock icon="military_tech" value={`${statistik.tahunPengalaman}+`} label={t('Tahun Pengalaman')} />
              <StatBlock icon="engineering" value={statistik.jumlahProyek} label={t('Proyek')} />
              <StatBlock icon="article" value={statistik.jumlahPublikasi} label={t('Publikasi')} />
              <StatBlock icon="workspace_premium" value={statistik.jumlahSertifikasi} label={t('Sertifikasi')} />
              <StatBlock icon="campaign" value={statistik.jumlahKegiatan} label={t('Kegiatan')} />
            </div>
          </div>
        </div>
      )}

      {/* ---------- 2 & 3 & 4. PROFIL: BIO, KATEGORI, KEAHLIAN ---------- */}
      <section id="profil" className="scroll-mt-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="flex flex-col">
          {/* Tentang Saya */}
          <div className="py-8 border-b border-gray-200">
            <SectionHeading title={t('expert_profile.about.title', 'Tentang Saya')} />
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{t(profile.tentang_saya || profile.tentangSaya)}</p>
            {(profile.ringkasan_keahlian || profile.ringkasanKeahlian) && (
              <p className="text-sm text-gray-500 leading-relaxed italic">{t(profile.ringkasan_keahlian || profile.ringkasanKeahlian)}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-5">
              {(profile.kriteria_list || profile.kategoriProfesional)?.map((k) => (
                <Chip key={k} tone="gray">{t(k)}</Chip>
              ))}
            </div>
          </div>

          {/* Catatan */}
          {(profile.catatan || profile.pengalaman || profile.ringkasanPengalaman) && (
            <div className="py-8 border-b border-gray-200">
              <SectionHeading title={t('Catatan')} />
              <p className="text-sm text-gray-700 leading-relaxed">{t(profile.catatan || profile.pengalaman || profile.ringkasanPengalaman)}</p>
            </div>
          )}

          {/* Bidang Keahlian */}
          <div className="py-8 border-b border-gray-200">
            <SectionHeading title={t('expert_profile.expertise.title', 'Bidang Keahlian')} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2.5">{t('Keahlian Utama')}</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.keahlian?.map((k) => <Chip key={k}>{t(k)}</Chip>)}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2.5">{t('Spesialisasi')}</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.spesialisasi?.map((k) => <Chip key={k} tone="gray">{t(k)}</Chip>)}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2.5">{t('Kompetensi')}</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.kompetensi?.map((k) => <Chip key={k} tone="gray">{t(k)}</Chip>)}
                </div>
              </div>
            </div>
          </div>

          {/* Bidang Utama + Aktif Sejak quick facts */}
          <div className="py-8">
            <SectionHeading title={t('expert_profile.summary.title', 'Ringkasan Profil')} />
            <ul className="flex flex-col gap-2">
              <li className="text-sm text-gray-800">
                <span className="text-gray-500 font-medium">{t('Nama Lengkap')} : </span>
                {profile.name}
              </li>
              <li className="text-sm text-gray-800">
                <span className="text-gray-500 font-medium">{t('Institusi/Lembaga')} : </span>
                {t(profile.institution)}
              </li>
              {yearsActive !== null && (
                <li className="text-sm text-gray-800">
                  <span className="text-gray-500 font-medium">{t('Aktif Sejak')} : </span>
                  {profile.activeSince} ({yearsActive}+ {t('tahun')})
                </li>
              )}
              <li className="text-sm text-gray-800">
                <span className="text-gray-500 font-medium">{t('Bidang Utama')} : </span>
                {(profile.bidang_utama || profile.bidangUtama)?.map(item => t(item)).join(' · ')}
              </li>
            </ul>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 self-start">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">{t('Alamat Email')}</h3>
            <a href={`mailto:${profile.email}`} className="text-[#0EA5E9] text-sm font-medium hover:underline break-all">
              {profile.email}
            </a>
          </Card>

          {profile.lokasi && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div id="profil-ahli-map" className="h-40 w-full" />
              <div className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{t('Lokasi')}</h3>
                <p className="text-sm text-gray-800 mb-3 leading-snug">{t(profile.lokasi.label)}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(profile.lokasi.label)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0EA5E9] text-sm font-medium hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">directions</span>
                  {t('Get Directions')}
                </a>
              </div>
            </div>
          )}

          {profile.sosial?.length > 0 && (
            <Card>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">{t('Sosial Media')}</h3>
              <div className="flex gap-2.5">
                {profile.sosial.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    title={s.label}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#0EA5E9] hover:text-white text-gray-600 transition-colors"
                  >
                    <SocialIcon type={s.type} />
                  </a>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">{t('Kriteria Keanggotaan')}</h3>
            <div className="flex flex-wrap gap-2">
              {profile.kriteria?.map((k) => (
                <Link
                  key={t(k.label)}
                  to={k.to}
                  className="text-xs bg-gray-100 hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {t(k.label)}
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </section>

      {/* ---------- 5 & 6. PENGALAMAN KERJA & PROYEK ---------- */}
      <section id="pengalaman" className="scroll-mt-16 bg-[#FAFBF9] border-t border-gray-200">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <SectionHeading title={t('expert_profile.experience.work', 'Pengalaman Kerja')} eyebrow={`${profile.pengalamanKerja?.length || 0} ${t('expert_profile.experience.positions', 'posisi')}`} />
            <div className="flex flex-col gap-6">
              {profile.pengalamanKerja?.map((p, i) => (
                <TimelineItem
                  key={i}
                  isLast={i === profile.pengalamanKerja.length - 1}
                  period={t(p.periode)}
                  title={t(p.jabatan)}
                  subtitle={t(p.institusi)}
                  description={t(p.deskripsi)}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionHeading title={t('expert_profile.experience.projects', 'Pengalaman Proyek')} eyebrow={`${profile.pengalamanProyek?.length || 0} ${t('expert_profile.experience.projects_count', 'proyek')}`} />
            <div className="flex flex-col gap-6">
              {profile.pengalamanProyek?.map((p, i) => (
                <TimelineItem
                  key={i}
                  isLast={i === profile.pengalamanProyek.length - 1}
                  period={t(p.tahun)}
                  title={t(p.nama)}
                  subtitle={`${t(p.peran)} · ${t(p.lokasi)}`}
                  description={t(p.deskripsi)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 7 & 8. SERTIFIKASI & PENDIDIKAN ---------- */}
      <section id="kredensial" className="scroll-mt-16 border-t border-gray-200">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <SectionHeading title={t('expert_profile.credentials.certifications', 'Sertifikasi Keahlian')} eyebrow={t('expert_profile.credentials.active', 'Kredensial aktif')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {profile.sertifikasi?.map((s, i) => (
              <Card key={i} className="flex flex-col gap-2.5">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${BRAND_BLUE}1A` }}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ color: BRAND_BLUE }}>
                    workspace_premium
                  </span>
                </span>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">{t(s.nama || s.nama_sertifikat)}</h4>
                <p className="text-xs text-gray-500">{t(s.lembaga || s.penerbit)}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 mt-auto border-t border-gray-100">
                  <span>{s.nomor ? `${t('No.')} ${s.nomor}` : (s.tahun ? `${t('Tahun')} ${s.tahun}` : '')}</span>
                  {s.berlakuHingga && <span>{t('Berlaku s.d.')} {s.berlakuHingga}</span>}
                </div>
                {(s.dokumen && s.dokumen !== '#') || s.file_url ? (
                  <a href={s.dokumen && s.dokumen !== '#' ? s.dokumen : s.file_url} target="_blank" rel="noreferrer" className="text-[#0EA5E9] text-xs font-semibold hover:underline flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">description</span>
                    {t('Lihat dokumen')}
                  </a>
                ) : null}
              </Card>
            ))}
          </div>

          <SectionHeading title={t('Riwayat Pendidikan')} />
          <div className="flex flex-col gap-6 max-w-2xl">
            {profile.pendidikan?.map((p, i) => (
              <TimelineItem
                key={i}
                isLast={i === profile.pendidikan.length - 1}
                period={p.tahun || p.tahun_lulus}
                title={p.prodi || p.jurusan ? `${t(p.jenjang)} — ${t(p.prodi || p.jurusan)}` : t(p.jenjang)}
                subtitle={p.gelar ? `${t(p.institusi)} · ${t('Gelar')} ${t(p.gelar)}` : t(p.institusi)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 9, 10, 11, 12(narasumber), 13, 14. AKADEMIK ---------- */}
      <section id="akademik" className="scroll-mt-16 bg-[#FAFBF9] border-t border-gray-200">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col gap-12">
          {/* Profil Akademik - Link Scopus, Google Scholar, SINTA, dll */}
          <div>
            <SectionHeading title={t('Profil Akademik')} eyebrow={t('Rekam jejak riset')} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {profile.scopus_url && (
                <a
                  href={profile.scopus_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1 hover:border-[#0EA5E9]/40 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-gray-900">Scopus</span>
                  <span className="text-xs text-gray-500">{t(profile.scopus_metrics) || t('Lihat Profil')}</span>
                </a>
              )}
              {profile.google_scholar_url && (
                <a
                  href={profile.google_scholar_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1 hover:border-[#0EA5E9]/40 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-gray-900">Google Scholar</span>
                  <span className="text-xs text-gray-500">{t(profile.google_scholar_metrics) || t('Lihat Profil')}</span>
                </a>
              )}
              {profile.sinta_url && (
                <a
                  href={profile.sinta_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1 hover:border-[#0EA5E9]/40 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-gray-900">SINTA</span>
                  <span className="text-xs text-gray-500">{t(profile.sinta_metrics) || t('Lihat Profil')}</span>
                </a>
              )}
              {profile.orcid_url && (
                <a
                  href={profile.orcid_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1 hover:border-[#0EA5E9]/40 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-gray-900">ORCID</span>
                  <span className="text-xs text-gray-500">{t(profile.orcid_metrics) || t('Lihat Profil')}</span>
                </a>
              )}
              {profile.researchgate_url && (
                <a
                  href={profile.researchgate_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1 hover:border-[#0EA5E9]/40 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-gray-900">ResearchGate</span>
                  <span className="text-xs text-gray-500">{t(profile.researchgate_metrics) || t('Lihat Profil')}</span>
                </a>
              )}
              {/* Fallback ke profilAkademik jika ada */}
              {profile.profilAkademik && !profile.scopus_url && Object.values(profile.profilAkademik).map((a) => (
                <a
                  key={a.label}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1 hover:border-[#0EA5E9]/40 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-gray-900">{t(a.label)}</span>
                  <span className="text-xs text-gray-500">{t(a.metrik)}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Organisasi */}
            {((profile.organisasi && profile.organisasi.length > 0) || profile.organisasi) && (
              <div>
                <SectionHeading title={t('Organisasi')} />
                <div className="flex flex-col gap-5">
                  {(profile.organisasi || []).map((o, i) => (
                    <Card key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{t(o.nama)}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{t(o.periode)}</span>
                      </div>
                      <p className="text-sm text-[#0EA5E9] font-medium mt-0.5">{t(o.jabatan)}</p>
                      {o.kontribusi && <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{t(o.kontribusi)}</p>}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reviewer Jurnal */}
            {((profile.reviewer_jurnal && profile.reviewer_jurnal.length > 0) || profile.reviewerJurnal) && (
              <div>
                <SectionHeading title={t('Reviewer Jurnal')} />
                <div className="flex flex-col gap-5">
                  {(profile.reviewer_jurnal || profile.reviewerJurnal || []).map((r, i) => (
                    <Card key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{t(r.nama)}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{t(r.periode)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{t(r.institusi)}</p>
                      <Chip tone="gray">{t(r.bidang)}</Chip>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Publikasi */}
          {((profile.publikasi && profile.publikasi.length > 0) || profile.publikasi) && (
            <div>
              <SectionHeading title={t('Publikasi')} eyebrow={`${(profile.publikasi || []).length} ${t('karya')}`} />
              <ol className="flex flex-col gap-3">
                {(profile.publikasi || []).map((p, i) => (
                  <li key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip tone="gray">{t(p.jenis)}</Chip>
                        <span className="text-xs text-gray-400">{t(p.tahun)}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{t(p.judul)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t(p.penerbit)}</p>
                    </div>
                    {p.link && p.link !== '#' && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="text-[#0EA5E9] text-xs font-semibold hover:underline flex items-center gap-1 shrink-0">
                        {t('Lihat publikasi')}
                        <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Narasumber */}
            {profile.narasumber?.length > 0 && (
              <div>
                <SectionHeading title={t('Narasumber')} />
                <ol className="list-decimal list-outside pl-5 flex flex-col gap-2.5">
                  {profile.narasumber.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 leading-relaxed">
                      <span className="text-gray-900 font-medium">{t(item.title)}</span>, {t(item.penyelenggara)}. {t(item.tempat)}, {t(item.tanggal)}.
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Instruktur / Trainer */}
            {((profile.instruktur && profile.instruktur.length > 0) || profile.instruktur) && (
              <div>
                <SectionHeading title={t('Instruktur / Trainer')} />
                <div className="flex flex-col gap-5">
                  {(profile.instruktur || []).map((it, i) => (
                    <Card key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{t(it.nama)}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{t(it.tahun)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{t(it.materi)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Chip tone="gray">{t(it.peran)}</Chip>
                        <span className="text-xs text-gray-400">{t(it.penyelenggara)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- ULASAN (RATING & REVIEWS) ---------- */}
      {/* Compact two-column layout: rating summary + "Tulis Ulasan" on the
          left (sticky), scrollable review list with clamp/expand on the
          right — keeps the section short even with many reviews. */}
      <section id="ulasan" className="scroll-mt-16 border-t border-gray-200">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <SectionHeading title={t('Ulasan')} eyebrow={`${ratingStats.total} ${t('ulasan')}`} />
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Ringkasan rating */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:sticky lg:top-24 self-start">
              <div className="flex items-end gap-2 mb-1.5">
                <span className="text-4xl font-bold text-gray-900 leading-none">{ratingStats.avg.toFixed(1)}</span>
                <span className="text-sm text-gray-400 mb-1">/ 5.0</span>
              </div>
              <StarRow rating={Math.round(ratingStats.avg)} size={18} />
              <p className="text-xs text-gray-400 mt-1.5 mb-4">{t('Berdasarkan')} {ratingStats.total} {t('ulasan')}</p>

              <div className="flex flex-col gap-1.5 mb-5">
                {ratingStats.dist.map((d) => (
                  <RatingBar key={d.label} label={d.label} count={d.count} total={ratingStats.total} />
                ))}
              </div>

              {!showReviewForm && (
                <button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="w-full bg-[#0EA5E9] text-white text-sm font-semibold py-2.5 rounded-full hover:bg-[#0284C7] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">rate_review</span>
                  {t('Tulis Ulasan')}
                </button>
              )}
            </div>

            {/* Daftar ulasan */}
            <div>
              {showReviewForm && (
                <ReviewForm onSubmit={handleAddReview} onCancel={() => setShowReviewForm(false)} />
              )}

              {reviews.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">
                  {t('Belum ada ulasan. Jadilah yang pertama memberikan ulasan untuk tenaga ahli ini.')}
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    {(showAllReviews ? reviews : reviews.slice(0, 3)).map((r, i) => (
                      <ReviewCard key={i} review={r} />
                    ))}
                  </div>
                  {reviews.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllReviews((v) => !v)}
                      className="text-sm font-semibold text-[#0EA5E9] hover:underline mt-3"
                    >
                      {showAllReviews ? t('Sembunyikan ulasan') : `${t('Lihat semua')} ${reviews.length} ${t('ulasan')}`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 15 & 16. PORTOFOLIO ---------- */}
      <section id="portofolio" className="scroll-mt-16 bg-[#FAFBF9] border-t border-gray-200">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <SectionHeading title={t('Portofolio')} eyebrow={t('Dokumen pendukung')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile.portofolio?.cv && (
              <a href={profile.portofolio.cv} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2 hover:border-[#0EA5E9]/40 hover:shadow-sm transition-all">
                <span className="material-symbols-outlined text-[#0EA5E9] text-[20px]">description</span>
                <span className="text-sm font-semibold text-gray-900">{t('Unduh CV')}</span>
              </a>
            )}
            {profile.portofolio?.video && (
              <a href={profile.portofolio.video} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2 hover:border-[#0EA5E9]/40 hover:shadow-sm transition-all">
                <span className="material-symbols-outlined text-[#0EA5E9] text-[20px]">play_circle</span>
                <span className="text-sm font-semibold text-gray-900">{t('Video Perkenalan')}</span>
              </a>
            )}
            {profile.portofolio?.sertifikat?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
                <span className="material-symbols-outlined text-[#0EA5E9] text-[20px]">workspace_premium</span>
                <span className="text-sm font-semibold text-gray-900 mb-1">{t('Sertifikat')}</span>
                {profile.portofolio.sertifikat.map((f, i) => (
                  <a key={i} href="#" className="text-xs text-gray-500 hover:text-[#0EA5E9] hover:underline truncate">{t(f)}</a>
                ))}
              </div>
            )}
            {profile.portofolio?.dokumentasi?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
                <span className="material-symbols-outlined text-[#0EA5E9] text-[20px]">photo_library</span>
                <span className="text-sm font-semibold text-gray-900 mb-1">{t('Dokumentasi Kegiatan')}</span>
                {profile.portofolio.dokumentasi.map((f, i) => (
                  <a key={i} href="#" className="text-xs text-gray-500 hover:text-[#0EA5E9] hover:underline truncate">{t(f)}</a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- 17. HUBUNGI TENAGA AHLI ---------- */}
      <section className="border-t border-gray-200" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-white mb-2">{t('Hubungi')} {profile.name.split(',')[0]}</h2>
          <p className="text-white/70 text-sm mb-8 max-w-xl mx-auto">
            {t('Tertarik berkolaborasi atau membutuhkan konsultasi lebih lanjut? Pilih cara terbaik untuk terhubung.')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="bg-white text-[#0EA5E9] h-11 px-6 rounded-full flex items-center gap-2 font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              {t('Kirim Pesan')}
            </a>
            <a
              href={`mailto:${profile.email}?subject=Ajukan%20Kerja%20Sama`}
              className="bg-white/10 text-white border border-white/25 h-11 px-6 rounded-full flex items-center gap-2 font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">handshake</span>
              {t('Ajukan Kerja Sama')}
            </a>
            <a
              href={`mailto:${profile.email}?subject=Minta%20Konsultasi`}
              className="bg-white/10 text-white border border-white/25 h-11 px-6 rounded-full flex items-center gap-2 font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              {t('Minta Konsultasi')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
