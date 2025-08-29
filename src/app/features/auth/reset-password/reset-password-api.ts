import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../../api-service/api.service';
import { Observable } from 'rxjs';

export interface ResetPasswordDto {
  Email: string,
  VerificationCode: string,
  NewPassword: string,
  ConfirmNewPassword: string
}

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService extends BaseService<ResetPasswordDto> {
  constructor(http: HttpClient) {
    super(http, 'https://localhost:7029/api/Authentication/reset-password');
  }

  // Gọi API gửi OTP
  override create(data: ResetPasswordDto): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }
}


