import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'question-list',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './question-list.html',
  styles: [`
    /* Custom styles để bổ sung cho Bootstrap */
    .card {
      border: none;
      border-radius: 12px;
    }

    .card-header {
      border-radius: 12px 12px 0 0 !important;
      border-bottom: none;
    }

    .form-select:focus,
    .form-control:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .btn {
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .badge {
      font-size: 0.75rem;
    }

    .table th {
      border-bottom: 2px solid #dee2e6;
      font-weight: 600;
    }

    .table-hover tbody tr:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }

    .shadow-sm {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .container-fluid {
        padding-left: 15px;
        padding-right: 15px;
      }
      
      .btn-lg {
        padding: 0.5rem 1rem;
        font-size: 1rem;
      }
      
      .table-responsive {
        font-size: 0.9rem;
      }
    }
  `]
})
export class QuestionListComponent implements OnInit {

  constructor(private cd: ChangeDetectorRef, public adminService: AdminService) { }

  ngOnInit(): void {
    
  }
  

//   /**
//    * Kiểm tra có thể thêm dạng bài không
//    */
//   // canAddQuestionType(): boolean {
//   //   return !!(this.selectedLevel &&
//   //     this.selectedSkill &&
//   //     this.typeName &&
//   //     this.startQuestion &&
//   //     this.endQuestion &&
//   //     this.startQuestion <= this.endQuestion);
//   // }

//   /**
//    * Thêm dạng bài mới
//    */
//   onAddRange(): void {

//     const range: Range = {
//       skillLevelId: this.selectedSkillLevel,
//       name: this.rangeName,
//       startQuestionNumber: this.startQuestionNumber,
//       endQuestionNumber: this.endQuestionNumber
//     }
//     // this.ranges.push(questionType);
//     this.adminService.postRange(range).subscribe({
//       next: (res) => {
//         Swal.fire({
//           title: 'Thêm thành công!',
//           text: 'Loại câu hỏi đã được thêm.',
//           icon: 'success',
//           timer: 1500,
//           showConfirmButton: false
//         }).then(() => {
//           console.log('ok')
//           this.getRanges()
//           this.resetForm();
//         });
//       },
//       error: (error) => {
//         console.log(error)
//       }
//     })
//   }

//   /**
//    * Sửa dạng bài theo ID
//    */
//   onUpdateRange(id: string): void {

//     this.adminService.getRangeById(id).subscribe({
//       next: (res) => {
//         console.log(res)
//         this.updateName = res.name
//         this.updateStartQuestionNumber = res.startQuestionNumber
//         this.updateEndQuestionNumber = res.endQuestionNumber
//         this.updateRangeId = id
//         this.cd.detectChanges()
//       }
//     })
//   }

//   onUpdateRangeModal(): void {
//     console.log(1)
//     const rangeUpdate: Range = {
//       name: this.updateName,
//       startQuestionNumber: this.updateStartQuestionNumber,
//       endQuestionNumber: this.updateEndQuestionNumber,
//       skillLevelId: this.selectedSkillLevel
//     }
//     this.adminService.updateRange(this.updateRangeId, rangeUpdate).subscribe({
//       next: () => {
//         Swal.fire({
//           title: 'Thành câu!',
//           text: 'Sửa thành công.',
//           icon: 'success',
//           timer: 1500,
//           showConfirmButton: false
//         }).then(() => {
//           this.getRanges()
//         })
//       }
//     })
//   }
//   /**
//      * Xóa dạng bài theo ID
//      */
//   onDeleteRange(id: string): void {
//     Swal.fire({
//       title: 'Bạn có chắc muốn xoá?',
//       text: 'Dữ liệu sẽ không thể khôi phục!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Xoá',
//       cancelButtonText: 'Huỷ'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.adminService.deleteRange(id).subscribe({
//           next: () => {
//             Swal.fire({
//               title: 'Đã xoá!',
//               text: 'Loại câu hỏi đã được xoá.',
//               icon: 'success',
//               timer: 1500,
//               showConfirmButton: false
//             }).then(() => {
//               this.getRanges()
//             })
//           }
//         })
//       }
//     });
//   }

//   /**
//    * Reset form về trạng thái ban đầu
//    */
//   private resetForm(): void {

//     this.resetInputFields();
//   }

//   /**
//    * Reset các trường input
//    */
//   private resetInputFields(): void {
//     this.rangeName = '';
//     this.startQuestionNumber = 1;
//     this.endQuestionNumber = 1;
//   }

//   /**
//    * Chuyển đổi chuỗi sang Title Case
//    */
//   toTitleCase(str: string): string {
//     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
//   }



}