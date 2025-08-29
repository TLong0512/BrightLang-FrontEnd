import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    // Lấy token & role từ localStorage
    const token = localStorage.getItem('role');
    const role = localStorage.getItem('role');

    // Nếu chưa login thì chuyển về trang login
    if (!token) {
      return this.router.parseUrl('/login');
    }

    // Nếu login rồi nhưng không phải admin thì chuyển qua /user
    if (role !== 'Admin') {
      return this.router.parseUrl('/user');
    }

    // Nếu là Admin thì cho vào route
    return true;
  }
}
