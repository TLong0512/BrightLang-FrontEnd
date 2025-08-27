import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PracticeService } from '../../services/practice.service';
import { PracticeResult, PracticeSession, UserAnswer, Question, Context } from '../../../../../models/topik.model';
import { ContextDisplayComponent } from '../../components/context-display/context-display';
import { FormsModule } from '@angular/forms';

interface ReviewItem {
  question: Question;
  userAnswer: UserAnswer;
  isCorrect: boolean;
  context?: Context;
}

@Component({
  selector: 'app-review-screen',
  standalone: true,
  imports: [CommonModule, ContextDisplayComponent, FormsModule],
  template: `
    <div class="review-screen-container">
      <div class="review-header">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i> Quay lại kết quả
        </button>
        
        <div class="header-content">
          <h1>Xem lại bài làm</h1>
          <p>Chi tiết từng câu hỏi và đáp án</p>
        </div>

        <div class="filter-controls">
          <select [(ngModel)]="filter" (change)="onFilterChange()" class="filter-select">
            <option value="all">Tất cả câu hỏi</option>
            <option value="correct">Chỉ câu đúng</option>
            <option value="incorrect">Chỉ câu sai</option>
            <option value="unanswered">Câu chưa trả lời</option>
          </select>
        </div>
      </div>

      @if (result(); as res) {
        <div class="review-summary">
          <div class="summary-item correct" [class.active]="filter === 'correct'" (click)="setFilter('correct')">
            <i class="fas fa-check-circle"></i>
            <span>{{ res.correctAnswers }} câu đúng</span>
          </div>
          <div class="summary-item wrong" [class.active]="filter === 'incorrect'" (click)="setFilter('incorrect')">
            <i class="fas fa-times-circle"></i>
            <span>{{ res.wrongAnswers }} câu sai</span>
          </div>
          <div class="summary-item unanswered" [class.active]="filter === 'unanswered'" (click)="setFilter('unanswered')">
            <i class="fas fa-question-circle"></i>
            <span>{{ getUnansweredCount() }} chưa trả lời</span>
          </div>
          <div class="summary-item accuracy" [class.active]="filter === 'all'" (click)="setFilter('all')">
            <i class="fas fa-percentage"></i>
            <span>{{ res.accuracy }}% chính xác</span>
          </div>
        </div>

        <div class="review-content">
          @if (filteredReviewData().length === 0) {
            <div class="no-results">
              <i class="fas fa-search"></i>
              <h3>Không có câu hỏi nào phù hợp với bộ lọc</h3>
              <p>Thử chọn bộ lọc khác để xem các câu hỏi.</p>
            </div>
          } @else {
            @for (review of filteredReviewData(); track review.question.id) {
              <div class="review-item" 
                   [class.correct]="review.isCorrect" 
                   [class.incorrect]="!review.isCorrect && review.userAnswer.selectedAnswer !== null"
                   [class.unanswered]="review.userAnswer.selectedAnswer === null">
                
                <div class="question-header">
                  <div class="question-number">
                    Câu {{ getOriginalQuestionIndex(review.question.id) + 1 }}
                    <span class="result-badge" 
                          [class.correct]="review.isCorrect" 
                          [class.incorrect]="!review.isCorrect && review.userAnswer.selectedAnswer !== null"
                          [class.unanswered]="review.userAnswer.selectedAnswer === null">
                      @if (review.userAnswer.selectedAnswer === null) {
                        <i class="fas fa-question"></i>
                        Chưa trả lời
                      } @else if (review.isCorrect) {
                        <i class="fas fa-check"></i>
                        Đúng
                      } @else {
                        <i class="fas fa-times"></i>
                        Sai
                      }
                    </span>
                  </div>
                </div>

                <!-- Context for this question -->
                @if (review.context) {
                  <div class="question-context">
                    <app-context-display [context]="review.context"></app-context-display>
                  </div>
                }

                <div class="question-content">
                  <h4 class="question-text">{{ review.question.questionText }}</h4>
                  
                  <div class="options-review">
                    @for (option of review.question.options; track $index) {
                      <div class="option-item"
                           [class.user-selected]="review.userAnswer.selectedAnswer === $index"
                           [class.correct-answer]="review.question.correctAnswer === $index"
                           [class.wrong-selection]="review.userAnswer.selectedAnswer === $index && !review.isCorrect">
                        
                        <div class="option-indicator">
                          @if (review.question.correctAnswer === $index) {
                            <i class="fas fa-check-circle correct-icon"></i>
                          } @else if (review.userAnswer.selectedAnswer === $index && !review.isCorrect) {
                            <i class="fas fa-times-circle wrong-icon"></i>
                          } @else {
                            <span class="option-number">{{ $index + 1 }}.</span>
                          }
                        </div>
                        
                        <span class="option-text">{{ option }}</span>
                        
                        @if (review.userAnswer.selectedAnswer === $index && review.question.correctAnswer !== $index) {
                          <span class="selection-label your-answer">Bạn đã chọn</span>
                        }
                        
                        @if (review.question.correctAnswer === $index) {
                          <span class="selection-label correct-label">Đáp án đúng</span>
                        }
                      </div>
                    }
                  </div>
                  
                  @if (review.question.explanation) {
                    <div class="explanation-section">
                      <h5>
                        <i class="fas fa-lightbulb"></i>
                        Giải thích:
                      </h5>
                      <p>{{ review.question.explanation }}</p>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>

        <div class="review-footer">
          <button class="action-btn restart-btn" (click)="restartPractice()">
            <i class="fas fa-redo"></i>
            Làm lại bài thi
          </button>
          <button class="action-btn home-btn" (click)="backToHome()">
            <i class="fas fa-home"></i>
            Về trang chủ
          </button>
        </div>
      } @else {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Đang tải kết quả...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .review-screen-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
      padding: 20px;
    }

    .review-header {
      background: rgba(255, 255, 255, 0.98);
      border-radius: 20px;
      padding: 25px 30px;
      margin-bottom: 25px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      border: 2px solid #80d0c7;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 20px;
      align-items: center;
    }

    .back-btn {
      background: #6c757d;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .back-btn:hover {
      background: #5a6268;
      transform: translateX(-3px);
    }

    .header-content {
      text-align: center;
    }

    .header-content h1 {
      color: #13547a;
      font-size: 2.2rem;
      margin-bottom: 5px;
      font-weight: 700;
    }

    .header-content p {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .filter-controls {
      display: flex;
      align-items: center;
    }

    .filter-select {
      padding: 10px 15px;
      border: 2px solid #80d0c7;
      border-radius: 10px;
      background: white;
      color: #13547a;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-select:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(128, 208, 199, 0.2);
    }

    .review-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-item {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      padding: 25px 20px;
      text-align: center;
      border: 3px solid;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .summary-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .summary-item.active {
      background: linear-gradient(135deg, #80d0c7 0%, #4ecdc4 100%);
      color: white;
      border-color: #13547a;
    }

    .summary-item.correct {
      border-color: #28a745;
    }

    .summary-item.wrong {
      border-color: #dc3545;
    }

    .summary-item.unanswered {
      border-color: #ffc107;
    }

    .summary-item.accuracy {
      border-color: #17a2b8;
    }

    .summary-item i {
      font-size: 2rem;
    }

    .summary-item.correct i { color: #28a745; }
    .summary-item.wrong i { color: #dc3545; }
    .summary-item.unanswered i { color: #ffc107; }
    .summary-item.accuracy i { color: #17a2b8; }

    .summary-item.active i {
      color: white;
    }

    .summary-item span {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .review-content {
      display: flex;
      flex-direction: column;
      gap: 25px;
      margin-bottom: 30px;
    }

    .review-item {
      background: rgba(255, 255, 255, 0.98);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      border-left: 6px solid;
      transition: all 0.3s ease;
    }

    .review-item.correct {
      border-left-color: #28a745;
    }

    .review-item.incorrect {
      border-left-color: #dc3545;
    }

    .review-item.unanswered {
      border-left-color: #ffc107;
    }

    .question-header {
      margin-bottom: 25px;
    }

    .question-number {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.4rem;
      font-weight: 700;
      color: #13547a;
    }

    .result-badge {
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .result-badge.correct {
      background: #d4edda;
      color: #155724;
    }

    .result-badge.incorrect {
      background: #f8d7da;
      color: #721c24;
    }

    .result-badge.unanswered {
      background: #fff3cd;
      color: #856404;
    }

    .question-context {
      margin-bottom: 25px;
    }

    .question-text {
      color: #13547a;
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 25px;
      line-height: 1.6;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #80d0c7;
    }

    .options-review {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 25px;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 18px 20px;
      border-radius: 12px;
      border: 2px solid #e9ecef;
      background: white;
      position: relative;
      transition: all 0.3s ease;
    }

    .option-item.correct-answer {
      border-color: #28a745;
      background: #d4edda;
    }

    .option-item.user-selected.wrong-selection {
      border-color: #dc3545;
      background: #f8d7da;
    }

    .option-item.user-selected.correct-answer {
      border-color: #28a745;
      background: #d1ecf1;
    }

    .option-indicator {
      min-width: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .correct-icon {
      color: #28a745;
      font-size: 1.2rem;
    }

    .wrong-icon {
      color: #dc3545;
      font-size: 1.2rem;
    }

    .option-number {
      font-weight: 700;
      color: #666;
    }

    .option-text {
      flex: 1;
      font-size: 1.1rem;
      line-height: 1.5;
    }

    .selection-label {
      font-size: 0.85rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .your-answer {
      background: #f8d7da;
      color: #721c24;
    }

    .correct-label {
      background: #d4edda;
      color: #155724;
    }

    .explanation-section {
      background: #e8f4f8;
      border-radius: 12px;
      padding: 20px;
      border-left: 4px solid #17a2b8;
    }

    .explanation-section h5 {
      color: #0c5460;
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .explanation-section p {
      color: #0c5460;
      line-height: 1.6;
      margin: 0;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      color: #666;
    }

    .no-results i {
      font-size: 4rem;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-results h3 {
      margin-bottom: 10px;
      color: #13547a;
    }

    .review-footer {
      display: flex;
      justify-content: center;
      gap: 20px;
      padding: 30px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .action-btn {
      padding: 15px 30px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 180px;
      justify-content: center;
    }

    .restart-btn {
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
      color: white;
    }

    .home-btn {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }

    .action-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 20px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      color: #13547a;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e9ecef;
      border-top: 4px solid #80d0c7;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .review-header {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 15px;
      }

      .review-summary {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }

      .review-item {
        padding: 20px;
      }

      .question-number {
        flex-direction: column;
        gap: 10px;
        text-align: center;
      }

      .review-footer {
        flex-direction: column;
        gap: 15px;
      }

      .action-btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .review-summary {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReviewScreenComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private practiceService = inject(PracticeService);
  
  protected result = signal<PracticeResult | null>(null);
  protected session = signal<PracticeSession | null>(null);
  protected filter: 'all' | 'correct' | 'incorrect' | 'unanswered' = 'all';
  
  // Computed values
  private reviewData = computed<ReviewItem[]>(() => {
  const res = this.result();
  const sess = this.session();
  
  if (!res || !sess) return [];

  const reviewItems: ReviewItem[] = [];
  
  for (const userAnswer of res.userAnswers) {
    const question = sess.questions.find(q => q.id === userAnswer.questionId);
    if (!question) continue; // Skip if question not found
    
    const context = sess.contexts.find(c => c.id === question.contextId);
    
    reviewItems.push({
      question,
      userAnswer,
      isCorrect: userAnswer.isCorrect === true,
      context
    });
  }
  
  return reviewItems;
});

  protected filteredReviewData = computed<ReviewItem[]>(() => {
    const data = this.reviewData();
    
    switch (this.filter) {
      case 'correct':
        return data.filter(item => item.isCorrect);
      case 'incorrect':
        return data.filter(item => !item.isCorrect && item.userAnswer.selectedAnswer !== null);
      case 'unanswered':
        return data.filter(item => item.userAnswer.selectedAnswer === null);
      default:
        return data;
    }
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const sessionId = params['sessionId'];
      this.loadReviewData(sessionId);
    });
  }

  private loadReviewData(sessionId: string) {
    // Mock data for demo - in real app, load from service
    const mockResult: PracticeResult = {
      sessionId,
      userAnswers: [
        { questionId: 'q1', selectedAnswer: 0, isCorrect: true },
        { questionId: 'q2', selectedAnswer: 2, isCorrect: false },
        { questionId: 'q3', selectedAnswer: null, isCorrect: false }
      ],
      score: 1,
      totalQuestions: 3,
      correctAnswers: 1,
      wrongAnswers: 1,
      accuracy: 33,
      timeElapsed: 300000
    };

    const mockSession: PracticeSession = {
      id: sessionId,
      topikLevel: 'topik1',
      skillId: 'listening',
      questionTypeId: 'basic-conversation',
      contexts: [
        {
          id: 'context-1',
          title: 'Hội thoại tại cửa hàng',
          type: 'audio',
          audioUrl: '/assets/audio/conversation1.mp3'
        }
      ],
      questions: [
        {
          id: 'q1',
          contextId: 'context-1',
          questionText: '남자는 무엇을 사고 싶어합니까?',
          options: ['사과를 사고 싶어합니다.', '바나나를 사고 싶어합니다.', '오렌지를 사고 싶어합니다.', '포도를 사고 싶어합니다.'],
          correctAnswer: 0,
          explanation: '남자가 "사과 얼마예요?"라고 물어봤습니다.',
          order: 1
        },
        {
          id: 'q2',
          contextId: 'context-1',
          questionText: '사과 가격은 얼마입니까?',
          options: ['1000원입니다.', '2000원입니다.', '3000원입니다.', '4000원입니다.'],
          correctAnswer: 1,
          explanation: '여자가 "한 개에 2000원입니다"라고 답했습니다.',
          order: 2
        },
        {
          id: 'q3',
          contextId: 'context-1',
          questionText: '김민수의 가족은 몇 명입니까?',
          options: ['세 명입니다.', '네 명입니다.', '다섯 명입니다.', '여섯 명입니다.'],
          correctAnswer: 1,
          explanation: '본문에서 "우리 가족은 네 명입니다"라고 했습니다.',
          order: 3
        }
      ],
      difficulty: 'medium',
      totalQuestions: 3
    };

    this.result.set(mockResult);
    this.session.set(mockSession);
  }

  protected getUnansweredCount(): number {
    return this.reviewData().filter(item => item.userAnswer.selectedAnswer === null).length;
  }

  protected getOriginalQuestionIndex(questionId: string): number {
    const sess = this.session();
    if (!sess) return 0;
    return sess.questions.findIndex(q => q.id === questionId);
  }

  protected setFilter(filter: 'all' | 'correct' | 'incorrect' | 'unanswered') {
    this.filter = filter;
  }

  protected onFilterChange() {
    // Method called when select changes
  }

  protected restartPractice() {
    this.practiceService.resetSession();
    this.router.navigate(['/practice']);
  }

  protected backToHome() {
    this.router.navigate(['/practice']);
  }

  protected goBack() {
    const sessionId = this.result()?.sessionId;
    if (sessionId) {
      this.router.navigate(['/practice/result', sessionId]);
    } else {
      this.router.navigate(['/practice']);
    }
  }
}