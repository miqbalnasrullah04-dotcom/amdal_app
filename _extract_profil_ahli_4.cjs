const fs = require('fs');
const readline = require('readline');
const path = 'C:/Users/UseR/.gemini/antigravity-ide/brain/77650e55-38e9-4356-a46d-55763bcb7735/.system_generated/logs/transcript_full.jsonl';

async function extract() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  for await (const line of rl) {
    if (line.includes('Total Lines: 1398') && line.includes('file:///c:/laragon/www/TenagaAhli/TenagaAhli/frontend/src/pages/ProfilAhli.jsx')) {
       try {
           const obj = JSON.parse(line);
           if (typeof obj.content === 'string') {
               const lines = obj.content.split('\n');
               console.log("first 5 lines:", lines.slice(0, 5));
               for(let l of lines.slice(0, 15)) {
                   const match = l.match(/^(\d+):\s(.*)$/);
                   if (match) {
                       console.log("matched!", match[1], match[2]);
                   } else {
                       console.log("NO match:", JSON.stringify(l));
                   }
               }
           }
       } catch(e) {}
       break;
    }
  }
}
extract();
