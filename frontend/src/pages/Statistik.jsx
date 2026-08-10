import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useTranslation } from '../context/LanguageContext.jsx';

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-black/5 shadow-sm ${className}`}>{children}</div>;
}

const getMONTHS = (t) => [
  t('stats.month.jan', 'Jan'), 
  t('stats.month.feb', 'Feb'), 
  t('stats.month.mar', 'Mar'), 
  t('stats.month.apr', 'Apr'), 
  t('stats.month.may', 'Mei'), 
  t('stats.month.jun', 'Jun'), 
  t('stats.month.jul', 'Jul')
];

const getDEMOSTATS = (t) => ({
  totalViews: 1247,
  viewsTrend: '+18%',
  totalClicks: 89,
  clicksTrend: '+12%',
  totalInquiries: 15,
  inquiriesTrend: '+5',
  avgRating: 4.8,
  monthlyViews: [120, 180, 250, 210, 320, 380, 1247],
  topSources: [
    { label: t('stats.source.google_search', 'Pencarian Google'), value: 42, pct: 45 },
    { label: t('stats.source.directory', 'Direktori TenagaAhli'), value: 28, pct: 30 },
    { label: t('stats.source.direct_link', 'Link Langsung'), value: 12, pct: 13 },
    { label: t('stats.source.social_media', 'Media Sosial'), value: 7, pct: 7 },
    { label: t('stats.source.others', 'Lainnya'), value: 5, pct: 5 },
  ],
  popularSections: [
    { label: t('stats.section.profile_summary', 'Ringkasan Profil'), visits: 892, icon: 'person' },
    { label: t('stats.section.education_cert', 'Pendidikan & Sertifikasi'), visits: 654, icon: 'school' },
    { label: t('stats.section.work_experience', 'Pengalaman Kerja'), visits: 523, icon: 'work' },
    { label: t('stats.section.contact_collab', 'Kontak & Kolaborasi'), visits: 312, icon: 'call' },
  ],
});

function MiniBarChart({ data, labels }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative">
            <div
              className="w-full bg-[#0284C7] rounded-t-md transition-all duration-700 hover:bg-[#0369A1]"
              style={{ height: `${(val / max) * 100}px`, minHeight: '4px' }}
              title={`${labels[i]}: ${val}`}
            />
          </div>
          <span className="text-[9px] text-[#414844]/50 font-medium">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Statistik() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7hari');
  const MONTHS = getMONTHS(t);
  const DEMO_STATS = getDEMOSTATS(t);

  // Simulate API call untuk load statistik data
  useEffect(() => {
    const loadStatisticsData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In real app, ini akan jadi:
        // const response = await api.get('/my/statistics');
        // setStatsData(response.data);
      } catch (error) {
        console.error('Error loading statistics:', error);
        // Handle error jika diperlukan
      } finally {
        setLoading(false);
      }
    };

    loadStatisticsData();
  }, [period]); // Reload data when period changes

  // Loading state
  if (loading) {
    return (
      <DashboardLayout 
        title={t('stats.title', 'Statistik & Laporan')} 
        subtitle={t('stats.subtitle', 'Analisis performa profil dan interaksi Anda.')}
      >
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#0284C7]/20 border-t-[#0284C7] rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-[#5B6660] font-medium">{t('stats.loading', 'Memuat data statistik...')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('stats.title', 'Statistik & Laporan')} subtitle={t('stats.subtitle', 'Analisis performa profil dan interaksi Anda.')}>
      <div className="space-y-5 animate-fadeIn">
        {/* Period selector */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: '7hari', label: t('stats.period.7days', '7 Hari') },
            { key: '30hari', label: t('stats.period.30days', '30 Hari') },
            { key: '3bulan', label: t('stats.period.3months', '3 Bulan') },
            { key: 'semua', label: t('stats.period.all_time', 'Semua Waktu') },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                period === p.key
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-white text-[#414844] border border-black/10 hover:bg-[#0284C7]/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: t('stats.kpi.profile_visits', 'Kunjungan Profil'),
              value: DEMO_STATS.totalViews.toLocaleString('id-ID'),
              trend: DEMO_STATS.viewsTrend,
              icon: 'visibility',
              color: '#0284C7',
              bg: '#E0F2FE',
            },
            {
              label: t('stats.kpi.contact_clicks', 'Klik Kontak'),
              value: DEMO_STATS.totalClicks,
              trend: DEMO_STATS.clicksTrend,
              icon: 'touch_app',
              color: '#7C3AED',
              bg: '#EDE9FE',
            },
            {
              label: 'Inquiry Masuk',
              value: DEMO_STATS.totalInquiries,
              trend: DEMO_STATS.inquiriesTrend,
              icon: 'mail',
              color: '#EA580C',
              bg: '#FFF4E6',
            },
            {
              label: 'Rating Rata-rata',
              value: DEMO_STATS.avgRating,
              trend: '⭐',
              icon: 'star',
              color: '#F59E0B',
              bg: '#FFF4D6',
            },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: kpi.bg, color: kpi.color }}
                >
                  <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-[#2E5E3B] bg-[#E3F2E7] px-2 py-0.5 rounded-full">
                  {kpi.trend}
                </span>
              </div>
              <p className="text-2xl font-black text-[#1F2A22] mb-0.5">{kpi.value}</p>
              <p className="text-[10px] text-[#414844]/60 font-medium">{kpi.label}</p>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Monthly Views Chart */}
          <Card className="p-6">
            <h3 className="text-xs font-bold text-[#414844]/60 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#0284C7]">trending_up</span>
              {t('Kunjungan Profil per Bulan')}
            </h3>
            <MiniBarChart data={DEMO_STATS.monthlyViews} labels={MONTHS} />
          </Card>

          {/* Traffic Sources */}
          <Card className="p-6">
            <h3 className="text-xs font-bold text-[#414844]/60 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#0284C7]">pie_chart</span>
              {t('Sumber Pengunjung')}
            </h3>
            <div className="space-y-3">
              {DEMO_STATS.topSources.map((src) => (
                <div key={src.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#1F2A22]">{src.label}</span>
                    <span className="font-bold text-[#414844]/60">{src.pct}%</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0284C7] rounded-full transition-all duration-700"
                      style={{ width: `${src.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Popular Profile Sections */}
        <Card className="p-6">
          <h3 className="text-xs font-bold text-[#414844]/60 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#0284C7]">analytics</span>
            {t('Bagian Profil Paling Banyak Dikunjungi')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {DEMO_STATS.popularSections.map((section, idx) => (
              <div
                key={section.label}
                className="flex items-center gap-3 p-4 rounded-xl border border-black/5 hover:border-[#0284C7]/20 hover:bg-[#0284C7]/3 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1F2A22] truncate">{section.label}</p>
                  <p className="text-lg font-black text-[#0284C7]">{section.visits}</p>
                  <p className="text-[9px] text-[#414844]/50">{t('kunjungan')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tip Banner */}
        <div className="bg-gradient-to-br from-[#E0F2FE] to-[#DBEAFE] rounded-2xl p-6 border border-[#0EA5E9]/20">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-white/80 shrink-0">
              <span className="material-symbols-outlined text-[28px] text-[#0284C7]">tips_and_updates</span>
            </div>
            <div>
              <h3 className="font-bold text-[#075985] text-sm mb-1">{t('Tips Meningkatkan Visibilitas')}</h3>
              <p className="text-xs text-[#0369A1] leading-relaxed">
                {t('Lengkapi semua bagian profil Anda, termasuk sertifikasi dan pengalaman kerja terbaru. Profil yang lengkap mendapat hingga')} <strong>{t('5x lebih banyak kunjungan')}</strong> {t('dibanding profil yang tidak lengkap. Upgrade ke paket')} <strong>{t('Premium')}</strong> {t('untuk tampil prioritas di pencarian!')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
