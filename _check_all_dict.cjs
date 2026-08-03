const fs = require('fs');
const path = require('path');

const dictFile = path.join(__dirname, 'frontend/src/services/builtInDictionary.js');
const dictContent = fs.readFileSync(dictFile, 'utf8');
const existingKeys = new Set();
const keyRegex = /"([^"]+)":\s*"/g;
let match;
while ((match = keyRegex.exec(dictContent)) !== null) {
  existingKeys.add(match[1]);
}

const filesToScan = [
  'Search.jsx',
  'Dashboard.jsx',
  'ProfilPublik.jsx',
  'ProfilSaya.jsx',
  'ProfilAhli.jsx'
];

const missingKeys = new Set();
const tRegex = /t\(\s*(['"`])((?:\\.|[^\1])*?)\1(?:\s*,\s*(['"`])((?:\\.|[^\3])*?)\3)?\s*\)/g;

for (const file of filesToScan) {
  const filePath = path.join(__dirname, 'frontend/src/pages', file);
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  let matchT;
  while ((matchT = tRegex.exec(content)) !== null) {
      const arg1 = matchT[2]?.replace(/\\'/g, "'").replace(/\\"/g, '"');
      const arg2 = matchT[4]?.replace(/\\'/g, "'").replace(/\\"/g, '"');
      let sourceText = (arg2 && arg2.trim()) ? arg2.trim() : (arg1 ? arg1.trim() : '');
      
      if (sourceText && !existingKeys.has(sourceText) && !sourceText.includes('${')) {
        missingKeys.add(sourceText);
      }
  }
}

console.log("Found " + missingKeys.size + " missing keys!");
if (missingKeys.size > 0) {
  console.log(Array.from(missingKeys).slice(0, 50));
}
