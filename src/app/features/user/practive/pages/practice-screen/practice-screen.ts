import { Component, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PracticeService } from '../../services/practice.service';
import { TopikDataService } from '../../services/topik-data.service';

import { ContextDisplayComponent } from '../../components/context-display/context-display';
import { QuestionNavigatorComponent } from '../../components/question-navigator/question-navigator';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-practice-screen',
  standalone: true,
  imports: [CommonModule, ContextDisplayComponent, QuestionNavigatorComponent, LoadingSpinnerComponent],
  template: `
    <div class="practice-screen-container">
      @if (practiceService.currentSession$ | async; as session) {
        <!-- Header Controls -->
        <div class="practice-header">
          <button class="exit-btn" (click)="confirmExit()">
            <i class="fas fa-times"></i>
            Thoát
          </button>
          
          <div class="progress-info">
            <div class="question-counter">
              <span class="current">{{ practiceService.currentQuestionIndex() + 1 }}</span>
              <span class="divider">/</span>
              <span class="total">{{ session.totalQuestions }}</span>
            </div>
          </div>
          
          @if (practiceService.currentQuestionIndex() === session.totalQuestions - 1) {
            <button class="submit-btn" (click)="submitPractice()">
              <i class="fas fa-check"></i>
              Nộp bài
            </button>
          } @else {
            <div class="placeholder"></div>
          }
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="practiceService.progress()"></div>
        </div>

        <div class="practice-content">
          <!-- Left Panel -->
          <div class="left-panel">
            <!-- Context Display -->
            <app-context-display [context]="practiceService.currentContext()"></app-context-display>
            
            <!-- Question -->
            @if (practiceService.currentQuestion(); as question) {
              <div class="question-container">
                <h3 class="question-text">{{ question.questionText }}</h3>
                
                <ul class="answers-list">
                  @for (option of question.options; track $index) {
                    <li>
                      <button 
                        class="answer-option"
                        [class.selected]="isAnswerSelected($index)"
                        (click)="selectAnswer($index)">
                        <span class="option-number">{{ $index + 1 }}.</span>
                        <span class="option-text">{{ option }}</span>
                      </button>
                    </li>
                  }
                </ul>
              </div>
            }

            <!-- Navigation Controls -->
            <div class="navigation-controls">
              <button 
                class="nav-btn prev-btn" 
                [disabled]="practiceService.currentQuestionIndex() === 0"
                (click)="previousQuestion()">
                <i class="fas fa-arrow-left"></i>
                Câu trước
              </button>
              
              <button 
                class="nav-btn next-btn" 
                [disabled]="practiceService.currentQuestionIndex() === session.totalQuestions - 1"
                (click)="nextQuestion()">
                Câu tiếp
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Right Panel -->
          <div class="right-panel">
            <app-question-navigator 
              [userAnswers]="practiceService.userAnswers()"
              [currentIndex]="practiceService.currentQuestionIndex()"
              (navigateToQuestionEvent)="goToQuestion($event)">
            </app-question-navigator>
          </div>
        </div>
      } @else {
        <app-loading-spinner message="Đang tải bài thi..."></app-loading-spinner>
      }
    </div>
  `,
  styles: [`
    .practice-screen-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
      padding: 15px;
    }

    .practice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.95);
      padding: 20px 30px;
      border-radius: 15px;
      margin-bottom: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      border: 2px solid #80d0c7;
    }

    .exit-btn {
      background: #dc3545;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .exit-btn:hover {
      background: #c82333;
      transform: scale(1.05);
    }

    .progress-info {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .question-counter {
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
      color: white;
      padding: 12px 25px;
      border-radius: 25px;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .current {
      font-size: 1.4rem;
    }

    .divider {
      margin: 0 8px;
      opacity: 0.7;
    }

    .total {
      opacity: 0.9;
    }

    .submit-btn {
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .submit-btn:hover {
      background: #218838;
      transform: scale(1.05);
    }

    .placeholder {
      width: 100px;
    }

    .progress-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      margin-bottom: 20px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #80d0c7, #4ecdc4);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .practice-content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .left-panel {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      border: 2px solid #80d0c7;
    }

    .right-panel {
      position: sticky;
      top: 20px;
      height: fit-content;
    }

    .question-container {
      margin-top: 25px;
    }

    .question-text {
      color: #13547a;
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 25px;
      line-height: 1.6;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid #80d0c7;
    }

    .answers-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .answers-list li {
      margin-bottom: 15px;
    }

    .answer-option {
      width: 100%;
      background: white;
      border: 3px solid #e0f2f1;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 1.1rem;
    }

    .answer-option:hover {
      border-color: #80d0c7;
      background: #f0fffe;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .answer-option.selected {
      border-color: #13547a;
      background: linear-gradient(135deg, #80d0c7 0%, #4ecdc4 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(19, 84, 122, 0.3);
    }

    .option-number {
      font-weight: 700;
      min-width: 25px;
    }

    .option-text {
      flex: 1;
      line-height: 1.5;
    }

    .navigation-controls {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 25px;
      border-top: 2px solid #e0f2f1;
    }

    .nav-btn {
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
      color: white;
      padding: 15px 25px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 140px;
      justify-content: center;
    }

    .nav-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    }

    .nav-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .prev-btn:disabled,
    .next-btn:disabled {
      transform: none;
      box-shadow: none;
    }

    @media (max-width: 1024px) {
      .practice-content {
        grid-template-columns: 1fr;
      }
      
      .right-panel {
        position: static;
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .practice-screen-container {
        padding: 10px;
      }
      
      .practice-header {
        padding: 15px 20px;
        flex-wrap: wrap;
        gap: 15px;
      }
      
      .left-panel {
        padding: 20px;
      }
      
      .question-text {
        font-size: 1.2rem;
        padding: 15px;
      }
      
      .answer-option {
        padding: 15px;
        font-size: 1rem;
      }
      
      .navigation-controls {
        flex-direction: column;
        gap: 15px;
      }
      
      .nav-btn {
        width: 100%;
      }
    }
  `]
})
export class PracticeScreenComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected practiceService = inject(PracticeService);
  private topikDataService = inject(TopikDataService);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const sessionId = params['sessionId'];
      this.loadSession(sessionId);
    });
  }

  ngOnDestroy() {
    // Optional: Save progress before leaving
  }

  private loadSession(sessionId: string) {
    // In real app, load session from service/API
    // For demo, generate a mock session
    this.topikDataService.generatePracticeSession('topik1', 'listening', 'basic-conversation', 10, 'medium')
      .subscribe(session => {
        this.practiceService.startSession(session);
      });
  }

  selectAnswer(answerIndex: number) {
    const currentQuestion = this.practiceService.currentQuestion();
    if (currentQuestion) {
      this.practiceService.selectAnswer(currentQuestion.id, answerIndex);
    }
  }

  isAnswerSelected(answerIndex: number): boolean {
    const currentQuestion = this.practiceService.currentQuestion();
    if (!currentQuestion) return false;
    
    const userAnswer = this.practiceService.userAnswers()
      .find(a => a.questionId === currentQuestion.id);
    
    return userAnswer?.selectedAnswer === answerIndex;
  }

  previousQuestion() {
    this.practiceService.previousQuestion();
  }

  nextQuestion() {
    this.practiceService.nextQuestion();
  }

  goToQuestion(index: number) {
    this.practiceService.goToQuestion(index);
  }

  confirmExit() {
    if (confirm('Bạn có chắc chắn muốn thoát? Kết quả luyện tập sẽ bị mất.')) {
      this.practiceService.resetSession();
      this.router.navigate(['/practice']);
    }
  }

  submitPractice() {
  if (confirm('Bạn có chắc chắn muốn nộp bài?')) {
    this.practiceService.submitPractice().subscribe(result => {
      this.router.navigate(['/home-user/result-screen', 99]); 
    });
  }
}
}