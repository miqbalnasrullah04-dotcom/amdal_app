import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import NavbarBackground from '../components/NavbarBackground.jsx';
import { usePageLoading } from '../context/LoadingContext.jsx';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const getOrderOptions = (t) => [
  { value: 'latest', label: t('Terbaru') },
  { value: 'top_rated', label: t('Rating Tertinggi') },
  { value: 'random', label: t('Acak') },
];

const KRITERIA_SUGGESTIONS = [
  'Peneliti Artikel/Jurnal',
  'Narasumber/Pembicara',
  'Tenaga Ahli',
  'Instruktur Pengajar',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutside();
      }
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [ref, onOutside]);
}

const FALLBACK_EXPERTS = [
  {
    id: 1,
    slug: 'prof-dr-wahyu-nugroho-s-si-m-sc',
    name: 'Prof. Dr. Wahyu Nugroho, S.Si., M.Sc.',
    field: 'Peneliti Kualitas Lingkungan',
    kriteria: 'Peneliti Artikel/Jurnal',
    location: 'Bandung',
    lat: -6.9175,
    lng: 107.6191,
    rating: 4.8,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    cover: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
    verified: true,
  },
  {
    id: 2,
    slug: 'dr-maya-anjani-s-t-m-t',
    name: 'Dr. Maya Anjani, S.T., M.T.',
    field: 'Peneliti Jurnal Ilmu Lingkungan',
    kriteria: 'Peneliti Artikel/Jurnal',
    location: 'Semarang',
    lat: -6.9932,
    lng: 110.4203,
    rating: 4.6,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    cover: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&q=80&w=800',
    verified: true,
  },
  {
    id: 3,
    slug: 'dr-fajar-ramadhan-s-hut-m-sc',
    name: 'Dr. Fajar Ramadhan, S.Hut., M.Sc.',
    field: 'Peneliti Artikel Kehutanan & Konservasi',
    kriteria: 'Peneliti Artikel/Jurnal',
    location: 'Surabaya',
    lat: -7.2575,
    lng: 112.7521,
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
    verified: false,
  },
];

export default function PenelitiArtikelJurnal() {
  const { t } = useTranslation();
  const orderOptions = getOrderOptions(t);
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [kriteria, setKriteria] = useState(
    searchParams.get('kategori') || searchParams.get('kriteria') || 'Peneliti Artikel/Jurnal'
  );
  const [kriteriaInput, setKriteriaInput] = useState('');
  const [order, setOrder] = useState(searchParams.get('order') || 'latest');

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { reportReady } = usePageLoading();
  const [activeId, setActiveId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [kriteriaOpen, setKriteriaOpen] = useState(false);
  const [searchAsMove, setSearchAsMove] = useState(false);
  const [visibleBounds, setVisibleBounds] = useState(null);

  const mapWrapperRef = useRef(null);
  const cardRefs = useRef({});
  const kriteriaBoxRef = useRef(null);
  const orderBoxRef = useRef(null);

  useClickOutside(kriteriaBoxRef, () => setKriteriaOpen(false));
  useClickOutside(orderBoxRef, () => setOrderOpen(false));

  const kriteriaMatches = useMemo(
    () =>
      KRITERIA_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(kriteriaInput.trim().toLowerCase())
      ),
    [kriteriaInput]
  );

  useEffect(() => {
    setLoading(true);
    setExperts(FALLBACK_EXPERTS);
    setLoading(false);
    reportReady();
  }, [searchParams]);

  useEffect(() => {
    const instance = L.map('peneliti-artikel-jurnal-map', { zoomControl: false }).setView([-6.9, 107.2], 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(instance);
    setMap(instance);
    return () => instance.remove();
  }, []);

  const filteredExperts = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    const krit = kriteria.trim().toLowerCase();

    return experts.filter((e) => {
      const matchKeyword =
        !kw || e.name?.toLowerCase().includes(kw) || e.field?.toLowerCase().includes(kw);
      const matchLocation = !loc || e.location?.toLowerCase().includes(loc);
      const matchKriteria = !krit || e.kriteria?.toLowerCase().includes(krit);
      const matchBounds =
        !searchAsMove || !visibleBounds || (e.lat && e.lng && visibleBounds.contains([e.lat, e.lng]));
      return matchKeyword && matchLocation && matchKriteria && matchBounds;
    });
  }, [experts, keyword, location, kriteria, searchAsMove, visibleBounds]);

  const sortedExperts = useMemo(() => {
    if (order === 'top_rated') return [...filteredExperts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (order === 'random') return shuffle(filteredExperts);
    return filteredExperts;
  }, [filteredExperts, order]);

  useEffect(() => {
    setActiveIndex(0);
  }, [sortedExperts.length]);

  useEffect(() => {
    if (!map) return;
    markers.forEach((m) => map.removeLayer(m));

    const withCoords = sortedExperts.filter((e) => e.lat && e.lng);
    const next = withCoords.map((e) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:40px;height:40px;border-radius:9999px;border:3px solid #0EA5E9;overflow:hidden;background:#fff">
                 <img src="${e.photo}" style="width:100%;height:100%;object-fit:cover" />
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      const marker = L.marker([e.lat, e.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${e.name}</b><br/><span style="color:#6b7570">${e.field || ''}</span>`);
      marker.on('click', () => {
        setActiveId(e.id);
        setActiveIndex(sortedExperts.findIndex((x) => x.id === e.id));
      });
      return marker;
    });
    setMarkers(next);

    if (withCoords.length && !searchAsMove) {
      map.fitBounds(L.latLngBounds(withCoords.map((e) => [e.lat, e.lng])), {
        padding: [40, 40],
        maxZoom: 9,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedExperts, map]);

  useEffect(() => {
    if (!map) return;
    const handleMoveEnd = () => {
      if (searchAsMove) setVisibleBounds(map.getBounds());
    };
    map.on('moveend', handleMoveEnd);
    if (searchAsMove) setVisibleBounds(map.getBounds());
    return () => map.off('moveend', handleMoveEnd);
  }, [map, searchAsMove]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKriteriaOpen(false);
    setOrderOpen(false);
    setSearchParams({ keyword, location, kriteria, order });
  };

  const handleReset = () => {
    setKeyword('');
    setLocation('');
    setKriteria('Peneliti Artikel/Jurnal');
    setOrder('latest');
    setSearchAsMove(false);
    setSearchParams({});
  };

  const focusExpert = (expert, index) => {
    setActiveId(expert.id);
    setActiveIndex(index);
    cardRefs.current[expert.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (map && expert.lat && expert.lng) {
      map.flyTo([expert.lat, expert.lng], 12, { duration: 0.6 });
      const marker = markers.find(
        (m) => m.getLatLng().lat === expert.lat && m.getLatLng().lng === expert.lng
      );
      marker?.openPopup();
    }
  };

  const goPrev = () => {
    if (!sortedExperts.length) return;
    const nextIndex = (activeIndex - 1 + sortedExperts.length) % sortedExperts.length;
    focusExpert(sortedExperts[nextIndex], nextIndex);
  };

  const goNext = () => {
    if (!sortedExperts.length) return;
    const nextIndex = (activeIndex + 1) % sortedExperts.length;
    focusExpert(sortedExperts[nextIndex], nextIndex);
  };

  const handleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen?.().then(() => setTimeout(() => map?.invalidateSize(), 200));
    } else {
      document.exitFullscreen?.().then(() => setTimeout(() => map?.invalidateSize(), 200));
    }
  };

  const handleLocate = () => {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 13),
      () => alert(t('experts.location_error', 'Tidak bisa mengambil lokasi kamu. Pastikan izin lokasi aktif.'))
    );
  };

  return (
    <div className="min-h-screen bg-white pt-[72px] md:pt-20">
      <NavbarBackground />

      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_1.3fr]">
        {/* ---------- FILTERS ---------- */}
        <aside className="p-6 border-r border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">{t('experts.search_keyword', 'Masukan Kata Kunci')}</label>
              <input
                className="border-b border-gray-300 focus:border-[#0EA5E9] outline-none py-2 text-sm bg-transparent"
                placeholder="Peneliti Kehutanan, Jurnal Lingkungan"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">{t('experts.search_location', 'Kota/Kabupaten/Provinsi')}</label>
              <input
                className="border-b border-gray-300 focus:border-[#0EA5E9] outline-none py-2 text-sm bg-transparent"
                placeholder={t("experts.search_location_placeholder", "Pilih Lokasi")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 relative" ref={kriteriaBoxRef}>
              <label className="text-sm text-gray-500">{t('experts.membership_criteria', 'Kriteria Keanggotaan')}</label>

              {kriteria ? (
                <div className="flex items-center justify-between bg-gray-100 rounded-md px-3 py-2 text-sm">
                  <span>{kriteria}</span>
                  <button
                    type="button"
                    onClick={() => setKriteria('')}
                    className="text-gray-500 hover:text-black"
                    aria-label={t("experts.remove_criteria", "Hapus kriteria")}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <input
                  className="border-b border-gray-300 focus:border-[#0EA5E9] outline-none py-2 text-sm bg-transparent"
                  placeholder={t("experts.criteria_placeholder", "Ketik untuk mencari kriteria...")}
                  value={kriteriaInput}
                  onChange={(e) => setKriteriaInput(e.target.value)}
                  onFocus={() => setKriteriaOpen(true)}
                />
              )}

              {kriteriaOpen && !kriteria && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-md z-10 overflow-hidden">
                  {kriteriaMatches.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setKriteria(s);
                        setKriteriaInput('');
                        setKriteriaOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {s}
                    </button>
                  ))}
                  {kriteriaMatches.length === 0 && (
                    <div className="px-4 py-2 text-xs text-gray-400">{t('experts.no_suggestions', 'Tidak ada saran')}</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 relative" ref={orderBoxRef}>
              <label className="text-sm text-gray-500">{t('Urutkan Berdasarkan')}</label>
              <button
                type="button"
                onClick={() => setOrderOpen((v) => !v)}
                className="flex items-center justify-between border-b border-gray-300 py-2 text-sm font-semibold"
              >
                {orderOptions.find((o) => o.value === order)?.label}
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${orderOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {orderOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-md z-10 overflow-hidden">
                  {orderOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        setOrder(o.value);
                        setOrderOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${order === o.value ? 'font-semibold' : 'text-gray-600'
                        }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />{t('Cari')}</button>
            <button type="button" onClick={handleReset} className="text-gray-500 text-sm underline flex items-center gap-1 justify-center">
              <ArrowPathIcon className="w-4 h-4" />{t('Reset Filter')}</button>
          </form>
        </aside>

        {/* ---------- RESULTS ---------- */}
        <section className="border-r border-gray-200 overflow-y-auto max-h-[calc(100vh-72px)] md:max-h-[calc(100vh-80px)]">
          <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10 border-b border-gray-100">
            <button onClick={goPrev} className="p-2 disabled:opacity-30" disabled={!sortedExperts.length}>
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-sm">
              {t('Menampilkan')} <b>{sortedExperts.length}</b> {t('hasil')}
            </span>
            <button onClick={goNext} className="p-2 disabled:opacity-30" disabled={!sortedExperts.length}>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {!loading && sortedExperts.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-16 px-6">
              Tidak ada peneliti artikel/jurnal yang cocok.
              <br />
              {t('experts.try_change_keywords', 'Coba ubah kata kunci atau filter lokasi.')}
            </div>
          )}

          <div className="flex flex-col gap-4 p-6">
            {loading ? null : (
              sortedExperts.map((expert, index) => (
                <div
                  key={expert.id}
                  ref={(el) => (cardRefs.current[expert.id] = el)}
                  onClick={() => focusExpert(expert, index)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-colors ${activeId === expert.id ? 'border-[#0EA5E9]' : 'border-transparent'
                    }`}
                >
                  <img src={expert.cover} alt={expert.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 rounded-md p-1.5">
                    <BoltIcon className="w-4 h-4 text-[#0EA5E9]" />
                  </div>
                  {expert.slug && (
                    <Link
                      to={`/profil/${expert.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-xs font-semibold text-[#0284C7] rounded-full px-3 py-1.5"
                    >{t('Lihat Profil')}</Link>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center gap-2">
                    <img
                      src={expert.photo}
                      alt={expert.name}
                      className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    />
                    <span className="text-white font-bold text-sm">{expert.name}</span>
                    {expert.verified && <CheckBadgeIcon className="w-5 h-5 text-sky-400" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ---------- MAP ---------- */}
        <div
          ref={mapWrapperRef}
          className="hidden lg:block relative isolate z-0 sticky top-[72px] md:top-20 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden"
        >
          <div id="peneliti-artikel-jurnal-map" className="absolute inset-0" />

          <label className="absolute top-4 left-4 z-[1000] bg-white rounded-md px-3 py-2 flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-[#0EA5E9]"
              checked={searchAsMove}
              onChange={(e) => setSearchAsMove(e.target.checked)}
            />
            {t('Cari saat peta digeser')}
          </label>

          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button onClick={() => map?.zoomIn()} className="bg-white rounded-md w-9 h-9 flex items-center justify-center">
              <PlusIcon className="w-4 h-4" />
            </button>
            <button onClick={() => map?.zoomOut()} className="bg-white rounded-md w-9 h-9 flex items-center justify-center">
              <MinusIcon className="w-4 h-4" />
            </button>
            <button onClick={handleFullscreen} className="bg-white rounded-md w-9 h-9 flex items-center justify-center">
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
            <button onClick={handleLocate} className="bg-white rounded-md w-9 h-9 flex items-center justify-center">
              <MapPinIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}