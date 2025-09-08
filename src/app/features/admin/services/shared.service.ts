// shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService<T = any> {
  // BehaviorSubject giữ giá trị cuối cùng và cho phép component mới subscribe ngay
  private dataSource = new BehaviorSubject<T | null>(null);
  currentData$ = this.dataSource.asObservable();

  // cập nhật object
  setData(data: T): void {
    this.dataSource.next(data);
  }

  // lấy object hiện tại (không cần subscribe)
  getData(): T | null {
    return this.dataSource.getValue();
  }

  // clear object
  clear() {
    this.dataSource.next(null);
  }
}
