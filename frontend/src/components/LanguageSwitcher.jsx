import { useLanguage } from '../context/LanguageContext.jsx';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center p-1 bg-black border border-gray-800 rounded-2xl shadow-sm">
      <button
        type="button"
        onClick={() => changeLanguage('id')}
        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 select-none ${
          language === 'id'
            ? 'bg-gradient-to-r from-[#00A5E9] to-[#1D4ED8] text-white shadow-sm'
            : 'text-gray-300 hover:text-white'
        }`}
        aria-label="Bahasa Indonesia"
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 select-none ${
          language === 'en'
            ? 'bg-gradient-to-r from-[#00A5E9] to-[#1D4ED8] text-white shadow-sm'
            : 'text-gray-300 hover:text-white'
        }`}
        aria-label="English Language"
      >
        EN
      </button>
    </div>
  );
}
