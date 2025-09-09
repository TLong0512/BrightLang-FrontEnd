import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopikDataService } from '../../services/topik-data.service';
import { Skill, SubLevel, TopikLevel } from '../../../../../models/practice.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { PracticeService } from '../../services/practice.service';

@Component({
  selector: 'app-skill-selection',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './skill-selection.html',
  styleUrls: ['../common/practice.css']
})
export class SkillSelectionComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topikDataService = inject(TopikDataService);
  private levelService = inject(PracticeService);

  protected levelId: string | null = null;
  protected loading = signal(true);
  protected skills = signal<Skill[]>([]);
  topikLevel: TopikLevel | null = null;
  subTopikLevel: SubLevel | null = null;

  ngOnInit() {
    this.levelId = this.route.snapshot.paramMap.get('levelId');

    if (this.levelId) {
      this.loadSkills(this.levelId);
    }

    // lấy level ngay khi vào trang
    this.topikLevel = this.levelService.getLevel();
    this.subTopikLevel = this.levelService.getSubLevel();

    // hoặc subscribe để cập nhật realtime
    this.levelService.selectedLevel$.subscribe(l => {
      this.topikLevel = l;
    });

    this.levelService.selectedSubLevel$.subscribe(sl => {
      this.subTopikLevel = sl;
    });
  }

  private loadSkills(levelId: string) {
    this.loading.set(true);
    this.topikDataService.getSkills(levelId).subscribe({
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

  selectSkill(skill: Skill) {
    this.router.navigate(['/home-user/question-types', skill.id]);
    this.levelService.setSkill(skill);
  }

  goBack() {
    this.router.navigate(['/home-user/topik-sublevel', this.topikLevel?.id]);
  }
}