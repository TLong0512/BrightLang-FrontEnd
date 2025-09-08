import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { Location } from "@angular/common";

@Component({
    selector: 'app-my-account',
    template: `
    <div class="mt-5 d-flex align-items-enter justify-content-center">
        <div>
            @defer(when user()) {
                <h3>Thông tin tài khoản của bạn:</h3>
                <!-- <p>Id: {{ user()!.id }}</p> -->
                <p>Họ tên: {{ user()!.fullName }}</p>
                <p>Email: {{ user()!.email }}</p>
                <p>
                    Quyền hạn:
                    @for(role of user()!.roles; track $index) {
                    <span>{{ role }}</span>
                    }
                </p>
                <div class="d-flex gap-2">
                    <a class="btn btn-warning" [routerLink]="['update-account']">Sửa thông tin tài khoản</a>
                    <a class="btn btn-danger" [routerLink]="['change-password']">Đổi mật khẩu</a>
                    <a (click)="goBack()" class="btn btn-secondary">Quay lại</a>
                </div>
            } @placeholder {
                <p>Đang tải thông tin...</p>
            } @error {
                <p>Không tìm thấy thông tin tài khoản của bạn.</p>
            }
        </div>
    </div>
`,
    imports: [RouterLink]
})
export class MyAccountComponent {

    private readonly location = inject(Location);
    goBack() { this.location.back() }

    private readonly authService = inject(AuthService);
    protected readonly user$ = this.authService.myAccountMe();
    protected readonly user = toSignal(this.user$);
}