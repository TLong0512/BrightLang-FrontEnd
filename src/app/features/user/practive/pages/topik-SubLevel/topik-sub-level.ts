import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubLevel, TopikLevel } from '../../../../../models/practice.model';
import { TopikDataService } from '../../services/topik-data.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { PracticeService } from '../../services/practice.service';

@Component({
  selector: 'app-topik-sublevel-selection',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './topik-sub-level.html',
  styleUrls: ['../common/practice.css']
})
export class TopikSubLevelSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private topikDataService = inject(TopikDataService);
  private levelService = inject(PracticeService);

  protected examTypeId: string | null = null;
  protected loading = signal(true);
  protected subLevels = signal<SubLevel[]>([]);
  level: TopikLevel | null = null;

  ngOnInit() {
    this.examTypeId = this.route.snapshot.paramMap.get('examTypeId');

    if (this.examTypeId) {
      this.loadSubLevels(this.examTypeId);
    }

    // lấy level ngay khi vào trang
    this.level = this.levelService.getLevel();

    // hoặc subscribe để cập nhật realtime
    this.levelService.selectedLevel$.subscribe(l => {
      this.level = l;
    });

  }

  loadSubLevels(examTypeId: string) {
    this.loading.set(true);
    this.topikDataService.getLevelsByExamTypeId(examTypeId).subscribe({
      next: (levels) => {
        this.subLevels.set(levels);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading TOPIK levels:', error);
        this.loading.set(false);
      }
    });
  }

  selectSubLevel(subLevel: SubLevel) {
    this.router.navigate(['/home-user/skill-selection', subLevel.id]);
    this.levelService.setSubLevel(subLevel);
  }

  goBack() {
    this.router.navigate(['/home-user/topik-selection']);
  }
}
