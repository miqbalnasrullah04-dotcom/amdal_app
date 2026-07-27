import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { 
    code: 'id', 
    name: 'Indonesia', 
    flag: 'https://flagcdn.com/w40/id.png',
    flagLarge: 'https://flagcdn.com/w80/id.png'
  },
  { 
    code: 'en', 
    name: 'English', 
    flag: 'https://flagcdn.com/w40/gb.png',
    flagLarge: 'https://flagcdn.com/w80/gb.png'
  },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-8 rounded-md bg-white/95 hover:bg-white shadow-sm border border-gray-200 transition-all hover:shadow-md overflow-hidden hover:border-gray-300"
        aria-label="Change language"
        title={`Current language: ${currentLang.name}`}
      >
        <img 
          src={currentLang.flag} 
          alt={currentLang.name}
          className="w-full h-full object-cover"
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  currentLang.code === lang.code ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                }`}
              >
                <img 
                  src={lang.flagLarge} 
                  alt={lang.name}
                  className="w-8 h-6 object-cover rounded border border-gray-200"
                />
                <span>{lang.name}</span>
                {currentLang.code === lang.code && (
                  <span className="material-symbols-outlined text-[18px] ml-auto" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
