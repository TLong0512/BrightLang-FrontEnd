import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';


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

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  isInvalid(controlName: string, error: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.hasError(error) && (control.touched || this.submitted));
  }

  onSubmit() {
    this.submitted = true;
    this.message = '';
    this.messageColor = 'red';

    // if (this.loginForm.invalid) {
    //   this.message = 'Vui lòng nhập đầy đủ thông tin!';
    //   return;
    // }

    const { email, password } = this.loginForm.value;
    console.log(email)
    console.log(password)
    if (!this.loginForm.value.email || !this.loginForm.value.password) {
      this.message = 'Vui lòng nhập thông tin!';
      return;
    }

    //const { email, password } = this.loginForm.value;
    this.Login(email, password)
  }

  Login(email: string, password: string) {
    this.authService.login(email, password).subscribe({
      next: res => {
        localStorage.setItem("role", res.roles[0]);
        Swal.fire({
          title: 'Đăng nhập thành công!',
          text: 'Chào mừng bạn!',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,       // tự đóng sau 2s (optional)
          timerProgressBar: true
        }).then(() => {
          console.log(res)
          this.authService.setRole(res.roles[0])
          if (res.roles[0] === "Admin") {
            console.log('ok')
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home-user']);
          }
        });
      },
      error: err => {
        console.log(err.status)
        if (err.status == 400) {
          this.message = 'Bạn nhập sai email hoặc mật khẩu!'
          this.cdr.detectChanges();
        }
        if (err.status == 0) {
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
