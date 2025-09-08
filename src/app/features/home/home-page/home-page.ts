import { Component, DestroyRef, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { MyAccountDto, UserState } from "../../auth/services/user.state";
import { AuthService } from "../../auth/services/auth.service";
import { HttpErrorResponse } from "@angular/common/http";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
    selector: 'home-page',
    standalone: true,
    templateUrl: './home-page.html',
    styleUrl: './home-page.css',
    imports: [RouterLink]
})

export class HomePageComponent {
    private readonly userState = inject(UserState);
    currentUser: MyAccountDto | null = null;
    ngOnInit() {
        this.userState.currentUser$.subscribe(user => this.currentUser = user);
    }

    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private destroyRef = inject(DestroyRef);
    handleLogout() {
        this.authService.logout()
        .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (isSuccess) => {
                    if (isSuccess) {
                        alert("Đăng xuất thành công!");
                        this.router.navigateByUrl('/');
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