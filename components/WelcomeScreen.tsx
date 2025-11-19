import React from 'react';
import { MessageCircle, ArrowRight, GraduationCap } from 'lucide-react';
import { t } from '../utils/translations';
import { Language } from '../types';
import Footer from './Footer';

interface Props {
  onStart: () => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const WelcomeScreen: React.FC<Props> = ({ onStart, lang, setLang }) => {
  const isArabic = lang === 'ar';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center text-white relative overflow-hidden ${isArabic ? 'font-[Noto_Sans_Arabic]' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Language Toggle Absolute */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all border border-white/20 font-bold"
        >
          {lang === 'en' ? '🇺🇸 English' : '🇸🇦 العربية'}
        </button>
      </div>

      <div className="z-10 max-w-2xl w-full p-8 text-center flex-1 flex flex-col justify-center items-center">
        <div className="mb-8 bg-white/10 p-6 rounded-full backdrop-blur-md animate-pulse">
          <GraduationCap size={64} className="text-indigo-400" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
          LinguistAI
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-indigo-100">
          {t('welcomeTitle', lang)}
        </h2>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 w-full backdrop-blur-sm">
          <p className="text-lg text-indigo-200 mb-2 font-light">{t('consultant', lang)}</p>
          <a 
            href="https://wa.me/967780804012" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg mt-4"
          >
            <MessageCircle size={24} />
            <span className="font-bold text-lg mx-2" dir="ltr">967 780 804 012</span>
            <span>{t('contactWhatsapp', lang)}</span>
          </a>
        </div>

        <button 
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500 hover:scale-105 shadow-2xl text-xl"
        >
          <span>{t('startButton', lang)}</span>
          <ArrowRight className={`ml-2 w-6 h-6 transition-transform ${isArabic ? 'rotate-180 mr-2 ml-0' : 'ml-2'}`} />
        </button>
      </div>

      <div className="w-full relative z-10">
        <Footer lang={lang} theme="dark" />
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;