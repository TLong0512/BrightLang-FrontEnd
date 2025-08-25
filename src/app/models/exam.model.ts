export interface Question {
  id: number;
  type: 'single' | 'multiple';
  question: string;
  options: string[];
  correctAnswers: number[];
  userAnswers?: number[];
}

export interface ExamContext {
  id: number;
  type: 'reading' | 'listening' | 'mixed';
  title?: string;
  content?: string; // Reading passage content
  audioUrl?: string; // For listening contexts
  imageUrl?: string; // For image-based contexts
  questions: Question[];
}

export interface ExamData {
  id: string;
  title: string;
  level: string;
  duration: number; // in seconds
  contexts: ExamContext[];
}

export interface ExamResult {
  examId: string;
  correct: number;
  total: number;
  percentage: number;
  listeningScore: number;
  readingScore: number;
  timeSpent: number;
  level: string;
}

export interface ExamLevel {
  value: string;
  label: string;
  description?: string;
}

export interface ExamSubmission {
  examId: string;
  level: string;
  answers: { questionId: number; selectedAnswers: number[] }[];
  timeSpent: number;
  startTime: Date;
  endTime: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ExamSettings {
  allowPause: boolean;
  showTimer: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  volume: number;
}

export interface AudioControls {
  play(): void;
  pause(): void;
  stop(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
}