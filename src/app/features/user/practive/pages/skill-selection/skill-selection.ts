import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TopikDataService } from '../../services/topik-data.service';
import { Skill } from '../../../../../models/topik.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-skill-selection',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="skill-selection-container">
      <div class="navigation">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>
      
      <div class="header">
        <h1>{{ getTopikName() }}</h1>
        <p>Chọn kỹ năng bạn muốn luyện tập</p>
      </div>
      
      @if (loading()) {
        <app-loading-spinner message="Đang tải kỹ năng..."></app-loading-spinner>
      } @else {
        <div class="options-grid">
          @for (skill of skills(); track skill.id) {
            <button 
              class="option-card" 
              (click)="selectSkill(skill.id)"
              [attr.data-skill]="skill.id">
              <div class="skill-icon">{{ skill.icon }}</div>
              <h3>{{ skill.name }}</h3>
              <p>{{ skill.description }}</p>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .skill-selection-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #80d0c7;
      margin-top: 120px;
      border-radius: 12px;       
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
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
      transform: translateX(-5px);
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
      font-size: 2.5rem;
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

    .skill-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      display: block;
    }

    .option-card h3 {
      font-size: 1.8rem;
      margin-bottom: 15px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }

    .option-card p {
      opacity: 0.8;
      line-height: 1.5;
      font-size: 1.1rem;
      position: relative;
      z-index: 1;
    }

    .option-card:hover p {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .options-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .option-card {
        padding: 40px 20px;
      }
      
      .header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class SkillSelectionComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topikDataService = inject(TopikDataService);

  protected loading = signal(true);
  protected skills = signal<Skill[]>([]);
  protected topikLevel = signal<'topik1' | 'topik2'>('topik1');

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.topikLevel.set(params['level'] as 'topik1' | 'topik2'); // ✅ đúng key
      this.loadSkills();
    });
  }

  private loadSkills() {
    this.loading.set(true);
    this.topikDataService.getSkills().subscribe({
      next: (skills) => {
        this.skills.set(skills);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading skills:', error);
        this.loading.set(false);
      }
    });
  }

  getTopikName(): string {
    return this.topikLevel() === 'topik1' ? 'TOPIK I' : 'TOPIK II';
  }

  selectSkill(skillId: string) {
    this.router.navigate(['/home-user/question-types', this.topikLevel(), skillId]);
  }

  goBack() {
    this.router.navigate(['/home-user/topik-sublevel']);
  }
}