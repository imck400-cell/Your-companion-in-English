
export enum UserLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export interface UserProfile {
  name: string;
  level: UserLevel;
  points: number;
  completedLessons: number;
  isLevelAssessed: boolean;
  learnedWords: string[]; // List of words the user has mastered
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface CorrectionError {
  original: string;
  correction: string;
  explanation: string; // In Arabic/English based on context
  type: 'grammar' | 'spelling' | 'vocabulary' | 'style';
}

export interface CorrectionResult {
  correctedText: string;
  errors: CorrectionError[];
}

export interface GeneratedArticle {
  title: string;
  content: string;
  vocabulary: { word: string; definition: string }[];
}

export interface VocabularyItem {
  word: string;
  contextSentence: string;
  definitionEn: string;
}

export type QuestionType = 'pronounce' | 'write' | 'meaning';

export type Language = 'en' | 'ar';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    ar: string;
  };
}
