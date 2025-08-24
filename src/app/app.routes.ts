import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { VerifyComponent } from './features/auth/verify/verify';
import { ForgetPassword } from './features/auth/forget-password/forget-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { TopicsDetail } from './features/home/topics-detail/topics-detail';
import { HomeComponent } from './features/home/home';
import { HomePageComponent } from './features/home/home-page/home-page';
import { AuthComponent } from './shared/auth/auth';

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
