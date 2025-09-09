import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { TopikLevel, Skill, QuestionType, SubLevel, Question } from '../../../../models/practice.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TopikDataService {

  private apiUrl = `${environment.apiUrlPractice}`

  constructor(private http: HttpClient) { }

  getTopikLevels(): Observable<TopikLevel[]> {
    return this.http.get<TopikLevel[]>(`${this.apiUrl}/examtypes`);
  }

  getLevelsByExamTypeId(examTypeId: string): Observable<SubLevel[]> {
    return this.http.get<SubLevel[]>(`${this.apiUrl}/levels/${examTypeId}`).pipe(
      map(levels =>
        levels.sort((a, b) => {
          const numA = parseInt(a.name.replace(/\D/g, ''), 10);
          const numB = parseInt(b.name.replace(/\D/g, ''), 10);
          return numA - numB;
        })
      )
    );
  }

  getSkills(levelId: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/skillLevels/${levelId}`);
  }

  getQuestionTypes(skillId: string): Observable<QuestionType[]> {
    return this.http.get<QuestionType[]>(`${this.apiUrl}/ranges/${skillId}`)
  }

  getPracticeQuestions(rangeId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/detail/${rangeId}`, { withCredentials: true })
  }
}