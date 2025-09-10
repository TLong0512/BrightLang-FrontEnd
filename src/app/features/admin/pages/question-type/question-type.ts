import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnlyDigitsDirective } from '../../directive/only-number';
import { MaxNumberDirective } from '../../directive/max-number';
import { MinNumberDirective } from '../../directive/min-number';
import Swal from 'sweetalert2';
import { QuestionBankApiService } from '../../services/question-bank-api.service';
import { ExamType, Level, SkillLevel, Range } from '../../models/question-bank.model';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-exam-question-types',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyDigitsDirective, MaxNumberDirective, MinNumberDirective],
  template: `
    <div class="question-type-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-icon">
            <span>📝</span>
          </div>
          <div class="header-text">
            <h1>Quản lý dạng câu hỏi</h1>
            <p>Tạo và quản lý các dạng câu hỏi cho bài kiểm tra</p>
          </div>
        </div>
        <div class="header-decoration"></div>
      </div>

      <!-- Selection Form -->
      <div class="selection-section">
        <div class="section-header">
          <h2>Cấu hình dạng câu hỏi</h2>
          <div class="section-subtitle">Chọn các thông tin cần thiết để tạo dạng câu hỏi</div>
        </div>

        <div class="selection-grid">
          <!-- Exam Type Selection -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📚</span>
              Dạng bài thi
            </label>
            <div class="select-wrapper">
              <select class="form-select" [(ngModel)]="selectedExamType" (ngModelChange)="onExamTypeChange()">
                <option value="">Chọn dạng bài thi</option>
                <option *ngFor="let examType of examTypes$ | async; trackBy: trackByFn" [value]="examType.id">
                  {{ examType.name }}
                </option>
              </select>
              <div class="select-arrow">
                <svg width="12" height="8" viewBox="0 0 12 8">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Level Selection -->
          <div class="form-group" [class.disabled]="!selectedExamType">
            <label class="form-label">
              <span class="label-icon">📊</span>
              Cấp độ
            </label>
            <div class="select-wrapper">
              <select class="form-select" [(ngModel)]="selectedLevel" (ngModelChange)="onLevelChange()" 
                      [disabled]="!selectedExamType">
                <option value="">Chọn cấp độ</option>
                <option *ngFor="let level of levels$ | async; trackBy: trackByFn" [value]="level.id">
                  {{ level.name }}
                </option>
              </select>
              <div class="select-arrow">
                <svg width="12" height="8" viewBox="0 0 12 8">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Skill Selection -->
          <div class="form-group" [class.disabled]="!selectedLevel">
            <label class="form-label">
              <span class="label-icon">🎯</span>
              Kỹ năng
            </label>
            <div class="select-wrapper">
              <select class="form-select" [(ngModel)]="selectedSkillLevel" (ngModelChange)="onSkillLevelChange()"
                      [disabled]="!selectedLevel">
                <option value="">Chọn kỹ năng</option>
                <option *ngFor="let skillLevel of skillLevels$ | async; trackBy: trackByFn" [value]="skillLevel.id">
                  {{ skillLevel.skillName }}
                </option>
              </select>
              <div class="select-arrow">
                <svg width="12" height="8" viewBox="0 0 12 8">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Form Section -->
      @if(selectedSkillLevel) {
      <div class="add-section show">
        <div class="section-header">
          <h2>Thêm dạng câu hỏi mới</h2>
          <div class="section-subtitle">Nhập thông tin cho dạng câu hỏi</div>
        </div>

        <div class="add-form">
          <!-- Range Name -->
          <div class="form-group full-width">
            <label class="form-label">
              <span class="label-icon">🏷️</span>
              Tên dạng câu hỏi
            </label>
            <div class="input-wrapper">
              <input type="text" class="form-input" 
                     [(ngModel)]="rangeName" 
                     placeholder="Nhập tên dạng câu hỏi..."
                     (focus)="onFocus('range')"
                     [class.error]="rangeMessage">
              <div class="input-icon">📝</div>
            </div>
            <div class="error-message" *ngIf="rangeMessage">{{ rangeMessage }}</div>
          </div>

          <!-- Question Range -->
          <div class="question-range">
            <!-- Start Question -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">▶️</span>
                Câu bắt đầu
              </label>
              <div class="input-wrapper">
                <input type="number" class="form-input" 
                       [(ngModel)]="startQuestionNumber" 
                       placeholder="1"
                       (focus)="onFocus('start')"
                       onlyDigits [maxNumber]="50" [minNumber]="1"
                       [class.error]="startMessage || compareMessage" (wheel)="onWheel($event)">
                <div class="input-icon">🔢</div>
              </div>
              <div class="error-message" *ngIf="startMessage">{{ startMessage }}</div>
            </div>

            <!-- End Question -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">⏹️</span>
                Câu kết thúc
              </label>
              <div class="input-wrapper">
                <input type="number" class="form-input" 
                       [(ngModel)]="endQuestionNumber" 
                       placeholder="10"
                       (focus)="onFocus('end')"
                       onlyDigits [maxNumber]="50" [minNumber]="1"
                       [class.error]="endMessage || compareMessage"
                       (wheel)="onWheel($event)">
                <div class="input-icon">🔢</div>
              </div>
              <div class="error-message" *ngIf="endMessage">{{ endMessage }}</div>
            </div>
          </div>

          <div class="error-message" *ngIf="compareMessage">{{ compareMessage }}</div>

          <!-- Add Button -->
          <div class="add-button-container d-flex justify-content-center">
            <button type="button" class="add-button" (click)="onAddRange()">
              <span class="button-icon">➕</span>
              <span class="button-text">Thêm dạng câu hỏi</span>
              <div class="button-ripple"></div>
            </button>
          </div>
        </div>
      </div>
      }
      

      <!-- List Section -->
      <div class="list-section">
        <div class="section-header">
          <h2>
            Danh sách dạng câu hỏi
            <span class="count-badge" *ngIf="ranges.length > 0">{{ ranges.length }}</span>
          </h2>
          <div class="section-subtitle">Quản lý các dạng câu hỏi đã tạo</div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="ranges.length === 0">
          <div class="empty-icon">📝</div>
          <h3>Chưa có dạng câu hỏi nào</h3>
          <p>Hãy thêm dạng câu hỏi đầu tiên của bạn!</p>
        </div>

        <!-- Question Types List -->
        <div class="question-list" *ngIf="ranges.length > 0">
          <div class="question-card" *ngFor="let item of ranges; let i = index; trackBy: trackByRange" 
               [style.animation-delay]="(i * 0.1) + 's'">
            <div class="card-header">
              <div class="card-number">{{ i + 1 }}</div>
              <div class="card-title">{{ item.name }}</div>
              <button class="delete-button" (click)="onDeleteRange(item.id!)" title="Xóa dạng câu hỏi">
                <span>🗑️</span>
              </button>
            </div>
            <div class="card-content">
              <div class="question-range-display">
                <div class="range-item start">
                  <span class="range-label">Bắt đầu</span>
                  <span class="range-value">Câu {{ item.startQuestionNumber }}</span>
                </div>
                <div class="range-separator">→</div>
                <div class="range-item end">
                  <span class="range-label">Kết thúc</span>
                  <span class="range-value">Câu {{ item.endQuestionNumber }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .question-type-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 50%, #d1fae5 100%);
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      position: relative;
    }

    .question-type-container::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 20%, rgba(128, 208, 199, 0.1) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.08) 0%, transparent 40%);
      pointer-events: none;
      z-index: 0;
    }

    /* Header Section */
    .header-section {
      background: linear-gradient(135deg, #80D0C7 0%, #22c55e 100%);
      color: white;
      padding: 4rem 2rem;
      position: relative;
      overflow: hidden;
      margin-bottom: 3rem;
    }

    .header-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="a" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100%" height="100%" fill="url(%23a)"/></svg>');
      opacity: 0.5;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 2rem;
      position: relative;
      z-index: 2;
    }

    .header-icon {
      font-size: 4rem;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }

    .header-text h1 {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .header-text p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
    }

    .header-decoration {
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 100px;
      height: 4px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
      transform: translateX(-50%);
      border-radius: 2px;
    }

    /* Section Styling */
    .selection-section,
    .add-section,
    .list-section {
      max-width: 1200px;
      margin: 0 auto 3rem auto;
      padding: 0 2rem;
      position: relative;
      z-index: 1;
    }

    .section-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .section-header h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .section-subtitle {
      color: #6b7280;
      font-size: 1.1rem;
    }

    .count-badge {
      background: linear-gradient(135deg, #80D0C7, #22c55e);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    /* Selection Grid */
    .selection-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    /* Form Groups */
    .form-group {
      position: relative;
    }

    .form-group.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.8rem;
      font-size: 1rem;
    }

    .label-icon {
      font-size: 1.2rem;
    }

    /* Select Styling */
    .select-wrapper {
      position: relative;
    }

    .form-select {
      width: 100%;
      padding: 1rem 3rem 1rem 1.2rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      font-size: 1rem;
      color: #374151;
      transition: all 0.3s ease;
      appearance: none;
      cursor: pointer;
    }

    .form-select:focus {
      outline: none;
      border-color: #80D0C7;
      box-shadow: 0 0 0 4px rgba(128, 208, 199, 0.1);
      background: white;
    }

    .form-select:disabled {
      background: #f9fafb;
      cursor: not-allowed;
    }

    .select-arrow {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      pointer-events: none;
    }

    /* Input Styling */
    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 1rem 3rem 1rem 1.2rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      font-size: 1rem;
      color: #374151;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #80D0C7;
      box-shadow: 0 0 0 4px rgba(128, 208, 199, 0.1);
      background: white;
    }

    .form-input.error {
      border-color: #ef4444;
    }

    .input-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.2rem;
      opacity: 0.6;
      pointer-events: none;
    }

    /* Add Section */
    .add-section {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.5s ease;
      pointer-events: none;
    }

    .add-section.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .add-form {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2.5rem;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .question-range {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin: 2rem 0;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.9rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .error-message::before {
      content: '⚠️';
    }

    /* Add Button */
    .add-button-container {
      text-align: center;
      margin-top: 2rem;
    }

    .add-button {
      background: linear-gradient(135deg, #80D0C7, #22c55e);
      color: white;
      border: none;
      padding: 1.2rem 3rem;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      box-shadow: 0 10px 30px rgba(128, 208, 199, 0.3);
    }

    .add-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(128, 208, 199, 0.4);
    }

    .add-button:active {
      transform: translateY(-1px);
    }

    .button-icon {
      font-size: 1.3rem;
    }

    /* List Section */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.7;
    }

    .empty-state h3 {
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .empty-state p {
      color: #6b7280;
      font-size: 1.1rem;
    }

    /* Question List */
    .question-list {
      display: grid;
      gap: 1.5rem;
    }

    .question-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
      opacity: 0;
      animation: cardSlideIn 0.5s ease forwards;
    }

    @keyframes cardSlideIn {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .question-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, rgba(128, 208, 199, 0.1), rgba(34, 197, 94, 0.1));
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid rgba(128, 208, 199, 0.2);
    }

    .card-number {
      background: linear-gradient(135deg, #80D0C7, #22c55e);
      color: white;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .card-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #1f2937;
      flex: 1;
    }

    .delete-button {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .delete-button:hover {
      transform: scale(1.1);
      box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
    }

    .card-content {
      padding: 2rem;
    }

    .question-range-display {
      display: flex;
      align-items: center;
      gap: 2rem;
      justify-content: center;
    }

    .range-item {
      text-align: center;
      flex: 1;
    }

    .range-label {
      display: block;
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 500;
    }

    .range-value {
      background: linear-gradient(135deg, #80D0C7, #22c55e);
      color: white;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      font-weight: 600;
      font-size: 1rem;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(128, 208, 199, 0.3);
    }

    .range-separator {
      font-size: 1.5rem;
      color: #80D0C7;
      font-weight: bold;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .header-text h1 {
        font-size: 2rem;
      }

      .selection-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .question-range {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .add-form {
        padding: 2rem;
      }

      .question-range-display {
        flex-direction: column;
        gap: 1rem;
      }

      .range-separator {
        transform: rotate(90deg);
      }

      .card-header {
        padding: 1rem 1.5rem;
      }

      .card-content {
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .question-type-container {
        padding: 0;
      }

      .header-section {
        padding: 2rem 1rem;
      }

      .selection-section,
      .add-section,
      .list-section {
        padding: 0 1rem;
      }

      .add-form {
        padding: 1.5rem;
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

  // error message
  rangeMessage: string = ''
  startMessage: string = ''
  endMessage: string = ''
  compareMessage: string = ''

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
        map(levels => levels.sort((a, b) => a.name!.localeCompare(b.name!))) // sort theo name
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

  /** Xử lý khi thay đổi level */
  onLevelChange(): void {
    this.getSkillLevels()
    this.selectedSkillLevel = ''
  }

  /** Xử lý khi thay đổi skill */
  onSkillLevelChange(): void {
    this.resetInputFields();
    this.getRanges()
  }

  /** Lấy danh sách range the */
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

  /** Thêm dạng bài mới */
  onAddRange(): void { 
    if(!this.isValid()) {
      return;
    }
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

  /** Xóa dạng bài theo ID */
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

  /** Reset form về trạng thái ban đầu */
  private resetForm(): void {
    this.resetInputFields();
  }

  /** Reset các trường input */
  private resetInputFields(): void {
    this.rangeName = '';
    this.startQuestionNumber = 1;
    this.endQuestionNumber = 1;
    this.rangeMessage = ''
    this.startMessage = ''
    this.endMessage = ''
    this.compareMessage = ''
  }

  // Xử lý error
  isValid(): boolean {
    let isValid = true
    if(this.rangeName.trim() == '') {
      this.rangeMessage = 'Vui lòng nhập tên dạng bài'
      isValid = false
    }
    if(this.startQuestionNumber.toString() == '') {
      this.startMessage = 'Vui lòng nhập câu bắt đầu'
      isValid = false
    }
    if(this.endQuestionNumber.toString() == '') {
      this.startMessage = 'Vui lòng nhập câu kết thúc'
      isValid = false
    }
    if(this.rangeMessage == '') {
      let range = this.ranges.find(r => r.name == this.rangeName)
      if(range) {
        this.rangeMessage = 'Tên dạng bài đã tồn tại'
      }
    }

    if(this.startQuestionNumber && this.endQuestionNumber) {
      if(this.startQuestionNumber >= this.endQuestionNumber) {
        this.compareMessage = 'Câu bắt đầu phải nhỏ hơn câu kết thúc'
      } else {
        this.ranges.forEach(r => {
          if((this.startQuestionNumber >= r.startQuestionNumber && this.startQuestionNumber <= r.endQuestionNumber) || 
              this.endQuestionNumber >= r.startQuestionNumber && this.endQuestionNumber <= r.endQuestionNumber) {
                this.compareMessage = 'Khoảng câu hỏi đã tồn tại'
                isValid = false
                return;
              }
        })
      }
    }
    return isValid
  }

  onFocus(input: string) {
    if(input == 'range') {
      this.rangeMessage = ''
    } else if(input == 'start') {
      this.startMessage = ''
      this.compareMessage = ''
    } else if(input == 'end') {
      this.endMessage = ''
      this.compareMessage = ''
    }
  }

  // Track by id (dùng cho examTypes, levels, skillLevels...)
  trackByFn(index: number, item: any): any {
    return item.id ?? index; // nếu item có id thì return id, không thì fallback index
  }

  // Track by range (dùng cho ranges)
  trackByRange(index: number, item: any): any {
    return index; // chỉ cần index là đủ vì ranges thường là mảng số hoặc object nhỏ
  }

  onWheel(event: WheelEvent) {
    (event.target as HTMLElement).blur(); // bỏ focus khỏi input
    event.preventDefault(); // chặn thay đổi giá trị khi scroll
  }
}