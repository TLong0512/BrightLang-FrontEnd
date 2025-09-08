import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { BaseService } from '../../../../api-service/base.service';
import { HttpClient } from '@angular/common/http';

// Updated DTOs to match actual backend response
export interface TestInProgressDto {
  id: string;
  createdDate: string;
  duration: number;
  questionDetails: QuestionDetailDto[];
  choseAnswerIds: string[];
}

export interface QuestionDetailDto {
  id: string;
  questionNumber?: number;
  content?: string;
  questionText?: string;
  contextContent?: string;
  skillName?: string;
  rangeName?: string;
  levelName?: string;
  answerContents?: AnswerSummaryDto[];
  answers?: AnswerSummaryDto[];
  type?: string;
  questionExplain?: string;
  contextExplain?: string;
}

export interface AnswerSummaryDto {
  id: string;
  answerText: string;
  isCorrect: boolean;
  explain?: string;
}

export interface SubmitTestRequestDto {
  listAnswerIds: string[];
  listTrueAnswerIds: string[];
}

export interface AutoSaveRequestDto {
  testId: string;
  questionId: string;
  selectedAnswerIds: string[];
}

export interface TestSummaryDto {
  id: string;
  userId: string;
  score?: number;
  createdAt: string;
}

export interface TestHistoryDto {
  id: string;
  createdDate: string;
  duration: number;
  score: number;
  actualDuration?: number;
}

export interface PageResult<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

@Injectable({
  providedIn: 'root'
})
export class TestService extends BaseService<any> {
  constructor(
    http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId, 'http://localhost:5005/api/Test');
  }

  /**
   * Create a new test and get its details
   */
  createTest(): Observable<TestInProgressDto> {
    return this.http.post<string>(
      `${this.baseUrl}/create-a-test`, 
      {}, 
      { withCredentials: true }
    ).pipe(
      switchMap(testId => {
        const cleanTestId = typeof testId === 'string' ? testId.replace(/"/g, '') : testId;
        return this.getTestDetail(cleanTestId);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get detailed test results
   */
  getTestDetail(testId: string): Observable<TestInProgressDto> {
    console.log('Getting test detail for:', testId);
    
    return this.http.get<TestInProgressDto>(
      `${this.baseUrl}/test-detail/${testId}`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        console.log('Raw backend response:', response);
        return this.transformBackendResponse(response);
      }),
      catchError(error => {
        console.error('Get test detail error:', error);
        return this.handleError(error);
      })
    );
  }

  private transformBackendResponse(response: any): TestInProgressDto {
    console.log('Raw backend response:', response);

    const [datePart, timePart] = response.createdDate.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const utcTime = Date.UTC(year, month - 1, day, hour, minute);
    const startTime = utcTime;
    const totalDuration = (response.duration ?? 0) * 60 * 1000;
    const endTime = startTime + totalDuration;
    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

    const transformed: TestInProgressDto = {
      id: response.id,
      createdDate: response.createdDate,
      duration: remainingSeconds,
      choseAnswerIds: response.choseAnswerIds || [],
      questionDetails: []
    };

    if (response.questionDetails && Array.isArray(response.questionDetails)) {
      transformed.questionDetails = response.questionDetails.map((q: any, index: number) => ({
        id: q.questionInformation?.id || `q-${index}`,
        questionNumber: q.questionInformation?.questionNumber || index + 1,
        content: q.questionInformation?.content || '',
        questionText: q.questionInformation?.content || '',
        contextContent: q.contextInformation?.content || '',
        skillName: q.skillName || '',
        rangeName: q.rangeName || '',
        levelName: q.levelName || '',
        type: q.questionInformation?.type || 'single',
        questionExplain: q.questionInformation?.explain || '',
        contextExplain: q.contextInformation?.explain || '',
        answers: (q.answerDetails || []).map((a: any) => ({
          id: a.id,
          answerText: a.value,
          isCorrect: a.isCorrect,
          explain: a.explain || ''
        })),
        answerContents: (q.answerDetails || []).map((a: any) => ({
          id: a.id,
          answerText: a.value,
          isCorrect: a.isCorrect,
          explain: a.explain || ''
        }))
      }));
    }
    
    return transformed;
  }

  autoSaveAnswer(testId: string, selectedAnswerIds: string[]): Observable<any> {
    const answerGuids = selectedAnswerIds;

    return this.http.post(
      `${this.baseUrl.replace('/Test', '/TestAnswer')}/${testId}`,
      answerGuids,
      { 
        headers: this.getAuthHeaders(),
        withCredentials: true 
      }
    ).pipe(
      catchError(error => {
        console.warn('Auto-save failed, but continuing...', error);
        return throwError(error);
      })
    );
  }

  /**
   * Submit test answers
   */
  submitTest(testId: string, submitRequest: SubmitTestRequestDto): Observable<string> {
    console.log('dto: ', submitRequest);
    console.log('testId: ', testId);
    return this.http.post(
      `${this.baseUrl}/submit/${testId}`,
      submitRequest,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true,
        responseType: 'text'
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all tests for the current user with pagination
   */
  getAllTestsByUser(page: number = 1, pageSize: number = 10): Observable<PageResult<TestSummaryDto>> {
    return this.http.get<PageResult<TestSummaryDto>>(
      `${this.baseUrl}/user-test/all/${page}/${pageSize}`,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Resume existing test by ID
   */
  resumeTest(testId: string): Observable<TestInProgressDto> {
    return this.getTestDetail(testId);
  }

  /**
   * Check if test exists and can be resumed
   */
  canResumeTest(testId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/can-resume/${testId}`,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(() => {
        return [false];
      })
    );
  }

  /**
   * Get all tests history for current user with pagination
   * FIXED: Ensure proper error handling and logging
   */
  getAllTestHistory(page: number = 1, pageSize: number = 10): Observable<PageResult<TestHistoryDto>> {
    console.log(`Calling getAllTestHistory with page: ${page}, pageSize: ${pageSize}`);
    console.log(`URL: ${this.baseUrl}/user-test/all/${page}/${pageSize}`);
    
    return this.http.get<PageResult<TestHistoryDto>>(
      `${this.baseUrl}/user-test/all/${page}/${pageSize}`,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    ).pipe(
      map(response => {
        console.log('getAllTestHistory response:', response);
        
        // Validate response structure
        if (!response || !Array.isArray(response.items)) {
          console.warn('Invalid response structure:', response);
          return {
            page: page,
            pageSize: pageSize,
            totalItems: 0,
            totalPages: 0,
            items: []
          } as PageResult<TestHistoryDto>;
        }

        // Transform response and calculate actual duration for each test
        const transformedItems = response.items.map(item => {
          const actualDuration = this.calculateActualDuration(item.createdDate, item.duration);
          console.log(`Item ${item.id}: createdDate=${item.createdDate}, duration=${item.duration}, actualDuration=${actualDuration}`);
          
          return {
            ...item,
            actualDuration: actualDuration
          };
        });

        return {
          ...response,
          items: transformedItems
        };
      }),
      catchError(error => {
        console.error('Error in getAllTestHistory:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        return this.handleError(error);
      })
    );
  }

  /**
   * Calculate actual test duration based on created date and max duration
   */
  private calculateActualDuration(createdDate: string, maxDuration: number): number {
    try {
      console.log(`Calculating actual duration for: ${createdDate}, max: ${maxDuration}`);
      
      if (!createdDate || !createdDate.includes(' ') || !createdDate.includes('/')) {
        console.error('Invalid date format:', createdDate);
        return 0;
      }

      const [datePart, timePart] = createdDate.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      // Validate parsed values
      if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hour) || isNaN(minute)) {
        console.error('Invalid date components:', { day, month, year, hour, minute });
        return 0;
      }

      const utcTime = Date.UTC(year, month - 1, day, hour, minute);
      const startTime = utcTime;
      const totalDuration = (maxDuration ?? 0) * 60 * 1000;
      const endTime = startTime + totalDuration;
      const now = Date.now();
      
      const usedDuration = Math.min(maxDuration, Math.floor((now - startTime) / (60 * 1000)));
      const result = Math.max(0, usedDuration);
      
      console.log(`Calculated duration: ${result} minutes`);
      return result;
    } catch (error) {
      console.error('Error calculating actual duration:', error);
      return 0;
    }
  }

  /**
   * Format duration from minutes to readable string
   */
  formatDuration(minutes: number): string {
    if (isNaN(minutes) || minutes < 0) {
      return '0m';
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  /**
   * Format date string to Vietnamese locale
   */
  formatDate(dateString: string): string {
    try {
      if (!dateString || !dateString.includes(' ')) {
        return dateString;
      }

      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hour) || isNaN(minute)) {
        return dateString;
      }
      
      const date = new Date(year, month - 1, day, hour, minute);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  /**
   * Get score badge style based on score value
   */
  getScoreBadgeClass(score: number): string {
    switch(score) {
      case 0: return 'score-failed';
      case 1: return 'score-average';
      case 2: return 'score-good';
      default: return 'score-default';
    }
  }

  /**
   * Get score text based on score value
   */
  getScoreText(score: number): string {
    switch(score) {
      case 0: return 'Chưa đạt';
      case 1: return 'Trung bình';
      case 2: return 'Tốt';
      default: return 'N/A';
    }
  }
}