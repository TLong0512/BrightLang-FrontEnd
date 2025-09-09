import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { RegisterDto } from '../../../models/register.model';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedService } from '../services/share.service';
import { EmailToVerifyDto } from '../../../models/email.model';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'verify',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './verify.html',
  styleUrls: ['./verify.css']
})
export class VerifyComponent implements OnInit, OnDestroy {
  message = '';
  resend = true;
  timeLeft = 60; // 60 giây
  timeLeft$ = new BehaviorSubject<number>(10);
  verifyForm: FormGroup = new FormGroup({});
  private intervalId: any;
  inputs = [0, 1, 2, 3, 4, 5];
  email = ''
  constructor(private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    const group: any = {};
    this.inputs.forEach((_, i) => {
      group['code' + i] = new FormControl('', [Validators.required]);
    });
    this.verifyForm = new FormGroup(group);

    this.sharedService.currentData.subscribe(res => {
      this.email = res
    });
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  getControl(i: number): FormControl {
    return this.verifyForm.get('code' + i) as FormControl;
  }

  onSubmit() {
    this.message = ''; // reset message
    console.log(this.inputs)
    const code = this.inputs
      .map((_, i) => this.getControl(i).value)
      .join('');

    this.sharedService.currentData.subscribe(res => {
      this.email = res
      const registerDto: RegisterDto = {
        FullName: res['fullName'],
        Email: res['email'],
        Password: res['password'],
        ConfirmPassword: res['confirmPassword'],
        VerificationCode: code
      }
      this.Register(registerDto)
    });
    console.log('76', this.email)
  }

  onResend() {
    this.timeLeft$ = new BehaviorSubject<number>(10);
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this.startCountdown();
    this.sharedService.currentData.subscribe(res => {
      this.SendEmail({Email: res['email']})
    });
  }

  startCountdown() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const current = this.timeLeft$.value;
      if (current > 0) {
        this.timeLeft$.next(current - 1);
      } else {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }, 1000);
  }

  focusNext(i: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key >= '0' && event.key <= '9' && i < this.inputs.length - 1) {
      this.getControl(i + 1).setValue('');
      (input.nextElementSibling as HTMLInputElement)?.focus();
    } else if (event.key === 'Backspace' && i > 0) {
      this.getControl(i).setValue('');
      (input.previousElementSibling as HTMLInputElement)?.focus();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(event.key)) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault(); // chặn ký tự không phải số
    }
  }

  Register(registerDto: RegisterDto) {
    console.log(registerDto)

    this.authService.register(registerDto).subscribe({
      next: (res) => {
        console.log('Đăng ký thành công:', res)
        Swal.fire({
          title: 'Đăng ký thành công!',
          text: 'Vui lòng đăng nhập để tiếp tục!',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true
        }).then(() => {
          if (res && res.roles.includes("Admin")) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home-user']);
          }
        });
      },
      error: err => {
        console.log(err)
        if (err.status == 400) {
          this.message = 'Mã xác nhận không chính xác!'
        }
        if (err.status == 0) {
          this.message = 'Lỗi kết nối!'
        } else {
          console.log(err)
        }
      }
    });
  }

  SendEmail(emailToVerifyDto: EmailToVerifyDto) {
    this.authService.registerEmailRequest(emailToVerifyDto).subscribe({
      next: res => {
        if(res == true) alert('Send success!');
        else alert('Email already used.');
      },
      error: (err: HttpErrorResponse) => {
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
