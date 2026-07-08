import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';

// Lazy-loaded so Leaflet's CSS/JS only ships to the bundle that needs it.
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
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const ORDER_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'top_rated', label: 'Top rated' },
  { value: 'random', label: 'Random' },
];

// Same categories used on the Home page's "Cari Tenaga Ahli" grid — kept as
// suggestions, but the field stays free text so people can type anything else.
const KRITERIA_SUGGESTIONS = [
  'Narasumber/Pembicara',
  'Tenaga Ahli',
  'Instruktur Pengajar',
  'Peneliti Artikel/Jurnal',
];

// Suggestions for the location field — kept as free text so people can still
// type anything (kecamatan, dsb) that isn't in this shortlist.
const LOCATION_SUGGESTIONS = [
  'Jakarta',
  'Bogor',
  'Depok',
  'Tangerang',
  'Bekasi',
  'Bandung',
  'Surabaya',
  'Semarang',
  'Yogyakarta',
  'Medan',
];

// Fisher-Yates, so "Random" doesn't just re-sort by insertion order every render.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Used only if /api/experts is unreachable, so the page is still demoable.
const FALLBACK_EXPERTS = [
  {
    id: 1,
    slug: 'dr-irman-firmansyah-s-hut-m-si',
    name: 'Dr. Irman Firmansyah, S.Hut, M.Si',
    field: 'Ahli Kehutanan & Tata Ruang',
    kriteria: 'Narasumber/Pembicara',
    location: 'Bogor',
    lat: -6.5971,
    lng: 106.806,
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    cover: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
    verified: true,
  },
  {
    id: 2,
    slug: 'ir-nurul-hidayah-m-t',
    name: 'Ir. Nurul Hidayah, M.T.',
    field: 'Ahli Kualitas Udara & Kebisingan',
    kriteria: 'Tenaga Ahli',
    location: 'Depok',
    lat: -6.4025,
    lng: 106.7942,
    rating: 4.7,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    cover: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&q=80&w=800',
    verified: true,
  },
  {
    id: 3,
    slug: 'dr-agus-purnomo-s-si-m-env',
    name: 'Dr. Agus Purnomo, S.Si, M.Env',
    field: 'Ahli Hidrologi & Kualitas Air',
    kriteria: 'Instruktur Pengajar',
    location: 'Jakarta',
    lat: -6.2088,
    lng: 106.8456,
    rating: 5.0,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
    verified: false,
  },
  {
    id: 4,
    slug: 'dr-iqbal-nasrullah-s-si-m-env',
    name: 'Dr. iqbal nasrullah, S.Si, M.Env',
    field: 'Ahli Hidrologi & Kualitas Air',
    kriteria: 'Peneliti Artikel/Jurnal',
    location: 'Surabaya',
    lat: -7.2463,
    lng: 112.7378,
    rating: 5.0,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
    verified: false,
  },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [kriteria, setKriteria] = useState(searchParams.get('kriteria') || '');
  const [order, setOrder] = useState(searchParams.get('order') || 'latest');

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [kriteriaOpen, setKriteriaOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchAsMove, setSearchAsMove] = useState(false);
  const [visibleBounds, setVisibleBounds] = useState(null);

  const mapWrapperRef = useRef(null);
  const cardRefs = useRef({});

  // Keep the form fields in sync with the URL even when React Router doesn't
  // remount this component — e.g. navigating here again from the Home hero
  // search with a different category. Without this, the inputs would still
  // show whatever was typed the last time this page was open.
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setLocation(searchParams.get('location') || '');
    setKriteria(searchParams.get('kriteria') || '');
    setOrder(searchParams.get('order') || 'latest');
  }, [searchParams]);

  const kriteriaMatches = useMemo(
    () =>
      KRITERIA_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(kriteria.trim().toLowerCase())
      ),
    [kriteria]
  );

  const locationMatches = useMemo(
    () =>
      LOCATION_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(location.trim().toLowerCase())
      ),
    [location]
  );

  // Fetch results whenever the URL query changes (so links/back-button work).
  useEffect(() => {
    setLoading(true);
    api
      .get('/experts', {
        params: {
          keyword: searchParams.get('keyword') || '',
          location: searchParams.get('location') || '',
          kriteria: searchParams.get('kriteria') || '',
          order: searchParams.get('order') || 'latest',
        },
      })
      .then((res) => {
        setExperts(res.data && res.data.length > 0 ? res.data : FALLBACK_EXPERTS);
      })
      .catch(() => setExperts(FALLBACK_EXPERTS))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Init Leaflet map once — CARTO light basemap, no default zoom control (we draw our own).
  useEffect(() => {
    const instance = L.map('search-map', { zoomControl: false }).setView([-6.9, 107.2], 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(instance);
    setMap(instance);
    return () => instance.remove();
  }, []);

  // Client-side filtering — works whether `experts` came from the real API
  // or from FALLBACK_EXPERTS, so the three fields always actually do something.
  const filteredExperts = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    const krit = kriteria.trim().toLowerCase();

    return experts.filter((e) => {
      const matchKeyword =
        !kw ||
        e.name?.toLowerCase().includes(kw) ||
        e.field?.toLowerCase().includes(kw);

      const matchLocation =
        !loc || e.location?.toLowerCase().includes(loc);

      const matchKriteria =
        !krit || e.kriteria?.toLowerCase().includes(krit);

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

  // Sync markers whenever the (filtered + sorted) result list changes.
  useEffect(() => {
    if (!map) return;
    markers.forEach((m) => map.removeLayer(m));

    const withCoords = sortedExperts.filter((e) => e.lat && e.lng);
    const next = withCoords.map((e) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:40px;height:40px;border-radius:9999px;border:3px solid #1FA774;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,.3);background:#fff">
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
      map.fitBounds(
        L.latLngBounds(withCoords.map((e) => [e.lat, e.lng])),
        { padding: [40, 40], maxZoom: 9 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedExperts, map]);

  // "Search as I move the map" — re-filter results to whatever's in view.
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
    setSearchParams({ keyword, location, kriteria, order });
  };

  const handleReset = () => {
    setKeyword('');
    setLocation('');
    setKriteria('');
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
      () => alert('Tidak bisa mengambil lokasi kamu. Pastikan izin lokasi aktif.')
    );
  };

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-[280px_1fr_1.3fr] min-h-screen pt-20">
      <div className="fixed top-0 left-0 w-full h-20 bg-[#3E2B1F] z-40" />

      {/* ---------- FILTERS ---------- */}
      <aside className="border-r border-outline-variant/30 bg-white p-6 overflow-y-auto">
        <h2 className="font-label-md uppercase tracking-widest text-on-surface-variant mb-5">
          Cari Tenaga Ahli
        </h2>

        <form onSubmit={handleSearch} className="flex flex-col gap-5">
          {/* --- INPUT KATA KUNCI (DESAIN BARU) --- */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Masukan Kata Kunci
            </label>
            <div className="flex items-center gap-2 border-b-2 border-outline-variant/40 focus-within:border-primary px-1 py-2 transition-colors">
              <MagnifyingGlassIcon className="w-[18px] h-[18px] text-primary" />
              <input
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface placeholder:text-surface-dim outline-none"
                placeholder="Ahli Kehutanan, Tata Ruang"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* --- INPUT LOKASI --- */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Kota/Kabupaten/Provinsi
            </label>
            <div className="flex items-center gap-2 border-b-2 border-outline-variant/40 focus-within:border-primary px-1 py-2 transition-colors">
              <MapPinIcon className="w-[18px] h-[18px] text-primary" />
              <input
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface placeholder:text-surface-dim outline-none"
                placeholder="Ketik untuk memilih lokasi..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setLocationOpen(true)}
                onBlur={() => setTimeout(() => setLocationOpen(false), 150)}
              />
            </div>

            {locationOpen && locationMatches.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border-b-2 border-primary rounded-t-lg shadow-lg z-10 overflow-hidden">
                {locationMatches.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setLocation(s);
                      setLocationOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors ${
                      i !== locationMatches.length - 1 ? 'border-b border-outline-variant/20' : ''
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- INPUT KRITERIA KEANGGOTAAN --- */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Kriteria Keanggotaan
            </label>
            <input
              type="text"
              className="border-b-2 border-outline-variant/40 focus:border-primary px-1 py-2 text-sm text-on-surface bg-transparent outline-none transition-colors"
              placeholder="Ketik untuk mencari kriteria..."
              value={kriteria}
              onChange={(e) => setKriteria(e.target.value)}
              onFocus={() => setKriteriaOpen(true)}
              onBlur={() => setTimeout(() => setKriteriaOpen(false), 150)}
            />

            {kriteriaOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border-b-2 border-primary rounded-t-lg shadow-lg z-10 overflow-hidden">
                <div className="px-4 py-3 text-xs text-on-surface-variant/60 text-center">
                  {kriteria.trim() ? 'Searching...' : 'Ketik kata kunci kriteria'}
                </div>
                {kriteriaMatches.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setKriteria(s);
                      setKriteriaOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors ${
                      i !== kriteriaMatches.length - 1 ? 'border-b border-outline-variant/20' : ''
                    }`}
                  >
                    {s}
                  </button>
                ))}
                {kriteria.trim() && kriteriaMatches.length === 0 && (
                  <div className="px-4 py-3 text-xs text-on-surface-variant/60 text-center border-t border-outline-variant/20">
                    Tidak ada saran, tekan Search untuk mencari “{kriteria}”
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- ORDER BY --- */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Order by
            </label>
            <button
              type="button"
              onClick={() => setOrderOpen((v) => !v)}
              onBlur={() => setTimeout(() => setOrderOpen(false), 120)}
              className="flex items-center justify-between border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface bg-transparent"
            >
              <span className="font-semibold">
                {ORDER_OPTIONS.find((o) => o.value === order)?.label}
              </span>
              <ChevronDownIcon
                className={`w-[18px] h-[18px] text-on-surface-variant transition-transform ${orderOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {orderOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-outline-variant/30 rounded-lg shadow-lg z-10 overflow-hidden">
                {ORDER_OPTIONS.map((o, i) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      setOrder(o.value);
                      setOrderOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-surface-container-low transition-colors ${
                      i !== ORDER_OPTIONS.length - 1 ? 'border-b border-outline-variant/20' : ''
                    } ${order === o.value ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-[#006673] hover:bg-[#00505a] text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-on-surface-variant text-sm underline flex items-center gap-1 justify-center"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Reset Filters
          </button>
        </form>
      </aside>

      {/* ---------- RESULTS ---------- */}
      <section className="border-r border-outline-variant/30 overflow-y-auto max-h-[calc(100vh-80px)]">
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10 border-b border-outline-variant/20">
          <button onClick={goPrev} className="p-2 disabled:opacity-30" disabled={!sortedExperts.length}>
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-sm text-on-background">
            Showing <b className="text-primary">{sortedExperts.length}</b> result
          </span>
          <button onClick={goNext} className="p-2 disabled:opacity-30" disabled={!sortedExperts.length}>
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <p className="text-on-surface-variant text-sm p-6">Memuat hasil...</p>
        )}

        {!loading && sortedExperts.length === 0 && (
          <div className="text-center text-on-surface-variant text-sm py-16 px-6">
            Tidak ada tenaga ahli yang cocok.
            <br />
            Coba ubah kata kunci atau filter lokasi.
          </div>
        )}

        <div className="flex flex-col gap-4 p-6">
          {sortedExperts.map((expert, index) => (
            <div
              key={expert.id}
              ref={(el) => (cardRefs.current[expert.id] = el)}
              onClick={() => focusExpert(expert, index)}
              className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-colors ${
                activeId === expert.id ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img src={expert.cover} alt={expert.name} className="w-full h-48 object-cover" />
              <div className="absolute top-3 left-3 bg-white/90 rounded-md p-1.5 shadow">
                <BoltIcon className="w-4 h-4 text-primary" />
              </div>
              {expert.slug && (
                <Link
                  to={`/profil/${expert.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-xs font-semibold text-primary rounded-full px-3 py-1.5 shadow"
                >
                  Lihat Profil
                </Link>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center gap-2">
                <img
                  src={expert.photo}
                  alt={expert.name}
                  className="w-9 h-9 rounded-full border-2 border-white object-cover"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm truncate">{expert.name}</span>
                    {expert.verified && <CheckBadgeIcon className="w-5 h-5 text-emerald-400 flex-none" />}
                  </div>
                  <p className="text-white/80 text-[11px] truncate">
                    {expert.field}
                    {expert.location && <span> · {expert.location}</span>}
                    {expert.rating && <span className="ml-2">⭐ {expert.rating}</span>}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- MAP ---------- */}
      <div
        ref={mapWrapperRef}
        className="hidden lg:block relative isolate sticky top-20 h-[calc(100vh-80px)] overflow-hidden"
      >
        <div id="search-map" className="absolute inset-0" />

        <label className="absolute top-4 left-4 z-[1000] bg-white shadow rounded-md px-3 py-2 flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={searchAsMove}
            onChange={(e) => setSearchAsMove(e.target.checked)}
          />
          Search as I move the map
        </label>

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button onClick={() => map?.zoomIn()} className="bg-white shadow rounded-md w-9 h-9 flex items-center justify-center">
            <PlusIcon className="w-4 h-4" />
          </button>
          <button onClick={() => map?.zoomOut()} className="bg-white shadow rounded-md w-9 h-9 flex items-center justify-center">
            <MinusIcon className="w-4 h-4" />
          </button>
          <button onClick={handleFullscreen} className="bg-white shadow rounded-md w-9 h-9 flex items-center justify-center">
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
          <button onClick={handleLocate} className="bg-white shadow rounded-md w-9 h-9 flex items-center justify-center">
            <MapPinIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}