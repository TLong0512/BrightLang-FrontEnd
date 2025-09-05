import { Component } from '@angular/core';
import { Route, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.service';

@Component({
   standalone: true,
  selector: 'app-user-header',
  imports: [RouterModule],
  
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class UserHeaderComponent {
  constructor(private authService: AuthService, private router: Router){

  }
  logout(){
    this.authService.logout();
    this.router.navigate(['/home-user']);
  }
  

}
