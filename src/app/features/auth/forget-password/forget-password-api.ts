import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../../api-service/api.service';
import { Observable } from 'rxjs';

export interface ForgetPasswordDto {
  Email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ForgetPasswordService extends BaseService<ForgetPasswordDto> {
  constructor(http: HttpClient) {
    super(http, 'https://localhost:7029/api/Authentication/reset-password-email-request');
  }

  // Gọi API gửi OTP
  override create(data: ForgetPasswordDto): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }
}


