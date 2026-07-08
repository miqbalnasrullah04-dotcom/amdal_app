import { Link } from 'react-router-dom';
import tentangKamiImg from '../assets/tentangkami.jpg';

// Data tim — dipisah dari markup supaya gampang ditambah/diubah tanpa
// menyentuh styling tabel di bawah.
const TIM_AMDAL = [
  { role: 'Pengarah', name: 'Prof. Dr. Ir. Widiatmaka, DAA' },
  { role: 'Koordinator Pakar', name: 'Dr. Irman Firmansyah, S.Hut, M.Si' },
  { role: 'Sekretaris', name: 'Yoga Hepta Gumilar S.Pd., M.Pd' },
  { role: 'Kepala Bidang Research', name: 'Dr. I Wayan Budiasa, S.P., M.P' },
];

export default function TentangKami() {
  return (
    <div className="relative pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Kotak coklat di belakang navbar — tinggi sama persis dengan navbar (h-20 / 80px) */}
      <div className="fixed top-0 left-0 w-full h-20 bg-[#3E2B1F] z-40" />

      {/* Hero — foto + deskripsi. Aksen teal (samakan dengan warna primary
          di Home: hover search jadi #0B7285) dipakai di garis judul supaya
          nyambung dengan warna aksi/navigasi di halaman lain. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center mb-20">
        <img
          src={tentangKamiImg}
          alt="Tim AMDAL.ID"
          className="w-full h-[380px] object-cover rounded-xl shadow-lg"
        />

        <div>
          <span className="inline-block w-14 h-1.5 rounded-full bg-[#006673] mb-4" />
          <h1 className="font-headline-lg text-headline-lg text-[#1F3D2B] mb-6">Tentang Kami</h1>
          <p className="text-[#3D5A48] leading-relaxed mb-4">
            AMDAL.ID merupakan platform pencarian ahli atau pakar untuk menyusun AMDAL maupun narasumber
            di Indonesia yang telah memiliki sertifikat. Platform ini bertujuan memudahkan dalam mencari
            ahli penyusun AMDAL sesuai dengan keahlian dan kepakaran masing-masing.
          </p>
          <p className="text-[#3D5A48] leading-relaxed">
            AMDAL juga sebagai media memperoleh informasi mengenai peraturan, artikel, lembaga pelatihan
            dan penyusun AMDAL.
          </p>
        </div>
      </div>

      {/* TIM AMDAL.ID — tema coklat kayu, senada dengan section "Tenaga Ahli
          Kajian Lingkungan Hidup Strategis" di Home (bg-[#3E2B1F], border
          #6B4F3A, teks krem #F0E2CE, aksen emas #C9A876). */}
      <h2 className="font-headline-md text-xl text-[#1F3D2B] mb-6">TIM AMDAL.ID</h2>
      <div className="rounded-xl overflow-hidden border border-[#6B4F3A] bg-[#3E2B1F] shadow-lg">
        <table className="w-full text-left">
          <tbody>
            {TIM_AMDAL.map((member, i) => (
              <tr
                key={member.role}
                className={`${i !== TIM_AMDAL.length - 1 ? 'border-b border-[#6B4F3A]' : ''} ${
                  i % 2 === 0 ? 'bg-[#3E2B1F]' : 'bg-[#2A1D14]'
                }`}
              >
                <td className="px-6 py-4 text-[#C9A876] font-medium w-1/3">{member.role}</td>
                <td className="px-6 py-4 text-[#F0E2CE]">{member.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA — hijau-teal supaya konsisten dengan tombol utama di Home
          (bg-primary / hover bg-primary-container) tanpa lepas dari nuansa
          hijau alam yang jadi benang merah brand AMDAL.ID. */}
      <div className="rounded-xl p-8 text-center mt-16 bg-gradient-to-br from-[#006673] to-[#1F3D2B]">
        <h2 className="font-headline-md text-xl text-white mb-3">Ingin bergabung sebagai tenaga ahli?</h2>
        <p className="text-white/85 mb-6">Daftarkan diri Anda dan perluas jangkauan proyek Anda.</p>
        <Link
          to="/daftar"
          className="inline-block bg-[#F0E2CE] text-[#1F3D2B] px-8 py-3 rounded-full font-label-md hover:bg-white transition-colors"
        >
          Daftar Sekarang
        </Link>
      </div>
    </div>
  );
}