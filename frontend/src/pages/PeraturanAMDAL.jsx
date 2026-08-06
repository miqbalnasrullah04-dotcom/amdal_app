import { useTranslation } from '../context/LanguageContext.jsx';
import NavbarBackground from '../components/NavbarBackground.jsx';

const requirements = [
  {
    icon: 'work_history',
    title: 'Pengalaman Sebagai Tenaga Ahli',
    desc: 'Pernah menjadi tenaga ahli pada suatu proyek, dibuktikan dengan Surat Tugas atau kontrak kerja.',
  },
  {
    icon: 'workspace_premium',
    title: 'Sertifikat Kompetensi',
    desc: 'Memiliki sertifikat kompetensi atau pelatihan yang sesuai dengan bidang keahlian.',
  },
  {
    icon: 'science',
    title: 'Riset & Karya Ilmiah',
    desc: 'Memiliki pengalaman penelitian, publikasi, atau karya ilmiah sesuai bidang keahlian.',
  },
  {
    icon: 'campaign',
    title: 'Narasumber atau Instruktur',
    desc: 'Pernah menjadi narasumber, pembicara, instruktur, atau pemateri dalam seminar, pelatihan, maupun workshop.',
  },
  {
    icon: 'business_center',
    title: 'Pengalaman Profesional',
    desc: 'Memiliki pengalaman profesional atau bekerja sesuai bidang keahlian, didukung dokumen pendukung.',
  },
];

const freeFeatures = [
  'Membuat profil tenaga ahli',
  'Profil tampil di hasil pencarian',
  'Menampilkan informasi dasar (nama, bidang keahlian, lokasi, pengalaman, dan kontak)',
  'Dapat menerima permintaan kerja sama dari calon klien',
  'Mengelola profil dan portofolio dasar',
];

const premiumFeatures = [
  'Seluruh manfaat Paket Free',
  'Badge Terverifikasi / Premium pada profil',
  'Prioritas tampil di hasil pencarian',
  'Portofolio tanpa batas',
  'Upload sertifikat dan dokumen pendukung tanpa batas',
  'Menampilkan pengalaman proyek secara lengkap',
  'Statistik jumlah kunjungan profil',
  'Prioritas memperoleh informasi peluang proyek dan kerja sama',
  'Dukungan (support) prioritas',
  'Akses webinar, pelatihan, dan event eksklusif',
  'Diskon untuk pelatihan, sertifikasi, dan kegiatan bersama platform',
];

export default function PaketKeanggotaanTenagaAhli() {
  const { t } = useTranslation();

  return (
    <div className="relative pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <NavbarBackground />

      {/* Header */}
      <div className="mb-14 max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[#0EA5E9] bg-[#0EA5E9]/10 px-3 py-1 rounded-full mb-4">
          <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
          {t('membership.badge', 'Keanggotaan Tenaga Ahli')}
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">
          {t('membership.title', 'Paket Keanggotaan Tenaga Ahli')}
        </h1>
        <p className="text-on-surface-variant">
          {t(
            'membership.subtitle',
            'Pilih paket yang sesuai untuk memperluas jangkauan profil dan peluang kerja sama Anda sebagai tenaga ahli.'
          )}
        </p>
      </div>

      {/* Requirements */}
      <section className="mb-20">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <h2 className="font-headline-md text-lg md:text-xl text-on-background">
            {t('membership.req_title', 'Syarat Menjadi Tenaga Ahli')}
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] bg-[#0EA5E9]/10 px-3 py-1.5 rounded-full whitespace-nowrap">
            <span className="material-symbols-outlined text-[16px]">rule</span>
            {t('membership.req_note', 'Cukup penuhi salah satu syarat')}
          </span>
        </div>
        <p className="text-on-surface-variant text-sm mb-8 max-w-2xl">
          {t(
            'membership.req_desc',
            'Calon anggota tidak perlu memenuhi seluruh poin di bawah ini — satu syarat saja sudah cukup untuk mengajukan pendaftaran.'
          )}
        </p>

        <div className="flex flex-col">
          {requirements.map((req, i) => (
            <div key={req.title}>
              <div className="group flex items-start gap-5 bg-white p-5 md:p-6 rounded-2xl border border-[#0EA5E9]/15 shadow-sm hover:shadow-md hover:border-[#0EA5E9]/40 transition-all duration-300">
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-[#0EA5E9]/10 group-hover:bg-[#0EA5E9] transition-colors duration-300">
                  <span className="material-symbols-outlined text-[24px] text-[#0EA5E9] group-hover:text-white transition-colors duration-300">
                    {req.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-semibold text-on-background mb-1">{req.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{req.desc}</p>
                </div>
              </div>

              {i < requirements.length - 1 && (
                <div className="flex items-center justify-center gap-3 py-3" aria-hidden="true">
                  <span className="h-8 w-px bg-[#0EA5E9]/20" />
                  <span className="text-[11px] font-bold tracking-widest text-[#0284C7] bg-[#0EA5E9]/10 px-2.5 py-1 rounded-full">
                    ATAU
                  </span>
                  <span className="h-8 w-px bg-[#0EA5E9]/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-20">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-headline-md text-lg md:text-xl text-on-background mb-2">
            {t('membership.plans_title', 'Pilih Paket Anda')}
          </h2>
          <p className="text-on-surface-variant text-sm">
            {t(
              'membership.plans_desc',
              'Mulai gratis, atau tingkatkan ke Premium untuk visibilitas dan kepercayaan yang lebih tinggi di mata klien.'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Free card */}
          <div className="flex flex-col bg-white rounded-3xl border border-[#0EA5E9]/15 shadow-sm p-8">
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant/70">
                {t('membership.free_label', 'Free')}
              </span>
              <div className="flex items-end gap-1 mt-2">
                <span className="font-headline-lg text-3xl md:text-4xl text-on-background">Rp0</span>
              </div>
              <p className="text-on-surface-variant text-sm mt-1">
                {t('membership.free_caption', 'Selamanya, tanpa biaya')}
              </p>
            </div>

            <ul className="flex flex-col gap-3 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-[#0EA5E9] mt-0.5 shrink-0">
                    check_circle
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium card */}
          <div className="relative flex flex-col bg-[#0B1220] rounded-3xl border border-[#F5B942]/30 shadow-xl p-8 overflow-hidden motion-safe:hover:-translate-y-1 transition-transform duration-300">
            {/* ambient glow */}
            <div
              className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[#F5B942]/20 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-[#0EA5E9]/20 blur-3xl"
              aria-hidden="true"
            />

            <span className="absolute top-6 right-6 text-[10px] font-bold tracking-widest uppercase text-[#0B1220] bg-[#F5B942] px-3 py-1.5 rounded-full">
              {t('membership.recommended', 'Direkomendasikan')}
            </span>

            <div className="relative mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5B942] to-[#D97706] flex items-center justify-center shadow-lg mb-5">
                <span className="material-symbols-outlined text-[28px] text-[#0B1220]">
                  workspace_premium
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#F5B942]">
                {t('membership.premium_label', 'Premium')}
              </span>
              <div className="flex items-end gap-1.5 mt-2">
                <span className="font-headline-lg text-3xl md:text-4xl text-white">Rp300.000</span>
                <span className="text-sm text-white/50 mb-1">/{t('membership.per_year', 'tahun')}</span>
              </div>
              <p className="text-white/50 text-sm mt-1">
                {t('membership.premium_caption', 'Berlaku 1 tahun sejak aktivasi')}
              </p>
            </div>

            <ul className="relative flex flex-col gap-3 flex-1">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="material-symbols-outlined text-[18px] text-[#F5B942] mt-0.5 shrink-0">
                    check_circle
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}