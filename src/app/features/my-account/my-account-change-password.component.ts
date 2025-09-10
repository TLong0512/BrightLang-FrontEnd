import { Component, inject } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { Location } from "@angular/common";

@Component({
    selector: 'app-my-account-change-password',
    template: `

    <div class="mt-5 d-flex align-items-enter justify-content-center">
        <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()" style="width: 800px;">
            <h3>Đổi mật khẩu</h3>
            <div class="mb-3">
                <label for="oldPassword" class="form-label">Mật khẩu cũ:</label>
                <input id="oldPassword" class="form-control" type="password" [formControl]="changePasswordForm.controls.oldPassword">
                <div class="text-danger">
                    @if(changePasswordForm.controls.oldPassword.touched && changePasswordForm.controls.oldPassword.invalid) {
                    @if(changePasswordForm.controls.oldPassword.errors?.['required']) {
                    Mật khẩu cũ không được để trống.
                    }
                    @if(changePasswordForm.controls.oldPassword.errors?.['wrong']) {
                    Mật khẩu cũ không chính xác.
                    }
                    }
                </div>
            </div>
            <div class="mb-3">
                <label for="newPassword" class="form-label">Mật khẩu mới:</label>
                <input id="newPassword" class="form-control" type="password" [formControl]="changePasswordForm.controls.newPassword">
                <div class="text-danger">
                    @if(changePasswordForm.controls.newPassword.touched && changePasswordForm.controls.newPassword.invalid) {
                    @if(changePasswordForm.controls.newPassword.errors?.['required']) {
                    Mật khẩu mới không được để trống.
                    }
                    @if(changePasswordForm.controls.newPassword.errors?.['minlength']) {
                    Mật khẩu mới quá ngắn.
                    }
                    @if(changePasswordForm.controls.newPassword.errors?.['maxlength']) {
                    Mật khẩu mới quá dài.
                    }
                    @if(changePasswordForm.controls.newPassword.errors?.['pattern']) {
                    Mật khẩu mới phải có chữ hoa, chữ thường, số và ký tự đặc biệt.
                    }
                    }
                </div>
            </div>
            <div class="mb-3">
                <label for="confirmNewPassword" class="form-label">Xác nhận mật khẩu mới:</label>
                <input id="confirmNewPassword" class="form-control" type="password" [formControl]="changePasswordForm.controls.confirmNewPassword">
                <div class="text-danger">
                    @if(changePasswordForm.controls.confirmNewPassword.touched && changePasswordForm.controls.confirmNewPassword.invalid) {
                    @if(changePasswordForm.controls.confirmNewPassword.errors?.['required']) {
                    Xác nhận mật khẩu mới không được để trống.
                    }
                    @if(changePasswordForm.controls.confirmNewPassword.errors?.['passwordMismatch']) {
                    Xác nhận mật khẩu mới không đúng.
                    }
                    }
                </div>
            </div>
            
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-success">Đổi mật khẩu</button>
                <a (click)="goBack()" class="btn btn-secondary">Quay lại</a>
            </div>
        </form>
    </div>
    `,
    imports: [ReactiveFormsModule]
})
export class MyAccountChangePasswordComponent {

    private readonly location = inject(Location);
    goBack() { this.location.back() } 

    changePasswordForm = new FormGroup({

        oldPassword: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        }),

        newPassword: new FormControl('', {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(50),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
            ]
        }),

        confirmNewPassword: new FormControl('', {
            nonNullable: true,
            validators: [
                Validators.required,
                // there is no built-in validation to compare two fields, so
                // we'll enforce "must match password" with a custom validator below
                // at the constructor
            ]
        }),
    })

    constructor() {
        // add a custom validator for password confirmation
        this.changePasswordForm.controls.confirmNewPassword.addValidators(control => {
            return control.value === this.changePasswordForm.controls.newPassword.value
                ? null
                : { passwordMismatch: true };
        });
    }

    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    onSubmit() {
        if (this.changePasswordForm.valid === false) {
            this.changePasswordForm.markAllAsTouched();
            return;
        }

        this.authService.myAccountChangePassword(this.changePasswordForm.getRawValue())
            .subscribe({
                next: (isSuccess: boolean) => {
                    if(isSuccess) {
                        alert("change password success!");
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