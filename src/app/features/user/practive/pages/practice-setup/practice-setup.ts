import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TopikDataService } from '../../services/topik-data.service';

@Component({
  selector: 'app-practice-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="practice-setup-container">
      <div class="navigation">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>
      
      <div class="setup-card">
        <div class="header">
          <h1>{{ getQuestionTypeName() }}</h1>
          <p>Thiết lập số lượng câu hỏi và độ khó</p>
        </div>
        
        <div class="setup-form">
          <div class="input-group">
            <label for="question-count">
              <i class="fas fa-list-ol"></i>
              Số lượng câu hỏi:
            </label>
            <input 
              type="number" 
              id="question-count" 
              [(ngModel)]="questionCount"
              min="1" 
              max="50" 
              class="form-input">
            <div class="input-note">Từ 1 đến 50 câu hỏi</div>
          </div>
          
          <div class="input-group">
            <label for="difficulty">
              <i class="fas fa-chart-line"></i>
              Mức độ khó:
            </label>
            <select 
              id="difficulty" 
              [(ngModel)]="difficulty"
              class="form-select">
              <option value="easy">🟢 Dễ</option>
              <option value="medium">🟡 Trung bình</option>
              <option value="hard">🔴 Khó</option>
            </select>
            <div class="input-note">Chọn mức độ phù hợp với trình độ của bạn</div>
          </div>
          
          <button 
            class="start-btn" 
            (click)="startPractice()"
            [disabled]="loading()">
            @if (loading()) {
              <div class="btn-spinner"></div>
              Đang chuẩn bị...
            } @else {
              <i class="fas fa-play"></i>
              Bắt đầu luyện tập
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .practice-setup-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
    }

    .navigation {
      margin-bottom: 20px;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.9);
      color: #13547a;
      padding: 12px 20px;
      border: 2px solid #80d0c7;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .back-btn:hover {
      background: #80d0c7;
      color: white;
      transform: translateX(-5px);
    }

    .setup-card {
      background: rgba(255, 255, 255, 0.98);
      border-radius: 25px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
      border: 3px solid #80d0c7;
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #80d0c7 0%, #4ecdc4 100%);
      color: white;
      text-align: center;
      padding: 40px 20px;
    }

    .header h1 {
      font-size: 2.2rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .header p {
      opacity: 0.9;
      font-size: 1.1rem;
      margin: 0;
    }

    .setup-form {
      padding: 50px;
    }

    .input-group {
      margin-bottom: 40px;
    }

    .input-group label {
      display: block;
      margin-bottom: 12px;
      font-weight: 700;
      color: #13547a;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-input, .form-select {
      width: 100%;
      padding: 18px 20px;
      border: 3px solid #e0f2f1;
      border-radius: 15px;
      font-size: 1.1rem;
      background: white;
      transition: all 0.3s ease;
      color: #13547a;
      font-weight: 600;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #80d0c7;
      box-shadow: 0 0 0 3px rgba(128, 208, 199, 0.2);
      transform: translateY(-2px);
    }

    .input-note {
      margin-top: 8px;
      color: #666;
      font-size: 0.9rem;
      font-style: italic;
    }

    .start-btn {
      width: 100%;
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
      color: white;
      padding: 20px;
      border: none;
      border-radius: 15px;
      font-size: 1.3rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.4s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 30px;
    }

    .start-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    .start-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .setup-form {
        padding: 30px 20px;
      }
      
      .header h1 {
        font-size: 1.8rem;
      }
      
      .start-btn {
        font-size: 1.1rem;
        padding: 18px;
      }
    }
  `]
})
export class PracticeSetupComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topikDataService = inject(TopikDataService);
  
  protected loading = signal(false);
  protected topikLevel = signal<'topik1' | 'topik2'>('topik1');
  protected skillId = signal<string>('');
  protected questionTypeId = signal<string>('');
  
  protected questionCount = 10;
  protected difficulty: 'easy' | 'medium' | 'hard' = 'medium';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.topikLevel.set(params['topikLevel']);
      this.skillId.set(params['skillId']);
      this.questionTypeId.set(params['questionTypeId']);
    });
  }

  getQuestionTypeName(): string {
    // In real app, you would get this from the service
    const typeNames: { [key: string]: string } = {
      'basic-conversation': 'Hội thoại cơ bản',
      'short-dialogue': 'Đối thoại ngắn',
      'announcement': 'Thông báo',
      'interview': 'Phỏng vấn',
      'lecture': 'Bài giảng',
      'short-text': 'Đoạn văn ngắn',
      'notice': 'Thông báo',
      'essay': 'Bài luận',
      'article': 'Bài báo'
    };
    return typeNames[this.questionTypeId()] || 'Dạng câu hỏi';
  }

  startPractice() {
    this.loading.set(true);
    
    this.topikDataService.generatePracticeSession(
      this.topikLevel(),
      this.skillId(),
      this.questionTypeId(),
      this.questionCount,
      this.difficulty
    ).subscribe({
      next: (session) => {
        this.loading.set(false);
        this.router.navigate(['/home-user/practice-screen', session.id]); 
      },
      error: (error) => {
        console.error('Error generating practice session:', error);
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/home-user/question-types', this.topikLevel(), this.skillId()]);
  }
}