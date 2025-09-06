import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.service';

@Component({
  selector: 'app-user-header',
  imports: [RouterModule],
  
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class UserHeaderComponent {
  constructor(private authService: AuthService,
    private router: Router
  ) {}

  onLogout() {
    this.authService.logout()
    this.router.navigate(['/home-user'])
  }
}
