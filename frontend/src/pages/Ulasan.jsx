import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useTranslation } from '../context/LanguageContext.jsx';

const DEMO_REVIEWS = [
  {
    id: 1,
    klien: 'PT Bangun Nusantara',
    avatar: 'B',
    avatarColor: '#0284C7',
    rating: 5,
    proyek: 'Konsultasi Analisis Dampak Lingkungan',
    tanggal: '2026-07-20',
    komentar:
      'Sangat profesional dan detail dalam menganalisis dampak lingkungan proyek kami. Dokumentasi lengkap dan komunikasi sangat baik selama proses berlangsung.',
    balasan: 'Terima kasih atas kepercayaannya. Semoga proyek berjalan lancar!',
  },
  {
    id: 2,
    klien: 'Dinas LH Kota Bogor',
    avatar: 'D',
    avatarColor: '#EA580C',
    rating: 4,
    proyek: 'Pelatihan Manajemen Lingkungan',
    tanggal: '2026-07-05',
    komentar:
      'Materi pelatihan sangat relevan dan penyampaiannya mudah dipahami oleh staf kami. Hanya saja jadwal agak ketat.',
    balasan: null,
  },
  {
    id: 3,
    klien: 'CV Maju Bersama',
    avatar: 'M',
    avatarColor: '#7C3AED',
    rating: 5,
    proyek: 'Penyusunan Dokumen AMDAL',
    tanggal: '2026-06-15',
    komentar:
      'Dokumen AMDAL yang disusun sangat komprehensif. Proses perizinan kami jadi lebih cepat berkat dokumen yang lengkap.',
    balasan: 'Senang bisa membantu. Jangan ragu untuk menghubungi kami jika ada kebutuhan lain!',
  },
];

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-black/5 shadow-sm ${className}`}>{children}</div>;
}

function StarRating({ rating, size = 18 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="material-symbols-outlined"
          style={{
            fontSize: `${size}px`,
            color: star <= rating ? '#F59E0B' : '#D1D5DB',
            fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function Ulasan() {
  const [reviews] = useState(DEMO_REVIEWS);
  const [filterRating, setFilterRating] = useState(0); // 0 = semua

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    pct: reviews.length ? (reviews.filter((rev) => rev.rating === r).length / reviews.length) * 100 : 0,
  }));

  const filteredReviews = filterRating === 0 ? reviews : reviews.filter((r) => r.rating === filterRating);

  return (
    <DashboardLayout title={t('auto_ulasan_rating', 'Ulasan & Rating')} subtitle="Lihat feedback dan penilaian dari klien Anda.">
      <div className="space-y-5 animate-fadeIn">
        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Average Rating */}
          <Card className="p-6 flex flex-col items-center justify-center text-center">
            <p className="text-4xl font-black text-[#1F2A22] mb-1">{avgRating}</p>
            <StarRating rating={Math.round(avgRating)} size={22} />
            <p className="text-xs text-[#414844]/60 mt-2">{reviews.length}  {t('auto_ulasan_total', 'ulasan total')}</p>
          </Card>

          {/* Rating Distribution */}
          <Card className="p-6 md:col-span-2">
            <h3 className="text-xs font-bold text-[#414844]/60 uppercase tracking-wider mb-3">{t('auto_distribusi_rating', 'Distribusi Rating')}</h3>
            <div className="space-y-2">
              {ratingDist.map((d) => (
                <button
                  key={d.star}
                  onClick={() => setFilterRating(filterRating === d.star ? 0 : d.star)}
                  className={`w-full flex items-center gap-3 py-1 rounded-lg transition-colors ${
                    filterRating === d.star ? 'bg-[#FFF4D6]/60' : 'hover:bg-black/2'
                  }`}
                >
                  <span className="text-xs font-bold text-[#414844] w-4 text-right">{d.star}</span>
                  <span className="material-symbols-outlined text-[14px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <div className="flex-1 h-2.5 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#414844]/60 w-8 text-right">{d.count}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterRating(0)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              filterRating === 0
                ? 'bg-[#0284C7] text-white'
                : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
            }`}
          >
            
                                  {t('auto_semua', 'Semua (')}{reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((r) => {
            const cnt = reviews.filter((rev) => rev.rating === r).length;
            if (cnt === 0) return null;
            return (
              <button
                key={r}
                onClick={() => setFilterRating(filterRating === r ? 0 : r)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${
                  filterRating === r
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
                }`}
              >
                {r} <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> ({cnt})
              </button>
            );
          })}
        </div>

        {/* Review Cards */}
        {filteredReviews.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="material-symbols-outlined text-[56px] text-[#F59E0B]/20 mb-3 block">star</span>
            <h3 className="text-base font-bold text-[#1F2A22] mb-1">{t('auto_tidak_ada_ulasan', 'Tidak ada ulasan')}</h3>
            <p className="text-sm text-[#414844]/60">
              
                                        {t('auto_belum_ada_ulasan_den', 'Belum ada ulasan dengan rating ini. Berikan layanan terbaik untuk mendapatkan ulasan dari klien!')}
                                      </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: review.avatarColor }}
                  >
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-sm text-[#1F2A22]">{review.klien}</h4>
                      <span className="text-[10px] text-[#414844]/50">{formatDate(review.tanggal)}</span>
                    </div>
                    <StarRating rating={review.rating} size={16} />
                    <p className="text-[10px] text-[#0284C7] font-medium mt-1 mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">work</span>
                      {review.proyek}
                    </p>
                    <p className="text-sm text-[#414844] leading-relaxed">{review.komentar}</p>

                    {review.balasan && (
                      <div className="mt-3 bg-[#F5F4EF] rounded-xl p-3 border border-black/5">
                        <p className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">reply</span>
                          
                                                                  {t('auto_balasan_anda', 'Balasan Anda')}
                                                                </p>
                        <p className="text-xs text-[#414844] leading-relaxed">{review.balasan}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
