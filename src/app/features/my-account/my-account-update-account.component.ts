import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { Location } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MyAccountDto } from "../auth/services/user.state";

@Component({
    selector: 'app-my-account-change-password',
    template: `
    <div class="mt-5 d-flex align-items-enter justify-content-center">
        <form [formGroup]="updateAccountForm" (ngSubmit)="onSubmit()">
            <h3>Cập nhật thông tin tài khoản</h3>
            <div class="mb-3">
                <label for="fullName" class="form-label">Tên đầy đủ:</label>
                <input id="fullName" class="form-control" type="text" [formControl]="updateAccountForm.controls.fullName">
                <div class="text-danger mt-1">
                    @if(updateAccountForm.controls.fullName.touched && updateAccountForm.controls.fullName.invalid) {
                    @if(updateAccountForm.controls.fullName.errors?.['required']) {
                    Tên đẩy đủ không được bỏ trống.
                    }
                    @if(updateAccountForm.controls.fullName.errors?.['maxlength']) {
                    Tên đầy đủ quá dài.
                    }
                    }
                </div>
            </div>
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-success">Câp nhật</button>
                <a (click)="goBack()" class="btn btn-secondary">Quay lại</a>
            </div>
        </form>
    </div>
    `,
    imports: [ReactiveFormsModule]
})
export class MyAccountUpdateAccountComponent implements OnInit {

    private readonly location = inject(Location);
    goBack() { this.location.back() } 

    updateAccountForm = new FormGroup({

        fullName: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.maxLength(50)]
        }),
    })

    constructor() {
    }

    private readonly asdf = inject(AuthService);
    private readonly asdf2 = inject(DestroyRef);

    ngOnInit(): void {
        this.asdf.myAccountMe()
        .pipe(takeUntilDestroyed(this.asdf2))
        .subscribe({
            next: (myAccount: MyAccountDto | null) => {
                if(myAccount != null) {
                    this.updateAccountForm.controls.fullName.setValue(myAccount.fullName);
                }
                else {
                    alert("Không tìm thấy thông tin tài khoản của bạn.");
                }
            },
            error: (error: HttpErrorResponse) => {
                alert("Có lỗi xảy ra khi tải thông tin.");
                console.error(error);
            }
        })
        
    }

    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    onSubmit() {
        if (this.updateAccountForm.valid === false) {
            this.updateAccountForm.markAllAsTouched();
            return;
        }

        this.authService.myAccountUpdateAccount(this.updateAccountForm.getRawValue())
            .subscribe({
                next: (isSuccess: boolean) => {
                    if(isSuccess) {
                        alert("Update account success!");
                        this.router.navigate(['/my-account']);
                    }
                    else {
                        alert("Change password fail. Please try again later.");
                    }
                },
                error: (error: HttpErrorResponse) => {
                    console.error(error);
                    alert("Unknown error happened.");
                }
            })

    }
}