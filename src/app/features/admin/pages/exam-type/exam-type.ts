import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { ExamType } from "../../models/question-bank.model";
import { FormsModule, NgModel } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ExamTypeService } from "../../services/exam-type-api.service";
import Swal from "sweetalert2";

@Component({
    selector: 'exam-type',
    templateUrl: './exam-type.html',
    styleUrl: './exam-type.css',
    imports: [FormsModule]
})

export class ExamTypeComponent implements OnInit {

    examTypes: ExamType[] = [
        // { id: '1', name: 'Thi giữa kỳ', description: 'Bài thi giữa học kỳ' },
        // { id: '2', name: 'Thi cuối kỳ', description: 'Bài thi cuối học kỳ' },
        // { id: '3', name: 'Kiểm tra', description: 'Bài kiểm tra 15 phút' }
    ];

    showModal = false;
    isEditMode = false;
    currentExamType!: ExamType;
    nextId = 4;
    contentMessage!: string
    descriptionMessage!: string

    private examTypeService = inject(ExamTypeService)
    constructor(
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.getExamTypes()
    }

    getExamTypes() {
        this.examTypeService.getExamTypes().subscribe({
            next: (res) => {
                this.examTypes = res
                this.cd.detectChanges()
            }
        })
    }

    openAddModal(): void {
        this.isEditMode = false;
        this.currentExamType = { id: '0', name: '', description: '' };
        this.showModal = true;
    }

    openEditModal(examType: ExamType): void {
        this.isEditMode = true;
        this.currentExamType = { ...examType };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.currentExamType = { id: '0', name: '', description: '' };
    }

    saveExamType(): void {
        
        if (this.isEditMode) {
            if(!this.isUpdateValid()) {
                return;
            }
            this.examTypeService.updateExamType(this.currentExamType).subscribe({
                next: ()=> {
                    Swal.fire({
                            title: 'Thành công!',
                            text: 'Cập nhật thông tin thành công.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            this.getExamTypes()
                            this.contentMessage = ''
                        })
                }
            })
        } else {
            if(!this.isAddValid()) {
                return;
            }
            this.examTypeService.addExamTypes(this.currentExamType).subscribe({
                next: ()=> {
                    Swal.fire({
                            title: 'Thành công!',
                            text: 'Thêm thành công.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            this.getExamTypes()
                            this.contentMessage = ''
                        })
                }
            })
        }

        this.closeModal();
    }

    deleteExamType(id: string): void {
        Swal.fire({
            title: 'Bạn có chắc muốn xoá?',
            text: 'Dữ liệu sẽ không thể khôi phục!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xoá',
            cancelButtonText: 'Huỷ'
        }).then((result) => {
            if (result.isConfirmed) {
                this.examTypeService.deleteExamType(id).subscribe({
                    next: () => {
                        Swal.fire({
                            title: 'Đã xoá!',
                            text: 'Xóa thành công.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            this.getExamTypes()
                        })
                    }
                })
            }
        });

    }

    isAddValid(): boolean {
        if(this.currentExamType.name.trim() == '') {
            this.contentMessage = 'Vui lòng nhập tên bài thi'
            return false
        } else {
            let examType = this.examTypes.find(e => e.name == this.currentExamType.name)
            if(examType) {
                this.contentMessage = 'Tên đã tồn tại'
                return false
            }
        }
        return true
    }

    isUpdateValid(): boolean {
        if(this.currentExamType.name.trim() == '') {
            this.contentMessage = 'Vui lòng nhập tên bài thi'
            return false
        } else {
            let examType = this.examTypes.find(e => e.name == this.currentExamType.name && e.id != this.currentExamType.id)
            if(examType) {
                this.contentMessage = 'Tên đã tồn tại'
                return false
            }
        }
        return true
    }

    onFocus() {
        this.contentMessage = ''
    }
}