const fs = require('fs');
const path = require('path');

const dictFile = path.join(__dirname, 'frontend/src/services/builtInDictionary.js');
let dictContent = fs.readFileSync(dictFile, 'utf8');

const EXTRA_TRANSLATIONS = {
  "5x lebih banyak kunjungan": "5x more visits",
  "Akses dan Kembangkan": "Access and Develop",
  "Anda harus memiliki": "You must have",
  "Bagian Profil Paling Banyak Dikunjungi": "Most Visited Profile Sections",
  "Bagikan pengalaman Anda bekerja sama dengan tenaga ahli ini...": "Share your experience working with this expert...",
  "Balasan": "Reply",
  "Balasan Anda": "Your Reply",
  "Bayar dengan berbagai metode pembayaran": "Pay with various payment methods",
  "Belum ada balasan. Tim kami akan segera merespons.": "No reply yet. Our team will respond shortly.",
  "Belum ada data organisasi.": "No organization data yet.",
  "Belum ada data pendidikan.": "No education data yet.",
  "Belum ada data pengalaman.": "No experience data yet.",
  "Belum ada data pengguna.": "No user data yet.",
  "Belum ada data publikasi.": "No publication data yet.",
  "Belum ada data reviewer jurnal.": "No journal reviewer data yet.",
  "Belum ada data sertifikat.": "No certificate data yet.",
  "Belum ada data transaksi.": "No transaction data yet.",
  "Belum ada ulasan untuk profil ini.": "No reviews for this profile yet.",
  "Belum ada video perkenalan.": "No intro video yet.",
  "Buka Tiket": "Open Ticket",
  "Buka Tiket Baru": "Open New Ticket",
  "Batal": "Cancel",
  "Cari": "Search",
  "Detail Pembayaran": "Payment Details",
  "Detail Profil": "Profile Details",
  "Detail Tiket": "Ticket Details",
  "Detail Transaksi": "Transaction Details",
  "Dokumen": "Documents",
  "Edit Profil": "Edit Profile",
  "Email / Username": "Email / Username",
  "Gagal memuat data": "Failed to load data",
  "Gagal memuat data.": "Failed to load data.",
  "Gagal menyimpan data.": "Failed to save data.",
  "Harga": "Price",
  "Informasi Akun": "Account Information",
  "Informasi Kontak": "Contact Information",
  "Informasi Pembayaran": "Payment Information",
  "Informasi Profil": "Profile Information",
  "Jenis Paket": "Package Type",
  "Jumlah": "Amount",
  "Jumlah Poin": "Points Amount",
  "Keluar": "Log Out",
  "Kembali": "Back",
  "Kirim": "Send",
  "Kirim Ulasan": "Send Review",
  "Konfirmasi": "Confirm",
  "Kupon / Kode Promo": "Coupon / Promo Code",
  "Metode Pembayaran": "Payment Method",
  "Nomor HP": "Phone Number",
  "Nomor WhatsApp": "WhatsApp Number",
  "Paket Berlangganan": "Subscription Package",
  "Pilih Paket": "Select Package",
  "Poin Saya": "My Points",
  "Profil": "Profile",
  "Profil Saya": "My Profile",
  "Riwayat Pembayaran": "Payment History",
  "Riwayat Transaksi": "Transaction History",
  "Simpan": "Save",
  "Status Pembayaran": "Payment Status",
  "Status Profil": "Profile Status",
  "Status Tiket": "Ticket Status",
  "Status Verifikasi": "Verification Status",
  "Selesai": "Completed",
  "Tanggal": "Date",
  "Tanggal Transaksi": "Transaction Date",
  "Tertunda": "Pending",
  "Tidak Ada Data": "No Data Available",
  "Tutup": "Close",
  "Ubah Password": "Change Password",
  "Unggah Foto": "Upload Photo",
  "Verifikasi": "Verify",
  "Verifikasi Akun": "Account Verification"
};

let count = 0;
for (const [k, v] of Object.entries(EXTRA_TRANSLATIONS)) {
  const sameRegex = new RegExp(`"${k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}":\\s*"[^"]*"`);
  if (sameRegex.test(dictContent)) {
    dictContent = dictContent.replace(sameRegex, `"${k}": "${v}"`);
    count++;
  } else {
    const lastBraceIndex = dictContent.lastIndexOf('};');
    if (lastBraceIndex !== -1) {
      const insertion = `  "${k}": "${v}",\n`;
      dictContent = dictContent.slice(0, lastBraceIndex) + insertion + dictContent.slice(lastBraceIndex);
      count++;
    }
  }
}

fs.writeFileSync(dictFile, dictContent, 'utf8');
console.log(`Updated ${count} additional extra translations!`);
