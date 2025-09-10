import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { ExamType, Level } from "../../models/question-bank.model";
import { FormsModule, NgModel } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ExamTypeService } from "../../services/exam-type-api.service";
import Swal from "sweetalert2";
import { LevelService } from "../../services/level-api.service";

@Component({
    selector: 'level',
    templateUrl: './level.html',
    styleUrl: './level.css',
    imports: [FormsModule]
})

export class LevelComponent implements OnInit {

    examTypes: ExamType[] = [
        // { id: '1', name: 'Thi giữa kỳ', description: 'Bài thi giữa học kỳ' },
        // { id: '2', name: 'Thi cuối kỳ', description: 'Bài thi cuối học kỳ' },
        // { id: '3', name: 'Kiểm tra', description: 'Bài kiểm tra 15 phút' }
    ];
    levels: Level[] = []

    showModal = false;
    isEditMode = false;
    currentExamTypeId!: string
    currentLevel!: Level;
    nextId = 4;
    errorMessage!: string

    private examTypeService = inject(ExamTypeService)
    private levelService = inject(LevelService)
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

    getLevels() {
        this.levelService.getLevels(this.currentExamTypeId).subscribe({
            next: (res) => {
                this.levels = res
                this.cd.detectChanges()
            }
        })
    }

    openAddModal(): void {
        this.isEditMode = false;
        this.currentLevel = { id: '0', name: '', examTypeId: this.currentExamTypeId };
        this.showModal = true;
    }

    openEditModal(level: Level): void {
        this.isEditMode = true;
        this.currentLevel = { 
            id: level.id,
            name: level.name,
            examTypeId: this.currentExamTypeId
         };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.currentLevel = { id: '0', name: '', examTypeId: '' };
    }

    saveLevel(): void {

        if (this.isEditMode) {
            if (!this.isUpdateValid()) {
                return;
            }
            
            this.levelService.updateLevel(this.currentLevel).subscribe({
                next: () => {
                    Swal.fire({
                        title: 'Thành công!',
                        text: 'Cập nhật thông tin thành công.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        this.getLevels()
                        this.errorMessage = ''
                    })
                },
                error: (err) => {
                    console.log(err)
                }
            })
        } else {
            if (!this.isAddValid()) {
                return;
            }
            this.levelService.addLevels({
                name: this.currentLevel.name || '',
                examTypeId: this.currentLevel.examTypeId || ''
            }).subscribe({
                next: () => {
                    Swal.fire({
                        title: 'Thành công!',
                        text: 'Thêm thành công.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        this.getLevels()
                        this.errorMessage = ''
                    })
                }
            })
        }

        this.closeModal();
    }

    deleteLevel(id: string): void {
        Swal.fire({
            title: 'Bạn có chắc muốn xoá?',
            text: 'Dữ liệu sẽ không thể khôi phục!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xoá',
            cancelButtonText: 'Huỷ'
        }).then((result) => {
            if (result.isConfirmed) {
                this.levelService.deleteLevel(id).subscribe({
                    next: () => {
                        Swal.fire({
                            title: 'Đã xoá!',
                            text: 'Xóa thành công.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            this.getLevels()
                        })
                    }
                })
            }
        });

    }

    isAddValid(): boolean {
        if (this.currentLevel!.name!.trim() == '') {
            this.errorMessage = 'Vui lòng nhập cấp độ'
            return false
        }
        let level = this.levels.find(l => l.name == this.currentLevel.name)
        if (level) {
            this.errorMessage = 'Cấp độ đã tồn tại'
            return false
        }
        return true
    }

    isUpdateValid(): boolean {
        if (this.currentLevel!.name!.trim() == '') {
            this.errorMessage = 'Vui lòng nhập cấp độ'
            return false
        } else {
            let level = this.levels.find(
                e => e.name?.toLowerCase() == this.currentLevel.name?.toLowerCase()
                    && e.id != this.currentLevel.id)
            if (level) {
                this.errorMessage = 'Cấp độ đã tồn tại'
                return false
            }
        }
        return true
    }

    onFocus() {
        this.errorMessage = ''
    }

    onChange() {
        if (this.currentExamTypeId) {
            this.getLevels()
        } else {
            this.levels = []
            this.cd.detectChanges()
        }
    }
}