import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EmailToVerifyDto } from '../../../models/email.model';
import { RegisterService } from './register-api';
import { SharedService } from '../share.service';

@Component({
  selector: 'register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
})

export class RegisterComponent {

  registerForm: FormGroup;
  passwordFocus = false;
  message: string = '';
  submitted: boolean = false;

  constructor(private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.maxLength(50), Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50), this.passwordStrengthValidator()],],
      confirmPassword: ['', [Validators.required, this.passwordMatchValidator]]
    });
  }

  isTyping: { [key: string]: boolean } = {};

  onFocus(field: string) {
    this.isTyping[field] = true;
  }

  onBlur(field: string) {
    this.isTyping[field] = false;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.parent) return null; 

    const password = control.parent.get('password')?.value;
    const confirmPassword = control.value;
    return password !== confirmPassword
      ? { mismatch: true }
      : null;
  }

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  onSubmit() {
    //this.submitted = true; // Khi bấm submit thì bật flag
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Xử lý submit
    const { fullName, email, password, confirmPassword } = this.registerForm.value;
    
    this.sharedService.updateData({
      fullName: fullName,
      email: email,
      password: password,
      confirmPassword: confirmPassword
    });
    this.SendEmail({Email: email})
  }

  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  SendEmail(emailToVerifyDto: EmailToVerifyDto) {
    this.registerService.create(emailToVerifyDto).subscribe({
      next: res => {
        this.router.navigate(['/auth/verify']);
      },
      error: err => {
        if (err.status == 409) {
          this.message = 'Email đã được sử dụng!'
        }
        if (err.status == 0) {
          this.message = 'Lỗi kết nối!'
        }
      }
    });
  }
}
