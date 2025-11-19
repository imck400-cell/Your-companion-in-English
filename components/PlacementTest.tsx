import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { determineLevel } from '../services/geminiService';
import { UserLevel, Language } from '../types';

interface Props {
  onComplete: (level: UserLevel) => void;
  lang: Language;
}

const questions = [
  "I _____ to the cinema yesterday.",
  "She _____ playing the piano right now.",
  "If I _____ you, I would study harder.",
  "By the time he arrived, the train _____ left.",
  "This is the house _____ I was born."
];

const options = [
    ["go", "went", "gone", "going"],
    ["is", "are", "was", "were"],
    ["was", "were", "am", "been"],
    ["has", "have", "had", "having"],
    ["who", "which", "where", "when"]
];

const PlacementTest: React.FC<Props> = ({ onComplete, lang }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setIsAnalyzing(true);
      const level = await determineLevel(newAnswers);
      setIsAnalyzing(false);
      onComplete(level);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in">
        <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analyzing your skills...</h2>
        <p className="text-slate-600 dark:text-slate-400">Our AI is determining the best starting point for you.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-indigo-900 dark:text-white mb-2">Welcome to LinguistAI</h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">Let's find your English level quickly.</p>
        </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 relative overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="absolute top-0 left-0 h-2 bg-indigo-100 dark:bg-indigo-900 w-full">
            <div 
                className="h-full bg-indigo-600 transition-all duration-500" 
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            ></div>
        </div>

        <div className="mt-4">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Question {step + 1} of {questions.length}</span>
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-8 leading-relaxed" dir="ltr">
                {questions[step].split('_____').map((part, i, arr) => (
                    <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && <span className="inline-block w-16 border-b-2 border-indigo-300 mx-2"></span>}
                    </React.Fragment>
                ))}
            </h3>

            <div className="grid gap-3">
                {options[step].map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        className="w-full text-left px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 group flex items-center justify-between"
                        dir="ltr"
                    >
                        <span className="text-lg text-slate-700 dark:text-slate-300 group-hover:text-indigo-900 dark:group-hover:text-indigo-200 font-medium">{option}</span>
                        <ArrowRight className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;