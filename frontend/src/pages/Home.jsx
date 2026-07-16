import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Background from '../assets/world.jpg';
import ShinyText from '../components/ShinyText';
import { usePageLoading } from '../context/LoadingContext.jsx';

import {
  UserIcon,
  Cog6ToothIcon,
  CheckIcon,
  BookOpenIcon,
} from '@heroicons/react/24/solid';

const categories = [
  {
    // Plain person icon — no badge
    MainIcon: UserIcon,
    BadgeIcon: null,
    title: 'Narasumber/Pembicara',
    overlay: 'bg-black/50 hover:bg-[#0EA5E9]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800',
    to: '/narasumber',
  },
  {
    // Person + gear badge
    MainIcon: UserIcon,
    BadgeIcon: Cog6ToothIcon,
    title: 'Tenaga Ahli',
    overlay: 'bg-black/50 hover:bg-[#0EA5E9]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
    to: '/tenaga-ahli',
  },
  {
    // Person + checkmark badge
    MainIcon: UserIcon,
    BadgeIcon: CheckIcon,
    title: 'Instruktur Pengajar',
    overlay: 'bg-black/50 hover:bg-[#0EA5E9]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1755692879703-d18a213f8691?auto=format&fit=crop&q=80&w=800',
    to: '/instruktur-pengajar',
  },
  {
    // Just the open book icon, no person
    MainIcon: BookOpenIcon,
    BadgeIcon: null,
    title: 'Peneliti Artikel/Jurnal',
    overlay: 'bg-black/50 hover:bg-[#0EA5E9]/70 transition-colors duration-300',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    to: '/peneliti-artikel-jurnal',
  },
];

const SEARCH_CATEGORIES = categories.map((c) => ({
  icon: c.MainIcon,
  title: c.title,
}));

// Data ahli unggulan cadangan (Telah Diperbarui ke Dr. Irman Firmansyah)
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
  const { reportReady } = usePageLoading();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [kategori, setKategori] = useState('');
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

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

        // Memeriksa jika data kosong ATAU data dari API masih mendeteksi nama Iqbal
        const isIqbalData = data.some(exp => exp.name && exp.name.toLowerCase().includes('iqbal'));

        if (data.length === 0 || isIqbalData) {
          setExperts(FALLBACK_FEATURED_EXPERTS);
        } else {
          setExperts(data);
        }
      })
      .catch(() => {
        setExperts(FALLBACK_FEATURED_EXPERTS);
      })
      .finally(() => {
        setLoading(false);
        reportReady(); // lapor ke RouteLoader: data Home sudah siap
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
              text="TenagaAhli.com"
              speed={2.5}
              delay={0.5}
              color="#ffffff"
              shineColor="#0EA5E9"
              spread={120}
              direction="left"
              pauseOnHover={false}
              yoyo={false}
              className="font-display-lg text-display-lg md:text-[80px]"
            />
          </h1>
          <p className="font-headline-lg text-white/90 max-w-2xl mx-auto uppercase tracking-widest text-sm md:text-base font-semibold">
            Platform Pencarian Tenaga Ahli
          </p>
        </div>

        {/* Search Component */}
        <form onSubmit={handleSearch} className="relative z-30 w-full max-w-[1200px] mt-12 px-margin-mobile">
          <div className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white/20">
            <div className="flex-1 flex items-center px-6 py-2 gap-3 border-r border-outline-variant/30 w-full">
              <span className="material-symbols-outlined text-[#0EA5E9]">search</span>
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
              <span className="material-symbols-outlined text-[#0EA5E9]">location_on</span>
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
              <span className="material-symbols-outlined text-[#0EA5E9]">category</span>
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
                        } ${c.title === kategori ? 'font-semibold text-[#0EA5E9]' : 'text-on-surface'}`}
                      >
                        <c.icon className="w-[18px] h-[18px] text-[#0EA5E9] shrink-0" />
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
              className="bg-[#0EA5E9] text-white h-14 px-10 rounded-full flex items-center justify-center gap-2 hover:bg-[#0284C7] transition-all active:scale-95 shadow-lg shadow-[#0EA5E9]/20 font-label-md"
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
                {cat.BadgeIcon ? (
                  <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
                    <cat.MainIcon className="w-full h-full drop-shadow-lg" />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-transparent">
                      <cat.BadgeIcon className="w-5 h-5 drop-shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <cat.MainIcon className="w-14 h-14 mb-4 drop-shadow-lg" />
                )}
                <h3 className="font-headline-md text-xl text-center">{cat.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Layanan Unggulan Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-white">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">Tenaga Ahli Kajian Lingkungan Hidup Strategis</h2>
            <p className="text-on-surface-variant">Telusuri tenaga ahli kajian lingkungan hidup strategis di sekitar anda</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {loading ? null : (
              experts.map((expert) => (
                <div key={expert.id} className="relative group rounded-xl overflow-hidden shadow-lg bg-white border border-outline-variant/30">
                  <div className="relative h-64">
                    <img src={expert.cover} alt={expert.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-1 rounded border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[#0EA5E9] text-sm">bolt</span>
                    </div>
                    {expert.slug && (
                      <Link to={`/profil/${expert.slug}`} onClick={(e) => e.stopPropagation()} className="absolute top-4 right-4 bg-[#0EA5E9] hover:bg-[#0284C7] text-xs font-semibold text-white rounded-full px-3 py-1.5 shadow">
                        Lihat Profil
                      </Link>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shrink-0">
                        <img src={expert.photo} alt={expert.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-white text-xs font-bold truncate">{expert.name}</span>
                        {expert.verified && (
                          <span className="material-symbols-outlined text-[#0EA5E9] text-[14px] shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}