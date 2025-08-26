import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { VerifyComponent } from './features/auth/verify/verify';
import { ForgetPassword } from './features/auth/forget-password/forget-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { TopicsDetail } from './features/home/topics-detail/topics-detail';
import { HomeComponent } from './features/user/home';
import { HomePageComponent } from './features/home/home-page/home-page';
import { UserHomeComponent } from './features/user/user-home/user-home';  

import { AuthComponent } from './shared/auth/auth';
import { BookComponent } from './features/user/book/book';
import { MainBookComponent } from './features/user/book/book.component';
import { VocabComponent } from './features/user/vocabulary/vocab.component';
import { VocabularyComponent } from './features/user/vocabulary/vocab';
import { FlashcardComponent } from './features/user/flashcard/flashcard';
import { MainFlashCardComponent } from './features/user/flashcard/flashcard.component';

export const routes: Routes = [
    {
    path: '',
    component: HomePageComponent
  },
  {
    path:'home',
    component: HomeComponent,
    children: [
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
    path: 'book',
    component: MainBookComponent,
    children: [
      {
      path: '',
      component: BookComponent
      }
    ]
  },
  {
    path: 'vocab/:id',
    component: VocabComponent,
    children:[{
      path: '',
      component: VocabularyComponent
    }]
  },
  {
    path: 'flashcard/:bookId',
    component: MainFlashCardComponent,
    children:[{
      path: '',
      component: FlashcardComponent
    }]
  },
  {
    path: '',
    redirectTo: 'books', pathMatch: 'full'
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
