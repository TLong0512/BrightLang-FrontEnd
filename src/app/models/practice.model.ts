export interface TopikLevel {
  id: string;
  name: string;
  description: string;
}

export interface SubLevel {
  id: string;
  name: string;
}

export interface Skill {
  id: string;
  skillName: string;
}

export interface QuestionType {
  id: string;
  name: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
}

export interface QuestionInformation {
  id: string;
  questionNumber: number;
  content: string;
  explain: string;
}

export interface ContextInformation {
  id: string;
  content: string;
  explain: string;
}

export interface AnswerDetail {
  id: string;
  value: string;
  explain: string;
  isCorrect: boolean;
}

export interface Question {
  questionInformation: QuestionInformation;
  contextInformation: ContextInformation;
  rangeName: string;
  skillName: string;
  levelName: string;
  answerDetails: AnswerDetail[];
}

export interface UserAnswer {
  questionId: string;
  selectedAnswerId: string | null;
  isCorrect: boolean;
}

export interface PracticeResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  userAnswers: UserAnswer[];
  questions: Question[];
}

export interface PracticeSession {
  id: string;
  rangeId: string;
  questions: Question[];
  userAnswers: UserAnswer[];
  status: 'active' | 'completed' | 'paused';
}
