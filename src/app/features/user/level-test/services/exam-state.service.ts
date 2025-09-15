import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TestService, TestInProgressDto, SubmitTestRequestDto, QuestionDetailDto, AnswerSummaryDto } from './exam.service';

// Updated models to match backend structure
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
  explain?: string;
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
  private readonly _hasUnsavedChanges = signal<boolean>(false);
  private readonly _currentContextId = signal<number>(0);

  // Auto-save subject
  // private autoSaveSubject = new Subject<{questionId: string, answerIds: string[]}>();
  private autoSaveSubject = new Subject<{testId: string, answerIds: string[]}>();
  // Readonly signals
  readonly examData = this._examData.asReadonly();
  readonly flatQuestions = this._flatQuestions.asReadonly();
  readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
  readonly timeRemaining = this._timeRemaining.asReadonly();
  readonly examResult = this._examResult.asReadonly();
  readonly isExamStarted = this._isExamStarted.asReadonly();
  readonly isExamPaused = this._isExamPaused.asReadonly();
  readonly userAnswers = this._userAnswers.asReadonly();
  readonly hasUnsavedChanges = this._hasUnsavedChanges.asReadonly();

  // Computed signals
  readonly currentQuestion = computed(() => {
    const questions = this._flatQuestions();
    const index = this._currentQuestionIndex();
    const question = questions[index] || null;
    
    if (question) {
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

  constructor(private testService: TestService) {
    this.setupAutoSave();
    this.setupBeforeUnloadWarning();
  }

  
  private setupAutoSave(): void {
    this.autoSaveSubject.pipe(
      debounceTime(1000), // Wait 1 second after user stops selecting
      distinctUntilChanged((a, b) => 
        a.testId === b.testId && 
        JSON.stringify(a.answerIds.sort()) === JSON.stringify(b.answerIds.sort())
      )
    ).subscribe(({testId, answerIds}) => {
      this.performAutoSave(testId, answerIds);
    });
  }

  private setupBeforeUnloadWarning(): void {
    // window.addEventListener('beforeunload', (event) => {
    //   if (this._isExamStarted() && this._hasUnsavedChanges()) {
    //     event.preventDefault();
    //     event.returnValue = 'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn thoát không?';
    //     return event.returnValue;
    //   }
    // });
  }


  private performAutoSave(testId: string, answerIds: string[]): void {
    if (!testId || answerIds.length === 0) return;

    this.testService.autoSaveAnswer(testId, answerIds).subscribe({
      next: () => {
        console.log(`Auto-saved ${answerIds.length} answers for test ${testId}`);
        this._hasUnsavedChanges.set(false);
      },
      error: (error) => {
        console.warn('Auto-save failed:', error);
        // Keep unsaved changes flag as true
      }
    });
  }

  /**
   * Initialize exam from backend TestInProgressDto - FIXED MAPPING
   */
  setExamDataFromTest(testData: TestInProgressDto): void {
    console.log('Setting exam data from test:', testData);

    // Reset user answers trước khi set dữ liệu mới
    this._userAnswers.set(new Map());
    this._hasUnsavedChanges.set(false);

    const examData: ExamData = {
      id: testData.id,
      testId: testData.id,
      level: 'intermediate',
      duration: testData.duration || 3600,
      contexts: [],
      listQuestion: testData.questionDetails.map(q => ({
        id: q.id,
        questionText: q.questionText || q.content || '',
        type: this.determineQuestionType(q.answerContents || q.answers || []),
        userAnswers: [],
        questionNumber: q.questionNumber,
        contextContent: q.contextContent,
        skillName: q.skillName,
        answers: (q.answerContents || q.answers || []).map(answer => ({
          id: answer.id,
          answerText: answer.answerText,
          isCorrect: answer.isCorrect
        }))
      }))
    };

    if (testData.choseAnswerIds && testData.choseAnswerIds.length > 0) {
      this.loadPreviousAnswers(testData.choseAnswerIds, examData.listQuestion || []);
    }

    this.setExamData(examData);
  }


  private determineQuestionType(answers: AnswerSummaryDto[]): 'single' | 'multiple' {
    const correctAnswers = answers.filter(a => a.isCorrect);
    return correctAnswers.length > 1 ? 'multiple' : 'single';
  }

  private loadPreviousAnswers(choseAnswerIds: string[], questions: Question[]): void {
    const answerMap = new Map<string, string[]>();
    
    // Group answer IDs by question
    questions.forEach(question => {
      const questionAnswerIds = choseAnswerIds.filter(answerId => 
        question.answers?.some(answer => answer.id === answerId)
      );
      
      if (questionAnswerIds.length > 0) {
        answerMap.set(question.id, questionAnswerIds);
      }
    });
    
    this._userAnswers.set(answerMap);
  }

  setExamData(data: ExamData): void {
    this._examData.set(data);
    this._timeRemaining.set(data.duration);
    this._currentQuestionIndex.set(0);
    this._isExamStarted.set(false);
    this._examResult.set(null);
    this._hasUnsavedChanges.set(false);
    
    // Flatten questions
    this.flattenQuestions(data);
  }

  private flattenQuestions(data: ExamData): void {
    const flatQuestions: FlatQuestion[] = [];
    
    // Process direct list of questions (from TestInProgressDto)
    if (data.listQuestion && data.listQuestion.length > 0) {
      data.listQuestion.forEach((question, index) => {
        // Group questions by skill/context to create virtual contexts
        const contextId = this.getContextIdForQuestion(question, index);
        
        flatQuestions.push({
          ...question,
          userAnswers: question.userAnswers ?? [],
          contextId: contextId,
          contextType: 'mixed',
          contextTitle: question.skillName || `Câu hỏi ${question.questionNumber || index + 1}`,
          contextContent: question.contextContent,
          contextAudioUrl: undefined,
          contextImageUrl: undefined
        });
      });
    }
    
    this._flatQuestions.set(flatQuestions);
  }

  private getContextIdForQuestion(question: Question, index: number): number {
    // Group by skillName to create virtual contexts
    if (question.skillName) {
      // Create a simple hash of skill name to get consistent context IDs
      let hash = 0;
      for (let i = 0; i < question.skillName.length; i++) {
        const char = question.skillName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    }
    return index + 1;
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
    const firstQuestionOfCurrentContext = questions.findIndex(q => q.contextId === currentQuestion.contextId);
    
    if (firstQuestionOfCurrentContext > 0) {
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
    this._hasUnsavedChanges.set(true);
    
    // Get all currently selected answers across all questions
    const allSelectedAnswers = Array.from(currentAnswers.values()).flat();
    const examData = this._examData();
    
    if (examData?.testId && allSelectedAnswers.length > 0) {
      // Trigger auto-save with all selected answers
      this.autoSaveSubject.next({ 
        testId: examData.testId, 
        answerIds: allSelectedAnswers 
      });
    }
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
    this._hasUnsavedChanges.set(false);
    this._currentContextId.set(0);
  }

  /**
   * Resume exam from existing test ID
   */
  resumeExamFromTestId(testId: string): Observable<void> {
    return new Observable(observer => {
      this.testService.resumeTest(testId).subscribe({
        next: (testData) => {
          this.setExamDataFromTest(testData);
          this.startExam();
          observer.next();
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
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

  /**
   * Check if user can safely leave the exam
   */
  canLeaveExam(): boolean {
    return !this._isExamStarted() || !this._hasUnsavedChanges();
  }

  /**
   * Force save all current answers
   */
  forceSaveAllAnswers(): Observable<boolean> {
    return new Observable(observer => {
      const examData = this._examData();
      const userAnswers = this._userAnswers();
      
      if (!examData?.testId) {
        observer.next(false);
        observer.complete();
        return;
      }
      
      // Collect all selected answers
      const allSelectedAnswers = Array.from(userAnswers.values()).flat();
      
      if (allSelectedAnswers.length === 0) {
        observer.next(true);
        observer.complete();
        return;
      }

      this.testService.autoSaveAnswer(examData.testId, allSelectedAnswers).subscribe({
        next: () => {
          this._hasUnsavedChanges.set(false);
          observer.next(true);
          observer.complete();
        },
        error: (error) => {
          console.error('Failed to save all answers:', error);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}