import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import tentangKamiImg from '../assets/tentangkami.jpg';
import NavbarBackground from '../components/NavbarBackground.jsx';

const TIM_AMDAL = [
  { roleKey: 'about.roles.director', role: 'Pengarah', name: 'Prof. Dr. Ir. Widiatmaka, DAA' },
  { roleKey: 'about.roles.coordinator', role: 'Koordinator Pakar', name: 'Dr. Irman Firmansyah, S.Hut, M.Si' },
  { roleKey: 'about.roles.secretary', role: 'Sekretaris', name: 'Yoga Hepta Gumilar S.Pd., M.Pd' },
  { roleKey: 'about.roles.research_head', role: 'Kepala Bidang Research', name: 'Dr. I Wayan Budiasa, S.P., M.P' },
];

export default function TentangKami() {
  const { t } = useTranslation();

  return (
    <div className="relative pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <NavbarBackground />

      {/* Hero — Foto + Deskripsi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center mb-20">
        <img
          src={tentangKamiImg}
          alt="Tim AMDAL.ID"
          className="w-full h-[380px] object-cover rounded-xl shadow-md border border-outline-variant"
        />

        <div>
          <span className="inline-block w-14 h-1.5 rounded-full bg-[#0EA5E9] mb-4" />
          <h1 className="font-headline-lg text-headline-lg text-on-background mb-6">{t('about.title', 'Tentang Kami')}</h1>
          <p className="text-on-surface-variant leading-relaxed mb-4">
            {t('about.desc1', 'AMDAL.ID merupakan platform pencarian ahli atau pakar untuk menyusun AMDAL maupun narasumber di Indonesia yang telah memiliki sertifikat. Platform ini bertujuan memudahkan dalam mencari ahli penyusun AMDAL sesuai dengan keahlian and kepakaran masing-masing.')}
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            {t('about.desc2', 'AMDAL juga sebagai media memperoleh informasi mengenai peraturan, artikel, lembaga pelatihan dan penyusun AMDAL.')}
          </p>
        </div>
      </div>

      {/* TIM AMDAL.ID — Tabel Bertema Modern */}
      <h2 className="font-headline-md text-xl text-on-background mb-6">{t('about.team_title', 'TIM AMDAL.ID')}</h2>
      <div className="rounded-xl overflow-hidden border border-outline-variant bg-white shadow-sm">
        <table className="w-full text-left">
          <tbody>
            {TIM_AMDAL.map((member, i) => (
              <tr
                key={member.role}
                className={`${i !== TIM_AMDAL.length - 1 ? 'border-b border-outline-variant' : ''} ${
                  i % 2 === 0 ? 'bg-white' : 'bg-surface-container-low'
                }`}
              >
                <td className="px-6 py-4 text-[#0EA5E9] font-semibold w-1/3">{t(member.roleKey, member.role)}</td>
                <td className="px-6 py-4 text-on-background">{member.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA — Gradasi Biru Gelap Premium */}
      <div className="rounded-xl p-8 text-center mt-16 bg-gradient-to-br from-[#031B2E] via-[#04263F] to-[#010B14] relative overflow-hidden shadow-lg">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#0EA5E9]/10 blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="font-headline-md text-xl text-white mb-3">{t('about.cta_title', 'Ingin bergabung sebagai tenaga ahli?')}</h2>
          <p className="text-white/70 mb-6 text-sm">{t('about.cta_desc', 'Daftarkan diri Anda dan perluas jangkauan proyek Anda.')}</p>
          <Link
            to="/daftar"
            className="inline-block bg-[#0EA5E9] text-white px-8 py-3 rounded-full font-label-md hover:bg-[#0284C7] scale-95 active:scale-90 transition-all shadow-sm shadow-[#0EA5E9]/20"
          >
            {t('about.cta_btn', 'Daftar Sekarang')}
          </Link>
        </div>
      </div>
    </div>
  );
}