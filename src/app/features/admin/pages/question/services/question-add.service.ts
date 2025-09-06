import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionAddService {
  private values = new BehaviorSubject<{ examTypeId: string, skillId: string }>({ 
    examTypeId: '', skillId: ''});
  values$ = this.values.asObservable();

  setValues(v1: string, v2: string) {
    this.values.next({ examTypeId: v1, skillId: v2})
  }
}
