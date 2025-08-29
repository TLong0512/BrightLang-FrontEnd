import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../../api-service/api.service';
import { LoginDto } from '../../../models/login.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService extends BaseService<LoginDto> {
     
  constructor(http: HttpClient) {
    super(http, 'https://localhost:7030/api/Authentication/login');
  }

  override create(data: LoginDto): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }
}
