import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExamType, Level, SkillLevel, Range, Context, Question, Answer, QuestionAdd } from '../models/question-bank.model';

@Injectable({
  providedIn: 'root' // hoặc chỉ trong UserModule
})
export class AdminService {
  private apiUrl = `${environment.apiUrlQuestionBank}`;

  constructor(private http: HttpClient) { }

  getExamTypes(): Observable<ExamType[]> {
    return this.http.get<ExamType[]>(`${this.apiUrl}/ExamType`);
  }

  getLevelsByExamTypeId(id: string): Observable<Level[]> {
    return this.http.get<Level[]>(`${this.apiUrl}/level/exam-type/${id}`);
  }

  getSkillLevelsByLevelId(id: string): Observable<SkillLevel[]> {
    return this.http.get<SkillLevel[]>(`${this.apiUrl}/SkillLevel/filter/level/${id}`);
  }

  getRangesBySkillLevelId(id: string): Observable<Range[]> {
    return this.http.get<Range[]>(`${this.apiUrl}/Range/filter/skill-level/${id}`);
  }

  postRange(range: Range): Observable<Range> {
    return this.http.post<Range>(`${this.apiUrl}/Range`, range, { withCredentials: true });
  }

  updateRange(id: string, range: Range): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Range/${id}`, range, { withCredentials: true });
  }

  deleteRange(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Range/${id}`, { withCredentials: true });
  }

  getRangeById(id: string): Observable<Range> {
    return this.http.get<Range>(`${this.apiUrl}/Range/${id}`, { withCredentials: true })
  }

  // Context
  getContextsByRangeId(id: string): Observable<Context[]> {
    return this.http.get<Context[]>(`${this.apiUrl}/Context/range/${id}`);
  }

  getContextById(id: string): Observable<Context> {
    return this.http.get<Context>(`${this.apiUrl}/Context/${id}`);
  }

  postContext(context: Context): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/Context`, context, { withCredentials: true });
  }

  updateContext(id: string, context: Context): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Context/${id}`, context, { withCredentials: true });
  }

  deleteContext(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Context/${id}`, { withCredentials: true });
  }

  // Question
  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/Question`)
  }
  getQuestionsByContextId(id: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/Question/filter/context/${id}`, { withCredentials: true });
  }

  getQuestionById(id: string): Observable<Question> { 
    return this.http.get<Question>(`${this.apiUrl}/Question/${id}`, { withCredentials: true });
  }

  postQuestion(examTypeId: string, skillId: string, questions: QuestionAdd[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Question/quick-add/skill/${skillId}/exam-type/${examTypeId}`, questions, { withCredentials: true });
  }
  updateQuestion(id: string, question: Question): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Question/${id}`, question, { withCredentials: true });
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Question/${id}`);
  }

  // Answer
  getAnswersByQuestionId(id: string): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/Answer/anser-in-question/${id}`);
  }
  getAnswerById(id: string): Observable<Answer> {
    return this.http.get<Answer>(`${this.apiUrl}/Answer/${id}`, { withCredentials: true });
  }

  postAnswer(answer: Answer): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Answer`, answer, { withCredentials: true });
  }
  updateAnswer(id: string, answer: Answer): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Answer/${id}`, answer, { withCredentials: true });
  }
}
