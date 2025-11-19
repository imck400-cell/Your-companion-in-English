
import { TranslationDictionary, Language } from '../types';

export const translations: TranslationDictionary = {
  welcomeTitle: {
    en: "Your Companion in English",
    ar: "رفيقك في اللغة الإنجليزية"
  },
  consultant: {
    en: "Prepared by Administrative and Educational Consultant Ibrahim Dukhan",
    ar: "إعداد المستشار الإداري والتربوي إبراهيم دخان"
  },
  contactWhatsapp: {
    en: "Contact via WhatsApp",
    ar: "للتواصل عبر الواتس"
  },
  startButton: {
    en: "Launch towards creativity and excellence",
    ar: "انطلق نحو الإبداع والتميز"
  },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  conversationLab: { en: "Conversation Lab", ar: "مختبر المحادثة" },
  smartCorrector: { en: "Smart Corrector", ar: "المصحح الذكي" },
  articleGenerator: { en: "Article Generator", ar: "منشئ المحتوى" },
  practiceMode: { en: "Skill Practice", ar: "تدريب المهارات" },
  level: { en: "Level", ar: "المستوى" },
  points: { en: "Points", ar: "نقاط" },
  mistakesFound: { en: "Mistakes Found", ar: "الأخطاء المكتشفة" },
  correctedVersion: { en: "Corrected Version", ar: "النص المصحح" },
  pasteText: { en: "Paste your text below", ar: "الصق النص هنا" },
  correctBtn: { en: "Correct My English", ar: "صحح لغتي" },
  generateBtn: { en: "Generate", ar: "إنشاء" },
  topicPlaceholder: { en: "Enter a topic...", ar: "أدخل موضوعاً..." },
  keyVocabulary: { en: "Key Vocabulary", ar: "المفردات الرئيسية" },
  listen: { en: "Listen", ar: "استماع" },
  export: { en: "Export", ar: "تصدير" },
  copy: { en: "Copy", ar: "نسخ" },
  home: { en: "Home", ar: "الرئيسية" },
  theme: { en: "Theme", ar: "السمة" },
  proFeatures: { en: "Pro Features", ar: "ميزات احترافية" },
  aiPowered: { en: "AI Powered", ar: "مدعوم بالذكاء الاصطناعي" },
  welcomeBack: { en: "Welcome back", ar: "مرحباً بعودتك" },
  currentLevel: { en: "Current Level", ar: "المستوى الحالي" },
  totalXP: { en: "Total XP", ar: "مجموع النقاط" },
  goalStreak: { en: "Streak", ar: "التتابع" },
  lessons: { en: "Lessons", ar: "الدروس" },
  takeTest: { en: "Take Skill Assessment", ar: "اختبار المهارات الشامل" },
  tips: {en: "Tips", ar: "نصائح"},
  selectScenario: {en: "Select Scenario", ar: "اختر السيناريو"},
  typeMessage: {en: "Type your message...", ar: "اكتب رسالتك..."},
  send: {en: "Send", ar: "إرسال"},
  analysisResults: {en: "Analysis Results", ar: "نتائج التحليل"},
  aiReading: {en: "AI Reading Practice", ar: "ممارسة القراءة بالذكاء الاصطناعي"},
  enterTopic: {en: "Enter a topic (e.g., 'Space Travel')", ar: "أدخل موضوعاً (مثلاً: السفر للفضاء)"},
  // Practice Mode
  pronounceTask: {en: "Pronounce the word", ar: "انطق الكلمة"},
  writeTask: {en: "Listen and Write", ar: "استمع واكتب"},
  meaningTask: {en: "What does this mean in Arabic?", ar: "ما معنى هذه الكلمة بالعربية؟"},
  startRecording: {en: "Tap to Speak", ar: "اضغط للتحدث"},
  stopRecording: {en: "Listening...", ar: "جاري الاستماع..."},
  checkAnswer: {en: "Check Answer", ar: "تحقق من الإجابة"},
  nextWord: {en: "Next Word", ar: "الكلمة التالية"},
  correct: {en: "Correct!", ar: "صحيح!"},
  incorrect: {en: "Incorrect", ar: "خطأ"},
  tryAgain: {en: "Try Again", ar: "حاول مرة أخرى"},
  score: {en: "Score", ar: "النتيجة"},
  completed: {en: "Practice Completed!", ar: "اكتمل التدريب!"},
  loadingPractice: {en: "Generating your lesson...", ar: "جاري تحضير الدرس..."},
  selectLevel: {en: "Select Test Level", ar: "اختر مستوى الاختبار"},
  skip: {en: "Skip Question", ar: "تخطي السؤال"},
  skipped: {en: "Skipped", ar: "تم التخطي"},
  correctAnswerIs: {en: "Correct answer:", ar: "الإجابة الصحيحة:"},
  definition: {en: "Definition", ar: "التعريف"},
  correctPronunciation: {en: "Word", ar: "الكلمة"},
  // Results
  results: {en: "Results", ar: "النتائج"},
  accuracy: {en: "Accuracy", ar: "الدقة"},
  correctAnswers: {en: "Correct Answers", ar: "إجابات صحيحة"},
  skippedQuestions: {en: "Skipped", ar: "تم تجاوزها"},
  mistakesMade: {en: "Mistakes", ar: "الأخطاء"},
  performanceExcellent: {en: "Excellent Work!", ar: "أداء ممتاز!"},
  performanceGood: {en: "Good Job!", ar: "عمل جيد!"},
  performanceFair: {en: "Keep Practicing", ar: "استمر في التدريب"},
  startNewSession: {en: "Start New Session", ar: "بدء جلسة جديدة"},
  returnHome: {en: "Return Home", ar: "العودة للرئيسية"},
};

export const t = (key: string, lang: Language): string => {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
};

export const isRTL = (lang: Language): boolean => lang === 'ar';
