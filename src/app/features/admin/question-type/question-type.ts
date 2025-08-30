import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface QuestionType {
    id: number;
    level: number;
    skill: string;
    typeName: string;
    startQuestion: number;
    endQuestion: number;
}

@Component({
    selector: 'app-exam-question-types',
    imports: [CommonModule, FormsModule],
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
  `]
})
export class ExamQuestionTypesComponent {
    questionTypes: QuestionType[] = [];
    selectedLevel: string = '';
    selectedSkill: string = '';
    typeName: string = '';
    startQuestion: number | null = null;
    endQuestion: number | null = null;

    // Dữ liệu skills theo level
    private skillsData: { [key: string]: string[] } = {
        '1': ['nghe', 'đọc'],
        '2': ['nghe', 'đọc', 'viết'],
        '3': ['nghe', 'đọc', 'viết'],
        '4': ['nghe', 'đọc', 'viết'],
        '5': ['nghe', 'đọc', 'viết'],
        '6': ['nghe', 'đọc', 'viết']
    };

    /**
     * Xử lý khi thay đổi level
     */
    onLevelChange(): void {
        this.selectedSkill = '';
        this.resetInputFields();
    }

    /**
     * Xử lý khi thay đổi skill
     */
    onSkillChange(): void {
        this.resetInputFields();
    }

    /**
     * Lấy danh sách skills có sẵn theo level đã chọn
     */
    getAvailableSkills(): string[] {
        if (!this.selectedLevel) {
            return [];
        }
        return this.skillsData[this.selectedLevel] || [];
    }

    /**
     * Kiểm tra có thể thêm dạng bài không
     */
    canAddQuestionType(): boolean {
        return !!(this.selectedLevel &&
            this.selectedSkill &&
            this.typeName &&
            this.startQuestion &&
            this.endQuestion &&
            this.startQuestion <= this.endQuestion);
    }

    /**
     * Thêm dạng bài mới
     */
    addQuestionType(): void {
        if (this.canAddQuestionType()) {
            const newQuestionType: QuestionType = {
                id: Date.now(),
                level: parseInt(this.selectedLevel),
                skill: this.selectedSkill,
                typeName: this.typeName,
                startQuestion: this.startQuestion!,
                endQuestion: this.endQuestion!
            };

            this.questionTypes.push(newQuestionType);
            this.resetForm();
        }
    }

    /**
     * Xóa dạng bài theo ID
     */
    removeQuestionType(id: number): void {
        this.questionTypes = this.questionTypes.filter(item => item.id !== id);
    }

    /**
     * Reset form về trạng thái ban đầu
     */
    private resetForm(): void {
        this.selectedLevel = '';
        this.selectedSkill = '';
        this.resetInputFields();
    }

    /**
     * Reset các trường input
     */
    private resetInputFields(): void {
        this.typeName = '';
        this.startQuestion = null;
        this.endQuestion = null;
    }

    /**
     * Chuyển đổi chuỗi sang Title Case
     */
    toTitleCase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}