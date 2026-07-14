import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Demo data used only if /api/experts/:slug is unreachable.
const FALLBACK_PROFILE = {
  slug: 'dr-irman-firmansyah-s-hut-m-si',
  name: 'Dr. Irman Firmansyah, S.Hut, M.Si',
  institution: 'PSL - IPB University',
  verified: true,
  activeSince: 2011,
  photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  cover: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1400',
  email: 'irmanf@gmail.com',
  keahlian: ['Ilmu Kehutanan', 'Ilmu Lingkungan', 'System Dynamics', 'Spasial Dynamics'],
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
  narasumber: [
    {
      title: 'Identifikasi materi KRP & analisis pengaruh KLHS RDTR Kec. Selaawi–Banyuresmi',
      penyelenggara: 'Dinas Lingkungan Hidup Kab. Garut',
      tempat: 'Garut',
      tanggal: '15 Nov 2022',
    },
    {
      title: 'Penyepakatan isu pembangunan berkelanjutan strategis KLHS RDTR Kec. Selaawi–Banyuresmi',
      penyelenggara: 'Dinas Lingkungan Hidup Kab. Garut',
      tempat: 'Garut',
      tanggal: '21 Sep 2022',
    },
    {
      title: 'Perumusan isu pembangunan berkelanjutan paling strategis KLHS RDTR Kec. Selaawi–Banyuresmi',
      penyelenggara: 'Dinas Lingkungan Hidup Kab. Garut',
      tempat: 'Garut',
      tanggal: '13 Sep 2022',
    },
  ],
  kajian: [
    {
      title: 'Kajian sistem dinamik untuk KLHS RPJMD Kota Manado',
      tempat: 'Manado',
      tanggal: 'Jun–Agt 2021',
    },
  ],
};

// Helper Fungsi untuk merender Ikon Sosial Media SVG Asli
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

export default function ProfilAhli() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

    // Mengubah penanda lingkaran pada peta menjadi Hijau Gelap (#2E5E3B)
    L.circleMarker([profile.lokasi.lat, profile.lokasi.lng], {
      radius: 9,
      color: '#2E5E3B',
      fillColor: '#2E5E3B',
      fillOpacity: 0.9,
      weight: 3,
    }).addTo(instance);
    return () => instance.remove();
  }, [profile]);

  const yearsActive = useMemo(() => {
    if (!profile) return null;
    return new Date().getFullYear() - (profile.activeSince || new Date().getFullYear());
  }, [profile]);

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
      {/* Hero Background */}
      <div className="relative h-80 md:h-[28rem] w-full overflow-hidden bg-on-background">
        <img src={profile.cover} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        {/* Informasi Profil di Dalam Hero */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-5">
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white object-cover shadow-2xl shrink-0"
              />
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-white break-words drop-shadow-md">
                    {profile.name}
                  </h1>
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/30 shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-green-400">
                        check_circle
                      </span>
                      Verified listing
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm md:text-base mt-1 drop-shadow-sm">{profile.institution}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- TAB / ACTION BAR ---------- */}
      <div className="border-b border-outline-variant/40 sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-sm">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between">
          <nav className="flex">
            {/* Mengubah warna teks & border tab-aktif menjadi hijau gelap #2E5E3B */}
            <span className="font-semibold text-sm text-[#2E5E3B] border-b-2 border-[#2E5E3B] px-4 py-4">
              Profil
            </span>
          </nav>

          <div className="flex items-center gap-2 py-2.5">
            {/* Mengubah bg button email ke hijau gelap #2E5E3B dan hover:bg-[#244B2F] */}
            <a
              href={`mailto:${profile.email}`}
              className="bg-[#2E5E3B] text-white h-9 px-4 rounded-full flex items-center gap-1.5 font-medium text-xs md:text-sm hover:bg-[#244B2F] transition-colors whitespace-nowrap shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>Send an email</span>
            </a>
            <div className="relative shrink-0">
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

      {/* ---------- CONTENT ---------- */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* MAIN */}
        <div className="flex flex-col">
          {/* Profil Data */}
          <section className="pb-8 border-b border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
              Profil Data
            </h2>
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
            </ul>
          </section>

          {/* Keahlian Dasar */}
          <section className="py-8 border-b border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
              Keahlian Dasar
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.keahlian?.map((k) => (
                // Mengubah warna chip keahlian ke warna tema hijau gelap
                <span
                  key={k}
                  className="bg-[#2E5E3B]/10 text-[#2E5E3B] text-sm font-medium px-4 py-1.5 rounded-full"
                >
                  {k}
                </span>
              ))}
            </div>
          </section>

          {/* Pengalaman */}
          {(profile.narasumber?.length > 0 || profile.kajian?.length > 0) && (
            <section className="py-8">
              <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-4">
                Pengalaman
              </h2>

              {profile.narasumber?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-800 mb-3">Narasumber</h3>
                  <ol className="list-decimal list-outside pl-5 flex flex-col gap-2.5">
                    {profile.narasumber.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 leading-relaxed">
                        <span className="text-gray-900 font-medium">{item.title}</span>, {item.penyelenggara}.{' '}
                        {item.tempat}, {item.tanggal}.
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {profile.kajian?.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-3">Kegiatan Kajian</h3>
                  <ol className="list-decimal list-outside pl-5 flex flex-col gap-2.5">
                    {profile.kajian.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 leading-relaxed">
                        <span className="text-gray-900 font-medium">{item.title}</span>. {item.tempat}, {item.tanggal}.
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 self-start">
          {/* Alamat Email */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
              Alamat Email
            </h3>
            {/* Mengubah warna teks link email ke hijau gelap */}
            <a
              href={`mailto:${profile.email}`}
              className="text-[#2E5E3B] text-sm font-medium hover:underline break-all"
            >
              {profile.email}
            </a>
          </div>

          {/* Lokasi */}
          {profile.lokasi && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div id="profil-ahli-map" className="h-40 w-full" />
              <div className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Lokasi
                </h3>
                <p className="text-sm text-gray-800 mb-3 leading-snug">{profile.lokasi.label}</p>
                {/* Mengubah warna teks link 'Get Directions' ke hijau gelap */}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(profile.lokasi.label)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2E5E3B] text-sm font-medium hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">directions</span>
                  Get Directions
                </a>
              </div>
            </div>
          )}

          {/* Sosial Media */}
          {profile.sosial?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                Sosial Media
              </h3>
              <div className="flex gap-2.5">
                {profile.sosial.map((s) => (
                  // Mengubah warna hover background icon sosial media ke hijau gelap
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    title={s.label}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#2E5E3B] hover:text-white text-gray-600 transition-colors"
                  >
                    <SocialIcon type={s.type} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Kriteria Keanggotaan */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
              Kriteria Keanggotaan
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.kriteria?.map((k) => (
                // Mengubah warna hover badge kriteria keanggotaan ke hijau gelap
                <Link
                  key={k.label}
                  to={k.to}
                  className="text-xs bg-gray-100 hover:bg-[#2E5E3B]/10 hover:text-[#2E5E3B] text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {k.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}