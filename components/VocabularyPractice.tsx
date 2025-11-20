// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, VocabularyItem, QuestionType, UserLevel } from '../types';
import { generateVocabularySet, validateTranslation } from '../services/geminiService';
import { Mic, Volume2, Check, X, ArrowRight, Loader2, PenTool, Globe, SkipForward, AlertCircle, Layers, Trophy, Home, RefreshCcw } from 'lucide-react';
import { t } from '../utils/translations';
import { useNavigate } from 'react-router-dom';

interface Props {
  user: UserProfile;
  addPoints: (n: number) => void;
  markWordAsLearned: (word: string) => void;
  lang: Language;
}

const VocabularyPractice: React.FC<Props> = ({ user, addPoints, markWordAsLearned, lang }) => {
  const navigate = useNavigate();
  const [practiceLevel, setPracticeLevel] = useState<UserLevel>(user.level);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<QuestionType>('pronounce'); // pronounce -> write -> meaning
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning' | null, msg: string }>({ type: null, msg: '' });
  const [isListening, setIsListening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // Stats Tracking
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    skipped: 0,
    mistakes: 0
  });
  
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadQuestions = async () => {
        setLoading(true);
        setIsFinished(false);
        // Pass learned words to exclude them from new generation
        const data = await generateVocabularySet(practiceLevel, user.learnedWords || []);
        
        if (data.length === 0) {
            // Fallback if AI fails completely (rare)
            setItems([
                { word: "Persistence", contextSentence: "Persistence is key to success.", definitionEn: "Firm or obstinate continuance in a course of action in spite of difficulty." },
                { word: "Knowledge", contextSentence: "Knowledge is power.", definitionEn: "Facts, information, and skills acquired by a person through experience or education." }
            ]);
        } else {
            setItems(data);
        }
        
        setCurrentIndex(0);
        setStage('pronounce');
        setFeedback({ type: null, msg: '' });
        setUserInput('');
        setSessionStats({ correct: 0, skipped: 0, mistakes: 0 });
        setLoading(false);
    };

    loadQuestions();
    // EXTREMELY IMPORTANT: Do NOT include user.learnedWords in dependency array.
    // Doing so creates a loop: user gets word right -> word added to learnedWords -> effect runs -> practice resets.
  }, [practiceLevel]); 

  useEffect(() => {
    if (stage !== 'pronounce' && !feedback.type) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [stage, feedback.type]);

  const currentItem = items[currentIndex] || { word: '', contextSentence: '', definitionEn: '' };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Pronunciation Logic
  const startListening = () => {
    // Use type assertion to avoid global declaration conflicts
    const win = window as any;
    if (!('webkitSpeechRecognition' in win) && !('SpeechRecognition' in win)) {
      alert("Speech recognition not supported in this browser. Please type the word instead.");
      return;
    }
    
    const Recognition = win.webkitSpeechRecognition || win.SpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setUserInput(transcript);
      checkPronunciation(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setFeedback({ type: 'error', msg: 'Could not hear you. Try again.' });
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const checkPronunciation = (spokenWord: string) => {
    const target = currentItem.word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    const spoken = spokenWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

    if (spoken.includes(target) || target.includes(spoken)) {
      setFeedback({ type: 'success', msg: t('correct', lang) });
      setSessionStats(s => ({ ...s, correct: s.correct + 1 }));
      addPoints(5);
    } else {
      setFeedback({ type: 'error', msg: `${t('incorrect', lang)}. You said: "${spokenWord}"` });
      setSessionStats(s => ({ ...s, mistakes: s.mistakes + 1 }));
    }
  };

  // Writing Logic
  const checkWriting = () => {
    if (userInput.trim().toLowerCase() === currentItem.word.toLowerCase()) {
      setFeedback({ type: 'success', msg: t('correct', lang) });
      setSessionStats(s => ({ ...s, correct: s.correct + 1 }));
      addPoints(5);
    } else {
      setFeedback({ type: 'error', msg: t('incorrect', lang) });
      setSessionStats(s => ({ ...s, mistakes: s.mistakes + 1 }));
    }
  };

  // Meaning Logic
  const checkMeaning = async () => {
    setFeedback({ type: null, msg: t('loadingPractice', lang) });
    const validation = await validateTranslation(currentItem.word, userInput);
    
    if (validation.isCorrect) {
      setFeedback({ type: 'success', msg: `${t('correct', lang)}! ${validation.feedback}` });
      setSessionStats(s => ({ ...s, correct: s.correct + 1 }));
      addPoints(5);
      // Mark word as learned since they got the meaning right (final step)
      markWordAsLearned(currentItem.word);
    } else {
      setFeedback({ type: 'error', msg: validation.feedback });
      setSessionStats(s => ({ ...s, mistakes: s.mistakes + 1 }));
    }
  };

  const handleSkip = () => {
    let msg = t('skipped', lang);
    
    if (stage === 'write') {
        // For writing, show the word
        msg = `${t('correctAnswerIs', lang)} ${currentItem.word}`;
    } else if (stage === 'meaning') {
        // For meaning, show the English definition as a hint/answer
        msg = `${t('definition', lang)}: ${currentItem.definitionEn}`;
    } else if (stage === 'pronounce') {
        // For pronunciation, just show the word clearly
        msg = `${t('correctPronunciation', lang)}: ${currentItem.word}`;
    }

    setFeedback({ type: 'warning', msg: msg });
    setSessionStats(s => ({ ...s, skipped: s.skipped + 1 }));
  };

  const handleNext = () => {
    setFeedback({ type: null, msg: '' });
    setUserInput('');
    
    if (stage === 'pronounce') {
      setStage('write');
      // Automatically play audio for writing stage
      setTimeout(() => playAudio(currentItem.word), 500);
    } else if (stage === 'write') {
      setStage('meaning');
    } else {
      // Move to next word or finish
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setStage('pronounce');
      } else {
        // Finished set, show results
        setIsFinished(true);
      }
    }
  };

  // --- Render Logic ---
  const reloadSession = () => {
    setPracticeLevel(prev => prev); // Trigger useEffect
    // Manually trigger the load since we didn't actually change the level value if it's the same
    // But React might not trigger useEffect if state is same.
    // Better to just force a re-mount or call logic.
    // Simplest way here:
    window.location.reload(); // Or just refresh component state if we extracted loadQuestions
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500">{t('loadingPractice', lang)}</p>
      </div>
    );
  }

  // --- Results View ---
  if (isFinished) {
    const totalQuestions = items.length * 3; // 3 stages per word
    const totalAttempts = sessionStats.correct + sessionStats.mistakes + sessionStats.skipped;
    // Avoid division by zero
    const accuracy = totalAttempts > 0 ? Math.round((sessionStats.correct / totalAttempts) * 100) : 0;
    
    let performanceMsg = t('performanceFair', lang);
    let colorClass = "text-orange-500";
    
    if (accuracy >= 90) {
        performanceMsg = t('performanceExcellent', lang);
        colorClass = "text-emerald-500";
    } else if (accuracy >= 70) {
        performanceMsg = t('performanceGood', lang);
        colorClass = "text-indigo-500";
    }

    return (
      <div className="max-w-2xl mx-auto animate-in fade-in zoom-in text-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="mb-6 inline-flex p-4 rounded-full bg-indigo-50 dark:bg-indigo-900/30">
                <Trophy size={48} className={colorClass} />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('completed', lang)}</h2>
            <p className={`text-xl font-bold mb-8 ${colorClass}`}>{performanceMsg}</p>

            {/* Score Circle */}
            <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80" cy="80" r="70"
                        stroke="currentColor" strokeWidth="10"
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-700"
                    />
                    <circle
                        cx="80" cy="80" r="70"
                        stroke="currentColor" strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * accuracy) / 100}
                        className={colorClass.replace('text', 'text')}
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${colorClass}`}>{accuracy}%</span>
                    <span className="text-xs text-slate-500 uppercase">{t('accuracy', lang)}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{sessionStats.correct}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('correctAnswers', lang)}</div>
                </div>
                <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{sessionStats.skipped}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('skippedQuestions', lang)}</div>
                </div>
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{sessionStats.mistakes}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('mistakesMade', lang)}</div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg transition-transform transform hover:scale-105"
                >
                    <RefreshCcw size={20} />
                    <span>{t('startNewSession', lang)}</span>
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 font-bold"
                >
                    <Home size={20} />
                    <span>{t('returnHome', lang)}</span>
                </button>
            </div>
        </div>
      </div>
    );
  }

  // --- Question View ---
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in pb-8">
      
      {/* Level Selector */}
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Layers className="text-indigo-600 dark:text-indigo-400" size={20} />
            <span className="font-bold text-slate-700 dark:text-slate-200">{t('selectLevel', lang)}</span>
        </div>
        <div className="flex space-x-1 rtl:space-x-reverse bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            {(['Beginner', 'Intermediate', 'Advanced'] as UserLevel[]).map((lvl) => (
                <button
                    key={lvl}
                    onClick={() => setPracticeLevel(lvl)}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all font-medium ${practiceLevel === lvl ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                    {lvl}
                </button>
            ))}
        </div>
      </div>

      <div className="mb-8 text-center">
        <div className="flex justify-center gap-2 mb-4">
            {items.map((_, idx) => (
                <div key={idx} className={`h-2 w-8 rounded-full transition-colors ${idx === currentIndex ? 'bg-indigo-600' : idx < currentIndex ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
        {/* Stage Indicator */}
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 flex justify-between items-center border-b border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-indigo-700 dark:text-indigo-300 font-bold">
            {stage === 'pronounce' && <><Mic size={20} /> <span>{t('pronounceTask', lang)}</span></>}
            {stage === 'write' && <><PenTool size={20} /> <span>{t('writeTask', lang)}</span></>}
            {stage === 'meaning' && <><Globe size={20} /> <span>{t('meaningTask', lang)}</span></>}
          </div>
          <button onClick={() => playAudio(currentItem.word)} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-400">
            <Volume2 size={24} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          
          {/* Content Display */}
          <div className="mb-8 w-full">
             {stage === 'pronounce' && (
                 <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-wide">{currentItem.word}</h1>
             )}
             {stage === 'write' && (
                 <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-full mb-4 inline-flex">
                     <Volume2 size={48} className="text-slate-400" />
                 </div>
             )}
             {stage === 'meaning' && (
                 <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{currentItem.word}</h1>
             )}
             
             <p className="text-lg text-slate-600 dark:text-slate-400 italic">"{currentItem.contextSentence}"</p>
          </div>

          {/* Interaction Area */}
          <div className="w-full max-w-md space-y-4">
             {stage === 'pronounce' && (
                 <button 
                    onClick={startListening}
                    disabled={feedback.type === 'success' || feedback.type === 'warning'}
                    className={`w-full py-6 rounded-xl flex items-center justify-center space-x-3 rtl:space-x-reverse transition-all transform hover:scale-105 active:scale-95 ${isListening ? 'bg-red-100 text-red-600 ring-2 ring-red-500 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'}`}
                 >
                    <Mic size={24} />
                    <span className="font-bold text-lg">{isListening ? t('stopRecording', lang) : t('startRecording', lang)}</span>
                 </button>
             )}

             {stage !== 'pronounce' && (
                 <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={stage === 'write' ? 'Type the word...' : 'المعنى بالعربية...'}
                    className="w-full p-4 text-center text-xl border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white outline-none transition-all"
                    dir={stage === 'meaning' ? 'rtl' : 'ltr'}
                    disabled={feedback.type === 'success' || feedback.type === 'warning'}
                    autoComplete="off"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !feedback.type) {
                             if (stage === 'write') checkWriting();
                             else checkMeaning();
                        } else if (e.key === 'Enter' && feedback.type) {
                            handleNext();
                        }
                    }}
                 />
             )}

             {/* Action Buttons (Check & Skip) */}
             {!feedback.type && (
                 <div className="flex space-x-3 rtl:space-x-reverse">
                     {stage !== 'pronounce' && (
                        <button 
                            onClick={stage === 'write' ? checkWriting : checkMeaning}
                            disabled={!userInput.trim()}
                            className="flex-1 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors shadow-md"
                        >
                            {t('checkAnswer', lang)}
                        </button>
                     )}
                     <button 
                        onClick={handleSkip}
                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700"
                        title={t('skip', lang)}
                     >
                         <SkipForward size={20} />
                     </button>
                 </div>
             )}

             {/* Feedback Area */}
             {feedback.type && (
                 <div className={`p-4 rounded-xl border flex items-center justify-between animate-in zoom-in-95 shadow-md
                    ${feedback.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' 
                        : feedback.type === 'warning'
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400'
                            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'}`}>
                     <div className="flex items-center flex-1">
                        {feedback.type === 'success' ? <Check size={20} className="mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0" /> 
                         : feedback.type === 'warning' ? <AlertCircle size={20} className="mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0" />
                         : <X size={20} className="mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0" />}
                        <span className="font-bold text-sm text-start">{feedback.msg}</span>
                     </div>
                     
                     {(feedback.type === 'success' || feedback.type === 'warning') ? (
                         <button onClick={handleNext} className="ml-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 flex items-center shadow whitespace-nowrap">
                             {t('nextWord', lang)} <ArrowRight size={16} className="ml-1 rtl:mr-1 rtl:ml-0" />
                         </button>
                     ) : (
                         <button onClick={() => {setFeedback({type: null, msg: ''}); setUserInput(''); inputRef.current?.focus();}} className="ml-2 px-3 py-1 text-sm bg-white/50 rounded hover:bg-white/80 font-bold underline decoration-2">
                             {t('tryAgain', lang)}
                         </button>
                     )}
                 </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VocabularyPractice;