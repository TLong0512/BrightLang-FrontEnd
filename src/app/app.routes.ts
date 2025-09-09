import { Router, Routes } from '@angular/router';

import { TopicsDetail } from './features/home/topics-detail/topics-detail';
import { HomeComponent } from './features/home/home';
import { HomePageComponent } from './features/home/home-page/home-page';
import { UserHomeComponent } from './features/user/user-home/user-home';
import { BookComponent } from './features/user/book-vocabulary/pages/book/book';
import { VocabularyComponent } from './features/user/book-vocabulary/pages/vocabulary/vocab';
import { FlashcardComponent } from './features/user/book-vocabulary/pages/flashcard/flashcard';
import { UserComponent } from './features/user/user';
import { LevelTestEntryComponent } from './features/user/level-test/pages/level-test-entry/level-test-entry';
import { TestReadyComponent } from './features/user/level-test/pages/test-ready/test-ready';
import { TestQuestionsComponent } from './features/user/level-test/pages/test-questions/test-questions';
import { TestResultComponent } from './features/user/level-test/pages/test-result/test-result';
import { QuestionTypesComponent } from './features/user/practive/pages/question-types/question-types';
import { PracticeComponent } from './features/user/practive/pages/practice-screen/practice-screen';
import { SkillSelectionComponent } from './features/user/practive/pages/skill-selection/skill-selection';
import { TopikSelectionComponent } from './features/user/practive/pages/topik-selection/topik-selection';
import { TestReviewComponent } from './features/user/level-test/pages/test-review/test-review';
import { TestHistoryComponent } from './features/user/level-test/pages/test-history/test-history';
import { UserState } from './features/auth/services/user.state';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { TopikSubLevelSelectionComponent } from './features/user/practive/pages/topik-SubLevel/topik-sub-level';
import { ResultComponent } from './features/user/practive/pages/result-screen/result-screen';
import { RoadmapComponent } from './features/user/roadmap/pages/roadmap/roadmap';
import { RoadmapSelectionComponent } from './features/user/roadmap/pages/roadmap-selection/roadmap-selection';
import { AdminGuard, AuthGuard } from './guards/guard';

// 👇 import guards
export const routes: Routes = [

  {
    path: '',
    canActivate: [() => {
      const router = inject(Router);
      const userState = inject(UserState);
      return userState.currentUser$.pipe(
        map(user => user == null
          ? true // cho phép đăng nhập đăng ký
          : router.navigateByUrl('/home-user') // đã đăng nhập. điều hướng về trang chủ.
        )
      )
    }],
    component: HomeComponent,
    children: [
      { path: '', component: HomePageComponent },
      { path: 'topik-detail', component: TopicsDetail }
      // { path: '', component: TopicsDetail }
    ]
  },

  {
    path: 'home-user',

    canActivate: [() => {
      const router = inject(Router);
      const userState = inject(UserState);
      return userState.currentUser$.pipe(
        map(user => user != null
          ? true // cho phép vào đăng ký
          : router.navigateByUrl('/') // đã đăng nhập. điều hướng về trang chủ.
        )
      )
    }],

    component: UserComponent,
    children: [
      { path: 'level-test', component: LevelTestEntryComponent },
      { path: 'test-ready', component: TestReadyComponent },
      { path: 'test-question', component: TestQuestionsComponent },
      { path: 'test-result', component: TestResultComponent },
      { path: 'test-review/:testId', component: TestReviewComponent },
      { path: 'test-history', component: TestHistoryComponent },
      { path: '', component: UserHomeComponent },
      { path: 'topik-detail', component: TopicsDetail },
      { path: 'book', component: BookComponent },
      { path: 'vocab/:bookId', component: VocabularyComponent },
      { path: 'flashcard/:bookId', component: FlashcardComponent },

      { path: 'result-screen', component: ResultComponent },
      { path: 'practice-screen/:rangeId', component: PracticeComponent },
      { path: 'question-types/:skillId', component: QuestionTypesComponent },
      {
        path: 'skill-selection/:levelId',
        component: SkillSelectionComponent
      },
      {
        path: 'topik-selection',
        component: TopikSelectionComponent
      },
      {
        path: 'topik-sublevel/:examTypeId',
        component: TopikSubLevelSelectionComponent
      },
      {
        path: '',
        component: UserHomeComponent
      },
      {
        path: 'topik-detail',
        component: TopicsDetail
      },
      { path: 'roadmap', component: RoadmapComponent },
      {
        path: 'roadmap-selection',
        component: RoadmapSelectionComponent
      }

    ]
  },

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  }
];
