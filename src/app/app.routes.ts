import { Router, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { VerifyComponent } from './features/auth/verify/verify';
import { ForgetPassword } from './features/auth/forget-password/forget-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { TopicsDetail } from './features/home/topics-detail/topics-detail';
import { HomeComponent } from './features/home/home';
import { HomePageComponent } from './features/home/home-page/home-page';
import { UserHomeComponent } from './features/user/user-home/user-home';

import { AuthComponent } from './shared/auth/auth';

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

import { AdminComponent } from './shared/admin/admin';
import { RoleGuard } from './guards/auth.guard';
import { TestReviewComponent } from './features/user/level-test/pages/test-review/test-review';
import { TestHistoryComponent } from './features/user/level-test/pages/test-history/test-history';
import { UserState } from './features/auth/services/user.state';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { TopikSubLevelSelectionComponent } from './features/user/practive/pages/topik-SubLevel/topik-sub-level';
import { ResultComponent } from './features/user/practive/pages/result-screen/result-screen';
import { RoadmapComponent } from './features/user/road-map/road-map';

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
      { path: 'test-review/:testId', component: TestReviewComponent},
      { path: 'test-history', component: TestHistoryComponent},
      { path: '', component: UserHomeComponent },
      { path: 'topik-detail', component: TopicsDetail },
      { path: 'book', component: BookComponent },
      { path: 'vocab/:id', component: VocabularyComponent },
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
        path: 'road-map',
        component: RoadmapComponent
      },
      
      {
        path: '',
        component: UserHomeComponent
      },
      {
        path: 'topik-detail',
        component: TopicsDetail
      }
    ]
  },

  {
    path: 'auth',
    canActivate: [() => {
      const router = inject(Router);
      const userState = inject(UserState);
      return userState.currentUser$.pipe(
        map(user => {
        if (user == null) {
          return true; // cho phép đi tiếp
        }
        return router.parseUrl('/home-user'); // redirect an toàn
      })
      )
    }],
    component: AuthComponent,
    children: [
      {
        path: '',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'verify',
        component: VerifyComponent
      },
      {
        path: 'forget-password',
        component: ForgetPassword
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent
      }
    ]
  },

  {
    path: 'admin',
    // canActivate: [RoleGuard], 
    // data: { roles: ['Admin'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  }
];
