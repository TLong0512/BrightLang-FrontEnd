import { Router } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopikLevel } from '../../../../../models/practice.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { TopikDataService } from '../../services/topik-data.service';
import { PracticeService } from '../../services/practice.service';

@Component({
  selector: 'app-topik-selection',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './topik-selection.html',
  styleUrls: ['../common/practice.css']
})
export class TopikSelectionComponent implements OnInit {
  private router = inject(Router);
  private topikDataService = inject(TopikDataService);
  private levelService = inject(PracticeService);

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

  selectTopikLevel(examTypeId: string, topik: TopikLevel) {
    this.router.navigate(['/home-user/topik-sublevel', examTypeId]);
    this.levelService.setLevel(topik);
  }
}