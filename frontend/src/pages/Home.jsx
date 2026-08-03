import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { reportReady } = usePageLoading();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [kategori, setKategori] = useState('');
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalExperts, setTotalExperts] = useState(0);
  const [showAll, setShowAll] = useState(false);
  
  const displayLimit = 6;
  const displayedExperts = showAll ? experts : experts.slice(0, displayLimit);

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
    // Fetch tenaga ahli premium/featured
    api
      .get('/experts', { params: { featured: 1, order: 'latest' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];

        // Filter hanya yang punya package_id (premium)
        const premiumExperts = data.filter(exp => exp.package_id || exp.featured);

        if (premiumExperts.length === 0) {
          setExperts(FALLBACK_FEATURED_EXPERTS);
          setTotalExperts(FALLBACK_FEATURED_EXPERTS.length);
        } else {
          setExperts(premiumExperts);
          setTotalExperts(premiumExperts.length);
        }
      })
      .catch(() => {
        setExperts(FALLBACK_FEATURED_EXPERTS);
        setTotalExperts(FALLBACK_FEATURED_EXPERTS.length);
      })
      .finally(() => {
        setLoading(false);
        reportReady();
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
          {/* FIX: leading-[1.25] + pb-2 mencegah descender huruf "g" pada "TenagaAhli.com"
              terpotong akibat line-height yang terlalu ketat pada teks berukuran besar
              yang memakai background-clip: text (efek shiny). */}
          <h1 className="font-display-lg text-display-lg md:text-[80px] mb-4 drop-shadow-lg leading-[1.25] pb-2">
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
              className="font-display-lg text-display-lg md:text-[80px] leading-[1.25]"
            />
          </h1>
          <p className="font-headline-lg text-white/90 max-w-2xl mx-auto uppercase tracking-widest text-sm md:text-base font-semibold">
            {t('Platform pencarian tenaga ahli profesional untuk mendukung kebutuhan konsultasi, penelitian, pelatihan, dan kolaborasi di berbagai bidang.')}
          </p>
        </div>

        {/* Search Component */}
        <form onSubmit={handleSearch} className="relative z-30 w-full max-w-[1200px] mt-12 px-margin-mobile">
          {/* FIX: rounded-full membuat bentuk jadi blob tidak rapi saat flex-col (mobile).
              Sekarang mobile pakai rounded-3xl, desktop (md:) tetap rounded-full seperti semula. */}
          <div className="bg-white/95 backdrop-blur-sm p-2 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white/20">
            <div className="flex-1 flex items-center px-6 py-2 gap-3 border-r border-outline-variant/30 w-full">
              <span className="material-symbols-outlined text-[#0EA5E9]">search</span>
              <div className="flex flex-col flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-1">
                  {t('home.search_keyword', 'Masukan Kata Kunci')}
                </label>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface font-body-md placeholder:text-surface-dim text-sm"
                  placeholder={t('home.search_keyword_placeholder', 'Ahli Kehutanan, Tata Ruang')}
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
                  {t('home.search_location_label', 'Kota/Kabupaten/Provinsi')}
                </label>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface font-body-md placeholder:text-surface-dim text-sm"
                  placeholder={t('Lokasi')}
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
                  {t('home.search_category_label', 'Kriteria Keanggotaan')}
                </label>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface font-body-md placeholder:text-surface-dim text-sm"
                  placeholder={t('home.search_category_placeholder', 'Tenaga Ahli, Narasumber...')}
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
              {t('Cari')}
            </button>
          </div>
        </form>
      </header>

      {/* Kategori Section */}
      <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">{t('Jelajahi Tenaga Ahli')}</h2>
          <p className="text-on-surface-variant">{t('Kategori Keahlian')}</p>
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
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">{t('Tenaga Ahli Terverifikasi')}</h2>
            <p className="text-on-surface-variant">{t('home.verified_experts_desc', 'Telusuri tenaga ahli profesional dari berbagai bidang keahlian yang telah melalui proses verifikasi di TenagaAhli.com.')}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-[#5B6660]">
                <span className="w-6 h-6 rounded-full border-2 border-[#0EA5E9]/30 border-t-[#0EA5E9] animate-spin" />
                <span>{t('Memuat...')}</span>
              </div>
            </div>
          ) : displayedExperts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#F5F4F0] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-[#5B6660]/40">group</span>
              </div>
              <p className="text-on-surface-variant">{t('Tidak ada hasil ditemukan')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedExperts.map((expert) => (
                  <div key={expert.id} className="relative group rounded-xl overflow-hidden shadow-lg bg-white border border-outline-variant/30 hover:shadow-xl transition-shadow">
                    <div className="relative h-64">
                      <img src={expert.cover} alt={expert.name} className="w-full h-full object-cover" />
                      
                      {/* Premium Badge */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-1.5 rounded-lg shadow-lg">
                        <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: '"FILL" 1' }}>workspace_premium</span>
                      </div>

                      {/* Lihat Profil Button */}
                      {expert.slug && (
                        <Link 
                          to={`/profil/${expert.slug}`} 
                          onClick={(e) => e.stopPropagation()} 
                          className="absolute top-4 right-4 bg-[#0EA5E9] hover:bg-[#0284C7] text-xs font-semibold text-white rounded-full px-3 py-1.5 shadow-lg transition-colors"
                        >
                          {t('Lihat Profil')}
                        </Link>
                      )}

                      {/* Expert Info Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-lg">
                            <img src={expert.photo} alt={expert.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-white text-sm font-bold truncate">{expert.name}</span>
                              {expert.verified && (
                                <span className="material-symbols-outlined text-sky-400 text-[16px] shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                              )}
                            </div>
                            {expert.field && (
                              <p className="text-white/80 text-xs truncate">{expert.field}</p>
                            )}
                            {expert.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-white/70 text-[12px]">location_on</span>
                                <span className="text-white/70 text-[10px] truncate">{expert.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Lihat Ahli Lainnya */}
              {totalExperts > displayLimit && (
                <div className="flex justify-center mt-12">
                  {!showAll ? (
                    <button
                      onClick={() => setShowAll(true)}
                      className="flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-[#0EA5E9]/20 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px]">expand_more</span>
                      {t('Selengkapnya')} ({totalExperts - displayLimit})
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAll(false);
                        window.scrollTo({ top: 800, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#0EA5E9] font-semibold px-8 py-3.5 rounded-full border-2 border-[#0EA5E9] transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px]">expand_less</span>
                      {t('Lebih Sedikit')}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}