import { Routes } from '@angular/router';
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
import { UserComponent } from './features/user/user';
import { LevelTestEntryComponent } from './features/user/level-test/pages/level-test-entry/level-test-entry';
import { TestReadyComponent } from './features/user/level-test/pages/test-ready/test-ready';
import { TestQuestionsComponent } from './features/user/level-test/pages/test-questions/test-questions';
import { TestResultComponent } from './features/user/level-test/pages/test-result/test-result';

export const routes: Routes = [
  
    {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: HomePageComponent
      },
      {
        path: 'topik-detail',
        component: TopicsDetail
      }
    ]
  },
  {
    path:'home-user',
    component: UserComponent,
    children: [
      {
        path: 'level-test',
        component: LevelTestEntryComponent
      },
      {
        path: 'test-ready',
        component: TestReadyComponent
      },
      {
        path: 'test-question',
        component: TestQuestionsComponent
      },
      {
        path: 'test-result',
        component: TestResultComponent
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
  }
    
];
