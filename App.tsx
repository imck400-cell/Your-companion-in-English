
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, PenTool, BookOpen, Award, Menu, X, Globe, Mic2 } from 'lucide-react';
import { UserLevel, UserProfile, Language } from './types';
import Dashboard from './components/Dashboard';
import PlacementTest from './components/PlacementTest';
import ConversationLab from './components/ConversationLab';
import SmartCorrector from './components/SmartCorrector';
import ArticleGenerator from './components/ArticleGenerator';
import VocabularyPractice from './components/VocabularyPractice';
import WelcomeScreen from './components/WelcomeScreen';
import Footer from './components/Footer';
import FloatingControls from './components/FloatingControls';
import { t, isRTL } from './utils/translations';

// Simple Store Implementation
const useAppStore = () => {
  const [user, setUser] = useState<UserProfile>(() => {
    if (typeof window === 'undefined') return {
        name: 'Learner',
        level: UserLevel.Beginner,
        points: 0,
        completedLessons: 0,
        isLevelAssessed: false,
        learnedWords: []
    };
    const saved = localStorage.getItem('linguistAI_user');
    return saved ? { 
      ...JSON.parse(saved),
      learnedWords: JSON.parse(saved).learnedWords || [] // Ensure backward compatibility
    } : {
      name: 'Learner',
      level: UserLevel.Beginner,
      points: 0,
      completedLessons: 0,
      isLevelAssessed: false,
      learnedWords: []
    };
  });

  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'ar';
    return (localStorage.getItem('linguistAI_lang') as Language) || 'ar';
  });

  const [hasStarted, setHasStarted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('linguistAI_started') === 'true';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('linguistAI_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('linguistAI_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('linguistAI_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('linguistAI_started', String(hasStarted));
  }, [hasStarted]);

  useEffect(() => {
    localStorage.setItem('linguistAI_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addPoints = (amount: number) => {
    setUser(prev => ({ ...prev, points: prev.points + amount }));
  };

  const updateLevel = (level: UserLevel) => {
    setUser(prev => ({ ...prev, level, isLevelAssessed: true }));
  };
  
  const markWordAsLearned = (word: string) => {
    setUser(prev => {
      if (prev.learnedWords.includes(word.toLowerCase())) return prev;
      return { ...prev, learnedWords: [...prev.learnedWords, word.toLowerCase()] };
    });
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { 
    user, setUser, addPoints, updateLevel, markWordAsLearned,
    lang, setLang, 
    hasStarted, setHasStarted,
    theme, toggleTheme
  };
};

// Sidebar Navigation Component
const Sidebar = ({ isOpen, setIsOpen, lang, setLang }: { isOpen: boolean, setIsOpen: (v: boolean) => void, lang: Language, setLang: (l: Language) => void }) => {
  const location = useLocation();
  const links = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard', lang) },
    { path: '/practice', icon: Mic2, label: t('practiceMode', lang) },
    { path: '/conversation', icon: MessageCircle, label: t('conversationLab', lang) },
    { path: '/corrector', icon: PenTool, label: t('smartCorrector', lang) },
    { path: '/read', icon: BookOpen, label: t('articleGenerator', lang) },
  ];

  const rtlClass = isRTL(lang) ? 'right-0 translate-x-full md:translate-x-0 border-l' : 'left-0 -translate-x-full md:translate-x-0 border-r';
  const rtlOpen = isRTL(lang) ? 'translate-x-0' : 'translate-x-0';

  return (
    <div className={`fixed inset-y-0 z-40 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? rtlOpen : rtlClass} md:relative md:translate-x-0 shadow-xl flex flex-col`}>
      <div className="flex items-center justify-between p-6 border-b border-indigo-800">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
            <span className="text-indigo-900 font-bold">AI</span>
          </div>
          <span className="text-xl font-bold tracking-tight">LinguistAI</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden text-indigo-200">
          <X size={24} />
        </button>
      </div>
      
      <nav className="mt-8 px-4 space-y-2 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}
            >
              <Icon size={20} />
              <span className={`font-medium ${isRTL(lang) ? 'font-[Noto_Sans_Arabic]' : ''}`}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-indigo-800">
        <button 
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-indigo-800 hover:bg-indigo-700 py-2 rounded-lg transition-colors text-indigo-200"
        >
          <Globe size={16} />
          <span>{lang === 'en' ? 'عربي' : 'English'}</span>
        </button>
      </div>

      <div className="p-6 bg-indigo-950">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="bg-indigo-800 p-2 rounded-full">
            <Award className="text-yellow-400" size={20} />
          </div>
          <div className={isRTL(lang) ? 'font-[Noto_Sans_Arabic]' : ''}>
            <p className="text-xs text-indigo-300 uppercase font-bold">{t('proFeatures', lang)}</p>
            <p className="text-sm text-white">{t('aiPowered', lang)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, addPoints, updateLevel, markWordAsLearned, lang, setLang, hasStarted, setHasStarted, theme, toggleTheme } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!hasStarted) {
    return <WelcomeScreen onStart={() => setHasStarted(true)} lang={lang} setLang={setLang} />;
  }

  if (!user.isLevelAssessed) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 ${isRTL(lang) ? 'font-[Noto_Sans_Arabic]' : ''}`}>
         <div className="w-full max-w-4xl mx-auto flex-1 flex items-center justify-center">
            <PlacementTest onComplete={(level) => updateLevel(level)} lang={lang} />
         </div>
         <Footer lang={lang} theme={theme} />
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden ${isRTL(lang) ? 'font-[Noto_Sans_Arabic]' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} lang={lang} setLang={setLang} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white dark:bg-slate-800 shadow-sm z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-600 dark:text-slate-300 hover:text-indigo-600">
              <Menu size={24} />
            </button>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse ml-auto rtl:ml-0 rtl:mr-auto">
              <div className="flex items-center space-x-2 rtl:space-x-reverse bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                <Award size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{user.points} XP</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('level', lang)}:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs uppercase">{user.level}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
          <Routes>
            <Route path="/" element={<Dashboard user={user} lang={lang} onRetakeTest={() => updateLevel(user.level)} />} />
            <Route path="/practice" element={<VocabularyPractice user={user} addPoints={addPoints} markWordAsLearned={markWordAsLearned} lang={lang} />} />
            <Route path="/conversation" element={<ConversationLab user={user} addPoints={addPoints} lang={lang} />} />
            <Route path="/corrector" element={<SmartCorrector user={user} addPoints={addPoints} lang={lang} />} />
            <Route path="/read" element={<ArticleGenerator user={user} addPoints={addPoints} lang={lang} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
          <div className="mt-12">
             <Footer lang={lang} theme={theme} />
          </div>
        </main>

        <FloatingControls toggleTheme={toggleTheme} isDark={theme === 'dark'} toggleSidebar={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
