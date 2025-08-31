import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAnswer } from '../../../../../models/topik.model';

@Component({
  selector: 'app-question-navigator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="navigator-container">
      <div class="navigator-header">
        <h4>Điều hướng câu hỏi</h4>
      </div>
      
      <div class="questions-grid">
        @for (answer of userAnswers(); track $index) {
          <button 
            class="question-btn"
            [class.current]="$index === currentIndex()"
            [class.answered]="answer.selectedAnswer !== null"
            [class.unanswered]="answer.selectedAnswer === null"
            (click)="navigateToQuestion($index)">
            {{ $index + 1 }}
          </button>
        }
      </div>
      
      <div class="navigator-stats">
        <div class="stat-item">
          <span class="stat-label">Đã làm:</span>
          <span class="stat-value answered">{{ getAnsweredCount() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Còn lại:</span>
          <span class="stat-value unanswered">{{ getUnansweredCount() }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .navigator-container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      padding: 20px;
      border: 2px solid #80d0c7;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .navigator-header h4 {
      color: #13547a;
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 15px;
      text-align: center;
    }

    .questions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
      gap: 8px;
      margin-bottom: 20px;
    }

    .question-btn {
      width: 45px;
      height: 45px;
      border-radius: 8px;
      border: 2px solid #e0f2f1;
      background: white;
      color: #666;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .question-btn:hover {
      transform: scale(1.1);
    }

    .question-btn.current {
      border-color: #13547a;
      background: #13547a;
      color: white;
      box-shadow: 0 2px 8px rgba(19, 84, 122, 0.3);
    }

    .question-btn.answered:not(.current) {
      border-color: #80d0c7;
      background: #80d0c7;
      color: white;
    }

    .question-btn.unanswered {
      border-color: #ffc107;
      background: #fff3cd;
      color: #856404;
    }

    .navigator-stats {
      display: flex;
      justify-content: space-between;
      padding-top: 15px;
      border-top: 1px solid #e0f2f1;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      font-weight: 600;
    }

    .stat-value {
      font-size: 1.2rem;
      font-weight: 700;
      padding: 8px 12px;
      border-radius: 20px;
    }

    .stat-value.answered {
      background: #80d0c7;
      color: white;
    }

    .stat-value.unanswered {
      background: #fff3cd;
      color: #856404;
    }

    @media (max-width: 768px) {
      .questions-grid {
        grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
        gap: 6px;
      }
      
      .question-btn {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class QuestionNavigatorComponent {
  userAnswers = input.required<UserAnswer[]>();
  currentIndex = input.required<number>();
  
  navigateToQuestionEvent = output<number>();

  navigateToQuestion(index: number) {
    this.navigateToQuestionEvent.emit(index);
  }

  getAnsweredCount(): number {
    return this.userAnswers().filter(a => a.selectedAnswer !== null).length;
  }

  getUnansweredCount(): number {
    return this.userAnswers().filter(a => a.selectedAnswer === null).length;
  }
}