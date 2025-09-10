import { Component, OnInit, OnDestroy, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { ExamStateService } from '../../services/exam-state.service';
import { ContextDisplayComponent } from '../../components/context-display/context-display';
import { Router } from '@angular/router';
import { TestService } from '../../services/exam.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-test-questions',
  standalone: true,
  imports: [CommonModule, ContextDisplayComponent],
  templateUrl: './test-questions.html',
  styleUrls: ['./test-questions.css']
})
export class TestQuestionsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  @Output() examFinished = new EventEmitter<void>();


  examStateService = inject(ExamStateService);
  testService = inject(TestService);

  showConfirmFinish = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');
  timerSubscription: Subscription | null = null;

  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.initializeTest();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  public initializeTest(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Create test using backend API
    this.testService.createTest().subscribe({
      next: (testData) => {
        console.log('Test data received:', testData);
        // Set exam data from TestInProgressDto
        this.examStateService.setExamDataFromTest(testData);
        this.examStateService.startExam();
        this.startTimer();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to create test:', error);
        this.errorMessage.set('Không thể tạo bài kiểm tra. Vui lòng thử lại.');
        this.isLoading.set(false);
      }
    });
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).pipe(
      takeWhile(() => !this.examStateService.isExamPaused())
    ).subscribe(() => {
      const timeRemaining = this.examStateService.timeRemaining();
      if (timeRemaining > 0) {
        this.examStateService.updateTimeRemaining(timeRemaining - 1);
      } else {
        this.finishExam();
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  togglePause(): void {
    if (this.examStateService.isExamPaused()) {
      this.examStateService.resumeExam();
      this.startTimer();
    } else {
      this.examStateService.pauseExam();
      this.stopTimer();
    }
  }

  // Question navigation methods
  previousQuestion(): void {
    this.examStateService.previousQuestion();
  }

  nextQuestion(): void {
    if (this.examStateService.isLastQuestion()) {
      this.showConfirmFinish.set(true);
    } else {
      this.examStateService.nextQuestion();
    }
  }

  jumpToQuestion(index: number): void {
    this.examStateService.setCurrentQuestionIndex(index);
  }

  onAnswerChange(optionIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const currentQuestion = this.examStateService.currentQuestion();

    if (!currentQuestion || !currentQuestion.answers) return;

    const currentAnswers = this.examStateService.userAnswers().get(currentQuestion.id) || [];
    let selectedAnswers: string[] = [];

    // Determine question type based on correct answers count
    const questionType = this.getQuestionType();

    if (questionType === 'radio') {
      // For single choice, store answer ID directly
      if (input.checked && currentQuestion.answers[optionIndex]) {
        selectedAnswers = [currentQuestion.answers[optionIndex].id];
      }
    } else {
      // For multiple choice
      selectedAnswers = [...currentAnswers];
      if (input.checked) {
        if (currentQuestion.answers[optionIndex]) {
          const answerId = currentQuestion.answers[optionIndex].id;
          if (!selectedAnswers.includes(answerId)) {
            selectedAnswers.push(answerId);
          }
        }
      } else {
        if (currentQuestion.answers[optionIndex]) {
          const answerId = currentQuestion.answers[optionIndex].id;
          selectedAnswers = selectedAnswers.filter(x => x !== answerId);
        }
      }
    }

    // Update question answer - this will trigger auto-save
    this.examStateService.updateQuestionAnswer(currentQuestion.id, selectedAnswers);
  }

  isOptionSelected(optionIndex: number): boolean {
    const currentQuestion = this.examStateService.currentQuestion();
    if (!currentQuestion || !currentQuestion.answers) return false;

    const userAnswers = this.examStateService.userAnswers().get(currentQuestion.id) || [];
    const answerId = currentQuestion.answers[optionIndex]?.id;

    return answerId ? userAnswers.includes(answerId) : false;
  }

  getQuestionType(): string {
    const currentQuestion = this.examStateService.currentQuestion();
    if (!currentQuestion || !currentQuestion.answers) return 'radio';

    // If we have explicit type, use it
    if (currentQuestion.type) {
      return currentQuestion.type === 'single' ? 'radio' : 'checkbox';
    }

    // Otherwise, determine by number of correct answers
    const correctCount = currentQuestion.answers.filter(a => a.isCorrect).length;
    return correctCount > 1 ? 'checkbox' : 'radio';
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // UI helper methods
  getTimerClass(): string {
    const time = this.examStateService.timeRemaining();
    if (time <= 60) return 'timer-critical text-danger';
    if (time <= 300) return 'timer-warning text-warning';
    return 'text-success';
  }

  getQuestionButtonClass(questionStatus: any): string {
    if (questionStatus.isCurrent) return 'btn-primary';
    if (questionStatus.isAnswered) return 'btn-success';
    return 'btn-outline-secondary';
  }

  getQuestionTooltip(questionStatus: any): string {
    if (questionStatus.isCurrent) return 'Câu hỏi hiện tại';
    if (questionStatus.isAnswered) return 'Đã trả lời';
    return 'Chưa trả lời';
  }

  getAnsweredCount(): number {
    return this.examStateService.answeredQuestions().filter(q => q.isAnswered).length;
  }

  markQuestionForReview(): void {
    console.log('Question marked for review');
  }

  getSectionDisplayName(): string {
    const currentQuestion = this.examStateService.currentQuestion();
    return currentQuestion?.skillName || 'KIỂM TRA TOPIK';
  }

  confirmFinishExam(): void {
    this.showConfirmFinish.set(false);
    this.isSubmitting.set(true);

    // Submit exam using the service
    this.examStateService.submitExam().subscribe({
      next: (response) => {
        console.log('Exam submitted successfully:', response);
        this.isSubmitting.set(false);
        this.finishExam();
      },
      error: (error) => {
        console.error('Failed to submit exam:', error);
        this.isSubmitting.set(false);
        this.errorMessage.set('Không thể nộp bài. Vui lòng thử lại.');
        // Optionally show error in modal or keep it open
      }
    });
  }

  finishExam(): void {
    this.stopTimer();
    this.router.navigate(['/home-user/test-result']);
  }

  getSafeHtml(htmlContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
}