const fs = require('fs');
const readline = require('readline');
const path = 'C:/Users/UseR/.gemini/antigravity-ide/brain/77650e55-38e9-4356-a46d-55763bcb7735/.system_generated/logs/transcript_full.jsonl';

async function extract() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  for await (const line of rl) {
    if (line.includes('Total Lines: 1398') && line.includes('file:///c:/laragon/www/TenagaAhli/TenagaAhli/frontend/src/pages/ProfilAhli.jsx')) {
       console.log("Found line with 1398 lines marker. Length:", line.length);
       
       try {
           const obj = JSON.parse(line);
           console.log("type:", obj.type);
           console.log("source:", obj.source);
           const contentObj = JSON.parse(obj.content);
           console.log("output snippet:", (contentObj.output || contentObj.text || '').substring(0, 200));
       } catch(e) {
           console.log("error parsing:", e.message);
       }
       break;
    }
  }
}
extract();
