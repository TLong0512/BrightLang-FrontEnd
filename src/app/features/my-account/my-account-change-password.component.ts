import { Component, inject } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { Location } from "@angular/common";

@Component({
    selector: 'app-my-account-change-password',
    template: `
<form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()">
    <div class="mb-3">
        <label for="oldPassword" class="form-label">Old password:</label>
        <input id="oldPassword" class="form-control" type="password" [formControl]="changePasswordForm.controls.oldPassword">
        <div class="text-danger">
            @if(changePasswordForm.controls.oldPassword.touched && changePasswordForm.controls.oldPassword.invalid) {
            @if(changePasswordForm.controls.oldPassword.errors?.['required']) {
            Old password is required.
            }
            @if(changePasswordForm.controls.oldPassword.errors?.['wrong']) {
            Old password is incorrect.
            }
            }
        </div>
    </div>
    <div class="mb-3">
        <label for="newPassword" class="form-label">New password:</label>
        <input id="newPassword" class="form-control" type="password" [formControl]="changePasswordForm.controls.newPassword">
        <div class="text-danger">
            @if(changePasswordForm.controls.newPassword.touched && changePasswordForm.controls.newPassword.invalid) {
            @if(changePasswordForm.controls.newPassword.errors?.['required']) {
            New password is required.
            }
            @if(changePasswordForm.controls.newPassword.errors?.['minlength']) {
            New password is too short.
            }
            @if(changePasswordForm.controls.newPassword.errors?.['maxlength']) {
            New password is too long.
            }
            @if(changePasswordForm.controls.newPassword.errors?.['pattern']) {
            New password must contain a uppercase, lowercase, number and special character.
            }
            }
        </div>
    </div>
    <div class="mb-3">
        <label for="confirmNewPassword" class="form-label">Confirm new password:</label>
        <input id="confirmNewPassword" class="form-control" type="password" [formControl]="changePasswordForm.controls.confirmNewPassword">
        <div class="text-danger">
            @if(changePasswordForm.controls.confirmNewPassword.touched && changePasswordForm.controls.confirmNewPassword.invalid) {
            @if(changePasswordForm.controls.confirmNewPassword.errors?.['required']) {
            Confirm new password is required.
            }
            @if(changePasswordForm.controls.confirmNewPassword.errors?.['passwordMismatch']) {
            New password and confirm new password is not match.
            }
            }
        </div>
    </div>
    
    <button type="submit" class="btn btn-success">Change password</button>
    <a (click)="goBack()" class="btn btn-secondary">Go back</a>
</form>
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