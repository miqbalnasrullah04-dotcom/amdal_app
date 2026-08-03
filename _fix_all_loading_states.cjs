const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const dictFile = path.join(rootDir, 'frontend/src/services/builtInDictionary.js');

// 1. Wrap unwrapped loading text in JSX files
const jsxFixes = [
  {
    file: 'frontend/src/pages/LengkapiProfil.jsx',
    pattern: /Memuat\.\.\./g,
    replacement: "{t('Memuat...')}"
  },
  {
    file: 'frontend/src/pages/Pengaturan.jsx',
    pattern: /Memuat pengaturan\.\.\./g,
    replacement: "{t('Memuat pengaturan...')}"
  },
  {
    file: 'frontend/src/pages/RiwayatPembayaran.jsx',
    pattern: /Memuat riwayat pembayaran\.\.\./g,
    replacement: "{t('Memuat riwayat pembayaran...')}"
  },
  {
    file: 'frontend/src/components/PageLoader.jsx',
    pattern: /Memuat halaman\.\.\./g,
    replacement: "{t('Memuat halaman...')}"
  }
];

for (const fix of jsxFixes) {
  const filePath = path.join(rootDir, fix.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(fix.pattern, fix.replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${fix.file}`);
  }
}

// 2. Loading & Not Found translations mapping
const LOADING_TRANSLATIONS = {
  // ProfilAhli loading & error keys
  "expert_profile.loading.title": "Loading expert profile...",
  "Memuat profil tenaga ahli...": "Loading expert profile...",
  "expert_profile.loading.desc": "Connecting to TenagaAhli.com database",
  "Menghubungkan ke database TenagaAhli.com": "Connecting to TenagaAhli.com database",
  "expert_profile.not_found.title": "Profile Not Found",
  "Profil Tidak Ditemukan": "Profile Not Found",
  "expert_profile.not_found.desc": "The expert you are looking for could not be found or has not been verified.",
  "Tenaga ahli yang Anda cari tidak dapat ditemukan atau belum terverifikasi.": "The expert you are looking for could not be found or has not been verified.",

  // General loading states across all pages
  "Memuat...": "Loading...",
  "Memuat data...": "Loading data...",
  "auto_memuat_data": "Loading data...",
  "Memuat pengaturan...": "Loading settings...",
  "Memuat riwayat pembayaran...": "Loading payment history...",
  "Memuat halaman...": "Loading page...",
  "Memuat data paket...": "Loading package data...",
  "Gagal memuat data profil.": "Failed to load profile data.",
  "Gagal memuat data dashboard.": "Failed to load dashboard data.",
  "dashboard.error_load_profile": "Failed to load profile data.",
  "dashboard.error_load_dashboard": "Failed to load dashboard data.",
  "payment.loading": "Processing payment...",
  "invoice.loading": "Loading invoice..."
};

// 3. Update builtInDictionary.js
let dictContent = fs.readFileSync(dictFile, 'utf8');

let addedCount = 0;
let updatedCount = 0;

for (const [k, v] of Object.entries(LOADING_TRANSLATIONS)) {
  const sameRegex = new RegExp(`"${k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}":\\s*"[^"]*"`);
  if (sameRegex.test(dictContent)) {
    dictContent = dictContent.replace(sameRegex, `"${k}": "${v}"`);
    updatedCount++;
  } else {
    const lastBraceIndex = dictContent.lastIndexOf('};');
    if (lastBraceIndex !== -1) {
      const insertion = `  "${k}": "${v}",\n`;
      dictContent = dictContent.slice(0, lastBraceIndex) + insertion + dictContent.slice(lastBraceIndex);
      addedCount++;
    }
  }
}

fs.writeFileSync(dictFile, dictContent, 'utf8');
console.log(`Updated loading translations in builtInDictionary.js! (Added: ${addedCount}, Updated: ${updatedCount})`);
