import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionListService {
  private values = new BehaviorSubject<{ rangeId: string}>({ rangeId: ''});
  values$ = this.values.asObservable();

  setValues(v1: string) {
    this.values.next({ rangeId: v1})
  }
}
