import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function PeraturanAMDAL() {
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk menyimpan ID peraturan yang sedang dibuka detailnya
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get('/regulations')
      .then((res) => setRegulations(res.data))
      .catch(() =>
        setRegulations([
          { 
            id: 1, 
            title: 'UU No. 32 Tahun 2009', 
            desc: 'Perlindungan dan Pengelolaan Lingkungan Hidup.',
            detail: 'Undang-Undang ini mengatur tentang upaya sistematis dan terpadu yang dilakukan untuk melestarikan fungsi lingkungan hidup dan mencegah terjadinya pencemaran dan/atau kerusakan lingkungan hidup yang meliputi perencanaan, pemanfaatan, pengendalian, pengawasan, dan penegakan hukum.'
          },
          { 
            id: 2, 
            title: 'PP No. 46 Tahun 2016', 
            desc: 'Tata Cara Penyelenggaraan Kajian Lingkungan Hidup Strategis.',
            detail: 'Peraturan Pemerintah ini mewajibkan Pemerintah Pusat dan Pemerintah Daerah untuk membuat KLHS demi memastikan bahwa prinsip pembangunan berkelanjutan telah menjadi dasar dan terintegrasi dalam pembangunan suatu wilayah dan/atau kebijakan, rencana, dan/atau program.'
          },
          { 
            id: 3, 
            title: 'Permen LHK No. 69 Tahun 2017', 
            desc: 'Pelaksanaan KLHS untuk Rencana Tata Ruang Wilayah.',
            detail: 'Peraturan Menteri ini mengatur secara spesifik mengenai tata cara pemuatan instrumen KLHS ke dalam penyusunan atau evaluasi Rencana Tata Ruang Wilayah (RTRW) tingkat Provinsi maupun Kabupaten/Kota agar selaras dengan daya dukung lingkungan.'
          },
        ])
      )
      .finally(() => setLoading(false));
  }, []);

  // Fungsi untuk handle klik buka/tutup detail
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="relative pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Kotak coklat di belakang navbar — TIDAK DIUBAH */}
      <div className="fixed top-0 left-0 w-full h-20 bg-[#3E2B1F] z-40" />

      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[#006673] bg-[#006673]/10 px-3 py-1 rounded-full mb-4">
          <span className="material-symbols-outlined text-[16px]">balance</span>
          Dasar Hukum
        </span>
        <h1 className="font-headline-lg text-headline-lg text-[#3E2B1F] mb-2">Peraturan AMDAL</h1>
        <p className="text-on-surface-variant">
          Kumpulan dasar hukum dan peraturan terkait Kajian Lingkungan Hidup Strategis yang berlaku di Indonesia.
        </p>
      </div>

      {/* List peraturan */}
      <div className="flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-[#006673]/5 animate-pulse border border-[#006673]/10"
            />
          ))
        ) : regulations.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant border border-dashed border-[#006673]/30 rounded-2xl">
            Belum ada data peraturan.
          </div>
        ) : (
          regulations.map((reg, idx) => {
            const isExpanded = expandedId === reg.id;
            return (
              <div
                key={reg.id}
                onClick={() => toggleExpand(reg.id)} // Seluruh kartu bisa diklik untuk membuka detail
                className={`group relative flex flex-col bg-white p-6 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                  isExpanded 
                    ? 'border-[#006673] shadow-md ring-1 ring-[#006673]/20' 
                    : 'border-[#006673]/15 shadow-sm hover:shadow-md hover:border-[#006673]/40'
                }`}
              >
                {/* Aksen kiri */}
                <span className={`absolute left-0 top-0 h-full w-1 transition-colors duration-200 ${
                  isExpanded ? 'bg-[#006673]' : 'bg-[#3E2B1F] group-hover:bg-[#006673]'
                }`} />

                {/* Baris Utama Card */}
                <div className="flex items-start gap-5 w-full">
                  {/* Ikon */}
                  <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                    isExpanded ? 'bg-[#006673]' : 'bg-[#006673]/10 group-hover:bg-[#006673]'
                  }`}>
                    <span className={`material-symbols-outlined text-[28px] transition-colors duration-200 ${
                      isExpanded ? 'text-white' : 'text-[#006673] group-hover:text-white'
                    }`}>
                      gavel
                    </span>
                  </div>

                  {/* Konten Utama */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#3E2B1F]/60 mb-1">
                      <span>{String(idx + 1).padStart(2, '0')}</span>
                      <span className="w-4 h-px bg-[#3E2B1F]/30" />
                    </div>
                    <h3 className="font-headline-md text-base md:text-lg text-[#3E2B1F] mb-1">
                      {reg.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{reg.desc}</p>
                  </div>

                  {/* Tombol Chevron dengan Animasi Rotasi */}
                  <span className={`material-symbols-outlined text-[24px] self-center transition-all duration-300 ${
                    isExpanded 
                      ? 'text-[#006673] rotate-90 translate-x-0' 
                      : 'text-[#006673]/30 group-hover:text-[#006673] group-hover:translate-x-1'
                  } hidden sm:block`}>
                    chevron_right
                  </span>
                </div>

                {/* Area Detail yang Tersembunyi (Akan meluncur turun saat isExpanded === true) */}
                <div className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-[#006673]/10' : 'grid-rows-[0fr] opacity-0'
                }`}>
                  <div className="overflow-hidden">
                    <div className="bg-[#F8F5F0] p-4 rounded-xl border border-[#3E2B1F]/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#3E2B1F] mb-2">Keterangan Detail:</h4>
                      <p className="text-sm text-[#3E2B1F]/80 leading-relaxed">
                        {reg.detail || 'Tidak ada informasi detail tambahan untuk peraturan ini.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}