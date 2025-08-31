import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { PracticeSession, UserAnswer, PracticeResult } from '../../../../models/topik.model';

@Injectable({
  providedIn: 'root'
})
export class PracticeService {
  private currentSessionSubject = new BehaviorSubject<PracticeSession | null>(null);
  private userAnswersSignal = signal<UserAnswer[]>([]);
  private currentQuestionIndexSignal = signal<number>(0);
  private startTimeSignal = signal<number>(0);

  readonly currentSession$ = this.currentSessionSubject.asObservable();
  readonly userAnswers = this.userAnswersSignal.asReadonly();
  readonly currentQuestionIndex = this.currentQuestionIndexSignal.asReadonly();

  readonly progress = computed(() => {
    const session = this.currentSessionSubject.value;
    const currentIndex = this.currentQuestionIndexSignal();
    
    if (!session) return 0;
    return ((currentIndex + 1) / session.totalQuestions) * 100;
  });

  readonly currentQuestion = computed(() => {
    const session = this.currentSessionSubject.value;
    const currentIndex = this.currentQuestionIndexSignal();
    
    if (!session || currentIndex >= session.questions.length) return null;
    return session.questions[currentIndex];
  });

  readonly currentContext = computed(() => {
    const question = this.currentQuestion();
    const session = this.currentSessionSubject.value;
    
    if (!question || !session) return null;
    return session.contexts.find(c => c.id === question.contextId) || null;
  });

  startSession(session: PracticeSession): void {
    this.currentSessionSubject.next(session);
    this.userAnswersSignal.set(
      session.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: null
      }))
    );
    this.currentQuestionIndexSignal.set(0);
    this.startTimeSignal.set(Date.now());
  }

  selectAnswer(questionId: string, answerIndex: number): void {
    this.userAnswersSignal.update(answers => 
      answers.map(answer => 
        answer.questionId === questionId
          ? { ...answer, selectedAnswer: answerIndex }
          : answer
      )
    );
  }

  nextQuestion(): void {
    const session = this.currentSessionSubject.value;
    const currentIndex = this.currentQuestionIndexSignal();
    
    if (session && currentIndex < session.questions.length - 1) {
      this.currentQuestionIndexSignal.set(currentIndex + 1);
    }
  }

  previousQuestion(): void {
    const currentIndex = this.currentQuestionIndexSignal();
    
    if (currentIndex > 0) {
      this.currentQuestionIndexSignal.set(currentIndex - 1);
    }
  }

  goToQuestion(index: number): void {
    const session = this.currentSessionSubject.value;
    
    if (session && index >= 0 && index < session.questions.length) {
      this.currentQuestionIndexSignal.set(index);
    }
  }

  submitPractice(): Observable<PracticeResult> {
    const session = this.currentSessionSubject.value;
    const answers = this.userAnswersSignal();
    const startTime = this.startTimeSignal();

    if (!session) {
      throw new Error('No active session');
    }

    // Calculate results
    const answersWithCorrectness = answers.map(answer => {
      const question = session.questions.find(q => q.id === answer.questionId);
      return {
        ...answer,
        isCorrect: question ? answer.selectedAnswer === question.correctAnswer : false
      };
    });

    const correctAnswers = answersWithCorrectness.filter(a => a.isCorrect).length;
    const wrongAnswers = session.totalQuestions - correctAnswers;
    const accuracy = Math.round((correctAnswers / session.totalQuestions) * 100);
    const timeElapsed = Date.now() - startTime;

    const result: PracticeResult = {
      sessionId: session.id,
      userAnswers: answersWithCorrectness,
      score: correctAnswers,
      totalQuestions: session.totalQuestions,
      correctAnswers,
      wrongAnswers,
      accuracy,
      timeElapsed
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(result);
        observer.complete();
      }, 500);
    });
  }

  resetSession(): void {
    this.currentSessionSubject.next(null);
    this.userAnswersSignal.set([]);
    this.currentQuestionIndexSignal.set(0);
    this.startTimeSignal.set(0);
  }
}