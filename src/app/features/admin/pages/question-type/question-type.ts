import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnlyDigitsDirective } from '../../directive/only-number';
import { MaxNumberDirective } from '../../directive/max-number';
import Swal from 'sweetalert2';
import { QuestionBankApiService } from '../../services/question-bank-api.service';
import { ExamType, Level, SkillLevel, Range } from '../../models/question-bank.model';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-exam-question-types',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyDigitsDirective, MaxNumberDirective],
  templateUrl: './question-type.html',
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
      .error-message {
    color: red;
}
  `]
})
export class ExamQuestionTypeComponent implements OnInit {

  ranges: Range[] = [];

  // two way binding
  selectedExamType: string = '';
  selectedLevel: string = '';
  selectedSkillLevel: string = '';

  // two way for input
  rangeName: string = '';
  startQuestionNumber: number = 0;
  endQuestionNumber: number = 0;

  // list
  examTypes$!: Observable<ExamType[]>
  levels$!: Observable<Level[]>
  skillLevels$!: Observable<SkillLevel[]>

  // two way binding update
  updateName: string = ''
  updateStartQuestionNumber: number = 0
  updateEndQuestionNumber: number = 0
  updateRangeId: string = ''

  // error message add
  rangeErrorMessage: string = ''
  startQuestionNumberErrorMessage: string = ''
  endQuestionNumberErrorMessage: string = ''
  relativeErrorMessage: string = ''

  // error message update
  rangeErrorMessageUpdate: string = ''
  startQuestionNumberErrorMessageUpdate: string = ''
  endQuestionNumberErrorMessageUpdate: string = ''


  constructor(private cd: ChangeDetectorRef, public adminService: QuestionBankApiService) { }

  ngOnInit(): void {
    this.getExamTypes()
  }
  // api: load exam type 
  getExamTypes() {
    this.examTypes$ = this.adminService.getExamTypes();
  }

  // api: load level
  getLevels() {
    if (this.selectedExamType) {
      this.levels$ = this.adminService.getLevelsByExamTypeId(this.selectedExamType).pipe(
        map(levels => levels.sort((a, b) => a.name.localeCompare(b.name))) // sort theo name
      );
    }
  }

  getSkillLevels() {
    if (this.selectedLevel) {
      this.skillLevels$ = this.adminService.getSkillLevelsByLevelId(this.selectedLevel)
    }
  }

  // Xử lý khi thay đổi exam type
  onExamTypeChange(): void {
    this.getLevels()
    this.selectedLevel = ''
  }

  /**
   * Xử lý khi thay đổi level
   */
  onLevelChange(): void {
    this.getSkillLevels()
    this.selectedSkillLevel = ''
  }

  /**
   * Xử lý khi thay đổi skill
   */
  onSkillLevelChange(): void {
    this.resetInputFields();
    this.getRanges()
  }

  /**
   * Lấy danh sách range the 
   */
  getRanges(): void {

    if (this.selectedSkillLevel) {
      this.adminService.getRangesBySkillLevelId(this.selectedSkillLevel)
        .subscribe(data => {
          this.ranges = data
          this.cd.detectChanges()
        })

    }
    console.log(this.ranges)
  }

  /**
   * Kiểm tra có thể thêm dạng bài không
   */

  checkValid(): boolean {
    let hasError = false
    if (this.rangeName.trim() == '') {
      this.rangeErrorMessage = 'Vui lòng nhập dạng câu hỏi.'
      hasError = true
    }

    if (!this.startQuestionNumber) {
      this.startQuestionNumberErrorMessage = 'Vui lòng nhập câu bắt đầu.'
      hasError = true
    } else if (this.startQuestionNumber == 0) {
      this.startQuestionNumberErrorMessage = 'Câu hỏi phải lớn hơn 0'
      hasError = true
    }

    if (!this.endQuestionNumber) {
      this.endQuestionNumberErrorMessage = 'Vui lòng nhập câu kết thúc.'
      hasError = true
    } else if (this.endQuestionNumber == 0) {
      this.startQuestionNumberErrorMessage = 'Câu hỏi phải lớn hơn 0'
      hasError = true
    }

    if (this.startQuestionNumber && this.endQuestionNumber) {
      if (this.startQuestionNumber >= this.endQuestionNumber) {
        this.relativeErrorMessage = 'Câu bắt đầu phải nhỏ hơn câu kết thúc.'
        this.startQuestionNumberErrorMessage = ''
        this.endQuestionNumberErrorMessage = ''
        hasError = true
        this.cd.detectChanges()
      }
    }

    // check name, range is exist
    const nameExists = this.ranges.some(r => r.name === this.rangeName);
    if (nameExists) {
      this.rangeErrorMessage = `Tên đã tồn tại.`;
      hasError = true
    }

    // 2. Check overlap start-end
    const overlap = this.ranges.some(r =>
      // nếu new.start <= r.end && new.end >= r.start => overlap
      this.startQuestionNumber <= r.endQuestionNumber && this.endQuestionNumber >= r.startQuestionNumber
    );

    console.log(232)
    if (overlap && this.relativeErrorMessage == '') {
      console.log(234, overlap, this.relativeErrorMessage)
      this.relativeErrorMessage = `Khoảng (${this.startQuestionNumber}, ${this.endQuestionNumber}) bị trùng với dữ liệu có sẵn.`;
      this.startQuestionNumberErrorMessage = ''
      hasError = true
    }
    return hasError
  }

  // checkValidUpdate(): boolean {
  //   let hasError = false
  //   if (this.updateName.trim() == '') {
  //     this.rangeErrorMessageUpdate = 'Vui lòng nhập dạng câu hỏi.'
  //     hasError = true
  //   }

  //   if (!this.updateStartQuestionNumber) {
  //     this.startQuestionNumberErrorMessageUpdate = 'Vui lòng nhập câu bắt đầu.'
  //     hasError = true
  //   } else if (this.updateStartQuestionNumber == 0) {
  //     this.startQuestionNumberErrorMessageUpdate = 'Câu hỏi phải lớn hơn 0'
  //     hasError = true
  //   }

  //   if (!this.updateEndQuestionNumber) {
  //     this.endQuestionNumberErrorMessageUpdate = 'Vui lòng nhập câu kết thúc.'
  //     hasError = true
  //   } else if (this.updateEndQuestionNumber == 0) {
  //     this.startQuestionNumberErrorMessageUpdate = 'Câu hỏi phải lớn hơn 0'
  //     hasError = true
  //   }

  //   if (this.updateStartQuestionNumber && this.updateEndQuestionNumber) {
  //     if (this.updateStartQuestionNumber >= this.updateEndQuestionNumber) {
  //       this.startQuestionNumberErrorMessageUpdate = 'Câu bắt đầu phải nhỏ hơn câu kết thúc.'
  //       this.endQuestionNumberErrorMessageUpdate = ''
  //       hasError = true
  //     }
  //   }

  //   // check name, range is exist
  //   const others =  this.ranges.filter(r => r.id !== this.updateRangeId) 

  //   const nameExists = others.some(r => r.name === this.updateName);
  //   if (nameExists) {
  //     this.rangeErrorMessageUpdate = `Tên đã tồn tại.`;
  //     hasError = true
  //   }

  //   // 2. Check overlap start-end
  //   const overlap = others.some(r =>
  //     // nếu new.start <= r.end && new.end >= r.start => overlap
  //     this.updateStartQuestionNumber <= r.endQuestionNumber && this.updateEndQuestionNumber >= r.startQuestionNumber
  //   );
  //   console.log(280, nameExists)
  //   if (overlap) {
  //     if (!this.startQuestionNumberErrorMessageUpdate) {
  //       this.startQuestionNumberErrorMessageUpdate = `Khoảng (${this.updateStartQuestionNumber}, ${this.updateEndQuestionNumber}) bị trùng với dữ liệu có sẵn.`;
  //       hasError = true
  //     }
  //   }
  //   return hasError
  // }

  /**
   * Thêm dạng bài mới
   */
  onAddRange(): void {
    if (this.checkValid()) return;
    const range: Range = {
      skillLevelId: this.selectedSkillLevel,
      name: this.rangeName,
      startQuestionNumber: this.startQuestionNumber,
      endQuestionNumber: this.endQuestionNumber
    }
    // this.ranges.push(questionType);
    console.log(range)
    this.adminService.postRange(range).subscribe({
      next: (res) => {
        Swal.fire({
          title: 'Thêm thành công!',
          text: 'Loại câu hỏi đã được thêm.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          console.log('ok')
          this.getRanges()
          this.resetForm();
        });
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  /**
   * Sửa dạng bài theo ID
   */
  onUpdateRange(id: string): void {

    this.adminService.getRangeById(id).subscribe({
      next: (res) => {
        console.log(res)
        this.updateName = res.name
        this.updateStartQuestionNumber = res.startQuestionNumber
        this.updateEndQuestionNumber = res.endQuestionNumber
        this.updateRangeId = id
        this.cd.detectChanges()
      }
    })
  }

  // onUpdateRangeModal(): void {
  //   if(this.checkValidUpdate()) {
  //     return;
  //   }
  //   const rangeUpdate: Range = {
  //     name: this.updateName,
  //     startQuestionNumber: this.updateStartQuestionNumber,
  //     endQuestionNumber: this.updateEndQuestionNumber,
  //     skillLevelId: this.selectedSkillLevel
  //   }
  //   this.adminService.updateRange(this.updateRangeId, rangeUpdate).subscribe({
  //     next: () => {
  //       Swal.fire({
  //         title: 'Thành câu!',
  //         text: 'Sửa thành công.',
  //         icon: 'success',
  //         timer: 1500,
  //         showConfirmButton: false
  //       }).then(() => {
  //         this.getRanges()
  //       })
  //     }
  //   })
  // }
  /**
     * Xóa dạng bài theo ID
     */
  onDeleteRange(id: string): void {
    Swal.fire({
      title: 'Bạn có chắc muốn xoá?',
      text: 'Dữ liệu sẽ không thể khôi phục!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Huỷ'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteRange(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Đã xoá!',
              text: 'Loại câu hỏi đã được xoá.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.getRanges()
            })
          }
        })
      }
    });
  }

  /**
   * Reset form về trạng thái ban đầu
   */
  private resetForm(): void {

    this.resetInputFields();
  }

  /**
   * Reset các trường input
   */
  private resetInputFields(): void {
    this.rangeName = '';
    this.startQuestionNumber = 1;
    this.endQuestionNumber = 1;
  }

  /**
   * Chuyển đổi chuỗi sang Title Case
   */
  toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }


  onFocus(inputName: string) {
    if (inputName == 'range') {
      this.rangeErrorMessage = ''
    } else if (inputName == 'start') {
      this.startQuestionNumberErrorMessage = ''
      this.relativeErrorMessage = ''
    } else if (inputName == 'end') {
      this.endQuestionNumberErrorMessage = ''
      this.relativeErrorMessage = ''
    } else if (inputName == 'rangeUpdate') {
      this.rangeErrorMessageUpdate = ''
    } else if (inputName == 'startUpdate') {
      this.startQuestionNumberErrorMessageUpdate = ''
    } else if (inputName == 'endUpdate') {
      this.endQuestionNumberErrorMessageUpdate = ''
    }

  }

}