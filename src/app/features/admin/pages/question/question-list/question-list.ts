import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuestionBankApiService } from '../../../services/question-bank-api.service';
import { Question, QuestionPage } from '../../../models/question-bank.model';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  template: `
    <div class="question-list-wrapper">
      <!-- Header Section -->
      <div class="header-section">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="page-title">
                <i class="fas fa-question-circle me-3"></i>
                Danh sách câu hỏi
              </h1>
              <p class="page-subtitle">Quản lý tất cả câu hỏi trong ngân hàng đề</p>
            </div>
            <div class="col-md-4 text-md-end">
              <div class="stats-card">
                <div class="stats-number"></div>
                <div class="stats-label">Tổng câu hỏi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container">
        <!-- Add Button Section -->
        <div class="add-question-section">
          <button 
            type="button" 
            class="btn-add-question"
            routerLink="/admin/question-add">
            <i class="fas fa-plus me-2"></i>
            Thêm câu hỏi mới
          </button>
        </div>

        <!-- Questions Content -->
        @if(!questionsData?.items) {
          <div class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-clipboard-question"></i>
            </div>
            <h3 class="empty-title">Chưa có câu hỏi nào</h3>
            <p class="empty-description">Hãy tạo câu hỏi đầu tiên để bắt đầu xây dựng ngân hàng đề</p>
            <button 
              type="button" 
              class="btn-primary-custom"
              routerLink="/admin/question-add">
              <i class="fas fa-plus me-2"></i>
              Tạo câu hỏi đầu tiên
            </button>
          </div>
        } @else {
          <div class="questions-grid">
            @for(question of questionsData?.items!; track question; let i = $index) {
              <div class="question-card" [style.animation-delay.s]="i * 0.1">
                <div class="card-header">
                  <div class="question-number">
                    <span>{{ question.questionNumber }}</span>
                  </div>
                  <div class="card-actions">
                    <button 
                      type="button" 
                      class="action-btn edit-btn" 
                      title="Chỉnh sửa"
                      (click)="editQuestion(question.id!)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      type="button" 
                      class="action-btn delete-btn" 
                      title="Xóa"
                      (click)="deleteQuestion(question.id!)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div class="card-body">
                  <div class="question-content">
                    {{ question.content || 'Nội dung câu hỏi' }}
                  </div>

                  <div class="explanation-section">
                    <div class="explanation-header">
                      <i class="fas fa-lightbulb"></i>
                      <span>Giải thích</span>
                    </div>
                    <div class="explanation-content" [class.no-explanation]="!question.explain">
                      {{ question.explain || 'Chưa có giải thích cho câu hỏi này' }}
                    </div>
                  </div>
                </div>
              </div>
            }

            @if(questionsData?.items!.length === 0) {
              <div class="no-results">
                <i class="fas fa-search"></i>
                <h4>Không tìm thấy câu hỏi nào</h4>
                <p>Thử điều chỉnh bộ lọc hoặc tạo câu hỏi mới</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './question-list.css'
})
export class QuestionListComponent implements OnInit {
  questionsData!: QuestionPage;

  constructor(
    private adminService: QuestionBankApiService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getAllQuestions();
  }

  getAllQuestions() {
    this.adminService.getAllQuestions().subscribe({
      next: (data) => {
        this.questionsData = data;
        this.cd.detectChanges();
        console.log('Questions data:', data);
      },
      error: (err) => {
        console.error('Error loading questions:', err);
        Swal.fire({
          title: 'Lỗi!',
          text: 'Không thể tải danh sách câu hỏi',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  editQuestion(questionId: string): void {
    this.router.navigate(['/admin/question-update', questionId]);
  }

  deleteQuestion(questionId: string): void {
    Swal.fire({
      title: 'Bạn có chắc muốn xóa?',
      text: 'Dữ liệu sẽ không thể khôi phục!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#80D0C7',
      cancelButtonColor: '#f56565',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'swal-custom-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteQuestion(questionId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Câu hỏi đã được xóa thành công.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'swal-success-popup'
              }
            }).then(() => {
              this.getAllQuestions();
            });
          },
          error: (err) => {
            console.error('Error deleting question:', err);
            Swal.fire({
              title: 'Lỗi!',
              text: 'Không thể xóa câu hỏi',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }
}