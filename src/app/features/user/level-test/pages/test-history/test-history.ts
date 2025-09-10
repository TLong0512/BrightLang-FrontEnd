import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService, PageResult, TestHistoryDto } from '../../services/exam.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

interface TestStatistics {
  totalTests: number;
  averageScore: number;
  passedTests: number;
  failedTests: number;
  averageCompletionRate: number;
  totalTimeSpent: number;
}

@Component({
  selector: 'app-test-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-history-container">
      <div class="container">
        <!-- Header Section -->
        <div class="page-header">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-10 text-center">
              <h1 class="page-title">Lịch Sử Làm Bài</h1>
              <p class="page-subtitle">Xem lại các bài kiểm tra bạn đã hoàn thành và theo dõi tiến độ học tập</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading && testHistory.items.length === 0" class="loading-container">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="hasError && !isLoading" class="error-container">
          <div class="error-card">
            <div class="error-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4>Có lỗi xảy ra</h4>
            <p>Không thể tải dữ liệu lịch sử bài thi. Vui lòng thử lại sau.</p>
            <button class="btn-retry" (click)="retryLoad()">
              <i class="fas fa-redo"></i>
              Thử lại
            </button>
          </div>
        </div>

        <!-- Statistics Section -->
        <div *ngIf="!isLoading && !hasError && statistics.totalTests > 0" class="statistics-section">
          <div class="stats-grid">
            <div class="stat-card total-tests">
              <div class="stat-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="stat-content">
                <h3>{{ statistics.totalTests }}</h3>
                <p>Tổng số bài</p>
              </div>
            </div>

            <div class="stat-card average-score">
              <div class="stat-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="stat-content">
                <h3>{{ getAverageScoreText() }}</h3>
                <p>Điểm TB</p>
              </div>
            </div>

            <div class="stat-card completion-rate">
              <div class="stat-icon">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="stat-content">
                <h3>{{ statistics.averageCompletionRate }}%</h3>
                <p>Hoàn thành</p>
              </div>
            </div>

            <div class="stat-card total-time">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3>{{ formatTotalTime(statistics.totalTimeSpent) }}</h3>
                <p>Tổng TG</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Test History Section -->
        <div class="test-history-section">
          <!-- No tests message -->
          <div *ngIf="!isLoading && !hasError && testHistory.items.length === 0 && statistics.totalTests === 0" class="no-tests-message">
            <div class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <h4>Chưa có bài kiểm tra nào</h4>
              <p>Bạn chưa hoàn thành bài kiểm tra nào. Hãy bắt đầu làm bài để xem kết quả ở đây!</p>
              <button class="btn-start-test" (click)="navigateToTest()">
                <i class="fas fa-play"></i>
                Bắt đầu làm bài
              </button>
            </div>
          </div>

          <!-- Test history list -->
          <div *ngIf="testHistory.items.length > 0" class="test-history-list">
            <div class="section-header">
              <h4>Danh sách bài thi</h4>
              <div class="results-info">
                {{ getStartIndex() }} - {{ getEndIndex() }} / {{ testHistory.totalItems }}
              </div>
            </div>

            <!-- Compact Test List -->
            <div class="test-list-compact">
              <div class="test-list-header">
                <div class="col-id">ID</div>
                <div class="col-date">Ngày thi</div>
                <div class="col-time">Thời gian</div>
                <div class="col-score">Kết quả</div>
                <div class="col-actions">Thao tác</div>
              </div>
              
              <div *ngFor="let test of testHistory.items; let i = index" 
                   class="test-list-item"
                   [style.animation-delay.ms]="i * 50">
                <div class="col-id">
                  <span class="test-id-short">#{{ getShortId(test.id) }}</span>
                </div>
                <div class="col-date">
                  <span class="test-date-compact">{{ formatDateShort(test.createdDate) }}</span>
                </div>
                <div class="col-time">
                  <span class="test-duration">{{ formatDuration(test.actualDuration || 0) }}</span>
                  <span class="test-duration-max">/ {{ formatDuration(test.duration) }}</span>
                </div>
                <div class="col-score">
                  <div class="score-badge-compact" [ngClass]="getScoreBadgeClass(test.score)">
                    <i class="fas" 
                       [ngClass]="{
                         'fa-times': test.score === 0,
                         'fa-check': test.score === 1,
                         'fa-star': test.score === 2
                       }"></i>
                    <span>{{ getScoreTextShort(test.score) }}</span>
                  </div>
                </div>
                <div class="col-actions">
                  <button class="btn-detail-compact" (click)="viewTestDetail(test.id)" [disabled]="!test.id">
                    <i class="fas fa-eye"></i>
                    <span>Chi tiết</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div *ngIf="testHistory.totalPages > 1" class="pagination-wrapper">
              <div class="pagination-info">
                Trang {{ currentPage }} / {{ testHistory.totalPages }}
              </div>
              <div class="pagination-controls">
                <button class="page-btn" 
                        (click)="goToPage(1)" 
                        [disabled]="currentPage === 1 || isLoading">
                  <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="page-btn" 
                        (click)="goToPage(currentPage - 1)" 
                        [disabled]="currentPage === 1 || isLoading">
                  <i class="fas fa-angle-left"></i>
                </button>
                
                <div class="page-numbers">
                  <button *ngFor="let page of getVisiblePages()" 
                          class="page-btn" 
                          [class.active]="page === currentPage"
                          (click)="goToPage(page)"
                          [disabled]="isLoading">
                    {{ page }}
                  </button>
                </div>
                
                <button class="page-btn" 
                        (click)="goToPage(currentPage + 1)" 
                        [disabled]="currentPage >= testHistory.totalPages || isLoading">
                  <i class="fas fa-angle-right"></i>
                </button>
                <button class="page-btn" 
                        (click)="goToPage(testHistory.totalPages)" 
                        [disabled]="currentPage >= testHistory.totalPages || isLoading">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-history-container {
      background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
      min-height: 100vh;
      padding: 120px 0 60px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Page Header */
    .page-header {
      margin-bottom: 40px;
      text-align: center;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a365d;
      margin-bottom: 15px;
      position: relative;
    }

    .page-title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2px;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #64748b;
      margin: 0;
    }

    /* Loading State */
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .loading-spinner {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e2e8f0;
      border-left: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-spinner p {
      color: #64748b;
      font-size: 16px;
      margin: 0;
    }

    /* Error State */
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      padding: 40px 20px;
    }

    .error-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      border: 2px solid #fee2e2;
      max-width: 400px;
    }

    .error-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: #dc2626;
      font-size: 1.5rem;
    }

    .error-card h4 {
      color: #dc2626;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .error-card p {
      color: #64748b;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .btn-retry {
      background: linear-gradient(135deg, #dc2626, #ef4444);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-retry:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
    }

    /* Statistics Section */
    .statistics-section {
      margin-bottom: 40px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
    }

    .stat-card.total-tests::before {
      background: linear-gradient(90deg, #667eea, #764ba2);
    }

    .stat-card.average-score::before {
      background: linear-gradient(90deg, #f093fb, #f5576c);
    }

    .stat-card.completion-rate::before {
      background: linear-gradient(90deg, #4facfe, #00f2fe);
    }

    .stat-card.total-time::before {
      background: linear-gradient(90deg, #43e97b, #38f9d7);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
      margin-bottom: 12px;
    }

    .total-tests .stat-icon {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .average-score .stat-icon {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }

    .completion-rate .stat-icon {
      background: linear-gradient(135deg, #4facfe, #00f2fe);
    }

    .total-time .stat-icon {
      background: linear-gradient(135deg, #43e97b, #38f9d7);
    }

    .stat-content h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a365d;
      margin-bottom: 4px;
    }

    .stat-content p {
      color: #64748b;
      margin: 0;
      font-size: 13px;
      font-weight: 500;
    }

    /* Empty State */
    .no-tests-message {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-state {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
      border: 2px dashed #e2e8f0;
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .empty-icon i {
      font-size: 2rem;
      color: white;
    }

    .empty-state h4 {
      color: #1a365d;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .empty-state p {
      color: #64748b;
      margin-bottom: 25px;
      line-height: 1.5;
    }

    .btn-start-test {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-start-test:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    /* Test History Section */
    .test-history-section {
      margin-top: 40px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h4 {
      color: #1a365d;
      font-weight: 600;
      margin: 0;
    }

    .results-info {
      color: #64748b;
      font-size: 14px;
    }

    /* Compact Test List */
    .test-list-compact {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .test-list-header {
      display: grid;
      grid-template-columns: 100px 120px 140px 120px 100px;
      gap: 20px;
      padding: 16px 20px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-weight: 600;
      color: #374151;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .test-list-item {
      display: grid;
      grid-template-columns: 100px 120px 140px 120px 100px;
      gap: 20px;
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      transition: all 0.3s ease;
      animation: slideInUp 0.4s ease-out forwards;
      align-items: center;
    }

    .test-list-item:last-child {
      border-bottom: none;
    }

    .test-list-item:hover {
      background: #f8fafc;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .test-id-short {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      background: #eef2ff;
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
    }

    .test-date-compact {
      font-size: 13px;
      color: #374151;
      font-weight: 500;
    }

    .test-duration {
      font-size: 13px;
      font-weight: 600;
      color: #1a365d;
    }

    .test-duration-max {
      font-size: 12px;
      color: #64748b;
      margin-left: 2px;
    }

    .score-badge-compact {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .score-badge-compact.score-failed {
      background: #fee2e2;
      color: #dc2626;
    }

    .score-badge-compact.score-average {
      background: #fef3c7;
      color: #d97706;
    }

    .score-badge-compact.score-good {
      background: #d1fae5;
      color: #059669;
    }

    .score-badge-compact.score-default {
      background: #f1f5f9;
      color: #64748b;
    }

    .btn-detail-compact {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .btn-detail-compact:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-detail-compact:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Pagination */
    .pagination-wrapper {
      margin-top: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .pagination-info {
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }

    .page-numbers {
      display: flex;
      gap: 4px;
    }

    .page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: #64748b;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.3s ease;
      cursor: pointer;
      font-size: 13px;
    }

    .page-btn:hover:not(:disabled) {
      background: #f1f5f9;
      color: #667eea;
    }

    .page-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }

      .test-list-header,
      .test-list-item {
        grid-template-columns: 80px 100px 120px 90px 80px;
        gap: 10px;
        padding: 12px 15px;
      }

      .test-list-header {
        font-size: 11px;
      }

      .section-header {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }

      .pagination-controls {
        flex-wrap: wrap;
        justify-content: center;
      }
    }

    @media (max-width: 576px) {
      .container {
        padding: 0 15px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .test-list-header,
      .test-list-item {
        grid-template-columns: 70px 90px 100px 80px 70px;
        gap: 8px;
        padding: 10px 12px;
      }

      .btn-detail-compact span {
        display: none;
      }

      .test-history-container {
        padding: 60px 0 40px;
      }
    }
  `]
})
export class TestHistoryComponent implements OnInit, OnDestroy {
  testHistory: PageResult<TestHistoryDto> = {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    items: []
  };

  statistics: TestStatistics = {
    totalTests: 0,
    averageScore: 0,
    passedTests: 0,
    failedTests: 0,
    averageCompletionRate: 0,
    totalTimeSpent: 0
  };

  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  hasError = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private testService: TestService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 TestHistoryComponent initialized');
    this.loadTestHistory();
  }

  ngOnDestroy(): void {
    console.log('🛑 TestHistoryComponent destroyed');
    this.subscription.unsubscribe();
  }

  loadTestHistory(): void {
    if (this.isLoading) {
      console.warn('⚠️ Already loading, skipping request');
      return;
    }
    
    console.log(`📊 Loading test history - Page: ${this.currentPage}, PageSize: ${this.pageSize}`);
    console.log(`🔗 URL: ${this.testService['baseUrl']}/user-test/all/${this.currentPage}/${this.pageSize}`);
    
    this.isLoading = true;
    this.hasError = false;
    
    const subscription = this.testService.getAllTestHistory(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        console.log('✅ Test history loaded successfully');
        console.log('📦 Raw response data:', data);
        console.log('📋 Response structure:', {
          page: data?.page,
          pageSize: data?.pageSize,
          totalItems: data?.totalItems,
          totalPages: data?.totalPages,
          itemsLength: data?.items?.length,
          firstItem: data?.items?.[0],
          lastItem: data?.items?.[data?.items?.length - 1]
        });
        this.handleSuccessResponse(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading test history:', error);
        console.error('📋 Error details:', {
          status: error?.status,
          statusText: error?.statusText,
          message: error?.message,
          url: error?.url,
          error: error?.error
        });
        this.handleErrorResponse();
      }
    });
    
    this.subscription.add(subscription);
  }

  private handleSuccessResponse(data: any): void {
    console.log('🔄 Processing response data...');
    
    if (!data) {
      console.warn('⚠️ No data received');
      this.handleEmptyData();
      return;
    }

    if (data.items && Array.isArray(data.items)) {
      console.log('✅ Valid paginated data structure');
      console.log('📊 Data details:', {
        currentDataPage: data.page,
        currentComponentPage: this.currentPage,
        dataPageSize: data.pageSize,
        componentPageSize: this.pageSize,
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        itemsCount: data.items.length
      });

      this.testHistory = {
        page: data.page || this.currentPage,
        pageSize: data.pageSize || this.pageSize,
        totalItems: data.totalItems || 0,
        totalPages: data.totalPages || 0,
        items: data.items || []
      };

      console.log('🔄 Updated testHistory:', this.testHistory);
      
    } else if (Array.isArray(data)) {
      console.warn('⚠️ Backend returned raw array instead of paginated result');
      const totalItems = data.length;
      const totalPages = Math.ceil(totalItems / this.pageSize);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      
      this.testHistory = {
        page: this.currentPage,
        pageSize: this.pageSize,
        totalItems: totalItems,
        totalPages: totalPages,
        items: data.slice(startIndex, endIndex)
      };
      
      console.log('🔄 Converted raw array to paginated format:', this.testHistory);
    } else {
      console.warn('⚠️ Unexpected data format:', data);
      this.handleEmptyData();
      return;
    }

    this.calculateStatistics();
    console.log('📈 Statistics calculated:', this.statistics);
  }

  private handleErrorResponse(): void {
    console.log('❌ Handling error response');
    this.isLoading = false;
    this.hasError = true;
    this.handleEmptyData();
  }

  private handleEmptyData(): void {
    console.log('📭 Handling empty data');
    this.testHistory = {
      page: this.currentPage,
      pageSize: this.pageSize,
      totalItems: 0,
      totalPages: 0,
      items: []
    };
    this.calculateStatistics();
  }

  retryLoad(): void {
    console.log('🔄 Retrying load...');
    this.hasError = false;
    this.loadTestHistory();
  }

  private calculateStatistics(): void {
    console.log('📊 Calculating statistics...');
    const items = this.testHistory.items;
    
    if (!items || items.length === 0) {
      console.log('📭 No items for statistics calculation');
      this.statistics = {
        totalTests: this.testHistory.totalItems || 0,
        averageScore: 0,
        passedTests: 0,
        failedTests: 0,
        averageCompletionRate: 0,
        totalTimeSpent: 0
      };
      return;
    }

    const totalTests = this.testHistory.totalItems || items.length;
    const passedTests = items.filter(test => (test.score || 0) >= 1).length;
    const failedTests = items.filter(test => (test.score || 0) === 0).length;
    
    const totalScore = items.reduce((sum, test) => sum + (test.score || 0), 0);
    const averageScore = items.length > 0 ? totalScore / items.length : 0;
    
    const totalCompletionRate = items.reduce((sum, test) => {
      const rate = this.getCompletionPercentage(test.actualDuration || 0, test.duration || 0);
      return sum + rate;
    }, 0);
    const averageCompletionRate = items.length > 0 ? Math.round(totalCompletionRate / items.length) : 0;
    
    const totalTimeSpent = items.reduce((sum, test) => sum + (test.actualDuration || 0), 0);

    this.statistics = {
      totalTests,
      averageScore,
      passedTests,
      failedTests,
      averageCompletionRate,
      totalTimeSpent
    };
    
    console.log('📈 Statistics result:', this.statistics);
  }

  goToPage(page: number): void {
    console.log(`🔄 goToPage called with page: ${page}`);
    console.log(`📋 Current state:`, {
      currentPage: this.currentPage,
      totalPages: this.testHistory.totalPages,
      isLoading: this.isLoading,
      requestedPage: page
    });

    // Enhanced validation with detailed logging
    if (page < 1) {
      console.warn(`⚠️ Invalid page number: ${page} (less than 1)`);
      return;
    }

    if (page > this.testHistory.totalPages) {
      console.warn(`⚠️ Invalid page number: ${page} (greater than total pages: ${this.testHistory.totalPages})`);
      return;
    }

    if (page === this.currentPage) {
      console.log(`ℹ️ Already on page ${page}, skipping`);
      return;
    }

    if (this.isLoading) {
      console.warn(`⚠️ Currently loading, skipping page change to ${page}`);
      return;
    }

    console.log(`✅ Valid page request: navigating from ${this.currentPage} to ${page}`);
    this.currentPage = page;
    this.loadTestHistory();
  }

  getVisiblePages(): number[] {
    console.log('📄 Calculating visible pages...');
    const totalPages = this.testHistory.totalPages;
    
    if (totalPages <= 1) {
      console.log('📄 No pagination needed (totalPages <= 1)');
      return [];
    }
    
    const current = this.currentPage;
    const delta = 2;
    const pages: number[] = [];

    const start = Math.max(1, current - delta);
    const end = Math.min(totalPages, current + delta);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    console.log(`📄 Visible pages: [${pages.join(', ')}] (current: ${current}, total: ${totalPages})`);
    return pages;
  }

  // Utility methods with enhanced logging
  formatDate(dateString: string): string {
    if (!dateString) {
      console.warn('⚠️ formatDate: empty dateString');
      return 'N/A';
    }
    
    try {
      const result = this.testService.formatDate(dateString);
      console.log(`📅 formatDate: ${dateString} -> ${result}`);
      return result;
    } catch (error) {
      console.error('❌ formatDate error:', error);
      try {
        return new Date(dateString).toLocaleDateString('vi-VN');
      } catch (fallbackError) {
        console.error('❌ formatDate fallback error:', fallbackError);
        return 'N/A';
      }
    }
  }

  formatDateShort(dateString: string): string {
    if (!dateString) {
      console.warn('⚠️ formatDateShort: empty dateString');
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      const result = date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit',
        year: '2-digit'
      });
      console.log(`📅 formatDateShort: ${dateString} -> ${result}`);
      return result;
    } catch (error) {
      console.error('❌ formatDateShort error:', error);
      return 'N/A';
    }
  }

  formatDuration(minutes: number): string {
    if (!minutes || minutes <= 0) {
      console.log(`⏱️ formatDuration: ${minutes} -> 0m`);
      return '0m';
    }
    
    try {
      const result = this.testService.formatDuration(minutes);
      console.log(`⏱️ formatDuration: ${minutes} -> ${result}`);
      return result;
    } catch (error) {
      console.error('❌ formatDuration error:', error);
      if (minutes < 60) {
        return `${minutes}m`;
      }
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    }
  }

  formatTotalTime(totalMinutes: number): string {
    console.log(`⏱️ formatTotalTime called with: ${totalMinutes}`);
    if (!totalMinutes || totalMinutes <= 0) return '0m';
    
    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  getScoreBadgeClass(score: number): string {
    try {
      const result = this.testService.getScoreBadgeClass(score);
      console.log(`🎯 getScoreBadgeClass: ${score} -> ${result}`);
      return result;
    } catch (error) {
      console.error('❌ getScoreBadgeClass error:', error);
      if (score >= 2) return 'score-good';
      if (score >= 1) return 'score-average';
      if (score === 0) return 'score-failed';
      return 'score-default';
    }
  }

  getScoreText(score: number): string {
    try {
      const result = this.testService.getScoreText(score);
      console.log(`🎯 getScoreText: ${score} -> ${result}`);
      return result;
    } catch (error) {
      console.error('❌ getScoreText error:', error);
      if (score >= 2) return 'Xuất sắc';
      if (score >= 1) return 'Đạt';
      if (score === 0) return 'Chưa đạt';
      return 'N/A';
    }
  }

  getScoreTextShort(score: number): string {
    console.log(`🎯 getScoreTextShort: ${score}`);
    if (score >= 2) return 'Xuất sắc';
    if (score >= 1) return 'Đạt';
    if (score === 0) return 'Chưa đạt';
    return 'N/A';
  }

  getCompletionPercentage(actualDuration: number, maxDuration: number): number {
    if (!maxDuration || maxDuration === 0) {
      console.log(`📊 getCompletionPercentage: maxDuration is 0, returning 0`);
      return 0;
    }
    if (!actualDuration || actualDuration === 0) {
      console.log(`📊 getCompletionPercentage: actualDuration is 0, returning 0`);
      return 0;
    }
    
    const percentage = Math.min(100, Math.round((actualDuration / maxDuration) * 100));
    console.log(`📊 getCompletionPercentage: ${actualDuration}/${maxDuration} = ${percentage}%`);
    return percentage;
  }

  getAverageScoreText(): string {
    const score = this.statistics.averageScore;
    console.log(`📊 getAverageScoreText: ${score}`);
    if (score >= 1.5) return 'Tốt';
    if (score >= 0.5) return 'TB';
    return 'Yếu';
  }

  getStartIndex(): number {
    const result = (this.testHistory.page - 1) * this.testHistory.pageSize + 1;
    console.log(`📊 getStartIndex: page=${this.testHistory.page}, pageSize=${this.testHistory.pageSize} -> ${result}`);
    return result;
  }

  getEndIndex(): number {
    const result = Math.min(
      this.testHistory.page * this.testHistory.pageSize,
      this.testHistory.totalItems
    );
    console.log(`📊 getEndIndex: page=${this.testHistory.page}, pageSize=${this.testHistory.pageSize}, totalItems=${this.testHistory.totalItems} -> ${result}`);
    return result;
  }

  getShortId(id: string): string {
    if (!id) {
      console.warn('⚠️ getShortId: empty id');
      return 'N/A';
    }
    const result = id.substring(0, 6);
    console.log(`🆔 getShortId: ${id} -> ${result}`);
    return result;
  }

  viewTestDetail(testId: string): void {
    console.log(`🔍 viewTestDetail called with testId: ${testId}`);
    if (!testId) {
      console.warn('⚠️ Invalid test ID');
      return;
    }
    console.log(`🚀 Navigating to test review: /home-user/test-review/${testId}`);
    this.router.navigate(['/home-user/test-review', testId]);
  }

  navigateToTest(): void {
    console.log('🚀 Navigating to level test: /home-user/level-test');
    this.router.navigate(['/home-user/level-test']);
  }
}