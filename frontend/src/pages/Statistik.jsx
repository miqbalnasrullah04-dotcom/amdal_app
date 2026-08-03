import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useTranslation } from '../context/LanguageContext.jsx';

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-black/5 shadow-sm ${className}`}>{children}</div>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'];

const DEMO_STATS = {
  totalViews: 1247,
  viewsTrend: '+18%',
  totalClicks: 89,
  clicksTrend: '+12%',
  totalInquiries: 15,
  inquiriesTrend: '+5',
  avgRating: 4.8,
  monthlyViews: [120, 180, 250, 210, 320, 380, 1247],
  topSources: [
    { label: 'Pencarian Google', value: 42, pct: 45 },
    { label: 'Direktori TenagaAhli', value: 28, pct: 30 },
    { label: 'Link Langsung', value: 12, pct: 13 },
    { label: 'Media Sosial', value: 7, pct: 7 },
    { label: 'Lainnya', value: 5, pct: 5 },
  ],
  popularSections: [
    { label: 'Ringkasan Profil', visits: 892, icon: 'person' },
    { label: 'Pendidikan & Sertifikasi', visits: 654, icon: 'school' },
    { label: 'Pengalaman Kerja', visits: 523, icon: 'work' },
    { label: 'Kontak & Kolaborasi', visits: 312, icon: 'call' },
  ],
};

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
  const [period, setPeriod] = useState('7hari');

  return (
    <DashboardLayout title={t('auto_statistik_laporan', 'Statistik & Laporan')} subtitle="Analisis performa profil dan interaksi Anda.">
      <div className="space-y-5 animate-fadeIn">
        {/* Period selector */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: '7hari', label: '7 Hari' },
            { key: '30hari', label: '30 Hari' },
            { key: '3bulan', label: '3 Bulan' },
            { key: 'semua', label: 'Semua Waktu' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
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
              label: 'Kunjungan Profil',
              value: DEMO_STATS.totalViews.toLocaleString('id-ID'),
              trend: DEMO_STATS.viewsTrend,
              icon: 'visibility',
              color: '#0284C7',
              bg: '#E0F2FE',
            },
            {
              label: 'Klik Kontak',
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
              
                                        {t('auto_kunjungan_profil_per', 'Kunjungan Profil per Bulan')}
                                      </h3>
            <MiniBarChart data={DEMO_STATS.monthlyViews} labels={MONTHS} />
          </Card>

          {/* Traffic Sources */}
          <Card className="p-6">
            <h3 className="text-xs font-bold text-[#414844]/60 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#0284C7]">pie_chart</span>
              
                                        {t('auto_sumber_pengunjung', 'Sumber Pengunjung')}
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
            
                                  {t('auto_bagian_profil_paling', 'Bagian Profil Paling Banyak Dikunjungi')}
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
                  <p className="text-[9px] text-[#414844]/50">{t('auto_kunjungan', 'kunjungan')}</p>
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
              <h3 className="font-bold text-[#075985] text-sm mb-1">{t('auto_tips_meningkatkan_vi', 'Tips Meningkatkan Visibilitas')}</h3>
              <p className="text-xs text-[#0369A1] leading-relaxed">
                Lengkapi semua bagian profil Anda, termasuk sertifikasi dan pengalaman kerja terbaru. 
                Profil yang lengkap mendapat hingga <strong>{t('auto_5x_lebih_banyak_kunj', '5x lebih banyak kunjungan')}</strong> dibanding profil yang tidak lengkap.
                Upgrade ke paket <strong>{t('auto_premium', 'Premium')}</strong>  {t('auto_untuk_tampil_priorit', 'untuk tampil prioritas di pencarian!')}
                                            </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
