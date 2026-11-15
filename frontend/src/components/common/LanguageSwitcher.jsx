import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const toggleLanguage = () => {
    const newLang = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-slate-300 hover:border-orange-500 bg-white text-slate-700 hover:text-orange-600 shadow-sm ${className}`}
      title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 text-orange-500" />
      <span>{isArabic ? 'English' : 'العربية'}</span>
    </button>
  );
}
