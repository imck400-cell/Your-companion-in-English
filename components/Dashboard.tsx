
import React from 'react';
import { UserProfile, Language } from '../types';
import { Trophy, Target, Zap, GraduationCap, Mic2 } from 'lucide-react';
import { t } from '../utils/translations';
import { useNavigate } from 'react-router-dom';

interface Props {
  user: UserProfile;
  lang: Language;
  onRetakeTest: () => void;
}

const Dashboard: React.FC<Props> = ({ user, lang, onRetakeTest }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('welcomeBack', lang)}, {user.name}!</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">{t('currentLevel', lang)}: <span className="font-bold text-indigo-600 dark:text-indigo-400">{user.level}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg transform transition hover:scale-105 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Trophy size={24} className="text-yellow-300" />
            </div>
            <span className="text-indigo-100 text-sm font-medium">{t('totalXP', lang)}</span>
          </div>
          <h3 className="text-4xl font-bold">{user.points}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Target size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('goalStreak', lang)}</span>
          </div>
          <h3 className="text-4xl font-bold text-slate-900 dark:text-white">3 <span className="text-lg text-slate-400 font-normal">days</span></h3>
        </div>

        <button 
          onClick={() => navigate('/practice')}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
              <Mic2 size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('practiceMode', lang)}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            Start Now <span className="ml-2 text-lg">→</span>
          </h3>
        </button>
      </div>

      {/* Level Up Section */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="p-3 bg-white dark:bg-indigo-900 rounded-full text-indigo-600 dark:text-indigo-300">
            <GraduationCap size={24} />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg">{t('takeTest', lang)}</h3>
            <p className="text-indigo-700 dark:text-indigo-300 text-sm">Practicing Pronunciation, Writing, and Meaning.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/practice')}
          className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold shadow-md hover:shadow-lg active:transform active:scale-95"
        >
          {t('takeTest', lang)}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
