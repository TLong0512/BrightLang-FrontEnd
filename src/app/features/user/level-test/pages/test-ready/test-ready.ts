import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-ready',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100">
      <div class="card shadow-lg ready-card">
        <div class="card-body text-center p-5">
          <div class="ready-header p-4 rounded mb-4">
            <div class="ready-icon mb-3">
              <i class="fas fa-rocket fa-3x"></i>
            </div>
            <h4 class="mb-0">ARE YOU READY?</h4>
            <p class="mt-2 mb-0">Hãy chuẩn bị tinh thần cho bài thi!</p>
          </div>
          
          <div class="d-flex justify-content-center gap-3">
            <button 
              class="btn btn-danger btn-lg px-4 action-button"
              (click)="onReady(false)"
              [disabled]="isProcessing()">
              <i class="fas fa-times me-2"></i>
              NO
            </button>
            <button 
              class="btn btn-success btn-lg px-4 action-button"
              (click)="onReady(true)"
              [disabled]="isProcessing()">
              <i class="fas fa-check me-2"></i>
              YES
            </button>
          </div>

          <div class="mt-3" *ngIf="isProcessing()">
            <div class="spinner-border spinner-border-sm text-primary me-2"></div>
            <span>Đang chuẩn bị bài thi...</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-100 { 
      min-height: 100vh; 
      background: #ffffff;
    }

    .ready-card { 
      border-radius: 20px;
      width: 500px;
      border: none;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
      background: #ffffff;
      border: 2px solid #7fffd4;
    }

    .ready-header {
      background: #f8f9fa;
      border-radius: 15px;
      border: 2px solid #7fffd4;
    }

    .ready-icon {
      color: #13547a;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }

    .action-button { 
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 120px;
    }

    .action-button:hover:not(:disabled) { 
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .action-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    h4 {
      color: #333;
      font-weight: 600;
    }

    p {
      color: #666;
      font-size: 14px;
    }
  `]
})
export class TestReadyComponent {
  readyConfirmed = output<boolean>();
  
  isProcessing = signal<boolean>(false);

  private router = inject(Router);

  onReady(ready: boolean): void {
    this.isProcessing.set(true);
    
    setTimeout(() => {
      this.isProcessing.set(false);

      if (ready) {
        this.router.navigate(['/home-user/test-question']);
      } else {
        this.router.navigate(['/home-user/level-test']);
      }

      this.readyConfirmed.emit(ready);
    }, ready ? 1000 : 500);
  }
}
