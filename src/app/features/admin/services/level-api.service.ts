import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Level } from '../models/question-bank.model';

@Injectable({
  providedIn: 'root' // hoặc chỉ trong UserModule
})
export class LevelService {
  
  constructor(private http: HttpClient) { }

  getLevels(id: string): Observable<Level[]> {
    return this.http.get<Level[]>(`/Level/filter/exam-type/${id}`);
  }

  addLevels(level: Level): Observable<void> {
    console.log(level)
    return this.http.post<void>(`/Level`, level);
  }
  updateLevel(level: Level): Observable<void> {
    console.log(level)
    return this.http.put<void>(`/Level/${level.id}`, {name: level.name, examTypeId: level.examTypeId});
  }
  deleteLevel(id: string): Observable<void> {
    return this.http.delete<void>(`/Level/${id}`);
  }

  
}
