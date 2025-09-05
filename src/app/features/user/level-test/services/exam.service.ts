import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { BaseService } from '../../../../api-service/base.service';

// DTOs to match backend exactly
export interface TestInProgressDto {
  testId: string;
  listQuestion: QuestionSummaryDto[];
}

export interface QuestionSummaryDto {
  id: string;
  questionNumber: number;
  content: string;
  contextContent: string;
  skillName: string;
  answerContents: AnswerSummaryDto[];
  questionText?: string; // Alias for content
  type?: string; // Will be determined by answer structure
}

export interface AnswerSummaryDto {
  id: string;
  answerText: string;
  isCorrect: boolean;
}

export interface SubmitTestRequestDto {
  listAnswerIds: string[];
  listTrueAnswerIds: string[];
}

export interface TestSummaryDto {
  id: string;
  userId: string;
  score?: number;
  createdAt: Date;
  // Add other properties based on your backend DTO
}

export interface PageResult<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  items: T[];
}

export interface TestReviewDto {
  testId: string;
  questionDetails: QuestionDetailDto[];
  choseAnswerIds: string[];
}

export interface QuestionDetailDto {
  id: string;
  questionText: string;
  type: string;
  answers: AnswerDto[];
  // Add other properties as needed
}

export interface AnswerDto {
  id: string;
  answerText: string;
  isCorrect: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TestService extends BaseService<any> {
  constructor() {
    super('https://localhost:7239/api/Test');
  }

  /**
   * Create a new test and get its details in one flow
   * First calls create-a-test to get testId, then calls test-detail to get full details
   */
  createTest(): Observable<TestInProgressDto> {

    return this.http.post<string>(
      `${this.baseUrl}/create-a-test`, {
        
      }, {withCredentials: true}
    ).pipe(
      switchMap(testId => {
        
        return this.getTestDetail(testId);
      }),
      catchError(this.handleError)
    )
    // 
  }

  /**
   * Get detailed test results - used internally and can be called directly
   * GET /api/Test/test-detail/{testId}
   */
  getTestDetail(testId: string): Observable<TestInProgressDto> {
    console.log('Getting test detail for:', testId);
    
    return this.http.get<TestInProgressDto>(
      `${this.baseUrl}/test-detail/${testId}`
    ).pipe(
      catchError(error => {
        console.error('Get test detail error:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Submit test answers
   * POST /api/Test/submit/{testId}
   */
  submitTest(testId: string, submitRequest: SubmitTestRequestDto): Observable<string> {
    // Call submit API directly without ApiResponse wrapper
    return this.http.post<string>(
      `${this.baseUrl}/submit/${testId}`,
      submitRequest,
      {
        headers: this.getAuthHeaders()
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all tests for the current user with pagination
   * GET /api/Test/user-test/all
   */
  getAllTestsByUser(page: number = 1, pageSize: number = 10): Observable<PageResult<TestSummaryDto>> {
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString()
    };
         
    // Call user-test/all API directly without ApiResponse wrapper
    return this.http.get<PageResult<TestSummaryDto>>(
      `${this.baseUrl}/user-test/all`,
      { 
        params,
        headers: this.getAuthHeaders()
      }
    ).pipe(
      catchError(this.handleError)
    );
  }
}