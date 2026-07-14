import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Background from '../assets/background.jpg';
import ShinyText from '../components/ShinyText';
import { MicrophoneIcon, BriefcaseIcon, AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/solid';

const categories = [
  {
    Icon: MicrophoneIcon,
    title: 'Narasumber/Pembicara',
    overlay: 'bg-black/50 hover:bg-[#2E5E3B]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800',
    to: '/narasumber',
  },
  {
    Icon: BriefcaseIcon,
    title: 'Tenaga Ahli',
    overlay: 'bg-black/50 hover:bg-[#2E5E3B]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
    to: '/tenaga-ahli',
  },
  {
    Icon: AcademicCapIcon,
    title: 'Instruktur Pengajar',
    overlay: 'bg-black/50 hover:bg-[#2E5E3B]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1755692879703-d18a213f8691?auto=format&fit=crop&q=80&w=800',
    to: '/instruktur-pengajar',
  },
  {
    Icon: BookOpenIcon,
    title: 'Peneliti Artikel/Jurnal',
    overlay: 'bg-black/50 hover:bg-[#2E5E3B]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    to: '/peneliti-artikel-jurnal',
  },
];

const SEARCH_CATEGORIES = categories.map((c) => ({ icon: c.Icon, title: c.title }));

// ---------------------------------------------------------------------------
// DATA MITRA
// ---------------------------------------------------------------------------
const MOU_UNIVERSITIES = [
  { name: 'Universitas Udayana', short: 'UNUD', logo: new URL('../assets/partners/unud.png', import.meta.url).href },
  { name: 'Universitas Negeri Jakarta', short: 'UNJ', logo: new URL('../assets/partners/unj.png', import.meta.url).href },
  { name: 'Universitas Negeri Gorontalo', short: 'UNG', logo: new URL('../assets/partners/ung.png', import.meta.url).href },
  { name: 'UIN Sulthan Thaha Saifuddin Jambi', short: 'UIN', logo: new URL('../assets/partners/uin jambi.png', import.meta.url).href },
  { name: 'Universitas Tanjungpura Pontianak', short: 'UNTAN', logo: new URL('../assets/partners/untan.png', import.meta.url).href },
  { name: 'Universitas Halu Oleo', short: 'UHO', logo: new URL('../assets/partners/uho.png', import.meta.url).href },
  { name: 'Universitas Jember', short: 'UNEJ', logo: new URL('../assets/partners/unej.png', import.meta.url).href },
  { name: 'SEAMEO', short: 'SEAMEO', logo: new URL('../assets/partners/seameo.png', import.meta.url).href },
  { name: 'SEAMEO QITEP in Science', short: 'QITEP', logo: new URL('../assets/partners/qitep.png', import.meta.url).href },
  { name: 'PS.PSL IPB University', short: 'IPB', logo: new URL('../assets/partners/ipb.png', import.meta.url).href },
  { name: 'Universitas Muhammadiyah Riau', short: 'UMRI', logo: new URL('../assets/partners/umri.png', import.meta.url).href },
  { name: 'STKIP Kusuma Negara', short: 'STKIP', logo: new URL('../assets/partners/stkip.png', import.meta.url).href },
  { name: 'Universitas Islam Bandung', short: 'UNISBA', logo: new URL('../assets/partners/unisba.png', import.meta.url).href },
  { name: 'Universitas Negeri Manado', short: 'UNIMA', logo: new URL('../assets/partners/unima.png', import.meta.url).href },
  { name: 'Universitas Negeri Padang', short: 'UNP', logo: new URL('../assets/partners/unp.png', import.meta.url).href },
  { name: 'Universitas Muhammadiyah Sorong', short: 'UNAMIN', logo: new URL('../assets/partners/unamin.png', import.meta.url).href },
  { name: 'Universitas Muhammadiyah Mataram', short: 'UMMAT', logo: new URL('../assets/partners/ummat.png', import.meta.url).href },
  { name: 'ITL Trisakti', short: 'ITL', logo: new URL('../assets/partners/itl.png', import.meta.url).href },
];

const GRANT_RESEARCH_PARTNERS = [
  { name: 'Ford Foundation', short: 'FF', logo: new URL('../assets/partners/FF.png', import.meta.url).href },
  { name: 'Kementerian PPN/Bappenas', short: 'PPN', logo: new URL('../assets/partners/ppn.png', import.meta.url).href },
  { name: 'World Resources Institute', short: 'WRI', logo: new URL('../assets/partners/wri.png', import.meta.url).href },
  { name: 'GIZ', short: 'GIZ', logo: new URL('../assets/partners/giz.png', import.meta.url).href },
];

const MOA_PARTNERS = [
  { name: 'Nusa Digital Creative', short: 'NDC', logo: new URL('../assets/partners/ndc.png', import.meta.url).href },
  { name: 'Penaprolis', short: 'PNP', logo: new URL('../assets/partners/pnp.png', import.meta.url).href },
];

// Grid Bulat untuk Universitas
function PartnerLogoGrid({ partners }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10">
      {partners.map((p) => (
        <div key={p.name} title={p.name} className="shrink-0">
          <div className="w-32 h-32 rounded-full bg-white border border-[#3E2B1F]/20 shadow-md flex items-center justify-center overflow-hidden relative transition-transform duration-300 hover:scale-105">
            {p.logo ? (
              <img
                src={p.logo}
                alt={p.name}
                className="w-full h-full object-contain p-4 relative z-10 bg-white"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            <span className="absolute text-[#3E2B1F] font-headline-md text-base font-bold tracking-wide z-0">{p.short}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Grid Khusus Horizontal Besar (Digunakan untuk Grant Research & MoA Partners)
function HorizontalPartnerLogoGrid({ partners }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-12 max-w-6xl mx-auto px-4">
      {partners.map((p) => (
        <div key={p.name} title={p.name} className="shrink-0 transition-transform duration-300 hover:scale-105">
          {p.logo ? (
            <img
              src={p.logo}
              alt={p.name}
              className="h-24 md:h-32 w-auto max-w-[280px] object-contain bg-transparent"
              onError={(e) => {
                e.target.style.alt = p.short;
              }}
            />
          ) : (
            <span className="text-[#3E2B1F] font-bold text-2xl">{p.short}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Data ahli unggulan cadangan
const FALLBACK_FEATURED_EXPERTS = [
  {
    id: 1,
    slug: 'dr-irman-firmansyah-s-hut-m-si',
    name: 'Dr. Irman Firmansyah, S.Hut, M.Si',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    cover: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
    verified: true,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [kategori, setKategori] = useState('');
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [experts, setExperts] = useState([]);

  const kategoriBoxRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (kategoriBoxRef.current && !kategoriBoxRef.current.contains(e.target)) {
        setKategoriOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const kategoriMatches = SEARCH_CATEGORIES.filter((c) =>
    c.title.toLowerCase().includes(kategori.trim().toLowerCase())
  );

  useEffect(() => {
    api
      .get('/experts', { params: { featured: 1 } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setExperts(data.length > 0 ? data : FALLBACK_FEATURED_EXPERTS);
      })
      .catch(() => {
        setExperts(FALLBACK_FEATURED_EXPERTS);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setKategoriOpen(false);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&kriteria=${encodeURIComponent(kategori)}`);
  };

  return (
    <>
      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-40 overflow-hidden">
        <div
          className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${Background})` }}
        />
        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="relative z-20 text-center px-margin-mobile max-w-4xl mx-auto">
          <h1 className="font-display-lg text-display-lg md:text-[80px] mb-4 drop-shadow-lg">
            <ShinyText
              text="AMDAL.ID"
              speed={2.5}
              delay={0.5}
              color="#ffffff"
              shineColor="#2E5E3B"
              spread={120}
              direction="left"
              pauseOnHover={false}
              yoyo={false}
              className="font-display-lg text-display-lg md:text-[80px]"
            />
          </h1>
          <p className="font-headline-lg text-white/90 max-w-2xl mx-auto uppercase tracking-widest text-sm md:text-base font-semibold">
            Analisis Mengenai Dampak Lingkungan Hidup
          </p>
        </div>

        {/* Search Component */}
        <form onSubmit={handleSearch} className="relative z-30 w-full max-w-[1200px] mt-12 px-margin-mobile">
          <div className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white/20">
            <div className="flex-1 flex items-center px-6 py-2 gap-3 border-r border-outline-variant/30 w-full">
              <span className="material-symbols-outlined text-[#2E5E3B]">search</span>
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
              <span className="material-symbols-outlined text-[#2E5E3B]">location_on</span>
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

            <div className="flex-1 relative flex items-center px-6 py-2 gap-3 w-full" ref={kategoriBoxRef}>
              <span className="material-symbols-outlined text-[#2E5E3B]">category</span>
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
                />
              </div>

              {kategoriOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl z-40 overflow-hidden border border-outline-variant/20">
                  {kategoriMatches.length > 0 ? (
                    kategoriMatches.map((c, i, arr) => (
                      <button
                        key={c.title}
                        type="button"
                        onClick={() => {
                          setKategori(c.title);
                          setKategoriOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-surface-container-low active:bg-surface-container-low transition-colors ${
                          i !== arr.length - 1 ? 'border-b border-outline-variant/20' : ''
                        } ${c.title === kategori ? 'font-semibold text-[#2E5E3B]' : 'text-on-surface'}`}
                      >
                        <c.icon className="w-[18px] h-[18px] text-[#2E5E3B] shrink-0" />
                        {c.title}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-on-surface-variant/60 text-center">
                      Tidak ada saran untuk "{kategori}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#2E5E3B] text-white h-14 px-10 rounded-full flex items-center justify-center gap-2 hover:bg-[#254B30] transition-all active:scale-95 shadow-lg shadow-[#2E5E3B]/20 font-label-md"
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
            <Link to={cat.to} key={cat.title} className="relative h-64 rounded-lg overflow-hidden group cursor-pointer block">
              <img src={cat.img} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className={`absolute inset-0 ${cat.overlay} flex flex-col items-center justify-center text-white p-6`}>
                <cat.Icon className="w-16 h-16 mb-4 drop-shadow-lg" />
                <h3 className="font-headline-md text-xl text-center">{cat.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Layanan Unggulan Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-[#3E2B1F]">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-[#F0E2CE] mb-4">Tenaga Ahli Kajian Lingkungan Hidup Strategis</h2>
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
                    <Link to={`/profil/${expert.slug}`} onClick={(e) => e.stopPropagation()} className="absolute top-4 right-4 bg-[#F0E2CE] hover:bg-white text-xs font-semibold text-[#3E2B1F] rounded-full px-3 py-1.5 shadow">
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
                        <span className="material-symbols-outlined text-[#2E5E3B] text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/member" className="hidden md:flex bg-[#2A1D14]/60 rounded-xl border-2 border-dashed border-[#6B4F3A] items-center justify-center hover:border-[#C9A876] transition-colors">
              <span className="text-[#C9A876] font-label-md">Lihat Ahli Lainnya</span>
            </Link>
            <Link to="/daftar" className="hidden md:flex bg-[#2A1D14]/60 rounded-xl border-2 border-dashed border-[#6B4F3A] items-center justify-center hover:border-[#C9A876] transition-colors">
              <span className="text-[#C9A876] font-label-md">Daftar sebagai Ahli</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Grid Mitra & Universitas */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-white">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-[#3E2B1F] mb-2">Berita Kajian Lingkungan Hidup Strategis</h2>
          </div>

          <div className="space-y-24 mb-16">
            {/* 1. Bagian Universitas */}
            <div>
              <h3 className="text-center font-bold text-2xl md:text-3xl text-[#6B4F3A] mb-8">System Dynamics Center MoU With University</h3>
              <PartnerLogoGrid partners={MOU_UNIVERSITIES} />
            </div>

            {/* 2. Bagian Grant Research */}
            <div>
              <h3 className="text-center font-bold text-2xl md:text-3xl text-[#6B4F3A] mb-8">Grant Research</h3>
              <HorizontalPartnerLogoGrid partners={GRANT_RESEARCH_PARTNERS} />
            </div>

            {/* 3. Bagian MoA Partners */}
            <div>
              <h3 className="text-center font-bold text-2xl md:text-3xl text-[#6B4F3A] mb-8">MoA System Dynamics Center</h3>
              <HorizontalPartnerLogoGrid partners={MOA_PARTNERS} />
            </div>
          </div>

          <div className="text-center">
            <Link to="/pamflet" className="text-[#6B4F3A] font-label-md hover:underline">
              Lihat semua berita &amp; pamflet →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}