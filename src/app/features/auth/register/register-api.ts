import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../../api-service/api.service';
import { Observable } from 'rxjs';
import { EmailToVerifyDto } from '../../../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService extends BaseService<EmailToVerifyDto> {
  constructor(http: HttpClient) {
    super(http, 'https://localhost:7029/api/Authentication/verify-email-request');
  }

  override create(data: EmailToVerifyDto): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }
}
