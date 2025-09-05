import { Component, OnInit, OnDestroy, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { ExamStateService } from '../../services/exam-state.service';
import { ContextDisplayComponent } from '../../components/context-display/context-display';
import { Router } from '@angular/router';
import { TestService } from '../../services/exam.service';

@Component({
  selector: 'app-test-questions',
  standalone: true,
  imports: [CommonModule, ContextDisplayComponent],
  template: `
    <div class="exam-container min-vh-100 bg-light">
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="d-flex justify-content-center align-items-center min-vh-100">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Đang tạo bài kiểm tra...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage()" class="d-flex justify-content-center align-items-center min-vh-100">
        <div class="text-center">
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ errorMessage() }}
          </div>
          <button class="btn btn-primary" (click)="initializeTest()">
            <i class="fas fa-redo me-2"></i>
            Thử lại
          </button>
        </div>
      </div>

      <!-- Exam Content -->
      <div *ngIf="!isLoading() && !errorMessage() && examStateService.examData()">
        <!-- Top Header -->
        <div class="top-header bg-white shadow-sm py-2 sticky-top">
          <div class="container-fluid">
            <div class="row align-items-center">
              <div class="col-md-3">
                <div class="exam-info">
                  <h6 class="mb-1 text-primary">Bài Kiểm Tra TOPIK</h6>
                  <div class="d-flex align-items-center gap-2">
                    <small class="text-muted">
                      Câu {{ examStateService.currentQuestionIndex() + 1 }} / {{ examStateService.totalQuestions() }}
                    </small>
                    <span class="badge bg-info">
                      {{ getSectionDisplayName() }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6 text-center">
                <div class="d-flex justify-content-center gap-2 quick-actions">
                  <button class="btn btn-sm btn-outline-primary" (click)="markQuestionForReview()" title="Đánh dấu câu hỏi">
                    <i class="fas fa-bookmark"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-warning" (click)="showConfirmFinish.set(true)" title="Nộp bài">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                  <button class="btn btn-sm" 
                          [class.btn-success]="examStateService.isExamPaused()"
                          [class.btn-warning]="!examStateService.isExamPaused()"
                          (click)="togglePause()" 
                          [title]="examStateService.isExamPaused() ? 'Tiếp tục' : 'Tạm dừng'">
                    <i class="fas" [class.fa-play]="examStateService.isExamPaused()" [class.fa-pause]="!examStateService.isExamPaused()"></i>
                  </button>
                </div>
              </div>
              
              <div class="col-md-3">
                <div class="d-flex justify-content-end align-items-center gap-3">
                  <!-- Compact Timer -->
                  <div class="timer-compact text-center">
                    <div class="timer-display-small" [class]="getTimerClass()">
                      {{ examStateService.formattedTimeRemaining() }}
                    </div>
                    <small class="text-muted d-block">Thời gian</small>
                  </div>
                  
                  <!-- Compact Progress -->
                  <div class="progress-compact">
                    <div class="progress mb-1" style="width: 80px; height: 6px;">
                      <div class="progress-bar bg-success" [style.width.%]="examStateService.examProgress()"></div>
                    </div>
                    <small class="text-muted">{{ examStateService.examProgress() }}%</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="container-fluid py-4">
          <div class="row">
            <!-- Context Display (if available) -->
            <div class="col-lg-6" *ngIf="examStateService.currentQuestion()?.contextContent">
              <div class="card border-0 shadow-sm context-card mb-4">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-book-open me-2"></i>
                    {{ examStateService.currentQuestion()?.contextTitle || 'Đoạn văn' }}
                  </h6>
                </div>
                <div class="card-body">
                  <div class="context-content">
                    {{ examStateService.currentQuestion()?.contextContent }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Questions Column -->
            <div class="col-lg-6" [class.col-lg-9]="!examStateService.currentQuestion()?.contextContent">
              <!-- Current Question -->
              <div *ngIf="examStateService.currentQuestion()" class="question-section mb-4">
                <div class="card border-0 shadow-sm question-card">
                  <div class="card-header bg-primary text-white">
                    <h6 class="mb-0">
                      <i class="fas fa-question-circle me-2"></i>
                      Câu {{ examStateService.currentQuestionIndex() + 1 }}
                      <span class="badge bg-light text-dark ms-2">{{ examStateService.currentQuestion()?.skillName }}</span>
                    </h6>
                  </div>
                  <div class="card-body p-4">
                    <div class="question-text mb-3">
                      <div class="question-title">
                        {{ examStateService.currentQuestion()?.questionText || '...' }}
                      </div>

                    </div>

                    <!-- Answer Options -->
                    <div class="answer-options" *ngIf="examStateService.currentQuestion()?.answers && examStateService.currentQuestion()?.answers?.length! > 0">
                      <div *ngFor="let answer of examStateService.currentQuestion()?.answers; let optIdx = index" class="form-check mb-2">
                        <input
                          class="form-check-input"
                          [type]="getQuestionType()"
                          [name]="'question-' + examStateService.currentQuestion()?.id"
                          [id]="'q' + examStateService.currentQuestion()?.id + '-option-' + optIdx"
                          [checked]="isOptionSelected(optIdx)"
                          (change)="onAnswerChange(optIdx, $event)">
                        <label class="form-check-label" [for]="'q' + examStateService.currentQuestion()?.id + '-option-' + optIdx">
                          <span class="option-letter me-2">{{ getOptionLetter(optIdx) }}.</span>
                          {{ answer.answerText }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Question Navigation -->
              <div class="d-flex justify-content-between mb-4 question-navigation">
                <button 
                  class="btn btn-outline-primary"
                  (click)="previousQuestion()" 
                  [disabled]="examStateService.currentQuestionIndex() === 0">
                  <i class="fas fa-chevron-left me-2"></i>
                  Câu Trước
                </button>
                
                <div class="text-center">
                  <small class="text-muted">
                    {{ examStateService.currentQuestionIndex() + 1 }} / {{ examStateService.totalQuestions() }}
                  </small>
                </div>
                
                <button 
                  class="btn"
                  [class.btn-danger]="examStateService.isLastQuestion()"
                  [class.btn-outline-primary]="!examStateService.isLastQuestion()"
                  (click)="nextQuestion()">
                  <ng-container *ngIf="examStateService.isLastQuestion(); else notLastQuestion">
                    <i class="fas fa-flag-checkered me-2"></i>
                    Hoàn Thành
                  </ng-container>
                  <ng-template #notLastQuestion>
                    Câu Sau
                    <i class="fas fa-chevron-right ms-2"></i>
                  </ng-template>
                </button>
              </div>
            </div>

            <!-- Compact Sidebar -->
            <div class="col-lg-3">
              <!-- Question Status Grid -->
              <div class="card border-0 shadow-sm question-status-card">
                <div class="card-header bg-light py-2">
                  <h6 class="mb-0 text-center">
                    <i class="fas fa-th me-1"></i>
                    Câu Hỏi
                  </h6>
                </div>
                <div class="card-body p-2">
                  <div class="row g-1 question-grid-compact">
                    <div class="col-2" *ngFor="let questionStatus of examStateService.answeredQuestions(); let i = index">
                      <button 
                        class="btn btn-sm w-100 question-number-btn-compact"
                        [class]="getQuestionButtonClass(questionStatus)"
                        (click)="jumpToQuestion(questionStatus.index)"
                        [title]="getQuestionTooltip(questionStatus)">
                        {{ questionStatus.index + 1 }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Compact Legend -->
                  <div class="mt-2 pt-2 border-top">
                    <div class="row g-1 text-center" style="font-size: 10px;">
                      <div class="col-4">
                        <div class="btn btn-success btn-sm legend-mini"></div>
                        <div class="text-muted">Xong</div>
                      </div>
                      <div class="col-4">
                        <div class="btn btn-primary btn-sm legend-mini"></div>
                        <div class="text-muted">Hiện tại</div>
                      </div>
                      <div class="col-4">
                        <div class="btn btn-outline-secondary btn-sm legend-mini"></div>
                        <div class="text-muted">Chưa</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Compact Stats -->
              <div class="card border-0 shadow-sm mt-3">
                <div class="card-body p-3">
                  <h6 class="card-title mb-2 text-center">
                    <i class="fas fa-chart-bar me-1"></i>
                    Thống Kê
                  </h6>
                  <div class="stats-compact">
                    <div class="d-flex justify-content-between mb-1">
                      <small class="text-muted">Tổng:</small>
                      <small class="fw-bold">{{ examStateService.totalQuestions() }}</small>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <small class="text-muted">Đã làm:</small>
                      <small class="fw-bold text-success">{{ getAnsweredCount() }}</small>
                    </div>
                    <div class="d-flex justify-content-between">
                      <small class="text-muted">Còn lại:</small>
                      <small class="fw-bold text-warning">{{ examStateService.totalQuestions() - getAnsweredCount() }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div *ngIf="showConfirmFinish()">
        <div class="modal show d-block" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
              <div class="modal-header bg-warning text-dark">
                <h5 class="modal-title">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  XÁC NHẬN NỘP BÀI
                </h5>
              </div>
              <div class="modal-body">
                <p>Bạn có chắc chắn muốn nộp bài không?</p>
                <div class="alert alert-info">
                  <strong>Thống kê bài thi:</strong><br>
                  • Tổng số câu: {{ examStateService.totalQuestions() }}<br>
                  • Đã trả lời: {{ getAnsweredCount() }}/{{ examStateService.totalQuestions() }} câu<br>
                  • Thời gian còn lại: {{ examStateService.formattedTimeRemaining() }}<br>
                  • Tiến độ: {{ examStateService.examProgress() }}%
                </div>
              </div>
              <div class="modal-footer">
                <button 
                  class="btn btn-secondary"
                  (click)="showConfirmFinish.set(false)">
                  Hủy
                </button>
                <button 
                  class="btn btn-danger"
                  (click)="confirmFinishExam()"
                  [disabled]="isSubmitting()">
                  <span *ngIf="isSubmitting()" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!isSubmitting()" class="fas fa-paper-plane me-2"></i>
                  {{ isSubmitting() ? 'Đang nộp...' : 'Nộp bài' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop show"></div>
      </div>
    </div>
  `,
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

  // Answer handling methods - FIXED TO HANDLE BACKEND DATA
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
}