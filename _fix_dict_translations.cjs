const fs = require('fs');
const path = require('path');

const dictFile = path.join(__dirname, 'frontend/src/services/builtInDictionary.js');
let dictContent = fs.readFileSync(dictFile, 'utf8');

const TRANSLATION_MAP = {
  // Stat blocks & Profile headers
  "Tahun Pengalaman": "Years of Experience",
  "Proyek": "Projects",
  "Publikasi": "Publications",
  "Sertifikasi": "Certifications",
  "Kegiatan": "Activities",
  "Catatan": "Notes / Summary",
  "Keahlian Utama": "Main Expertise",
  "Spesialisasi": "Specializations",
  "Kompetensi": "Competencies",
  "Ringkasan Profil": "Profile Summary",
  "Institusi/Lembaga": "Institution / Agency",
  "Aktif Sejak": "Active Since",
  "Bidang Utama": "Main Field",
  "Sosial Media": "Social Media",
  "Membership Criteria": "Membership Criteria",
  "Work Experience": "Work Experience",
  "posisi": "positions",
  "Pengalaman Proyek": "Project Experience",
  "proyek": "projects",
  "Sertifikasi Keahlian": "Expertise Certifications",
  "Kredensial aktif": "Active Credentials",
  "Berlaku s.d.": "Valid until",
  "Riwayat Pendidikan": "Education History",
  "Gelar": "Degree",
  "Profil Akademik": "Academic Profile",
  "Rekam jejak riset": "Research Track Record",
  "Sekarang": "Present",
  "Reviewer Jurnal": "Journal Reviewer",
  "karya": "works",
  "Jurnal": "Journal",
  "Prosiding": "Proceedings",
  "Buku": "Book",
  "Instruktur / Trainer": "Instructor / Trainer",
  "Ulasan": "Reviews",
  "ulasan": "reviews",
  "Berdasarkan": "Based on",
  "Tulis Ulasan": "Write a Review",
  "Baca selengkapnya": "Read more",
  "Sembunyikan": "Hide",
  "Lihat semua": "View all",
  "Portofolio": "Portfolio",
  "Dokumen pendukung": "Supporting Documents",
  "Unduh CV": "Download CV",
  "Video Perkenalan": "Introductory Video",
  "Dokumentasi Kegiatan": "Activity Documentation",
  "Ajukan Kerja Sama": "Propose Collaboration",
  "Minta Konsultasi": "Request Consultation",
  "Send Message": "Send Message",
  "Contact": "Contact",
  "Tertarik berkolaborasi atau membutuhkan konsultasi lebih lanjut? Pilih cara terbaik untuk terhubung.": "Interested in collaborating or need further consultation? Choose the best way to connect.",

  // Roles & Specializations
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
  "Narasumber": "Speaker / Resource Person",
  "Akademisi": "Academician",
  "Narasumber/Pembicara": "Speaker / Resource Person",
  "Instruktur Pengajar": "Instructor / Teacher",
  "Tersedia untuk kerja sama baru": "Available for new collaborations",
  "Kembali ke Beranda": "Back to Home",
  "Terverifikasi": "Verified",
  "Hubungi": "Contact",
  "Bagikan profil": "Share profile",
  "Link disalin": "Link copied",
  "Tentang Saya": "About Me",
  "Catatan": "Note",
  "Bidang Keahlian": "Field of Expertise",
  "Kredensial terverifikasi": "Verified Credentials",
  "Baru saja": "Just now",

  // Review & Ratings
  "Sangat membantu dalam penyusunan KLHS RDTR di daerah kami. Penjelasannya detail dan mudah dipahami, baik oleh tim teknis maupun pemangku kepentingan non-teknis. Rekomendasi terbaik untuk kajian lingkungan hidup strategis.": "Very helpful in preparing KLHS RDTR in our region. Detailed and easy to understand explanations for both technical teams and non-technical stakeholders. Highly recommended for strategic environmental assessments.",
  "Profesional dan responsif sejak konsultasi awal. Hasil pemodelan sistem dinamiknya sangat membantu pengambilan keputusan di daerah kami.": "Professional and responsive from initial consultation. Their system dynamics modeling results greatly helped decision making in our region.",
  "Kompeten di bidangnya dan komunikasi lancar selama proyek berjalan. Hanya perlu sedikit penyesuaian jadwal di tahap awal.": "Competent in their field with clear communication throughout the project. Just needed a minor schedule adjustment initially.",
  "Narasumber yang sangat menguasai materi KLHS dan mampu menjelaskan konsep yang cukup rumit dengan bahasa yang sederhana dan mudah diikuti peserta pelatihan.": "A speaker who truly masters KLHS materials and is able to explain complex concepts in simple, easy-to-follow language for training participants.",
  "2 minggu lalu": "2 weeks ago",
  "1 bulan lalu": "1 month ago",
  "2 bulan lalu": "2 months ago",
  "3 bulan lalu": "3 months ago",

  // Additional common UI terms
  "Ahli Kehutanan & Tata Ruang": "Forestry & Spatial Planning Expert",
  "Akademik": "Academic",
  "Alamat Lengkap": "Full Address",
  "Alur Pendaftaran Tenaga Ahli": "Expert Registration Flow",
  "Ambil Foto": "Take Photo",
  "Anda belum memiliki riwayat transaksi": "You have no transaction history yet",
  "Anda belum memiliki tiket bantuan": "You have no support tickets yet",
  "Anggota / Pengurus": "Member / Executive",
  "Atau Upload Bukti Transfer Manual": "Or Upload Manual Transfer Receipt",
  "Pengurus Bidang Riset": "Head of Research Division",
  "Mengoordinasikan kajian valuasi ekonomi lingkungan.": "Coordinating environmental economic valuation studies.",
  "Kontributor diskusi kebijakan tata ruang berkelanjutan.": "Contributor to sustainable spatial policy discussions."
};

let count = 0;
for (const [idText, enText] of Object.entries(TRANSLATION_MAP)) {
  const targetPattern = `"${idText}": "${idText}"`;
  const replacement = `"${idText}": "${enText}"`;
  if (dictContent.includes(targetPattern)) {
    dictContent = dictContent.replace(targetPattern, replacement);
    count++;
  } else if (!dictContent.includes(`"${idText}":`)) {
    // If key not present at all, append it
    const lastBraceIndex = dictContent.lastIndexOf('};');
    if (lastBraceIndex !== -1) {
      const insertion = `  "${idText}": "${enText}",\n`;
      dictContent = dictContent.slice(0, lastBraceIndex) + insertion + dictContent.slice(lastBraceIndex);
      count++;
    }
  }
}

fs.writeFileSync(dictFile, dictContent, 'utf8');
console.log(`Updated ${count} translation keys in builtInDictionary.js!`);
