const fs = require('fs');
const path = require('path');

const dictFile = path.join(__dirname, 'frontend/src/services/builtInDictionary.js');
let dictContent = fs.readFileSync(dictFile, 'utf8');

// Key translation table for all ProfilAhli and general strings
const DICTIONARY_MAP = {
  // Section Headings & Subtitles
  "Tentang Saya": "About Me",
  "Catatan": "Note / Summary",
  "Bidang Keahlian": "Field of Expertise",
  "Keahlian Utama": "Main Expertise",
  "Spesialisasi": "Specializations",
  "Kompetensi": "Competencies",
  "Ringkasan Profil": "Profile Summary",
  "Nama Lengkap": "Full Name",
  "Institusi/Lembaga": "Institution / Agency",
  "Aktif Sejak": "Active Since",
  "tahun": "years",
  "Bidang Utama": "Main Field",
  "Alamat Email": "Email Address",
  "Lokasi": "Location",
  "Get Directions": "Get Directions",
  "Sosial Media": "Social Media",
  "Kriteria Keanggotaan": "Membership Criteria",
  "Pengalaman Kerja": "Work Experience",
  "posisi": "positions",
  "Pengalaman Proyek": "Project Experience",
  "proyek": "projects",
  "Sertifikasi Keahlian": "Expertise Certifications",
  "Kredensial aktif": "Active credentials",
  "No.": "No.",
  "Tahun": "Year",
  "Berlaku s.d.": "Valid until",
  "Lihat dokumen": "View document",
  "Riwayat Pendidikan": "Education History",
  "Gelar": "Degree",
  "Profil Akademik": "Academic Profile",
  "Rekam jejak riset": "Research Track Record",
  "Lihat Profil": "View Profile",
  "Organisasi": "Organizations",
  "Reviewer Jurnal": "Journal Reviewer",
  "Publikasi": "Publications",
  "karya": "works",
  "Lihat publikasi": "View publication",
  "Narasumber": "Speaker / Resource Person",
  "Instruktur / Trainer": "Instructor / Trainer",
  "Ulasan": "Reviews",
  "ulasan": "reviews",
  "Berdasarkan": "Based on",
  "Tulis Ulasan": "Write a Review",
  "Belum ada ulasan. Jadilah yang pertama memberikan ulasan untuk tenaga ahli ini.": "No reviews yet. Be the first to leave a review for this expert.",
  "Sembunyikan ulasan": "Hide reviews",
  "Lihat semua": "View all",
  "Portofolio": "Portfolio",
  "Dokumen pendukung": "Supporting Documents",
  "Unduh CV": "Download CV",
  "Video Perkenalan": "Introductory Video",
  "Sertifikat": "Certificates",
  "Dokumentasi Kegiatan": "Activity Documentation",
  "Hubungi": "Contact",
  "Tertarik berkolaborasi atau membutuhkan konsultasi lebih lanjut? Pilih cara terbaik untuk terhubung.": "Interested in collaborating or need further consultation? Choose the best way to connect.",
  "Kirim Pesan": "Send Message",
  "Ajukan Kerja Sama": "Propose Collaboration",
  "Minta Konsultasi": "Request Consultation",

  // Stats bar
  "Tahun Pengalaman": "Years of Experience",
  "Proyek": "Projects",
  "Sertifikasi": "Certifications",
  "Kegiatan": "Activities",

  // Misc UI
  "Kembali ke Beranda": "Back to Home",
  "Kredensial terverifikasi": "Verified credentials",
  "Terverifikasi": "Verified",
  "Bagikan profil": "Share profile",
  "Link disalin": "Link copied",
  "Baru saja": "Just now",
  "Sembunyikan": "Hide",
  "Baca selengkapnya": "Read more",
  "Mohon isi nama, rating, dan ulasan sebelum mengirim.": "Please enter your name, rating, and review before submitting.",

  // Dynamic roles & categories
  "Peneliti & Konsultan Lingkungan": "Environmental Researcher & Consultant",
  "Peneliti & Dosen": "Researcher & Lecturer",
  "Konsultan Lingkungan Independen": "Independent Environmental Consultant",
  "Tenaga Ahli Pendamping": "Assisting Expert",
  "Ketua Tim Ahli": "Lead Expert Team",
  "Tenaga Ahli Lingkungan": "Environmental Expert",
  "Anggota Tim Peneliti": "Research Team Member",
  "Instruktur Utama": "Lead Instructor",
  "Fasilitator": "Facilitator",
  "Kajian Lingkungan Hidup Strategis (KLHS)": "Strategic Environmental Assessment (KLHS)",
  "Perencanaan Tata Ruang": "Spatial Planning",
  "Pemodelan Sistem Dinamik": "System Dynamics Modeling",
  "Ilmu Kehutanan": "Forestry Science",
  "Ilmu Lingkungan": "Environmental Science",
  "System Dynamics": "System Dynamics",
  "Spasial Dynamics": "Spatial Dynamics",
  "KLHS RDTR & RPJMD": "KLHS RDTR & RPJMD",
  "System Dynamics Modelling": "System Dynamics Modeling",
  "Analisis Daya Dukung Lingkungan": "Environmental Carrying Capacity Analysis",
  "Powersim / Vensim": "Powersim / Vensim",
  "GIS & Penginderaan Jauh": "GIS & Remote Sensing",
  "Fasilitasi Multi-pihak": "Multi-stakeholder Facilitation",
  "Tenaga Ahli / Konsultan": "Expert / Consultant",
  "Peneliti": "Researcher",
  "Narasumber/Pembicara": "Speaker / Resource Person",
  "Instruktur Pengajar": "Instructor / Teacher",
  "Akademisi": "Academician",
  "Sekarang": "Present",
  "Jurnal": "Journal",
  "Prosiding": "Proceedings",
  "Buku": "Book"
};

// Scan ProfilAhli.jsx to link auto_profil_ keys to the proper translation
const profilFile = path.join(__dirname, 'frontend/src/pages/ProfilAhli.jsx');
const profilContent = fs.readFileSync(profilFile, 'utf8');
const tRegex = /t\(\s*(['"`])((?:\\.|[^\1])*?)\1(?:\s*,\s*(['"`])((?:\\.|[^\3])*?)\3)?\s*\)/g;

let match;
const additions = {};

while ((match = tRegex.exec(profilContent)) !== null) {
  const arg1 = match[2]?.replace(/\\'/g, "'").replace(/\\"/g, '"');
  const arg2 = match[4]?.replace(/\\'/g, "'").replace(/\\"/g, '"');

  const keyName = arg1 ? arg1.trim() : '';
  const fallbackText = arg2 ? arg2.trim() : '';

  let englishTranslation = DICTIONARY_MAP[fallbackText] || DICTIONARY_MAP[keyName];

  if (englishTranslation) {
    if (keyName) additions[keyName] = englishTranslation;
    if (fallbackText) additions[fallbackText] = englishTranslation;
  }
}

// Add all DICTIONARY_MAP entries directly as well
for (const [k, v] of Object.entries(DICTIONARY_MAP)) {
  additions[k] = v;
}

let addedCount = 0;
let updatedCount = 0;

for (const [k, v] of Object.entries(additions)) {
  const sameRegex = new RegExp(`"${k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}":\\s*"[^"]*"`);
  if (sameRegex.test(dictContent)) {
    // Update existing
    dictContent = dictContent.replace(sameRegex, `"${k}": "${v}"`);
    updatedCount++;
  } else {
    // Insert new
    const lastBraceIndex = dictContent.lastIndexOf('};');
    if (lastBraceIndex !== -1) {
      const insertion = `  "${k}": "${v}",\n`;
      dictContent = dictContent.slice(0, lastBraceIndex) + insertion + dictContent.slice(lastBraceIndex);
      addedCount++;
    }
  }
}

fs.writeFileSync(dictFile, dictContent, 'utf8');
console.log(`Dictionary updated successfully! (Added: ${addedCount}, Updated: ${updatedCount})`);
