const fs = require('fs');
const path = require('path');

const dictFile = path.join(__dirname, 'frontend/src/services/builtInDictionary.js');
const dictContent = fs.readFileSync(dictFile, 'utf8');

const keys = [
  'expert_profile.loading.title',
  'Memuat profil tenaga ahli...',
  'expert_profile.loading.desc',
  'Menghubungkan ke database TenagaAhli.com',
  'expert_profile.not_found.title',
  'Profil Tidak Ditemukan',
  'expert_profile.not_found.desc',
  'Tenaga ahli yang Anda cari tidak dapat ditemukan atau belum terverifikasi.',
  'Memuat...',
  'Memuat data...'
];

for (const k of keys) {
  const match = dictContent.match(new RegExp(`"${k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}":\\s*"([^"]*)"`));
  console.log(`${k} => "${match ? match[1] : 'NOT FOUND'}"`);
}
