import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { LoginService } from './login-api';
import { LoginDto} from '../../../models/login.model';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';


@Component({
  selector: 'login',
  templateUrl: './login.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;

  message: string = '';
  messageColor: string = 'red';

  mockToken = {
    value: 'abc123token',
    expiry: Date.now() + 10000
  };

  constructor(private fb: FormBuilder, 
    private loginService: LoginService, 
    private cdr: ChangeDetectorRef,
    private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  // ✅ Helper check invalid
  isInvalid(controlName: string, error: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.hasError(error) && (control.touched || this.submitted));
  }

  isTokenExpired(): boolean {
    return Date.now() > this.mockToken.expiry;
  }

  onSubmit() {
    this.submitted = true;
    this.message = '';
    this.messageColor = 'red';

    if (this.loginForm.invalid) {
      this.message = 'Vui lòng nhập đầy đủ thông tin!';
      return;
    }

    const { email, password } = this.loginForm.value;
    this.Login(email, password)
  }

  Login(email: string , password: string) {
    const acount: LoginDto = { Email: email, Password: password};
    
    this.loginService.create(acount).subscribe({
      next: res => {
        Swal.fire({
          title: 'Đăng nhập thành công!',
          text: 'Chào mừng bạn!',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,       // tự đóng sau 2s (optional)
          timerProgressBar: true
        }).then(() => {
        // Chuyển trang sau khi OK hoặc timer kết thúc
          this.router.navigate(['/home']); // đổi '/dashboard' thành route của bạn
        });
      },
      error: err => {
        console.log(err.status)
        if(err.status == 400) {
          this.message = 'Bạn nhập sai email hoặc mật khẩu!'
          this.cdr.detectChanges();
        }
        if(err.status == 0) {
          this.message = 'Lỗi kết nối!'
          this.cdr.detectChanges();
        }
      }
    });
  }
  clearMessage() {
    this.message = '';
  }
}
