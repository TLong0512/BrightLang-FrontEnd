import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../../api-service/api.service';
import { LoginDto } from '../../../models/login.model';
import { Observable } from 'rxjs';
import { RegisterDto } from '../../../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class VerifyService extends BaseService<RegisterDto> {
  constructor(http: HttpClient) {
    super(http, 'https://localhost:7029/api/Authentication/register');
  }

  override create(data: RegisterDto): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }
}
