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
  templateUrl: './question-list.html',
  styleUrl: './question-list.css'
})
export class QuestionListComponent implements OnInit {
  questionsData!: QuestionPage;

  currentPage = 1;
  pageSize = 10; // mặc định

  pageSizeOptions = [5, 10, 15, 20];
  constructor(
    private adminService: QuestionBankApiService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getAllQuestions(this.currentPage, this.pageSize);
  }

  getAllQuestions(page: number, pageSize: number) {
    this.adminService.getAllQuestions(page, pageSize).subscribe({
      next: (data) => {
        this.questionsData = data;
        this.questionsData.items.sort((a, b) => a.questionNumber! - b.questionNumber!)
        console.log(data)
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
              this.getAllQuestions(this.currentPage, this.pageSize);
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

  changePage(page: number): void {
    if (page < 1 || page > this.questionsData.totalPages) return;
    this.getAllQuestions(page, this.pageSize);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1; // reset về trang 1
    this.getAllQuestions(this.currentPage, this.pageSize);
  }
}