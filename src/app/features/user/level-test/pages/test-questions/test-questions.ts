import { Component, OnInit, OnDestroy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { ExamStateService } from '../../services/exam-state.service';
import { ContextDisplayComponent } from '../../components/context-display/context-display';
import { MockDataService } from '../../services/mock-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-questions',
  standalone: true,
  imports: [CommonModule, ContextDisplayComponent],
  template: `
    <div class="exam-container min-vh-100 bg-light">
      <!-- Top Header -->
      <div class="top-header bg-white shadow-sm py-2 sticky-top">
        <div class="container-fluid">
          <div class="row align-items-center">
            <div class="col-md-3">
              <div class="exam-info">
                <h6 class="mb-1 text-primary">{{ examStateService.examData()?.title }}</h6>
                <div class="d-flex align-items-center gap-2">
                  <small class="text-muted">
                    Context {{ getCurrentContextIndex() + 1 }} / {{ getTotalContexts() }}
                  </small>
                  <span class="badge" [class]="getSectionBadgeClass()">
                    {{ getSectionDisplayName() }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 text-center">
              <div class="d-flex justify-content-center gap-2 quick-actions">
                <button class="btn btn-sm btn-outline-primary" (click)="markContextForReview()" title="Đánh dấu context">
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
          <!-- Questions Column -->
          <div class="col-lg-9">
            <!-- Context Display -->
            <div *ngIf="examStateService.currentContext()" class="context-section mb-4">
              <app-context-display
                [question]="null"
                [context]="examStateService.currentContext()"
                [questionNumber]="0"
                [showContext]="true"
                [contextProgress]="examStateService.contextProgress()" />
            </div>

            <!-- All Questions in Current Context -->
            <div class="questions-list">
              <div *ngFor="let question of getCurrentContextQuestions(); let i = index" class="question-item mb-4">
                <div class="card border-0 shadow-sm question-card">
                  <div class="card-header bg-primary text-white">
                    <h6 class="mb-0">
                      <i class="fas fa-question-circle me-2"></i>
                      Câu {{ getQuestionGlobalIndex(question) + 1 }}
                    </h6>
                  </div>
                  <div class="card-body p-4">
                    <div class="question-text mb-3">
                      <div class="question-title">{{ question.question }}</div>
                    </div>

                    <!-- Answer Options -->
                    <div class="answer-options">
                      <div *ngFor="let option of question.options; let optIdx = index" class="form-check mb-2">
                        <input
                          class="form-check-input"
                          [type]="question.type === 'single' ? 'radio' : 'checkbox'"
                          [name]="'question-' + question.id"
                          [id]="'q' + question.id + '-option-' + optIdx"
                          [checked]="isOptionSelected(question, optIdx)"
                          (change)="onAnswerChange(question, optIdx, $event)">
                        <label class="form-check-label" [for]="'q' + question.id + '-option-' + optIdx">
                          <span class="option-letter me-2">{{ getOptionLetter(optIdx) }}.</span>
                          {{ option }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Context Navigation -->
            <div class="d-flex justify-content-between mb-4 context-navigation">
              <button 
                class="btn btn-outline-primary context-nav-btn"
                (click)="previousContext()" 
                [disabled]="!canGoPreviousContext()">
                <i class="fas fa-chevron-left me-2"></i>
                Context Trước
              </button>
              
              <div class="context-indicator text-center">
                <small class="text-muted">
                  {{ examStateService.currentContext()?.title }}
                </small>
              </div>
              
              <button 
                class="btn context-nav-btn"
                [class.btn-danger]="isLastContext()"
                [class.btn-outline-primary]="!isLastContext()"
                (click)="nextContext()">
                <ng-container *ngIf="isLastContext(); else notLastContext">
                  <i class="fas fa-flag-checkered me-2"></i>
                  Hoàn Thành
                </ng-container>
                <ng-template #notLastContext>
                  <ng-container *ngIf="isEndOfSection(); else normalNext">
                    <i class="fas fa-arrow-right me-2"></i>
                    {{ getNextSection() === 'reading' ? 'Phần Đọc' : 'Tiếp Theo' }}
                  </ng-container>
                  <ng-template #normalNext>
                    Context Sau
                    <i class="fas fa-chevron-right ms-2"></i>
                  </ng-template>
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
                  (click)="confirmFinishExam()">
                  <i class="fas fa-paper-plane me-2"></i>
                  Nộp bài
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
  examFinished = output<void>();
  
  examStateService = inject(ExamStateService);
  mockDataService = inject(MockDataService);
  
  showConfirmFinish = signal<boolean>(false);
  timerSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.loadMockData();
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private loadMockData(): void {
    this.mockDataService.getExamByLevel('beginner').subscribe(data => {
      this.examStateService.setExamData(data);
      this.examStateService.startExam();
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

  // Context navigation methods
  getCurrentContextQuestions(): any[] {
    const currentContext = this.examStateService.currentContext();
    if (!currentContext) return [];
    
    const allQuestions = this.examStateService.flatQuestions();
    return allQuestions.filter(q => q.contextId === currentContext.id);
  }

  getCurrentContextIndex(): number {
    const contexts = this.examStateService.questionsByContext();
    const currentContext = this.examStateService.currentContext();
    return contexts.findIndex(c => c.context.id === currentContext?.id);
  }

  getTotalContexts(): number {
    return this.examStateService.questionsByContext().length;
  }

  canGoPreviousContext(): boolean {
    return this.getCurrentContextIndex() > 0;
  }

  isLastContext(): boolean {
    return this.getCurrentContextIndex() === this.getTotalContexts() - 1;
  }

  previousContext(): void {
    this.examStateService.previousContext();
  }

  nextContext(): void {
    if (this.isLastContext()) {
      this.showConfirmFinish.set(true);
    } else {
      this.examStateService.nextContext();
    }
  }

  // Check if we're at the end of a section
  isEndOfSection(): boolean {
    const currentSection = this.getCurrentSection();
    const currentContext = this.examStateService.currentContext();
    if (!currentContext || !currentSection) return false;
    
    const contextsInSection = this.examStateService.questionsByContext()
      .filter(c => c.context.type === currentSection);
    
    return contextsInSection[contextsInSection.length - 1]?.context.id === currentContext.id;
  }

  getCurrentSection(): 'listening' | 'reading' | null {
    const currentContext = this.examStateService.currentContext();
    if (!currentContext) return null;
    return currentContext.type === 'listening' ? 'listening' : 'reading';
  }

  getNextSection(): 'listening' | 'reading' | null {
    const currentSection = this.getCurrentSection();
    if (currentSection === 'listening') return 'reading';
    if (currentSection === 'reading') return null; // End of exam
    return 'listening'; // Default to listening first
  }

  // Question handling methods
  getQuestionGlobalIndex(question: any): number {
    const allQuestions = this.examStateService.flatQuestions();
    return allQuestions.findIndex(q => q.id === question.id);
  }

  onAnswerChange(question: any, optionIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const questionIndex = this.getQuestionGlobalIndex(question);
    
    if (questionIndex === -1) return;

    let selectedAnswers: number[] = [];
    const currentAnswers = question.userAnswers || [];

    if (question.type === 'single') {
      selectedAnswers = input.checked ? [optionIndex] : [];
    } else {
      selectedAnswers = [...currentAnswers];
      if (input.checked) {
        if (!selectedAnswers.includes(optionIndex)) {
          selectedAnswers.push(optionIndex);
        }
      } else {
        selectedAnswers = selectedAnswers.filter(x => x !== optionIndex);
      }
    }

    this.examStateService.updateQuestionAnswer(questionIndex, selectedAnswers);
  }

  isOptionSelected(question: any, optionIndex: number): boolean {
    return question.userAnswers ? question.userAnswers.includes(optionIndex) : false;
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

  jumpToQuestion(index: number): void {
    this.examStateService.setCurrentQuestionIndex(index);
  }

  markContextForReview(): void {
    console.log('Context marked for review');
  }

  getSectionDisplayName(): string {
    const section = this.getCurrentSection();
    switch(section) {
      case 'listening': return 'PHẦN NGHE';
      case 'reading': return 'PHẦN ĐỌC';
      default: return 'KIỂM TRA';
    }
  }

  getSectionBadgeClass(): string {
    const section = this.getCurrentSection();
    switch(section) {
      case 'listening': return 'badge bg-danger';
      case 'reading': return 'badge bg-success';
      default: return 'badge bg-info';
    }
  }

  confirmFinishExam(): void {
    this.showConfirmFinish.set(false);
    this.finishExam();
  }

  finishExam(): void {
    this.stopTimer();
    this.router.navigate(['/home-user/test-result']);
  }
}