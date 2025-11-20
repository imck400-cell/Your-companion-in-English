
import React, { useState } from 'react';
import { UserProfile, GeneratedArticle, Language } from '../types';
import { generateArticle } from '../services/geminiService';
import { BookOpen, Sparkles, Play, Loader2, FileText } from 'lucide-react';
import { t } from '../utils/translations';
import ExportToolbar from './ExportToolbar';

interface Props {
  user: UserProfile;
  addPoints: (n: number) => void;
  lang: Language;
}

const ArticleGenerator: React.FC<Props> = ({ user, addPoints, lang }) => {
  const [topic, setTopic] = useState('');
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const data = await generateArticle(topic, user.level);
      setArticle(data);
      addPoints(15);
    } catch (error) {
      console.error(error);
      alert("Could not generate article.");
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (article) {
        const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.content}`);
        window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('aiReading', lang)}</h2>
        <p className="text-slate-600 dark:text-slate-400">Generate custom reading materials tailored to your <strong>{user.level}</strong> level.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center mb-10 max-w-xl mx-auto">
        <div className="pl-4 rtl:pr-4 rtl:pl-0 text-slate-400">
            <Sparkles size={20} />
        </div>
        <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('enterTopic', lang)}
            className="flex-1 p-3 outline-none text-slate-700 dark:text-white bg-transparent placeholder:text-slate-400"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button 
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center"
        >
            {loading ? <Loader2 className="animate-spin" size={20} /> : t('generateBtn', lang)}
        </button>
      </div>

      {article && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="bg-indigo-900 text-white p-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="inline-block bg-indigo-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-indigo-200">
                                {user.level} Reading
                            </div>
                            <ExportToolbar 
                                content={`${article.title}\n\n${article.content}`} 
                                title={article.title} 
                                lang={lang} 
                                data={article.vocabulary}
                            />
                        </div>
                        <h1 className="text-3xl font-bold mb-4 font-serif" dir="ltr">{article.title}</h1>
                        <button 
                            onClick={handleReadAloud}
                            className="flex items-center space-x-2 rtl:space-x-reverse bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors"
                        >
                            <Play size={16} fill="currentColor" />
                            <span>{t('listen', lang)}</span>
                        </button>
                    </div>
                    <BookOpen className="absolute right-[-20px] bottom-[-20px] rtl:left-[-20px] rtl:right-auto text-indigo-800 w-48 h-48 opacity-50 rotate-12" />
                </div>

                <div className="p-8 md:p-12">
                    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none font-serif leading-loose text-slate-700 dark:text-slate-300" dir="ltr">
                        {article.content.split('\n').map((para, i) => (
                            <p key={i} className="mb-4">{para}</p>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                            <FileText className="mr-2 rtl:ml-2 rtl:mr-0 text-indigo-600 dark:text-indigo-400" /> {t('keyVocabulary', lang)}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {article.vocabulary.map((vocab, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-1" dir="ltr">{vocab.word}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400" dir="ltr">{vocab.definition}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ArticleGenerator;
