import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Pamflet() {
  const [items, setItems] = useState([]);
  // State untuk menyimpan data item yang sedang di-preview di modal
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    api
      .get('/pamflet')
      .then((res) => setItems(res.data))
      .catch(() =>
        setItems([
          {
            id: 1,
            title: 'Sosialisasi AMDAL 2026',
            img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=900',
          },
          {
            id: 2,
            title: 'Workshop Tenaga Ahli AMDAL',
            img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=900',
          },
          {
            id: 3,
            title: 'Panduan Pendaftaran Member',
            img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=900',
          },
        ])
      );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background Navbar — Disamakan ke Biru Gradasi Search */}
      <div className="fixed top-0 left-0 w-full h-20 md:h-[88px] bg-gradient-to-r from-[#0369A1] via-[#0EA5E9] to-[#0284C7] z-40 shadow-sm" />

      {/* Hero — Menggunakan Gradasi Tema Biru */}
      <section className="pt-36 pb-20 bg-gradient-to-b from-[#0369A1] via-[#0284C7] to-[#0EA5E9]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Label diubah menjadi aksen biru semi-transparan */}
          <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white border border-white/40 text-sm font-semibold mb-5">
            Informasi Terbaru
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Pamflet</h1>
          <p className="text-sky-100 text-lg leading-8 max-w-3xl">
            Berbagai informasi mengenai sosialisasi, pelatihan, seminar, workshop, pengumuman, dan kegiatan terbaru
            seputar AMDAL.
          </p>
        </div>
      </section>

      {/* Galeri Pamflet */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImg(item)}
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                shadow-lg
                cursor-pointer
                hover:-translate-y-2
                hover:shadow-2xl
                transition-all
                duration-500
              "
            >
              <img
                src={item.img}
                alt={item.title}
                className="
                  w-full
                  h-[520px]
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-110
                "
              />

              {/* Overlay + Teks Judul */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition duration-500 flex flex-col justify-end p-6">
                <div className="w-full">
                  {/* Label PAMFLET diubah ke warna biru tema #0EA5E9 */}
                  <span className="inline-block bg-[#0EA5E9] text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    PAMFLET
                  </span>
                  <h2 className="text-2xl font-bold text-white leading-snug drop-shadow-lg">
                    {item.title}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- MODAL PREVIEW (LIGHTBOX) --- */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedImg(null)}
        >
          {/* Tombol Close */}
          <button
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition"
            onClick={() => setSelectedImg(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Konten Gambar Modal — Background diubah dari cokelat ke slate gelap/biru tua */}
          <div
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-slate-900 p-2 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImg.img}
              alt={selectedImg.title}
              className="max-h-[70vh] w-auto object-contain rounded-xl mx-auto"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-bold text-white">{selectedImg.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}