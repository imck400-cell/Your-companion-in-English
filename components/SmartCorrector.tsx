
import React, { useState } from 'react';
import { UserProfile, CorrectionResult, Language } from '../types';
import { getSmartCorrection } from '../services/geminiService';
import { Wand2, ArrowRight, Check, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { t } from '../utils/translations';
import ExportToolbar from './ExportToolbar';

interface Props {
  user: UserProfile;
  addPoints: (n: number) => void;
  lang: Language;
}

const SmartCorrector: React.FC<Props> = ({ user, addPoints, lang }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCorrection = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const data = await getSmartCorrection(text);
      setResult(data);
      addPoints(10);
    } catch (error) {
      console.error(error);
      alert("Failed to correct text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeak = () => {
      if(result?.correctedText) {
          const utterance = new SpeechSynthesisUtterance(result.correctedText);
          window.speechSynthesis.speak(utterance);
      }
  }

  const getTypeColor = (type: string) => {
      switch(type) {
          case 'grammar': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300';
          case 'spelling': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-300';
          case 'vocabulary': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
          default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
      }
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Input Section */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <Wand2 className="mr-2 rtl:ml-2 rtl:mr-0 text-indigo-600 dark:text-indigo-400" /> {t('smartCorrector', lang)}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">{t('pasteText', lang)}</p>
        </div>
        
        <textarea
          className="w-full flex-1 min-h-[200px] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg resize-none shadow-sm"
          placeholder="e.g. I has went to the store yesterday..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir="ltr"
        />

        <button
          onClick={handleCorrection}
          disabled={isProcessing || !text}
          className="mt-4 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center"
        >
          {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <React.Fragment>{t('correctBtn', lang)} <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0" /></React.Fragment>}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-700 dark:text-slate-200 flex justify-between items-center">
            <span>{t('analysisResults', lang)}</span>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {result && (
                  <button onClick={handleSpeak} className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                      <Volume2 size={16} className="mr-1 rtl:ml-1 rtl:mr-0" /> {t('listen', lang)}
                  </button>
                )}
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p>{t('analysisResults', lang)}...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Corrected Text */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold mb-2">
                    <div className="flex items-center">
                        <Check size={18} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('correctedVersion', lang)}
                    </div>
                    <ExportToolbar 
                        content={result.correctedText} 
                        title="Correction" 
                        lang={lang}
                        data={result.errors}
                    />
                </div>
                <p className="text-lg text-emerald-900 dark:text-emerald-100 leading-relaxed font-medium" dir="ltr">
                  {result.correctedText}
                </p>
              </div>

              {/* Error Breakdown */}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t('mistakesFound', lang)} ({result.errors.length})</h3>
                <div className="space-y-3">
                    {result.errors.map((err, idx) => (
                        <div key={idx} className="p-4 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold border ${getTypeColor(err.type)}`}>
                                    {err.type}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2" dir="ltr">
                                <span className="text-red-500 line-through decoration-2">{err.original}</span>
                                <ArrowRight size={14} className="text-slate-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{err.correction}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2 rounded font-['Noto_Sans_Arabic']" dir="rtl">
                                💡 {err.explanation}
                            </p>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartCorrector;
