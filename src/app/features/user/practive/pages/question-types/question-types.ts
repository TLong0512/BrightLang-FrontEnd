import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TopikDataService } from '../../services/topik-data.service';
import { QuestionType, Skill, SubLevel, TopikLevel } from '../../../../../models/practice.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { PracticeService } from '../../services/practice.service';

@Component({
  selector: 'app-question-types',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './question-types.html',
  styleUrls: ['../common/practice.css']
})

export class QuestionTypesComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topikDataService = inject(TopikDataService);
  private levelService = inject(PracticeService);

  protected loading = signal(true);
  protected questionTypes = signal<QuestionType[]>([]);
  protected skillId: string | null = null;
  topikLevel: TopikLevel | null = null;
  subTopikLevel: SubLevel | null = null;
  skill: Skill | null = null;

  ngOnInit() {
    this.skillId = this.route.snapshot.paramMap.get('skillId');

    if (this.skillId) {
      this.loadQuestionTypes(this.skillId);
    }

    // lấy level ngay khi vào trang
    this.topikLevel = this.levelService.getLevel();
    this.subTopikLevel = this.levelService.getSubLevel();
    this.skill = this.levelService.getSkill();

    // hoặc subscribe để cập nhật realtime
    this.levelService.selectedLevel$.subscribe(l => {
      this.topikLevel = l;
    });

    this.levelService.selectedSubLevel$.subscribe(sl => {
      this.subTopikLevel = sl;
    });

    this.levelService.selectedSkill$.subscribe(s => {
      this.skill = s;
    })
  }

  private loadQuestionTypes(skillId: string) {
    this.loading.set(true);
    this.topikDataService.getQuestionTypes(skillId).subscribe({
      next: (types) => {
        this.questionTypes.set(types);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading question types:', error);
        this.loading.set(false);
      }
    });
  }

  selectQuestionType(questionTypeId: string) {
    this.router.navigate(['/home-user/practice-screen', questionTypeId]);
  }

  goBack() {
    this.router.navigate(['/home-user/skill-selection', this.subTopikLevel?.id]);
  }
}
