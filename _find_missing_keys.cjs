const fs = require('fs');

const dictFile = 'c:/laragon/www/TenagaAhli/TenagaAhli/frontend/src/services/builtInDictionary.js';
const dictContent = fs.readFileSync(dictFile, 'utf8');

// Poor man's parse of keys
const existingKeys = new Set();
const keyRegex = /"([^"]+)":\s*"/g;
let match;
while ((match = keyRegex.exec(dictContent)) !== null) {
  existingKeys.add(match[1]);
}

const file = 'c:/laragon/www/TenagaAhli/TenagaAhli/frontend/src/pages/ProfilAhli.jsx';
const content = fs.readFileSync(file, 'utf8');
const tRegex = /t\(\s*(['"`])((?:\\.|[^\1])*?)\1(?:\s*,\s*(['"`])((?:\\.|[^\3])*?)\3)?\s*\)/g;

const missingKeys = new Set();
let matchT;
while ((matchT = tRegex.exec(content)) !== null) {
    const arg1 = matchT[2]?.replace(/\\'/g, "'").replace(/\\"/g, '"');
    const arg2 = matchT[4]?.replace(/\\'/g, "'").replace(/\\"/g, '"');
    let sourceText = (arg2 && arg2.trim()) ? arg2.trim() : (arg1 ? arg1.trim() : '');
    
    if (sourceText && !existingKeys.has(sourceText)) {
      missingKeys.add(sourceText);
    }
}

console.log("Missing Keys:", Array.from(missingKeys));
