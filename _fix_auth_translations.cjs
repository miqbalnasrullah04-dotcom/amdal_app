const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

// ── 1. Fix unwrapped placeholders in Daftar.jsx ──
const daftarFile = path.join(rootDir, 'frontend/src/pages/Daftar.jsx');
let daftarContent = fs.readFileSync(daftarFile, 'utf8');

// placeholder="Minimal 8 karakter" → placeholder={t('Minimal 8 karakter')}
daftarContent = daftarContent.replace(
  'placeholder="Minimal 8 karakter"',
  "placeholder={t('Minimal 8 karakter')}"
);
// placeholder="Ketik ulang kata sandi" → placeholder={t('Ketik ulang kata sandi')}
daftarContent = daftarContent.replace(
  'placeholder="Ketik ulang kata sandi"',
  "placeholder={t('Ketik ulang kata sandi')}"
);

fs.writeFileSync(daftarFile, daftarContent, 'utf8');
console.log('Fixed Daftar.jsx placeholders');

// ── 2. Fix unwrapped placeholder in SignIn.jsx ──
const signInFile = path.join(rootDir, 'frontend/src/pages/SignIn.jsx');
let signInContent = fs.readFileSync(signInFile, 'utf8');

// placeholder="nama@email.com" is fine (universal), skip
// placeholder="••••••••" is fine (universal), skip

fs.writeFileSync(signInFile, signInContent, 'utf8');
console.log('Checked SignIn.jsx');

// ── 3. Add all missing translations to builtInDictionary.js ──
const dictFile = path.join(rootDir, 'frontend/src/services/builtInDictionary.js');
let dictContent = fs.readFileSync(dictFile, 'utf8');

const AUTH_TRANSLATIONS = {
  // Sign In page
  "Masuk": "Sign In",
  "Kata Sandi": "Password",
  "Kembali": "Back",
  "Belum punya akun?": "Don't have an account?",
  "Daftar di sini": "Register here",
  "Pendaftaran berhasil. Silakan masuk dengan akun Anda.": "Registration successful. Please sign in with your account.",
  "Data tidak valid.": "Invalid data.",
  "Email atau kata sandi salah.": "Incorrect email or password.",
  "Server sedang bermasalah. Coba beberapa saat lagi.": "Server is experiencing issues. Please try again later.",
  "Tidak bisa terhubung ke server.": "Cannot connect to server.",
  "Masuk untuk mengelola profil tenaga ahli Anda.": "Sign in to manage your expert profile.",
  "Akses dan Kembangkan": "Access and Develop",
  "Profil Profesional Anda.": "Your Professional Profile.",
  "Masuk ke akun Anda untuk mengelola profil, menampilkan keahlian, dan terhubung dengan berbagai peluang profesional di seluruh Indonesia.": "Sign in to your account to manage your profile, showcase your expertise, and connect with professional opportunities across Indonesia.",
  "Kelola profil dan informasi keahlian Anda": "Manage your profile and expertise information",
  "Perbarui pengalaman, pendidikan, dan sertifikat": "Update your experience, education, and certificates",
  "Tingkatkan visibilitas Anda sebagai tenaga ahli profesional": "Increase your visibility as a professional expert",

  // Sign In auto_ keys
  "auth.hero.title_line1": "Access and Develop",
  "auth.hero.title_line2": "Your Professional Profile.",
  "auth.hero.desc": "Sign in to your account to manage your profile, showcase your expertise, and connect with professional opportunities across Indonesia.",
  "auth.hero.feature1": "Manage your profile and expertise information",
  "auth.hero.feature2": "Update your experience, education, and certificates",
  "auth.hero.feature3": "Increase your visibility as a professional expert",
  "auth.login_subtitle": "Sign in to manage your expert profile.",
  "auth.register_success": "Registration successful. Please sign in with your account.",
  "auth.error.invalid_data": "Invalid data.",
  "auth.error.wrong_credentials": "Incorrect email or password.",
  "auth.error.server_issue": "Server is experiencing issues. Please try again later.",
  "auth.error.no_connection": "Cannot connect to server.",

  // Daftar (Register) page
  "Daftar": "Register",
  "Nama Lengkap": "Full Name",
  "Konfirmasi Kata Sandi": "Confirm Password",
  "Minimal 8 karakter": "Minimum 8 characters",
  "Mengandung huruf": "Contains letters",
  "Mengandung angka": "Contains numbers",
  "Semua field wajib diisi.": "All fields are required.",
  "Kata sandi minimal 8 karakter.": "Password must be at least 8 characters.",
  "Konfirmasi kata sandi tidak sama.": "Password confirmation does not match.",
  "Kata sandi tidak cocok": "Passwords do not match",
  "Kata sandi cocok": "Passwords match",
  "Sudah punya akun?": "Already have an account?",
  "Masuk di sini": "Sign in here",
  "Ketik ulang kata sandi": "Retype your password",
  "Pendaftaran gagal. Periksa kembali data Anda.": "Registration failed. Please check your data.",
  "Promosikan": "Promote",
  "Keahlian Anda": "Your Expertise",
  "Bergabunglah bersama tenaga ahli dari berbagai bidang dan tampilkan profil profesional Anda agar lebih mudah ditemukan oleh instansi, perusahaan, dan mitra yang membutuhkan keahlian Anda.": "Join experts from various fields and showcase your professional profile to be easily found by agencies, companies, and partners who need your expertise.",
  "Pendaftaran gratis dan mudah": "Free and easy registration",
  "Profil Anda akan terverifikasi oleh tim kami": "Your profile will be verified by our team",
  "Dapatkan kesempatan proyek dari seluruh Indonesia": "Get project opportunities from all over Indonesia",
  "Daftar sebagai tenaga ahli profesional di TenagaAhli.com": "Register as a professional expert on TenagaAhli.com",
  "Masukkan nama lengkap Anda": "Enter your full name",

  // Daftar auto_ keys
  "auth.register_hero.title_line1": "Promote",
  "auth.register_hero.title_line2": "Your Expertise",
  "auth.register_hero.desc": "Join experts from various fields and showcase your professional profile to be easily found by agencies, companies, and partners who need your expertise.",
  "auth.register_hero.feature1": "Free and easy registration",
  "auth.register_hero.feature2": "Your profile will be verified by our team",
  "auth.register_hero.feature3": "Get project opportunities from all over Indonesia",
  "auth.register_subtitle": "Register as a professional expert on TenagaAhli.com",
  "auth.name_placeholder": "Enter your full name",
  "auth.error.register_failed": "Registration failed. Please check your data."
};

let addedCount = 0;
let updatedCount = 0;

for (const [k, v] of Object.entries(AUTH_TRANSLATIONS)) {
  const escapedKey = k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const sameRegex = new RegExp(`"${escapedKey}":\\s*"[^"]*"`);
  if (sameRegex.test(dictContent)) {
    dictContent = dictContent.replace(sameRegex, `"${k}": "${v}"`);
    updatedCount++;
  } else {
    const lastBraceIndex = dictContent.lastIndexOf('};');
    if (lastBraceIndex !== -1) {
      const insertion = `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`;
      dictContent = dictContent.slice(0, lastBraceIndex) + insertion + dictContent.slice(lastBraceIndex);
      addedCount++;
    }
  }
}

fs.writeFileSync(dictFile, dictContent, 'utf8');
console.log(`Dictionary updated! (Added: ${addedCount}, Updated: ${updatedCount})`);
