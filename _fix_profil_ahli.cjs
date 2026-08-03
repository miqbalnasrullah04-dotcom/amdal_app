const fs = require('fs');

const file = 'c:/laragon/www/TenagaAhli/TenagaAhli/frontend/src/pages/ProfilAhli.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. review.tanggal
content = content.replace(
  /<span className="text-xs text-gray-400 shrink-0">\{review\.tanggal\}<\/span>/,
  '<span className="text-xs text-gray-400 shrink-0">{t(review.tanggal)}</span>'
);

// 2. 'Baru saja'
content = content.replace(
  /tanggal: 'Baru saja'/g,
  "tanggal: t('Baru saja')"
);

// 3. title="Kredensial terverifikasi"
content = content.replace(
  /title="Kredensial terverifikasi"/g,
  "title={t('Kredensial terverifikasi')}"
);

// 4-8. metrics
content = content.replace(
  />\{profile\.scopus_metrics\s*\|\|\s*t\('auto_profil_lihat_profil',\s*'Lihat Profil'\)\}<\/span>/g,
  ">{t(profile.scopus_metrics) || t('auto_profil_lihat_profil', 'Lihat Profil')}</span>"
);
content = content.replace(
  />\{profile\.google_scholar_metrics\s*\|\|\s*t\('auto_profil_lihat_profil',\s*'Lihat Profil'\)\}<\/span>/g,
  ">{t(profile.google_scholar_metrics) || t('auto_profil_lihat_profil', 'Lihat Profil')}</span>"
);
content = content.replace(
  />\{profile\.sinta_metrics\s*\|\|\s*t\('auto_profil_lihat_profil',\s*'Lihat Profil'\)\}<\/span>/g,
  ">{t(profile.sinta_metrics) || t('auto_profil_lihat_profil', 'Lihat Profil')}</span>"
);
content = content.replace(
  />\{profile\.orcid_metrics\s*\|\|\s*t\('auto_profil_lihat_profil',\s*'Lihat Profil'\)\}<\/span>/g,
  ">{t(profile.orcid_metrics) || t('auto_profil_lihat_profil', 'Lihat Profil')}</span>"
);
content = content.replace(
  />\{profile\.researchgate_metrics\s*\|\|\s*t\('auto_profil_lihat_profil',\s*'Lihat Profil'\)\}<\/span>/g,
  ">{t(profile.researchgate_metrics) || t('auto_profil_lihat_profil', 'Lihat Profil')}</span>"
);

// 9. a.label and a.metrik
content = content.replace(
  /<span className="text-sm font-bold text-gray-900">\{a\.label\}<\/span>\s*<span className="text-xs text-gray-500">\{a\.metrik\}<\/span>/g,
  '<span className="text-sm font-bold text-gray-900">{t(a.label)}</span>\n                  <span className="text-xs text-gray-500">{t(a.metrik)}</span>'
);

// 10. portofolio files
content = content.replace(
  /className="text-xs text-gray-500 hover:text-\[#0EA5E9\] hover:underline truncate">\{f\}<\/a>/g,
  'className="text-xs text-gray-500 hover:text-[#0EA5E9] hover:underline truncate">{t(f)}</a>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Replacements complete.');
