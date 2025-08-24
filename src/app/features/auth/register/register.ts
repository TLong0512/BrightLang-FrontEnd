import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EmailToVerifyDto } from '../../../models/email.model';
import { RegisterService } from './register-api';

@Component({
  selector: 'register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  
})
export class RegisterComponent {
  registerForm: FormGroup;
  message: string = '';

  constructor(private fb: FormBuilder, 
    private router: Router, 
    private registerService: RegisterService) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { fullName, email, password, confirmPassword } = this.registerForm.value;
    // Chuyển sang verify page
    // Lưu tạm thông tin vào localStorage nếu muốn
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('confirmPassword', confirmPassword);
    
    this.router.navigate(['/auth/verify']);
    
    
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
        if(err.status == 409) {
          this.message = 'Email đã được sử dụng!'
        }
        if(err.status == 0) {
          this.message = 'Lỗi kết nối!'
        }
      }
    });
  }
}
