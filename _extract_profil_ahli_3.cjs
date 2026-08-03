const fs = require('fs');
const readline = require('readline');
const path = 'C:/Users/UseR/.gemini/antigravity-ide/brain/77650e55-38e9-4356-a46d-55763bcb7735/.system_generated/logs/transcript_full.jsonl';

async function extract() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  let extractedLines = {};
  
  for await (const line of rl) {
    if (line.includes('Total Lines: 1398') && line.includes('file:///c:/laragon/www/TenagaAhli/TenagaAhli/frontend/src/pages/ProfilAhli.jsx')) {
       try {
           const obj = JSON.parse(line);
           if (typeof obj.content === 'string') {
               const lines = obj.content.split('\n');
               for (const l of lines) {
                  const match = l.match(/^(\d+):\s(.*)$/);
                  if (match) {
                     extractedLines[parseInt(match[1])] = match[2];
                  }
               }
           }
       } catch(e) {}
    }
  }
  
  const maxLine = Math.max(...Object.keys(extractedLines).map(Number));
  let finalFile = '';
  for (let i = 1; i <= maxLine; i++) {
    finalFile += (extractedLines[i] !== undefined ? extractedLines[i] : '') + '\n';
  }
  
  if (maxLine > 1000) {
    fs.writeFileSync('c:/laragon/www/TenagaAhli/TenagaAhli/frontend/src/pages/ProfilAhli.jsx', finalFile);
    console.log('Restored ProfilAhli.jsx with ' + maxLine + ' lines!');
  } else {
    console.log('Not enough lines found: ' + maxLine);
  }
}
extract();
