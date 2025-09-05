import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable } from 'rxjs';
import { TestService, TestInProgressDto, SubmitTestRequestDto, QuestionSummaryDto} from './exam.service';

// Updated models to match backend structure exactly
export interface Question {
  id: string;
  questionText: string;
  type: 'single' | 'multiple';
  userAnswers?: string[];
  correctAnswers?: string[];
  answers?: Answer[];
  questionNumber?: number;
  contextContent?: string;
  skillName?: string;
}

export interface Answer {
  id: string;
  answerText: string;
  isCorrect?: boolean;
}

export interface ExamContext {
  id: number;
  type: 'reading' | 'listening' | 'mixed';
  title?: string;
  content?: string;
  audioUrl?: string;
  imageUrl?: string;
  questions: Question[];
}

export interface ExamData {
  id: string;
  testId: string;
  level: string;
  duration: number;
  contexts: ExamContext[];
  listQuestion?: Question[];
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

export interface FlatQuestion extends Question {
  contextId: number;
  contextType: 'reading' | 'listening' | 'mixed';
  contextTitle?: string;
  contextContent?: string;
  contextAudioUrl?: string;
  contextImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExamStateService {
  // Signals for state management
  private readonly _examData = signal<ExamData | null>(null);
  private readonly _flatQuestions = signal<FlatQuestion[]>([]);
  private readonly _currentQuestionIndex = signal<number>(0);
  private readonly _timeRemaining = signal<number>(0);
  private readonly _examResult = signal<ExamResult | null>(null);
  private readonly _isExamStarted = signal<boolean>(false);
  private readonly _isExamPaused = signal<boolean>(false);
  private readonly _userAnswers = signal<Map<string, string[]>>(new Map());

  // Readonly signals
  readonly examData = this._examData.asReadonly();
  readonly flatQuestions = this._flatQuestions.asReadonly();
  readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
  readonly timeRemaining = this._timeRemaining.asReadonly();
  readonly examResult = this._examResult.asReadonly();
  readonly isExamStarted = this._isExamStarted.asReadonly();
  readonly isExamPaused = this._isExamPaused.asReadonly();
  readonly userAnswers = this._userAnswers.asReadonly();

  // Computed signals
  readonly currentQuestion = computed(() => {
    const questions = this._flatQuestions();
    const index = this._currentQuestionIndex();
    const question = questions[index] || null;
    
    if (question) {
      // Attach user answers from our separate tracking
      const answers = this._userAnswers().get(question.id) || [];
      return { ...question, userAnswers: answers };
    }
    
    return question;
  });

  readonly currentContext = computed(() => {
    const question = this.currentQuestion();
    if (!question) return null;

    const examData = this._examData();
    if (!examData || !examData.contexts) return null;

    return examData.contexts.find(context => context.id === question.contextId) || null;
  });

  readonly totalQuestions = computed(() => {
    return this._flatQuestions().length;
  });

  readonly isLastQuestion = computed(() => {
    const total = this.totalQuestions();
    const current = this._currentQuestionIndex();
    return current === total - 1;
  });

  readonly answeredQuestions = computed(() => {
    const questions = this._flatQuestions();
    const userAnswers = this._userAnswers();
    
    if (!questions.length) return [];
    
    return questions.map((question, index) => ({
      index,
      questionId: question.id,
      contextId: question.contextId,
      isAnswered: userAnswers.has(question.id) && (userAnswers.get(question.id)?.length || 0) > 0,
      isCurrent: index === this._currentQuestionIndex(),
      contextType: question.contextType
    }));
  });

  readonly formattedTimeRemaining = computed(() => {
    const time = this._timeRemaining();
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  readonly examProgress = computed(() => {
    const answered = this.answeredQuestions().filter(q => q.isAnswered).length;
    const total = this.totalQuestions();
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  });

  readonly contextProgress = computed(() => {
    const currentQuestion = this.currentQuestion();
    if (!currentQuestion) return { current: 0, total: 0 };

    const questionsInContext = this._flatQuestions().filter(q => q.contextId === currentQuestion.contextId);
    const currentIndexInContext = questionsInContext.findIndex(q => q.id === currentQuestion.id);
    
    return {
      current: currentIndexInContext + 1,
      total: questionsInContext.length
    };
  });

  readonly questionsByContext = computed(() => {
    const questions = this._flatQuestions();
    const contexts = this._examData()?.contexts || [];
    const userAnswers = this._userAnswers();
    
    return contexts.map(context => ({
      context,
      questions: questions.filter(q => q.contextId === context.id),
      answered: questions.filter(q => 
        q.contextId === context.id && 
        userAnswers.has(q.id) && 
        (userAnswers.get(q.id)?.length || 0) > 0
      ).length
    }));
  });

  constructor(private testService: TestService) {}

  // Auto-save effect
  private autoSaveEffect = effect(() => {
    const data = this._examData();
    if (data && this._isExamStarted()) {
      // Auto-save logic here
      this.saveExamProgress();
    }
  });

  /**
   * Initialize exam from backend TestInProgressDto - FIXED MAPPING
   */
  setExamDataFromTest(testData: TestInProgressDto): void {
    const examData: ExamData = {
      id: testData.testId,
      testId: testData.testId,
      level: 'intermediate', // Default or get from another source
      duration: 3600, // Default 1 hour or get from config
      contexts: [],
      listQuestion: testData.listQuestion.map(q => ({
        id: q.id,
        questionText: q.questionText || q.content, // Map content to questionText
        // type: q.type.toLowerCase() as 'single' | 'multiple',

        type: 'single',
        userAnswers: [],
        questionNumber: q.questionNumber,
        contextContent: q.contextContent,
        skillName: q.skillName,
        // Map AnswerContents to answers
        answers: q.answerContents?.map(answer => ({
          id: answer.id,
          answerText: answer.answerText,
          isCorrect: answer.isCorrect
        })) || []
      }))
    };
    
    this.setExamData(examData);
  }

  setExamData(data: ExamData): void {
    this._examData.set(data);
    this._timeRemaining.set(data.duration);
    this._currentQuestionIndex.set(0);
    this._isExamStarted.set(false);
    this._examResult.set(null);
    this._userAnswers.set(new Map());
    
    // Flatten questions from contexts or use direct list
    this.flattenQuestions(data);
  }

  private flattenQuestions(data: ExamData): void {
    const flatQuestions: FlatQuestion[] = [];
    
    // If we have contexts, flatten from contexts
    if (data.contexts && data.contexts.length > 0) {
      data.contexts.forEach(context => {
        context.questions.forEach(question => {
          flatQuestions.push({
            ...question,
            userAnswers: question.userAnswers ?? [],
            contextId: context.id,
            contextType: context.type,
            contextTitle: context.title,
            contextContent: context.content,
            contextAudioUrl: context.audioUrl,
            contextImageUrl: context.imageUrl
          });
        });
      });
    } 
    // If we have a direct list of questions (from TestInProgressDto)
    else if (data.listQuestion && data.listQuestion.length > 0) {
      data.listQuestion.forEach((question, index) => {
        flatQuestions.push({
          ...question,
          userAnswers: question.userAnswers ?? [],
          contextId: index + 1, // Create virtual context IDs
          contextType: 'mixed', // Default type
          contextTitle: `${question.skillName || 'Câu hỏi'} ${question.questionNumber || index + 1}`,
          contextContent: question.contextContent,
          contextAudioUrl: undefined,
          contextImageUrl: undefined
        });
      });
    }
    
    this._flatQuestions.set(flatQuestions);
  }

  startExam(): void {
    this._isExamStarted.set(true);
    this._isExamPaused.set(false);
  }

  pauseExam(): void {
    this._isExamPaused.set(true);
  }

  resumeExam(): void {
    this._isExamPaused.set(false);
  }

  setCurrentQuestionIndex(index: number): void {
    const total = this.totalQuestions();
    if (index >= 0 && index < total) {
      this._currentQuestionIndex.set(index);
    }
  }

  nextQuestion(): void {
    const current = this._currentQuestionIndex();
    const total = this.totalQuestions();
    if (current < total - 1) {
      this._currentQuestionIndex.set(current + 1);
    }
  }

  previousQuestion(): void {
    const current = this._currentQuestionIndex();
    if (current > 0) {
      this._currentQuestionIndex.set(current - 1);
    }
  }

  jumpToContext(contextId: number): void {
    const questions = this._flatQuestions();
    const contextFirstQuestionIndex = questions.findIndex(q => q.contextId === contextId);
    if (contextFirstQuestionIndex !== -1) {
      this.setCurrentQuestionIndex(contextFirstQuestionIndex);
    }
  }

  nextContext(): void {
    const currentQuestion = this.currentQuestion();
    if (!currentQuestion) return;

    const questions = this._flatQuestions();
    const currentIndex = this._currentQuestionIndex();
    
    // Find next question from different context
    for (let i = currentIndex + 1; i < questions.length; i++) {
      if (questions[i].contextId !== currentQuestion.contextId) {
        this.setCurrentQuestionIndex(i);
        break;
      }
    }
  }

  previousContext(): void {
    const currentQuestion = this.currentQuestion();
    if (!currentQuestion) return;

    const questions = this._flatQuestions();
    
    // Find first question of current context
    const firstQuestionOfCurrentContext = questions.findIndex(q => q.contextId === currentQuestion.contextId);
    
    if (firstQuestionOfCurrentContext > 0) {
      // Find the context before current context
      const prevContextQuestion = questions[firstQuestionOfCurrentContext - 1];
      const firstQuestionOfPrevContext = questions.findIndex(q => q.contextId === prevContextQuestion.contextId);
      this.setCurrentQuestionIndex(firstQuestionOfPrevContext);
    }
  }

  updateTimeRemaining(time: number): void {
    this._timeRemaining.set(Math.max(0, time));
  }

  updateQuestionAnswer(questionId: string, answerIds: string[]): void {
    const currentAnswers = new Map(this._userAnswers());
    currentAnswers.set(questionId, [...answerIds]);
    this._userAnswers.set(currentAnswers);
  }

  setExamResult(result: ExamResult): void {
    this._examResult.set(result);
  }

  resetExam(): void {
    this._examData.set(null);
    this._flatQuestions.set([]);
    this._currentQuestionIndex.set(0);
    this._timeRemaining.set(0);
    this._examResult.set(null);
    this._isExamStarted.set(false);
    this._isExamPaused.set(false);
    this._userAnswers.set(new Map());
  }

  /**
   * Submit exam using the backend API
   */
  submitExam(): Observable<string> {
    const examData = this._examData();
    if (!examData?.testId) {
      throw new Error('No exam data available');
    }

    const userAnswers = this._userAnswers();
    const listAnswerIds = Array.from(userAnswers.values()).flat();
    
    // Get correct answers from questions
    const flatQuestions = this._flatQuestions();
    const listTrueAnswerIds: string[] = [];
    
    flatQuestions.forEach(question => {
      if (question.answers) {
        const correctAnswers = question.answers
          .filter(answer => answer.isCorrect)
          .map(answer => answer.id);
        listTrueAnswerIds.push(...correctAnswers);
      }
    });

    const submitRequest: SubmitTestRequestDto = {
      listAnswerIds,
      listTrueAnswerIds
    };

    return this.testService.submitTest(examData.testId, submitRequest);
  }

  calculateResult(): ExamResult | null {
    const data = this._examData();
    const flatQuestions = this._flatQuestions();
    const userAnswers = this._userAnswers();
    
    if (!data || !flatQuestions.length) return null;

    let correct = 0;
    let listeningCorrect = 0;
    let readingCorrect = 0;
    let listeningTotal = 0;
    let readingTotal = 0;

    flatQuestions.forEach(question => {
      const questionAnswers = userAnswers.get(question.id) || [];
      const isCorrect = this.isAnswerCorrect(question, questionAnswers);
      
      if (question.contextType === 'listening') {
        listeningTotal++;
        if (isCorrect) listeningCorrect++;
      } else {
        readingTotal++;
        if (isCorrect) readingCorrect++;
      }

      if (isCorrect) correct++;
    });

    const total = flatQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    const listeningScore = listeningTotal > 0 ? Math.round((listeningCorrect / listeningTotal) * 100) : 0;
    const readingScore = readingTotal > 0 ? Math.round((readingCorrect / readingTotal) * 100) : 0;

    return {
      examId: data.id,
      correct,
      total,
      percentage,
      listeningScore,
      readingScore,
      timeSpent: data.duration - this._timeRemaining(),
      level: data.level
    };
  }

  private isAnswerCorrect(question: FlatQuestion, userAnswers: string[]): boolean {
    if (!userAnswers || userAnswers.length === 0 || !question.answers) {
      return false;
    }

    const correctAnswers = question.answers
      .filter(answer => answer.isCorrect)
      .map(answer => answer.id);

    if (question.type === 'single') {
      return userAnswers.length === 1 && 
             correctAnswers.includes(userAnswers[0]);
    } else if (question.type === 'multiple') {
      const userSet = new Set(userAnswers);
      const correctSet = new Set(correctAnswers);
      return userSet.size === correctSet.size && 
             [...userSet].every(answer => correctSet.has(answer));
    }

    return false;
  }

  private saveExamProgress(): void {
    // Implementation for auto-saving exam progress
    const data = this._examData();
    const userAnswers = this._userAnswers();
    
    if (data) {
      const progress = {
        examId: data.id,
        testId: data.testId,
        currentIndex: this._currentQuestionIndex(),
        timeRemaining: this._timeRemaining(),
        answers: Array.from(userAnswers.entries()).map(([questionId, answers]) => ({
          questionId,
          answerIds: answers
        }))
      };
      
      try {
        // Note: In Claude.ai artifacts, localStorage is not supported
        // In a real application, you would use localStorage or an API call
        console.log('Exam progress would be saved:', progress);
      } catch (error) {
        console.error('Failed to save exam progress:', error);
      }
    }
  }

  loadExamProgress(): void {
    // Note: In Claude.ai artifacts, localStorage is not supported
    // In a real application, you would load from localStorage or an API
    console.log('Exam progress loading not supported in this environment');
  }
}