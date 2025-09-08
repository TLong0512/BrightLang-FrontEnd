import { Component, inject } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { Location } from "@angular/common";

@Component({
    selector: 'app-my-account-change-password',
    template: `
<h3>Update your account information:</h3>
<form [formGroup]="updateAccountForm" (ngSubmit)="onSubmit()">
    <div class="mb-3">
        <label for="newPassword" class="form-label">New full name:</label>
        <input id="newPassword" class="form-control" type="password" [formControl]="updateAccountForm.controls.fullName">
        <div class="text-danger">
            @if(updateAccountForm.controls.fullName.touched && updateAccountForm.controls.fullName.invalid) {
            @if(updateAccountForm.controls.fullName.errors?.['required']) {
            New full name is required.
            }
            @if(updateAccountForm.controls.fullName.errors?.['maxlength']) {
            New full name is too long.
            }
            }
        </div>
    </div>
    <button type="submit" class="btn btn-success">Update account</button>
    <a (click)="goBack()" class="btn btn-secondary">Go back</a>
</form>
    `,
    imports: [ReactiveFormsModule]
})
export class MyAccountUpdateAccountComponent {

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