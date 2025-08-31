import { Injectable, signal, computed, effect } from '@angular/core';
import { ExamData, ExamResult, Question, ExamContext } from '../../../../models/exam.model';

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

  // Readonly signals
  readonly examData = this._examData.asReadonly();
  readonly flatQuestions = this._flatQuestions.asReadonly();
  readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
  readonly timeRemaining = this._timeRemaining.asReadonly();
  readonly examResult = this._examResult.asReadonly();
  readonly isExamStarted = this._isExamStarted.asReadonly();
  readonly isExamPaused = this._isExamPaused.asReadonly();

  // Computed signals
  readonly currentQuestion = computed(() => {
    const questions = this._flatQuestions();
    const index = this._currentQuestionIndex();
    return questions[index] || null;
  });

  readonly currentContext = computed(() => {
    const question = this.currentQuestion();
    if (!question) return null;

    const examData = this._examData();
    if (!examData) return null;

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
    if (!questions.length) return [];
    
    return questions.map((question, index) => ({
      index,
      questionId: question.id,
      contextId: question.contextId,
      isAnswered: question.userAnswers && question.userAnswers.length > 0,
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
    
    return contexts.map(context => ({
      context,
      questions: questions.filter(q => q.contextId === context.id),
      answered: questions.filter(q => q.contextId === context.id && (q.userAnswers ?? []).length > 0).length
    }));
  });

  // Auto-save effect
  private autoSaveEffect = effect(() => {
    const data = this._examData();
    if (data && this._isExamStarted()) {
      // Auto-save logic here
      this.saveExamProgress();
    }
  });

  setExamData(data: ExamData): void {
    this._examData.set(data);
    this._timeRemaining.set(data.duration);
    this._currentQuestionIndex.set(0);
    this._isExamStarted.set(false);
    this._examResult.set(null);
    
    // Flatten questions from contexts
    this.flattenQuestions(data);
  }

  private flattenQuestions(data: ExamData): void {
    const flatQuestions: FlatQuestion[] = [];
    
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
    const currentIndex = this._currentQuestionIndex();
    
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

  updateQuestionAnswer(questionIndex: number, answers: number[]): void {
    const flatQuestions = this._flatQuestions();
    if (questionIndex >= 0 && questionIndex < flatQuestions.length) {
      const updatedQuestions = [...flatQuestions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        userAnswers: [...answers]
      };
      
      this._flatQuestions.set(updatedQuestions);
      
      // Update original exam data as well
      this.syncBackToExamData(updatedQuestions);
    }
  }

  private syncBackToExamData(flatQuestions: FlatQuestion[]): void {
    const examData = this._examData();
    if (!examData) return;

    const updatedContexts = examData.contexts.map(context => ({
      ...context,
      questions: context.questions.map(question => {
        const flatQuestion = flatQuestions.find(fq => fq.id === question.id && fq.contextId === context.id);
        return flatQuestion ? { ...question, userAnswers: flatQuestion.userAnswers } : question;
      })
    }));

    this._examData.set({
      ...examData,
      contexts: updatedContexts
    });
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
  }

  calculateResult(): ExamResult | null {
    const data = this._examData();
    const flatQuestions = this._flatQuestions();
    if (!data || !flatQuestions.length) return null;

    let correct = 0;
    let listeningCorrect = 0;
    let readingCorrect = 0;
    let listeningTotal = 0;
    let readingTotal = 0;

    flatQuestions.forEach(question => {
      const isCorrect = this.isAnswerCorrect(question);
      
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

  private isAnswerCorrect(question: Question): boolean {
    if (!question.userAnswers || question.userAnswers.length === 0) {
      return false;
    }

    if (question.type === 'single') {
      return question.userAnswers.length === 1 && 
             question.correctAnswers.includes(question.userAnswers[0]);
    } else if (question.type === 'multiple') {
      const userSet = new Set(question.userAnswers);
      const correctSet = new Set(question.correctAnswers);
      return userSet.size === correctSet.size && 
             [...userSet].every(answer => correctSet.has(answer));
    }

    return false;
  }

  private saveExamProgress(): void {
    // Implementation for auto-saving exam progress
    const data = this._examData();
    if (data) {
      const progress = {
        examId: data.id,
        currentIndex: this._currentQuestionIndex(),
        timeRemaining: this._timeRemaining(),
        answers: this._flatQuestions().map(q => ({
          id: q.id,
          contextId: q.contextId,
          userAnswers: q.userAnswers
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