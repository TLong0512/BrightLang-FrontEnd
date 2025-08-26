import { Component, signal, output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-level-test-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100">
      <div class="card shadow-lg entry-card">
        <div class="card-body text-center p-5">
          <h4 class="mb-4 title">BÀI TEST TRÌNH ĐỘ TOPIK</h4>
          
          <div class="mb-4">
            <label class="form-label fw-bold">TÔI BIẾT TRÌNH ĐỘ CỦA MÌNH:</label>
            <select 
              class="form-select level-select" 
              [(ngModel)]="selectedLevel" 
              (change)="onLevelChange()">
              <option value="">Chọn cấp độ TOPIK</option>
              @for (level of topikLevels; track level.value) {
                <option [value]="level.value">{{ level.label }}</option>
              }
            </select>
            @if (selectedLevel()) {
              <small class="text-muted mt-2 d-block">
                {{ getLevelDescription(selectedLevel()) }}
              </small>
            }
          </div>
          
          <div class="d-grid gap-3">
            <button 
              class="btn btn-primary btn-lg roadmap-button" 
              (click)="goToRoadmap()" 
              [disabled]="!selectedLevel()">
              <i class="fas fa-route me-2"></i>
              XÂY DỰNG LỘ TRÌNH HỌC TẬP
            </button>
            
            <div class="divider my-3">
              <span class="divider-text">HOẶC</span>
            </div>
            
            <button 
              class="btn btn-outline-secondary btn-lg test-button" 
              (click)="startTest()">
              <i class="fas fa-clipboard-list me-2"></i>
              KIỂM TRA TRÌNH ĐỘ (TEST)
            </button>
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

    .entry-card { 
      border-radius: 20px;
      width: 500px;
      border: none;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
      background: #ffffff;
      border: 2px solid #7fffd4;
    }

    .title {
      color: #333;
      font-weight: 700;
      font-size: 24px;
      margin-bottom: 30px;
    }

    .level-select {
      border-radius: 12px;
      border: 2px solid #e9ecef;
      padding: 12px 16px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #ffffff;
    }

    .level-select:focus {
      border-color: #7fffd4;
      box-shadow: 0 0 0 0.2rem rgba(127, 255, 212, 0.25);
      outline: none;
    }

    .roadmap-button { 
      border-radius: 12px;
      padding: 15px 32px;
      font-size: 16px;
      font-weight: 600;
      background: #7fffd4;
      border: 2px solid #7fffd4;
      color: #333;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .roadmap-button:hover:not(:disabled) { 
      background: #66ffcc;
      border-color: #66ffcc;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(127, 255, 212, 0.3);
      color: #333;
    }

    .roadmap-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: #e9ecef;
      border-color: #e9ecef;
      color: #6c757d;
    }

    .test-button { 
      border-radius: 12px;
      padding: 15px 32px;
      font-size: 16px;
      font-weight: 600;
      border: 2px solid #6c757d;
      color: #6c757d;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: transparent;
    }

    .test-button:hover { 
      background: #6c757d;
      border-color: #6c757d;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(108, 117, 125, 0.3);
    }

    .form-label {
      color: #555;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 15px;
    }

    .divider {
      position: relative;
      text-align: center;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e9ecef;
    }

    .divider-text {
      background: #ffffff;
      padding: 0 20px;
      color: #6c757d;
      font-size: 14px;
      font-weight: 500;
    }

    .btn i {
      font-size: 16px;
    }
  `]
})
export class LevelTestEntryComponent {
  levelSelected = output<string>();
  
  selectedLevel = signal<string>('');
  
  topikLevels = [
    { value: 'topik1', label: 'TOPIK I - Level 1', description: 'Sơ cấp - Có thể hiểu và sử dụng từ vựng, cụm từ cơ bản' },
    { value: 'topik2', label: 'TOPIK I - Level 2', description: 'Sơ cấp - Có thể giao tiếp trong các tình huống đơn giản' },
    { value: 'topik3', label: 'TOPIK II - Level 3', description: 'Trung cấp - Có thể thực hiện các chức năng cơ bản trong cuộc sống hàng ngày' },
    { value: 'topik4', label: 'TOPIK II - Level 4', description: 'Trung cấp - Có thể sử dụng tiếng Hàn trong nhiều tình huống khác nhau' },
    { value: 'topik5', label: 'TOPIK II - Level 5', description: 'Cao cấp - Có thể sử dụng tiếng Hàn một cách tương đối thành thạo' },
    { value: 'topik6', label: 'TOPIK II - Level 6', description: 'Cao cấp - Có thể sử dụng tiếng Hàn thành thạo trong mọi lĩnh vực' }
  ];

  constructor(private router: Router) {}

  onLevelChange(): void {
    // Additional validation or side effects can be added here
    console.log('Selected TOPIK level:', this.selectedLevel());
  }

  goToRoadmap(): void {
    const level = this.selectedLevel();
    if (level) {
      // Navigate to roadmap page with selected level
      this.router.navigate(['/roadmap'], { 
        queryParams: { level: level } 
      });
    }
  }

  startTest(): void {
    // Navigate to test-ready page
    this.router.navigate(['/home-user/test-ready']);
  }

  getLevelDescription(level: string): string {
    const found = this.topikLevels.find(l => l.value === level);
    return found?.description || '';
  }
}