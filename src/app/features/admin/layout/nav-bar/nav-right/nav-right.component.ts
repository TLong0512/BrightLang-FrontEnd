// Angular import
import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../../../../shared/shared.module';
import { AuthService } from '../../../../auth/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

// third party import

@Component({
  selector: 'app-nav-right',
  imports: [RouterModule, SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {

  private router = inject(Router)
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef);
  onLogout() {
    this.authService.logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (isSuccess) => {
          if (isSuccess) {
            Swal.fire({
              title: 'Thành công!',
              text: 'Đăng xuất thành công.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'swal-success-popup'
              }
            }).then(() => {
              this.router.navigateByUrl('/');
            });
          }
          else {
            alert('Đăng xuất không thành công.');
          }
        },
        error: (err: HttpErrorResponse) => {
          alert("Lỗi không rõ khi đăng xuất.");
          console.error(err);
        }
      })
  }
}
