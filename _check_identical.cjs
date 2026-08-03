const fs = require('fs');
const path = require('path');

const dictFile = path.join(__dirname, 'frontend/src/services/builtInDictionary.js');
const dictContent = fs.readFileSync(dictFile, 'utf8');

const regex = /"([^"]+)":\s*"([^"]+)"/g;
let identicalCount = 0;
let match;
const identicals = [];
while ((match = regex.exec(dictContent)) !== null) {
  if (match[1] === match[2]) {
    identicalCount++;
    identicals.push(match[1]);
  }
}
console.log('Total identical key-values:', identicalCount);
console.log('Sample identicals:', identicals.slice(0, 50));
