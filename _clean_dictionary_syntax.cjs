const fs = require('fs');
const path = require('path');

const dictFile = path.join(__dirname, 'frontend/src/services/builtInDictionary.js');
let dictContent = fs.readFileSync(dictFile, 'utf8');

// Parse out key-value pairs cleanly using RegExp
const kvRegex = /"((?:\\.|[^"\\])+)":\s*"((?:\\.|[^"\\])+)"/g;
const map = new Map();

let match;
while ((match = kvRegex.exec(dictContent)) !== null) {
  map.set(match[1], match[2]);
}

console.log(`Extracted ${map.size} valid key-value pairs.`);

// Reconstruct file cleanly
let newContent = `// Auto-generated built-in dictionary for instant offline i18n lookup\nconst BUILTIN_DICTIONARY_EN = {\n`;

const entries = Array.from(map.entries());
entries.forEach(([k, v], idx) => {
  const isLast = idx === entries.length - 1;
  const safeK = JSON.stringify(k);
  const safeV = JSON.stringify(v);
  newContent += `  ${safeK}: ${safeV}${isLast ? '' : ','}\n`;
});

newContent += `};\n\nexport default BUILTIN_DICTIONARY_EN;\n`;

fs.writeFileSync(dictFile, newContent, 'utf8');
console.log('builtInDictionary.js cleaned and validated successfully!');
