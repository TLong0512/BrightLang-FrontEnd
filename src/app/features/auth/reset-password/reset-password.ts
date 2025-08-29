import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResetPasswordDto, ResetPasswordService } from './reset-password-api';
import { Router, RouterModule } from '@angular/router';
import { SharedService } from '../share.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  submitted = false;
  message = '';
  messageColor = 'red';
  email = ''


  constructor(
    private fb: FormBuilder,
    private resetService: ResetPasswordService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService
  ) {
    this.resetForm = this.fb.group(
      {
        otp: ['', [Validators.required]],
        newPass: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,50}$/)
          ]
        ],
        confirmPass: ['', Validators.required]
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  private passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const newPass = group.get('newPass')?.value;
    const confirmPass = group.get('confirmPass')?.value;
    return newPass && confirmPass && newPass !== confirmPass ? { mismatch: true } : null;
  };

  onSubmit() {
    this.submitted = true;
    this.message = '';

    if (this.resetForm.invalid) {
      if (this.resetForm.controls['otp'].errors?.['required']) {
        this.message = 'Vui lòng nhập OTP!';
      } else if (this.resetForm.controls['newPass'].errors?.['required']) {
        this.message = 'Vui lòng nhập mật khẩu mới!';
      } else if (this.resetForm.controls['newPass'].errors?.['minlength'] || this.resetForm.controls['newPass'].errors?.['maxlength']) {
        this.message = 'Mật khẩu phải từ 6 đến 50 ký tự!';
      } else if (this.resetForm.controls['newPass'].errors?.['pattern']) {
        this.message = 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt!';
      } else if (this.resetForm.hasError('mismatch')) {
        this.message = 'Mật khẩu xác nhận không khớp!';
      }
      this.messageColor = 'red';
      return;
    }

    this.sharedService.currentData.subscribe(res => this.email = res)
    const dto: ResetPasswordDto = {
      Email: this.email ?? '',
      VerificationCode: this.resetForm.value.otp,
      NewPassword: this.resetForm.value.newPass,
      ConfirmNewPassword: this.resetForm.value.confirmPass
    };

    this.resetService.create(dto).subscribe({
      next: res => {
        Swal.fire({
          title: 'Đổi mật khẩu thành công!',
          text: 'Vui lòng đăng nhập để tiếp tục!',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true
        }).then(() => {
          this.router.navigate(['/auth']);
        });
      },
      error: err => {
        console.error('Đổi mật khẩu thất bại:', err);
        this.messageColor = 'red';
        if (err.status === 0) {
          this.message = 'Mất kết nối!';
        } else {
          this.message = 'OTP không đúng hoặc đã hết hạn!';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
