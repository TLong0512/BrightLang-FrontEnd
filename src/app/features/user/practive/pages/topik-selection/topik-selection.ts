import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TopikDataService } from '../../services/topik-data.service';
import { TopikLevel } from '../../../../../models/topik.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-topik-selection',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="topik-selection-container">
      <div class="header">
        <h1>Luyện tập TOPIK</h1>
        <p>Chọn cấp độ TOPIK để bắt đầu luyện tập</p>
      </div>
      
      @if (loading()) {
        <app-loading-spinner message="Đang tải dữ liệu..."></app-loading-spinner>
      } @else {
        <div class="options-grid">
          @for (level of topikLevels(); track level.id) {
            <button 
              class="option-card" 
              (click)="selectTopikLevel(level.level)"
              [attr.data-level]="level.level">
              <h3>{{ level.name }}</h3>
              <p>{{ level.description }}</p>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .topik-selection-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 2px solid #80d0c7;
    }

    .header h1 {
      color: #13547a;
      font-size: 2.8rem;
      margin-bottom: 15px;
      font-weight: 700;
    }

    .header p {
      color: #666;
      font-size: 1.2rem;
      margin: 0;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
      margin: 30px 0;
    }

    .option-card {
      background: linear-gradient(135deg, #80d0c7 0%, #13547a 100%);
      color: white;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      border: 3px solid transparent;
      font-size: 1.1rem;
      position: relative;
      overflow: hidden;
    }

    .option-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .option-card:hover::before {
      left: 100%;
    }

    .option-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      border-color: rgba(255,255,255,0.5);
    }

    .option-card h3 {
      font-size: 2rem;
      margin-bottom: 15px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }

    .option-card p {
      opacity: 0.95;
      line-height: 1.5;
      font-size: 1.1rem;
      position: relative;
      z-index: 1;
    }

    .option-card[data-level="topik1"] {
      background: linear-gradient(135deg, #80d0c7 0%, #4ecdc4 100%);
    }

    .option-card[data-level="topik2"] {
      background: linear-gradient(135deg, #13547a 0%, #80d0c7 100%);
    }

    @media (max-width: 768px) {
      .options-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .option-card {
        padding: 30px 20px;
      }
      
      .header h1 {
        font-size: 2.2rem;
      }
    }
  `]
})
export class TopikSelectionComponent implements OnInit {
  private router = inject(Router);
  private topikDataService = inject(TopikDataService);
  
  protected loading = signal(true);
  protected topikLevels = signal<TopikLevel[]>([]);

  ngOnInit() {
    this.loadTopikLevels();
  }

  private loadTopikLevels() {
    this.loading.set(true);
    this.topikDataService.getTopikLevels().subscribe({
      next: (levels) => {
        this.topikLevels.set(levels);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading TOPIK levels:', error);
        this.loading.set(false);
      }
    });
  }

  selectTopikLevel(level: 'topik1' | 'topik2') {
    this.router.navigate(['/home-user/skill-selection', level]);
  }
}