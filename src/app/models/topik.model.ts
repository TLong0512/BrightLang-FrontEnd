export interface TopikLevel {
  id: string;
  name: string;
  description: string;
  level: 'topik1' | 'topik2';
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface QuestionType {
  id: string;
  name: string;
  skillId: string;
  topikLevel: 'topik1' | 'topik2';
}

export interface Context {
  id: string;
  title?: string;
  textContent?: string;
  audioUrl?: string;
  imageUrl?: string;
  type: 'text' | 'audio' | 'image' | 'mixed';
}

export interface Question {
  id: string;
  contextId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  order: number;
}

export interface PracticeSession {
  id: string;
  topikLevel: 'topik1' | 'topik2';
  skillId: string;
  questionTypeId: string;
  contexts: Context[];
  questions: Question[];
  totalQuestions: number;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect?: boolean;
  timeSpent?: number;
}

export interface PracticeResult {
  sessionId: string;
  userAnswers: UserAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeElapsed: number;
}
interface ReviewItem {
  question: Question;
  userAnswer: UserAnswer;
  isCorrect: boolean;
  context?: Context; // Already optional, this is correct
}