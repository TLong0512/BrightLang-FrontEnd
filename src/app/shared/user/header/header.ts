import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-user-header',
  imports: [RouterModule],

  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class UserHeaderComponent {

  constructor(private authService: AuthService,
    private router: Router
  ) { }

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
