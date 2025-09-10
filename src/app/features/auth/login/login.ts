import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { UserState } from '../services/user.state';
import { take } from 'rxjs';


@Component({
  selector: 'login',
  templateUrl: './login.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class LoginComponent implements OnInit {
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
  ngOnInit(): void {
    this.userState.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.router.navigate(['/home-user']);
      }
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

  private readonly userState = inject(UserState);

  Login(email: string, password: string) {
    this.authService.login(email, password).subscribe({
      next: (res) => {
        if (res == null) {
          alert('Login failed. Please check your username and password!');
          return;
        }
        // localStorage.setItem("role", res.roles[0]);
        Swal.fire({
          title: 'Đăng nhập thành công!',
          text: 'Chào mừng bạn!',
          icon: 'success',
          timer: 2000,       // tự đóng sau 2s (optional)
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          // console.log(res)
          // this.authService.setRole(res.roles[0])

          if (res.roles.includes("Admin")) {
            // console.log('ok')
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
          
        } else if (err.status == 0) {
          this.message = 'Lỗi kết nối!'
        }
        else this.message = "Lỗi không xác định.";
        this.cdr.detectChanges();
      }
    });
  }
  clearMessage() {
    this.message = '';
  }
}
