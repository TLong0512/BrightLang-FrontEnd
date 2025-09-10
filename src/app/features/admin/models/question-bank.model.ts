export interface ExamType {
  id?: string;
  name: string;
  description: string;
}

export interface Level {
  id?: string;
  name?: string;
  examTypeId?: string;
}

export interface SkillLevel {
  id: string;
  skillName: string;
  levelName?: string;
  skillId?: string;
}

export interface Range {
  id?: string;
  name: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  skillLevelId?: string;
}

export interface Context {
  id?: string;
  content?: string;
  explain?: string;
  isBelongTest?: boolean;
  rangeId?: string;
}

export interface Question {
  id?: string;
  content?: string;
  explain?: string;
  questionNumber?: number;
  contextId?: string;
  answerList?: Answer[];
}

export interface QuestionDto {
  questionInformation?: Question;
  contextInformation?: Context;
  rangeName?: string;
  skillName?: string;
  levelName?: string;
  answerDetails?: Answer[];
}
export interface QuestionAdd {
  id?: string;
  content?: string;
  contentMessage?: string;
  explain?: string;
  questionNumber?: number;
  questionNumberMessage?: string;
  context?: Context;
  answerList?: Answer[];
}

export interface QuestionUpdate {
  questionNumber: number
  content: string
  explain: string
  contextUpdate: Context
  listAnswers: Answer[];
}

export interface Answer {
  id?: string;
  value?: string;
  explain?: string;
  isCorrect?: boolean;
  answerMessage?: string;
  questionId?: string;
}

export interface QuestionPage {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: Question[];
}
