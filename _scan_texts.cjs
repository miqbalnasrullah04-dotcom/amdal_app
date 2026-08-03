const fs = require('fs');
const path = require('path');

function findJsxFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      results.push(...findJsxFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = findJsxFiles(path.join(__dirname, 'frontend', 'src'));
const sourceTexts = new Set();

const tRegex = /t\(\s*(['"`])((?:\\.|[^\1])*?)\1(?:\s*,\s*(['"`])((?:\\.|[^\3])*?)\3)?\s*\)/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const arg1 = match[2]?.replace(/\\'/g, "'").replace(/\\"/g, '"');
    const arg2 = match[4]?.replace(/\\'/g, "'").replace(/\\"/g, '"');
    
    let sourceText = (arg2 && arg2.trim()) ? arg2.trim() : (arg1 ? arg1.trim() : '');
    if (sourceText) {
      sourceTexts.add(sourceText);
    }
  }
}

console.log(`Found ${sourceTexts.size} unique source texts used in t(...) calls!`);
const textArray = Array.from(sourceTexts).sort();
console.log('Sample source texts:', textArray.slice(0, 30));
