import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RangeService {
  private rangeIdSource = new BehaviorSubject<string | null>(null);

  // Observable để component con có thể subscribe
  rangeId$ = this.rangeIdSource.asObservable();

  // Hàm set rangeId
  setRangeId(id: string) {
    this.rangeIdSource.next(id);
  }

  // Hàm lấy giá trị hiện tại
  getRangeId(): string | null {
    return this.rangeIdSource.value;
  }
}
