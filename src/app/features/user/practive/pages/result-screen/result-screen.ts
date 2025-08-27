import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PracticeResult } from '../../../../../models/topik.model';

@Component({
  selector: 'app-result-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="result-screen-container">
      <div class="result-card">
        <div class="result-header">
          <div class="success-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <h1>Kết quả luyện tập</h1>
          <p>Chúc mừng bạn đã hoàn thành bài thi!</p>
        </div>
        
        @if (result(); as res) {
          <div class="score-section">
            <div class="main-score">
              <span class="score-number">{{ res.score }}</span>
              <span class="score-divider">/</span>
              <span class="total-number">{{ res.totalQuestions }}</span>
            </div>
            
            <div class="accuracy-circle">
              <div class="circle-progress" [style]="getCircleStyle(res.accuracy)">
                <span class="accuracy-text">{{ res.accuracy }}%</span>
              </div>
            </div>
          </div>
          
          <div class="result-details">
            <div class="detail-item correct">
              <div class="detail-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="detail-content">
                <span class="detail-label">Số câu đúng</span>
                <span class="detail-value">{{ res.correctAnswers }}</span>
              </div>
            </div>
            
            <div class="detail-item wrong">
              <div class="detail-icon">
                <i class="fas fa-times-circle"></i>
              </div>
              <div class="detail-content">
                <span class="detail-label">Số câu sai</span>
                <span class="detail-value">{{ res.wrongAnswers }}</span>
              </div>
            </div>
            
            <div class="detail-item time">
              <div class="detail-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="detail-content">
                <span class="detail-label">Thời gian</span>
                <span class="detail-value">{{ formatTime(res.timeElapsed) }}</span>
              </div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="action-btn review-btn" (click)="showReview()">
              <i class="fas fa-eye"></i>
              Xem lại bài
            </button>
            <button class="action-btn restart-btn" (click)="restartPractice()">
              <i class="fas fa-redo"></i>
              Làm lại
            </button>
            <button class="action-btn home-btn" (click)="backToHome()">
              <i class="fas fa-home"></i>
              Trang chủ
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .result-screen-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .result-card {
      background: rgba(255, 255, 255, 0.98);
      border-radius: 25px;
      padding: 50px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      border: 3px solid #80d0c7;
      text-align: center;
    }

    .result-header {
      margin-bottom: 40px;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
      font-size: 2.5rem;
      color: white;
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
    }

    .result-header h1 {
      color: #13547a;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .result-header p {
      color: #666;
      font-size: 1.2rem;
      margin: 0;
    }

    .score-section {
      display: flex;
      align-items: center;
      justify-content: space-around;
      margin: 40px 0;
      padding: 30px;
      background: #f8f9fa;
      border-radius: 20px;
      border: 2px solid #e0f2f1;
    }

    .main-score {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .score-number {
      font-size: 4rem;
      font-weight: 700;
      color: #80d0c7;
    }

    .score-divider {
      font-size: 2rem;
      color: #666;
    }

    .total-number {
      font-size: 2rem;
      color: #666;
      font-weight: 600;
    }

    .accuracy-circle {
      position: relative;
      width: 120px;
      height: 120px;
    }

    .circle-progress {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: conic-gradient(#80d0c7 var(--progress, 0%), #e9ecef 0%);
    }

    .circle-progress::before {
      content: '';
      position: absolute;
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
    }

    .accuracy-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: #13547a;
      position: relative;
      z-index: 1;
    }

    .result-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin: 40px 0;
    }

    .detail-item {
      background: white;
      border-radius: 15px;
      padding: 25px 20px;
      border: 2px solid;
      transition: transform 0.3s ease;
    }

    .detail-item:hover {
      transform: translateY(-5px);
    }

    .detail-item.correct {
      border-color: #28a745;
    }

    .detail-item.wrong {
      border-color: #dc3545;
    }

    .detail-item.time {
      border-color: #17a2b8;
    }

    .detail-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .detail-item.correct .detail-icon {
      color: #28a745;
    }

    .detail-item.wrong .detail-icon {
      color: #dc3545;
    }

    .detail-item.time .detail-icon {
      color: #17a2b8;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .detail-label {
      font-size: 0.9rem;
      color: #666;
      font-weight: 600;
    }

    .detail-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #13547a;
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .action-btn {
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

    .review-btn {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
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

    @media (max-width: 768px) {
      .result-card {
        padding: 30px 20px;
        margin: 10px;
      }
      
      .result-header h1 {
        font-size: 2rem;
      }
      
      .score-section {
        flex-direction: column;
        gap: 30px;
        padding: 25px;
      }
      
      .result-details {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: stretch;
      }
      
      .action-btn {
        width: 100%;
      }
    }
  `]
})
export class ResultScreenComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  protected result = signal<PracticeResult | null>(null);

  ngOnInit() {
  this.route.params.subscribe(params => {
    const sessionId = params['sessionId'];
    this.loadResult(sessionId);
  });
}

  private loadResult(sessionId: string) {
    // Mock result for demo
    const mockResult: PracticeResult = {
      sessionId,
      userAnswers: [],
      score: 8,
      totalQuestions: 10,
      correctAnswers: 8,
      wrongAnswers: 2,
      accuracy: 80,
      timeElapsed: 600000 // 10 minutes
    };
    this.result.set(mockResult);
  }

  getCircleStyle(accuracy: number) {
    return {
      '--progress': `${(accuracy / 100) * 360}deg`
    };
  }

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  showReview() {
    this.router.navigate(['/practice/review', this.result()?.sessionId]);
  }

  restartPractice() {
    this.router.navigate(['/practice']);
  }

  backToHome() {
    this.router.navigate(['/practice']);
  }
}