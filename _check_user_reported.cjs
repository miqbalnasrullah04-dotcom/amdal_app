const fs = require('fs');
const path = require('path');

const dictFile = path.join(__dirname, 'frontend/src/services/builtInDictionary.js');
const dictContent = fs.readFileSync(dictFile, 'utf8');

const keysToCheck = [
  "Tahun Pengalaman",
  "Proyek",
  "Publikasi",
  "Sertifikasi",
  "Kegiatan",
  "Catatan",
  "Keahlian Utama",
  "Spesialisasi",
  "Kompetensi",
  "Ringkasan Profil",
  "Institusi/Lembaga",
  "Aktif Sejak",
  "Bidang Utama",
  "Sosial Media",
  "posisi",
  "Pengalaman Proyek",
  "proyek",
  "Sertifikasi Keahlian",
  "Kredensial aktif",
  "Berlaku s.d.",
  "Riwayat Pendidikan",
  "Gelar",
  "Profil Akademik",
  "Rekam jejak riset",
  "Sekarang",
  "Reviewer Jurnal",
  "karya",
  "Jurnal",
  "Prosiding",
  "Buku",
  "Instruktur / Trainer",
  "Ulasan",
  "ulasan",
  "Berdasarkan",
  "Tulis Ulasan",
  "Baca selengkapnya",
  "Lihat semua",
  "Portofolio",
  "Dokumen pendukung",
  "Unduh CV",
  "Video Perkenalan",
  "Dokumentasi Kegiatan",
  "Ajukan Kerja Sama",
  "Minta Konsultasi",
  "auto_profil_tahun_pengalaman",
  "auto_profil_proyek",
  "auto_profil_publikasi",
  "auto_profil_sertifikasi",
  "auto_profil_kegiatan",
  "auto_profil_catatan",
  "auto_profil_keahlian_utama",
  "auto_profil_spesialisasi",
  "auto_profil_kompetensi"
];

for (const k of keysToCheck) {
  const hasIt = dictContent.includes(`"${k}":`);
  console.log(`${k}: ${hasIt ? 'YES' : 'MISSING'}`);
}
