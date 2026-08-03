const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

// 1. Update SignIn.jsx
const signInPath = path.join(rootDir, 'frontend/src/pages/SignIn.jsx');
let signInContent = fs.readFileSync(signInPath, 'utf8');
signInContent = signInContent.replace(
  'placeholder="nama@email.com"',
  "placeholder={t('nama@email.com')}"
);
fs.writeFileSync(signInPath, signInContent, 'utf8');
console.log('Updated SignIn.jsx email placeholder');

// 2. Update Daftar.jsx
const daftarPath = path.join(rootDir, 'frontend/src/pages/Daftar.jsx');
let daftarContent = fs.readFileSync(daftarPath, 'utf8');
daftarContent = daftarContent.replace(
  'placeholder="nama@email.com"',
  "placeholder={t('nama@email.com')}"
);
fs.writeFileSync(daftarPath, daftarContent, 'utf8');
console.log('Updated Daftar.jsx email placeholder');

// 3. Update builtInDictionary.js
const dictPath = path.join(rootDir, 'frontend/src/services/builtInDictionary.js');
let dictContent = fs.readFileSync(dictPath, 'utf8');

const newEntries = {
  "nama@email.com": "name@email.com",
  "auth.email_placeholder": "name@email.com"
};

for (const [k, v] of Object.entries(newEntries)) {
  const escapedKey = k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const sameRegex = new RegExp(`"${escapedKey}":\\s*"[^"]*"`);
  if (sameRegex.test(dictContent)) {
    dictContent = dictContent.replace(sameRegex, `"${k}": "${v}"`);
  } else {
    const lastBraceIndex = dictContent.lastIndexOf('};');
    if (lastBraceIndex !== -1) {
      const insertion = `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`;
      dictContent = dictContent.slice(0, lastBraceIndex) + insertion + dictContent.slice(lastBraceIndex);
    }
  }
}

fs.writeFileSync(dictPath, dictContent, 'utf8');
console.log('Updated builtInDictionary.js with email placeholder translation');
