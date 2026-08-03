const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

const filesToFix = [
  {
    path: 'frontend/src/components/PageLoader.jsx',
    importPath: "import { useTranslation } from '../context/LanguageContext.jsx';",
    componentPattern: /export default function PageLoader\(\{ visible \}\) \{/
  },
  {
    path: 'frontend/src/pages/LengkapiProfil.jsx',
    importPath: "import { useTranslation } from '../context/LanguageContext.jsx';",
    componentPattern: /export default function LengkapiProfil\(\) \{/
  },
  {
    path: 'frontend/src/pages/Pengaturan.jsx',
    importPath: "import { useTranslation } from '../context/LanguageContext.jsx';",
    componentPattern: /export default function Pengaturan\(\) \{/
  },
  {
    path: 'frontend/src/pages/RiwayatPembayaran.jsx',
    importPath: "import { useTranslation } from '../context/LanguageContext.jsx';",
    componentPattern: /export default function RiwayatPembayaran\(\) \{/
  }
];

for (const f of filesToFix) {
  const fullPath = path.join(rootDir, f.path);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Add import if missing
  if (!content.includes('useTranslation')) {
    content = f.importPath + '\n' + content;
  }

  // Add const { t } = useTranslation(); inside component function if missing
  if (!content.includes('useTranslation()')) {
    content = content.replace(f.componentPattern, (match) => {
      return `${match}\n  const { t } = useTranslation();`;
    });
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Successfully fixed imports and hook in ${f.path}`);
}
