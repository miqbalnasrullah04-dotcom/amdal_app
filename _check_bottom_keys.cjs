const fs = require('fs');
const path = require('path');

const dictFile = path.join(__dirname, 'frontend/src/services/builtInDictionary.js');
const dictContent = fs.readFileSync(dictFile, 'utf8');

const keys = [
  "auto_profil_hubungi_nama",
  "auto_profil_tertarik_berkolaborasi",
  "auto_profil_kirim_pesan",
  "auto_profil_ajukan_kerja_sama",
  "auto_profil_minta_konsultasi",
  "auto_profil_unduh_cv",
  "auto_profil_video_perkenalan",
  "auto_profil_sertifikat",
  "auto_profil_dokumentasi_kegiatan",
  "auto_profil_portofolio",
  "auto_profil_dokumen_pendukung",
  "auto_profil_ulasan_title",
  "auto_profil_tulis_ulasan",
  "auto_profil_berdasarkan",
  "auto_profil_instruktur_trainer",
  "auto_profil_narasumber",
  "auto_profil_publikasi_title",
  "auto_profil_karya",
  "auto_profil_reviewer_jurnal",
  "auto_profil_organisasi",
  "auto_profil_profil_akademik",
  "auto_profil_rekam_jejak_riset",
  "auto_profil_riwayat_pendidikan",
  "auto_profil_no",
  "auto_profil_tahun_label",
  "auto_profil_berlaku_sd",
  "auto_profil_lihat_dokumen",
  "auto_profil_alamat_email",
  "auto_profil_lokasi",
  "auto_profil_get_directions",
  "auto_profil_sosial_media",
  "auto_profil_kriteria_keanggotaan",
  "auto_profil_nama_lengkap",
  "auto_profil_institusi_lembaga",
  "auto_profil_aktif_sejak",
  "auto_profil_tahun",
  "auto_profil_bidang_utama",
  "auto_profil_catatan",
  "auto_profil_keahlian_utama",
  "auto_profil_spesialisasi",
  "auto_profil_kompetensi"
];

for (const k of keys) {
  const match = dictContent.match(new RegExp(`"${k}":\\s*"([^"]+)"`));
  if (match) {
    console.log(`${k} => "${match[1]}"`);
  } else {
    console.log(`${k} => MISSING`);
  }
}
