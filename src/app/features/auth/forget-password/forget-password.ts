import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ForgetPasswordDto, ForgetPasswordService } from './forget-password-api';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'forget-password',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './forget-password.html'
})
export class ForgetPassword {
  otpForm: FormGroup;
  submitted = false;
  message = '';
  messageColor = 'red';

  constructor(
    private fb: FormBuilder,
    private forgetService: ForgetPasswordService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.message = '';

    if (this.otpForm.invalid) {
      if (this.otpForm.controls['email'].errors?.['required']) {
        this.message = 'Vui lòng nhập email!';
      } else if (this.otpForm.controls['email'].errors?.['email']) {
        this.message = 'Email không hợp lệ!';
      }
      this.messageColor = 'red';
      return;
    }

    const email = this.otpForm.value.email;
    this.Forget(email);
  }

  Forget(email: string) {
    const account: ForgetPasswordDto = { Email: email };
    this.forgetService.create(account).subscribe({
      next: res => {
        console.log('OTP đã gửi:', res);
        localStorage.setItem('email', email)
        this.router.navigate(['/auth/reset-password']);
      },
      error: err => {
        console.error('Gửi OTP thất bại:', err);
        this.messageColor = 'red';
        if (err.status == 0) {
          this.message = 'Mất kết nối';
        } else {
          this.message = 'Không gửi được OTP';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
