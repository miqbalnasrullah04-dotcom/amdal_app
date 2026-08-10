import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';

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

function getAvatarColor(name) {
  const colors = ['#0284C7', '#EA580C', '#7C3AED', '#059669', '#DC2626', '#D97706'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function Ulasan() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [replyText, setReplyText] = useState({});
  const [sendingReply, setSendingReply] = useState({});

  const loadReviews = () => {
    setLoading(true);
    setError('');
    api
      .get('/my/reviews')
      .then((res) => {
        setReviews(res.data.data || []);
        setAvgRating(res.data.avg_rating || 0);
      })
      .catch((err) => {
        setError(err.response?.data?.message || t('review.error.load_failed', 'Gagal memuat data ulasan.'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;

    setSendingReply((prev) => ({ ...prev, [reviewId]: true }));

    try {
      await api.post(`/my/reviews/${reviewId}/reply`, { balasan: text });
      loadReviews();
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (err) {
      alert(err.response?.data?.message || t('review.error.reply_failed', 'Gagal mengirim balasan.'));
    } finally {
      setSendingReply((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleDeleteReply = async (reviewId) => {
    if (!confirm(t('review.confirm.delete_reply', 'Hapus balasan ini?'))) return;

    try {
      await api.delete(`/my/reviews/${reviewId}/reply`);
      loadReviews();
    } catch (err) {
      alert(err.response?.data?.message || t('review.error.delete_failed', 'Gagal menghapus balasan.'));
    }
  };

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    pct: reviews.length ? (reviews.filter((rev) => rev.rating === r).length / reviews.length) * 100 : 0,
  }));

  const filteredReviews = filterRating === 0 ? reviews : reviews.filter((r) => r.rating === filterRating);

  return (
    <DashboardLayout title={t('Ulasan & Rating')} subtitle={t('Lihat feedback dan penilaian dari klien Anda.')}>
      {error && (
        <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm rounded-xl p-4 flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-5 animate-fadeIn">
        {/* Summary Row */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0284C7]/20 border-t-[#0284C7] mx-auto"></div>
            </Card>
            <Card className="p-12 md:col-span-2 text-center">
              <p className="text-sm text-[#414844]/60">Memuat data ulasan...</p>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <p className="text-4xl font-black text-[#1F2A22] mb-1">{avgRating}</p>
              <StarRating rating={Math.round(avgRating)} size={22} />
              <p className="text-xs text-[#414844]/60 mt-2">{reviews.length} {t('ulasan total')}</p>
            </Card>

            <Card className="p-6 md:col-span-2">
              <h3 className="text-xs font-bold text-[#414844]/60 uppercase tracking-wider mb-3">{t('Distribusi Rating')}</h3>
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
        )}

        {/* Filter pills */}
        {!loading && reviews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterRating(0)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                filterRating === 0
                  ? 'bg-[#0284C7] text-white'
                  : 'bg-[#0284C7]/5 text-[#414844] hover:bg-[#0284C7]/10'
              }`}
            >
              {t('Semua')} ({reviews.length})
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
        )}

        {/* Review Cards */}
        {!loading && filteredReviews.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="material-symbols-outlined text-[56px] text-[#F59E0B]/20 mb-3 block">star</span>
            <h3 className="text-base font-bold text-[#1F2A22] mb-1">{t('Tidak ada ulasan')}</h3>
            <p className="text-sm text-[#414844]/60">
              {filterRating > 0
                ? t('Belum ada ulasan dengan rating ini.')
                : t('Belum ada ulasan. Berikan layanan terbaik untuk mendapatkan ulasan dari klien!')}
            </p>
          </Card>
        ) : !loading ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const avatarColor = getAvatarColor(review.nama);
              const avatarInitial = review.nama?.charAt(0).toUpperCase() || '?';
              const showReplyForm = !review.balasan;

              return (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {avatarInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-sm text-[#1F2A22]">{review.nama}</h4>
                        <span className="text-[10px] text-[#414844]/50">{formatDate(review.tanggal)}</span>
                      </div>
                      <StarRating rating={review.rating} size={16} />
                      <p className="text-sm text-[#414844] leading-relaxed mt-3">{review.komentar}</p>

                      {review.balasan && (
                        <div className="mt-3 bg-[#F5F4EF] rounded-xl p-3 border border-black/5">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">reply</span>
                              {t('Balasan Anda')}
                            </p>
                            <button
                              onClick={() => handleDeleteReply(review.id)}
                              className="text-[10px] text-[#B3261E] hover:underline font-bold flex items-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[12px]">delete</span>
                              Hapus
                            </button>
                          </div>
                          <p className="text-xs text-[#414844] leading-relaxed">{review.balasan}</p>
                          {review.replied_at && (
                            <p className="text-[9px] text-[#414844]/50 mt-1">
                              Dibalas {formatDate(review.replied_at)}
                            </p>
                          )}
                        </div>
                      )}

                      {showReplyForm && (
                        <div className="mt-3 border-t border-black/5 pt-3">
                          <p className="text-[10px] font-bold text-[#414844]/60 uppercase tracking-wider mb-2">
                            {t('Balas Ulasan Ini')}
                          </p>
                          <div className="flex gap-2">
                            <textarea
                              rows={2}
                              value={replyText[review.id] || ''}
                              onChange={(e) => setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))}
                              placeholder={t('Tulis balasan Anda...')}
                              className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] transition-all resize-none"
                            />
                            <button
                              onClick={() => handleReply(review.id)}
                              disabled={sendingReply[review.id] || !(replyText[review.id] || '').trim()}
                              className="bg-[#0284C7] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#0369A1] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#0284C7]/15 h-fit flex items-center gap-1"
                            >
                              {sendingReply[review.id] ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  {t('Kirim...')}
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[14px]">send</span>
                                  {t('Kirim')}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
