import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Background from '../assets/background.jpg';
import ShinyText from '../components/ShinyText';
import { MicrophoneIcon, BriefcaseIcon, AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/solid';

// Heroicons instead of Material Symbols glyphs — SVG-based so the size is
// guaranteed by width/height classes and never shrinks if the icon font
// hasn't finished loading.
const categories = [
  {
    Icon: MicrophoneIcon,
    title: 'Narasumber/Pembicara',
    overlay: 'bg-black/50 hover:bg-[#0B7285]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800',
    to: '/narasumber',
  },
  {
    Icon: BriefcaseIcon,
    title: 'Tenaga Ahli',
    overlay: 'bg-black/50 hover:bg-[#0B7285]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
    to: '/tenaga-ahli',
  },
  {
    Icon: AcademicCapIcon,
    title: 'Instruktur Pengajar',
    overlay: 'bg-black/50 hover:bg-[#0B7285]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1755692879703-d18a213f8691?auto=format&fit=crop&q=80&w=800',
    to: '/instruktur-pengajar',
  },
  {
    Icon: BookOpenIcon,
    title: 'Peneliti Artikel/Jurnal',
    overlay: 'bg-black/50 hover:bg-[#0B7285]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    to: '/peneliti-artikel-jurnal',
  },
];

// Same 4 categories as the grid below, reused as the search bar's
// "Kriteria Keanggotaan" dropdown so both places always stay in sync.
const SEARCH_CATEGORIES = categories.map((c) => ({ icon: c.icon, title: c.title }));

// ---------------------------------------------------------------------------
// Kajian Lingkungan Hidup Strategis — data mitra.
// Ganti field `logo` dengan path/URL logo asli bila sudah tersedia
// (mis. `/assets/partners/udayana.png`). Selama belum ada file logo,
// badge inisial otomatis dipakai sebagai placeholder yang konsisten.
// ---------------------------------------------------------------------------
const MOU_UNIVERSITIES = [
  { name: 'Universitas Udayana', short: 'UNUD', logo: null },
  { name: 'Universitas Negeri Jakarta', short: 'UNJ', logo: null },
  { name: 'Universitas Negeri Gorontalo', short: 'UNG', logo: null },
  { name: 'UIN Sulthan Thaha Saifuddin Jambi', short: 'UIN', logo: null },
  { name: 'Universitas Tanjungpura Pontianak', short: 'UNTAN', logo: null },
  { name: 'Universitas Halu Oleo', short: 'UHO', logo: null },
  { name: 'Universitas Jember', short: 'UNEJ', logo: null },
  { name: 'SEAMEO', short: 'SEAMEO', logo: null },
  { name: 'SEAMEO QITEP in Science', short: 'QITEP', logo: null },
  { name: 'PS.PSL IPB University', short: 'IPB', logo: null },
  { name: 'Universitas Muhammadiyah Riau', short: 'UMRI', logo: null },
  { name: 'STKIP Kusuma Negara', short: 'STKIP', logo: null },
  { name: 'Universitas Islam Bandung', short: 'UNISBA', logo: null },
  { name: 'Universitas Negeri Manado', short: 'UNIMA', logo: null },
  { name: 'Universitas Negeri Padang', short: 'UNP', logo: null },
  { name: 'Universitas Muhammadiyah Sorong', short: 'UNAMIN', logo: null },
  { name: 'Universitas Muhammadiyah Mataram', short: 'UMMAT', logo: null },
  { name: 'ITL Trisakti', short: 'ITL', logo: null },
];

const GRANT_RESEARCH_PARTNERS = [
  { name: 'Ford Foundation', short: 'FF', logo: null },
  { name: 'Kementerian PPN/Bappenas', short: 'PPN', logo: null },
  { name: 'World Resources Institute', short: 'WRI', logo: null },
  { name: 'GIZ', short: 'GIZ', logo: null },
];

const MOA_PARTNERS = [
  { name: 'Nusa Digital Creative', short: 'NDC', logo: null },
  { name: 'Penaprolis', short: 'PNP', logo: null },
];

// Satu baris grid mitra yang dipakai berulang untuk ketiga kelompok
// (MoU, Grant Research, MoA) supaya tampilannya konsisten.
function PartnerLogoGrid({ partners }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
      {partners.map((p) => (
        <div
          key={p.name}
          title={p.name}
          className="group flex flex-col items-center gap-2 w-[110px] shrink-0"
        >
          <div className="w-20 h-20 rounded-full bg-[#2A1D14] border border-[#6B4F3A] flex items-center justify-center overflow-hidden grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
            {p.logo ? (
              <img src={p.logo} alt={p.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-[#C9A876] font-headline-md text-sm tracking-wide">{p.short}</span>
            )}
          </div>
          <span className="text-[10px] leading-tight text-center text-[#C9A876]/80">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [kategori, setKategori] = useState(''); // free text, suggestions from SEARCH_CATEGORIES
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [experts, setExperts] = useState([]);

  const kategoriMatches = SEARCH_CATEGORIES.filter((c) =>
    c.title.toLowerCase().includes(kategori.trim().toLowerCase())
  );

  useEffect(() => {
    // Pulled from Laravel: GET /api/experts?featured=1
    api.get('/experts', { params: { featured: 1 } }).then((res) => setExperts(res.data)).catch(() => {
      setExperts([
        {
          id: 1,
          slug: 'dr-irman-firmansyah-s-hut-m-si',
          name: 'Dr. Irman Firmansyah, S.Hut, M.Si',
          photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
          cover: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
          verified: true,
        },
      ]);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    navigate(
      `/search?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&kriteria=${encodeURIComponent(kategori)}`
    );
  };

  return (
    <>
      {/* Hero Section — pb-24 diganti pb-16 supaya background hutan langsung
          habis tepat di bawah search bar, tanpa jeda putih. Kartu statistik
          (4 kotak: Tenaga Ahli Terverifikasi dll) sudah dihapus. */}
      <header className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-40 overflow-hidden">
        <div
          className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${Background})`,
          }}
        />
        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="relative z-20 text-center px-margin-mobile max-w-4xl mx-auto">
          <h1 className="font-display-lg text-display-lg md:text-[80px] mb-4 drop-shadow-lg">
            <ShinyText
              text="AMDAL.ID"
              speed={2.5}
              delay={0.5}
              color="#ffffff"
              shineColor="#006673"
              spread={120}
              direction="left"
              pauseOnHover={false}
              yoyo={false}
              className="font-display-lg text-display-lg md:text-[80px]"
            />
          </h1>
          <p className="font-headline-lg text-white/90 max-w-2xl mx-auto">Analisis Mengenai dampak lingkungan</p>
        </div>

        {/* Search Component — 3 kolom ketik: kata kunci, lokasi, kriteria/kategori */}
        <form onSubmit={handleSearch} className="relative z-30 w-full max-w-[1200px] mt-12 px-margin-mobile">
          <div className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white/20">
            <div className="flex-1 flex items-center px-6 py-2 gap-3 border-r border-outline-variant/30 w-full">
              <span className="material-symbols-outlined text-primary">search</span>
              <div className="flex flex-col flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-1">
                  Masukan Kata Kunci
                </label>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface font-body-md placeholder:text-surface-dim text-sm"
                  placeholder="Ahli Kehutanan, Tata Ruang"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 flex items-center px-6 py-2 gap-3 border-r border-outline-variant/30 w-full">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <div className="flex flex-col flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-1">
                  Kota/Kabupaten/Provinsi
                </label>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface font-body-md placeholder:text-surface-dim text-sm"
                  placeholder="Pilih Lokasi"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Kolom ke-3: Kriteria Keanggotaan — input teks + saran, sama seperti di halaman Search */}
            <div className="flex-1 relative flex items-center px-6 py-2 gap-3 w-full">
              <span className="material-symbols-outlined text-primary">category</span>
              <div className="flex flex-col flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-1">
                  Kriteria Keanggotaan
                </label>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface font-body-md placeholder:text-surface-dim text-sm"
                  placeholder="Tenaga Ahli, Narasumber..."
                  type="text"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  onFocus={() => setKategoriOpen(true)}
                  onBlur={() => setTimeout(() => setKategoriOpen(false), 120)}
                />
              </div>

              {kategoriOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl z-40 overflow-hidden border border-outline-variant/20">
                  {SEARCH_CATEGORIES.filter((c) =>
                    c.title.toLowerCase().includes(kategori.trim().toLowerCase())
                  ).map((c, i, arr) => (
                    <button
                      key={c.title}
                      type="button"
                      onClick={() => {
                        setKategori(c.title);
                        setKategoriOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-surface-container-low transition-colors ${
                        i !== arr.length - 1 ? 'border-b border-outline-variant/20' : ''
                      } ${c.title === kategori ? 'font-semibold text-primary' : 'text-on-surface'}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
                      {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-primary text-white h-14 px-10 rounded-full flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 font-label-md"
            >
              Search
            </button>
          </div>
        </form>
      </header>

      {/* Kategori Section */}
      <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">Cari Tenaga Ahli</h2>
          <p className="text-on-surface-variant">Urutan dalam Kategori</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Link
              to={cat.to}
              key={cat.title}
              className="relative h-64 rounded-lg overflow-hidden group cursor-pointer block"
            >
              <img
                src={cat.img}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 ${cat.overlay} flex flex-col items-center justify-center text-white p-6`}>
                <cat.Icon className="w-16 h-16 mb-4 drop-shadow-lg" />
                <h3 className="font-headline-md text-xl text-center">{cat.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Layanan Unggulan Section — tema coklat kayu/batang pohon (gelap &
          pekat), beda dari navbar/hero/kartu kategori yang tetap biru-teal.
          Ini bagian "konten & konteks", jadi warnanya dibikin hangat dan
          berbeda dari warna aksi/navigasi supaya ada jeda visual di halaman. */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-[#3E2B1F]">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-[#F0E2CE] mb-4">
              Tenaga Ahli Kajian Lingkungan Hidup Strategis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-24">
            {experts.slice(0, 1).map((expert) => (
              <div key={expert.id} className="relative group rounded-xl overflow-hidden shadow-lg bg-[#2A1D14] border border-[#6B4F3A]">
                <div className="relative h-64">
                  <img src={expert.cover} alt={expert.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-[#3E2B1F]/60 backdrop-blur-sm p-1 rounded border border-white/20">
                    <span className="material-symbols-outlined text-white text-sm">bolt</span>
                  </div>
                  {expert.slug && (
                    <Link
                      to={`/profil/${expert.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-4 right-4 bg-[#F0E2CE] hover:bg-white text-xs font-semibold text-[#3E2B1F] rounded-full px-3 py-1.5 shadow"
                    >
                      Lihat Profil
                    </Link>
                  )}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/20">
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                      <img src={expert.photo} alt={expert.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-white text-xs font-bold">{expert.name}</span>
                      {expert.verified && (
                        <span className="material-symbols-outlined text-primary-fixed text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                          check_circle
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Link
              to="/member"
              className="hidden md:flex bg-[#2A1D14]/60 rounded-xl border-2 border-dashed border-[#6B4F3A] items-center justify-center hover:border-[#C9A876] transition-colors"
            >
              <span className="text-[#C9A876] font-label-md">Lihat Ahli Lainnya</span>
            </Link>
            <Link
              to="/daftar"
              className="hidden md:flex bg-[#2A1D14]/60 rounded-xl border-2 border-dashed border-[#6B4F3A] items-center justify-center hover:border-[#C9A876] transition-colors"
            >
              <span className="text-[#C9A876] font-label-md">Daftar sebagai Ahli</span>
            </Link>
          </div>

          {/* Kajian Lingkungan Hidup Strategis — MoU Perguruan Tinggi,
              Grant Research, dan MoA System Dynamics Center. Tiga kelompok
              mitra ditampilkan sebagai badge logo (grayscale → berwarna saat
              hover) di atas latar coklat yang sama dengan bagian di atasnya. */}
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-[#F0E2CE] mb-2">
              Berita Kajian Lingkungan Hidup Strategis
            </h2>
          </div>

          <div className="space-y-20 mb-16">
            {/* 1. MoU System Dynamics Center dengan universitas */}
            <div>
              <h3 className="text-center font-headline-md text-lg text-[#C9A876] mb-8">
                System Dynamics Center MoU With University
              </h3>
              <PartnerLogoGrid partners={MOU_UNIVERSITIES} />
            </div>

            {/* 2. Grant Research */}
            <div>
              <h3 className="text-center font-headline-md text-lg text-[#C9A876] mb-8">Grant Research</h3>
              <PartnerLogoGrid partners={GRANT_RESEARCH_PARTNERS} />
            </div>

            {/* 3. MoA System Dynamics Center */}
            <div>
              <h3 className="text-center font-headline-md text-lg text-[#C9A876] mb-8">MoA System Dynamics Center</h3>
              <PartnerLogoGrid partners={MOA_PARTNERS} />
            </div>
          </div>

          <div className="text-center">
            <Link to="/pamflet" className="text-[#C9A876] font-label-md hover:underline">
              Lihat semua berita &amp; pamflet →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}