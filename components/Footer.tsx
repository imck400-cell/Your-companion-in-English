import React from 'react';
import { MessageCircle } from 'lucide-react';
import { t } from '../utils/translations';
import { Language } from '../types';

interface Props {
  lang: Language;
  theme?: 'light' | 'dark';
}

const Footer: React.FC<Props> = ({ lang, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-slate-300' : 'text-slate-600';
  const subTextColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const waBg = isDark ? 'bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700';

  return (
    <footer className={`w-full py-6 px-4 mt-auto border-t ${isDark ? 'border-white/10' : 'border-slate-200'} text-center`}>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
        <div className="text-center md:text-left rtl:md:text-right">
          <p className={`font-medium ${textColor} ${lang === 'ar' ? 'font-[Noto_Sans_Arabic]' : ''}`}>
            {t('consultant', lang)}
          </p>
        </div>
        
        <a 
          href="https://wa.me/967780804012" 
          target="_blank" 
          rel="noreferrer"
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${waBg}`}
        >
          <MessageCircle size={18} />
          <span className="font-bold text-sm" dir="ltr">967 780 804 012</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;