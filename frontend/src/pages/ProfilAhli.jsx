import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------------------------
// Theme constants — matched to TenagaAhli.com's real brand (the sky-blue
// "Masuk" button + deep navy hero on the sign-in page): a confident primary
// blue for actions/links, a deep navy for high-contrast bands, and a
// slightly brighter sky blue reserved for verification/credential accents.
// ---------------------------------------------------------------------------
const BRAND_BLUE = '#1479D6';
const NAVY_DARK = '#0B2A4D';
const ACCENT_SKY = '#0EA5E9';

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

  // ---- Profil Akademik ---------------------------------------------------
  profilAkademik: {
    scopus: { url: 'https://www.scopus.com', label: 'Scopus', metrik: 'H-index 8 · 24 dokumen' },
    googleScholar: { url: 'https://scholar.google.com', label: 'Google Scholar', metrik: '312 sitasi' },
    sinta: { url: 'https://sinta.kemdikbud.go.id', label: 'SINTA', metrik: 'Skor SINTA 3 · S3' },
    orcid: { url: 'https://orcid.org', label: 'ORCID', metrik: '0000-0002-XXXX-XXXX' },
    researchGate: { url: 'https://www.researchgate.net', label: 'ResearchGate', metrik: 'RG Score 18.4' },
  },

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
    blue: 'bg-[#1479D6]/10 text-[#1479D6]',
    sky: 'bg-[#0EA5E9]/10 text-[#0EA5E9]',
    gray: 'bg-gray-100 text-gray-600',
  };
  return <span className={`inline-flex items-center text-sm font-medium px-3.5 py-1.5 rounded-full ${tones[tone]}`}>{children}</span>;
}

function StatBlock({ icon, value, label }) {
  return (
    <div className="flex flex-col items-start gap-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <span className="material-symbols-outlined text-[20px] text-[#1479D6]">{icon}</span>
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
      <span className="absolute left-0 top-1 w-3 h-3 rounded-full bg-[#1479D6] ring-4 ring-[#1479D6]/15" />
      {!isLast && <span className="absolute left-[5px] top-4 bottom-[-1.5rem] w-px bg-gray-200" />}
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-[#1479D6] tracking-wide">{period}</span>
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

const NAV_SECTIONS = [
  { id: 'profil', label: 'Profil' },
  { id: 'pengalaman', label: 'Pengalaman' },
  { id: 'kredensial', label: 'Sertifikasi & Pendidikan' },
  { id: 'akademik', label: 'Akademik' },
  { id: 'portofolio', label: 'Portofolio' },
];

export default function ProfilAhli() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('profil');
  const sectionRefs = useRef({});

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
      .get(`/experts/${slug || FALLBACK_PROFILE.slug}`)
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(FALLBACK_PROFILE))
      .finally(() => setLoading(false));
  }, [slug]);

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
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-on-surface-variant text-sm">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

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
                    title="Kredensial terverifikasi"
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
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/30 shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-green-400">check_circle</span>
                      Verified listing
                    </span>
                  )}
                </div>
                <p className="text-white/90 text-sm md:text-base mt-1.5 font-medium drop-shadow-sm">{profile.profesi}</p>
                <p className="text-white/70 text-sm mt-0.5 drop-shadow-sm">{profile.institution}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2.5 text-white/75 text-xs md:text-sm">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">location_on</span>
                    {profile.alamat?.kota}, {profile.alamat?.provinsi}
                  </span>
                  {profile.ketersediaan && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${profile.ketersediaan.status === 'tersedia' ? 'bg-green-400' : 'bg-amber-400'}`}
                      />
                      {profile.ketersediaan.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`mailto:${profile.email}`}
                className="bg-[#1479D6] text-white h-10 px-5 rounded-full flex items-center gap-1.5 font-semibold text-sm hover:bg-[#0F63B0] transition-colors whitespace-nowrap shadow-lg"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                Hubungi
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
                    ? 'text-[#1479D6] border-[#1479D6]'
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
                aria-label="Bagikan profil"
              >
                <span className="material-symbols-outlined text-gray-600 text-[16px]">share</span>
              </button>
              {copied && (
                <span className="absolute top-full mt-2 right-0 z-10 bg-black text-white text-[11px] px-2 py-1 rounded whitespace-nowrap shadow-md">
                  Link disalin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- 2 & 3 & 4. PROFIL: BIO, KATEGORI, KEAHLIAN ---------- */}
      <section id="profil" className="scroll-mt-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="flex flex-col">
          {/* Tentang Saya */}
          <div className="pb-8 border-b border-gray-200">
            <SectionHeading title="Tentang Saya" />
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{profile.tentangSaya}</p>
            <p className="text-sm text-gray-500 leading-relaxed italic">{profile.ringkasanKeahlian}</p>

            <div className="flex flex-wrap gap-2 mt-5">
              {profile.kategoriProfesional?.map((k) => (
                <Chip key={k} tone="gray">{k}</Chip>
              ))}
            </div>
          </div>

          {/* Bidang Keahlian */}
          <div className="py-8 border-b border-gray-200">
            <SectionHeading title="Bidang Keahlian" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2.5">Keahlian Utama</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.keahlian?.map((k) => <Chip key={k}>{k}</Chip>)}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2.5">Spesialisasi</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.spesialisasi?.map((k) => <Chip key={k} tone="gray">{k}</Chip>)}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2.5">Kompetensi</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.kompetensi?.map((k) => <Chip key={k} tone="gray">{k}</Chip>)}
                </div>
              </div>
            </div>
          </div>

          {/* Bidang Utama + Aktif Sejak quick facts */}
          <div className="py-8">
            <SectionHeading title="Ringkasan Profil" />
            <ul className="flex flex-col gap-2">
              <li className="text-sm text-gray-800">
                <span className="text-gray-500 font-medium">Nama Lengkap : </span>
                {profile.name}
              </li>
              <li className="text-sm text-gray-800">
                <span className="text-gray-500 font-medium">Institusi/Lembaga : </span>
                {profile.institution}
              </li>
              {yearsActive !== null && (
                <li className="text-sm text-gray-800">
                  <span className="text-gray-500 font-medium">Aktif Sejak : </span>
                  {profile.activeSince} ({yearsActive}+ tahun)
                </li>
              )}
              <li className="text-sm text-gray-800">
                <span className="text-gray-500 font-medium">Bidang Utama : </span>
                {profile.bidangUtama?.join(' · ')}
              </li>
            </ul>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 self-start">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Alamat Email</h3>
            <a href={`mailto:${profile.email}`} className="text-[#1479D6] text-sm font-medium hover:underline break-all">
              {profile.email}
            </a>
          </Card>

          {profile.lokasi && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div id="profil-ahli-map" className="h-40 w-full" />
              <div className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Lokasi</h3>
                <p className="text-sm text-gray-800 mb-3 leading-snug">{profile.lokasi.label}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(profile.lokasi.label)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1479D6] text-sm font-medium hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">directions</span>
                  Get Directions
                </a>
              </div>
            </div>
          )}

          {profile.sosial?.length > 0 && (
            <Card>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Sosial Media</h3>
              <div className="flex gap-2.5">
                {profile.sosial.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    title={s.label}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#1479D6] hover:text-white text-gray-600 transition-colors"
                  >
                    <SocialIcon type={s.type} />
                  </a>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Kriteria Keanggotaan</h3>
            <div className="flex flex-wrap gap-2">
              {profile.kriteria?.map((k) => (
                <Link
                  key={k.label}
                  to={k.to}
                  className="text-xs bg-gray-100 hover:bg-[#1479D6]/10 hover:text-[#1479D6] text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {k.label}
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
            <SectionHeading title="Pengalaman Kerja" eyebrow={`${profile.pengalamanKerja?.length || 0} posisi`} />
            <div className="flex flex-col gap-6">
              {profile.pengalamanKerja?.map((p, i) => (
                <TimelineItem
                  key={i}
                  isLast={i === profile.pengalamanKerja.length - 1}
                  period={p.periode}
                  title={p.jabatan}
                  subtitle={p.institusi}
                  description={p.deskripsi}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionHeading title="Pengalaman Proyek" eyebrow={`${profile.pengalamanProyek?.length || 0} proyek`} />
            <div className="flex flex-col gap-6">
              {profile.pengalamanProyek?.map((p, i) => (
                <TimelineItem
                  key={i}
                  isLast={i === profile.pengalamanProyek.length - 1}
                  period={p.tahun}
                  title={p.nama}
                  subtitle={`${p.peran} · ${p.lokasi}`}
                  description={p.deskripsi}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 7 & 8. SERTIFIKASI & PENDIDIKAN ---------- */}
      <section id="kredensial" className="scroll-mt-16 border-t border-gray-200">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <SectionHeading title="Sertifikasi Keahlian" eyebrow="Kredensial aktif" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {profile.sertifikasi?.map((s, i) => (
              <Card key={i} className="flex flex-col gap-2.5">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${ACCENT_SKY}1A` }}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ color: ACCENT_SKY }}>
                    workspace_premium
                  </span>
                </span>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">{s.nama}</h4>
                <p className="text-xs text-gray-500">{s.lembaga}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 mt-auto border-t border-gray-100">
                  <span>No. {s.nomor}</span>
                  <span>Berlaku s.d. {s.berlakuHingga}</span>
                </div>
                {s.dokumen && (
                  <a href={s.dokumen} className="text-[#1479D6] text-xs font-semibold hover:underline flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">description</span>
                    Lihat dokumen
                  </a>
                )}
              </Card>
            ))}
          </div>

          <SectionHeading title="Riwayat Pendidikan" />
          <div className="flex flex-col gap-6 max-w-2xl">
            {profile.pendidikan?.map((p, i) => (
              <TimelineItem
                key={i}
                isLast={i === profile.pendidikan.length - 1}
                period={p.tahun}
                title={`${p.jenjang} — ${p.prodi}`}
                subtitle={`${p.institusi} · Gelar ${p.gelar}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 9, 10, 11, 12(narasumber), 13, 14. AKADEMIK ---------- */}
      <section id="akademik" className="scroll-mt-16 bg-[#FAFBF9] border-t border-gray-200">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col gap-12">
          {/* Profil Akademik */}
          {profile.profilAkademik && (
            <div>
              <SectionHeading title="Profil Akademik" eyebrow="Rekam jejak riset" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.values(profile.profilAkademik).map((a) => (
                  <a
                    key={a.label}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1 hover:border-[#1479D6]/40 hover:shadow-sm transition-all"
                  >
                    <span className="text-sm font-bold text-gray-900">{a.label}</span>
                    <span className="text-xs text-gray-500">{a.metrik}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Organisasi */}
            {profile.organisasi?.length > 0 && (
              <div>
                <SectionHeading title="Organisasi" />
                <div className="flex flex-col gap-5">
                  {profile.organisasi.map((o, i) => (
                    <Card key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{o.nama}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{o.periode}</span>
                      </div>
                      <p className="text-sm text-[#1479D6] font-medium mt-0.5">{o.jabatan}</p>
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{o.kontribusi}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reviewer Jurnal */}
            {profile.reviewerJurnal?.length > 0 && (
              <div>
                <SectionHeading title="Reviewer Jurnal" />
                <div className="flex flex-col gap-5">
                  {profile.reviewerJurnal.map((r, i) => (
                    <Card key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{r.nama}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{r.periode}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{r.institusi}</p>
                      <Chip tone="gray">{r.bidang}</Chip>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Publikasi */}
          {profile.publikasi?.length > 0 && (
            <div>
              <SectionHeading title="Publikasi" eyebrow={`${profile.publikasi.length} karya`} />
              <ol className="flex flex-col gap-3">
                {profile.publikasi.map((p, i) => (
                  <li key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip tone="gray">{p.jenis}</Chip>
                        <span className="text-xs text-gray-400">{p.tahun}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{p.judul}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.penerbit}</p>
                    </div>
                    <a href={p.link} className="text-[#1479D6] text-xs font-semibold hover:underline flex items-center gap-1 shrink-0">
                      Lihat publikasi
                      <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Narasumber */}
            {profile.narasumber?.length > 0 && (
              <div>
                <SectionHeading title="Narasumber" />
                <ol className="list-decimal list-outside pl-5 flex flex-col gap-2.5">
                  {profile.narasumber.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 leading-relaxed">
                      <span className="text-gray-900 font-medium">{item.title}</span>, {item.penyelenggara}. {item.tempat}, {item.tanggal}.
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Instruktur / Trainer */}
            {profile.instruktur?.length > 0 && (
              <div>
                <SectionHeading title="Instruktur / Trainer" />
                <div className="flex flex-col gap-5">
                  {profile.instruktur.map((it, i) => (
                    <Card key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{it.nama}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{it.tahun}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{it.materi}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Chip tone="gray">{it.peran}</Chip>
                        <span className="text-xs text-gray-400">{it.penyelenggara}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- 15 & 16. PORTOFOLIO & STATISTIK ---------- */}
      <section id="portofolio" className="scroll-mt-16 border-t border-gray-200">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
          {statistik && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-12">
              <StatBlock icon="military_tech" value={`${statistik.tahunPengalaman}+`} label="Tahun Pengalaman" />
              <StatBlock icon="engineering" value={statistik.jumlahProyek} label="Proyek" />
              <StatBlock icon="article" value={statistik.jumlahPublikasi} label="Publikasi" />
              <StatBlock icon="workspace_premium" value={statistik.jumlahSertifikasi} label="Sertifikasi" />
              <StatBlock icon="campaign" value={statistik.jumlahKegiatan} label="Kegiatan" />
            </div>
          )}

          <SectionHeading title="Portofolio" eyebrow="Dokumen pendukung" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile.portofolio?.cv && (
              <a href={profile.portofolio.cv} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2 hover:border-[#1479D6]/40 hover:shadow-sm transition-all">
                <span className="material-symbols-outlined text-[#1479D6] text-[20px]">description</span>
                <span className="text-sm font-semibold text-gray-900">Unduh CV</span>
              </a>
            )}
            {profile.portofolio?.video && (
              <a href={profile.portofolio.video} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2 hover:border-[#1479D6]/40 hover:shadow-sm transition-all">
                <span className="material-symbols-outlined text-[#1479D6] text-[20px]">play_circle</span>
                <span className="text-sm font-semibold text-gray-900">Video Perkenalan</span>
              </a>
            )}
            {profile.portofolio?.sertifikat?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
                <span className="material-symbols-outlined text-[#1479D6] text-[20px]">workspace_premium</span>
                <span className="text-sm font-semibold text-gray-900 mb-1">Sertifikat</span>
                {profile.portofolio.sertifikat.map((f, i) => (
                  <a key={i} href="#" className="text-xs text-gray-500 hover:text-[#1479D6] hover:underline truncate">{f}</a>
                ))}
              </div>
            )}
            {profile.portofolio?.dokumentasi?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
                <span className="material-symbols-outlined text-[#1479D6] text-[20px]">photo_library</span>
                <span className="text-sm font-semibold text-gray-900 mb-1">Dokumentasi Kegiatan</span>
                {profile.portofolio.dokumentasi.map((f, i) => (
                  <a key={i} href="#" className="text-xs text-gray-500 hover:text-[#1479D6] hover:underline truncate">{f}</a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- 17. HUBUNGI TENAGA AHLI ---------- */}
      <section className="border-t border-gray-200" style={{ backgroundColor: NAVY_DARK }}>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center">
          <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-white mb-2">Hubungi {profile.name.split(',')[0]}</h2>
          <p className="text-white/70 text-sm mb-8 max-w-xl mx-auto">
            Tertarik berkolaborasi atau membutuhkan konsultasi lebih lanjut? Pilih cara terbaik untuk terhubung.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="bg-white text-[#1479D6] h-11 px-6 rounded-full flex items-center gap-2 font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Kirim Pesan
            </a>
            <a
              href={`mailto:${profile.email}?subject=Ajukan%20Kerja%20Sama`}
              className="bg-white/10 text-white border border-white/25 h-11 px-6 rounded-full flex items-center gap-2 font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">handshake</span>
              Ajukan Kerja Sama
            </a>
            <a
              href={`mailto:${profile.email}?subject=Minta%20Konsultasi`}
              className="bg-white/10 text-white border border-white/25 h-11 px-6 rounded-full flex items-center gap-2 font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              Minta Konsultasi
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}