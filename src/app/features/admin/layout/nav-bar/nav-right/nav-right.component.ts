// Angular import
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../../../shared/shared.module';
import { AuthService } from '../../../../auth/services/auth.service';

// third party import

@Component({
  selector: 'app-nav-right',
  imports: [RouterModule, SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {

  private authService = inject(AuthService)
  onLogout() {
    this.authService.logout()
  }
}
