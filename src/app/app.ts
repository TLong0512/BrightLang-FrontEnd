import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthComponent } from './shared/auth/auth';
import { HomePageComponent } from './features/home/home-page/home-page';
import { UserFooterComponent } from './shared/user/footer/footer';
import { UserHeaderComponent } from './shared/user/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet , RouterModule, 
    ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BrightGo');
}
