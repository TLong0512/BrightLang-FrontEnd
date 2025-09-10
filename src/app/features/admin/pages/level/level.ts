
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { ExamType, Level } from "../../models/question-bank.model";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ExamTypeService } from "../../services/exam-type-api.service";
import Swal from "sweetalert2";
import { LevelService } from "../../services/level-api.service";

@Component({
  selector: 'level',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="level-management-wrapper">
      <!-- Header Section -->
      <div class="header-section">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="page-title">
                <i class="fas fa-layer-group me-3"></i>
                Quản lý cấp độ
              </h1>
              <p class="page-subtitle">Quản lý cấp độ theo từng dạng bài thi</p>
            </div>
            <div class="col-md-4 text-md-end">
              <div class="stats-card">
                <div class="stats-number">{{ levels.length }}</div>
                <div class="stats-label">Tổng cấp độ</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container">
        <!-- Exam Type Selection Section -->
        <div class="selection-section">
          <div class="selection-card">
            <div class="selection-header">
              <i class="fas fa-filter me-2"></i>
              <span>Chọn dạng bài thi</span>
            </div>
            <div class="selection-body">
              <select 
                class="form-select-custom" 
                [(ngModel)]="currentExamTypeId" 
                (change)="onChange()">
                <option value="">-- Chọn dạng bài thi --</option>
                @for(examType of examTypes; track examType) {
                  <option [value]="examType.id">{{ examType.name }}</option>
                }
              </select>
            </div>
          </div>

          @if(currentExamTypeId) {
            <button 
              class="btn-add-level"
              (click)="openAddModal()">
              <i class="fas fa-plus me-2"></i>
              Thêm cấp độ mới
            </button>
          }
        </div>

        <!-- Levels Content -->
        @if(!currentExamTypeId) {
          <div class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-hand-pointer"></i>
            </div>
            <h3 class="empty-title">Chọn dạng bài thi</h3>
            <p class="empty-description">Vui lòng chọn dạng bài thi để xem và quản lý cấp độ</p>
          </div>
        } @else if(levels.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <h3 class="empty-title">Chưa có cấp độ nào</h3>
            <p class="empty-description">Hãy tạo cấp độ đầu tiên cho dạng bài thi này</p>
            <button 
              class="btn-primary-custom"
              (click)="openAddModal()">
              <i class="fas fa-plus me-2"></i>
              Tạo cấp độ đầu tiên
            </button>
          </div>
        } @else {
          <div class="levels-grid">
            @for(level of levels; track level; let i = $index) {
              <div class="level-card" [style.animation-delay.s]="i * 0.1">
                <div class="card-header">
                  <div class="level-number">
                    <span>{{ i + 1 }}</span>
                  </div>
                  <div class="card-actions">
                    <button 
                      type="button" 
                      class="action-btn edit-btn" 
                      title="Chỉnh sửa"
                      (click)="openEditModal(level)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      type="button" 
                      class="action-btn delete-btn" 
                      title="Xóa"
                      (click)="deleteLevel(level.id!)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div class="card-body">
                  <div class="level-name">
                    <i class="fas fa-tag me-2"></i>
                    {{ level.name }}
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Modal -->
      @if(showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>
                <i class="fas fa-layer-group me-2"></i>
                {{ isEditMode ? 'Sửa cấp độ' : 'Thêm cấp độ mới' }}
              </h3>
              <button class="close-btn" (click)="closeModal()">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <form>
                <div class="form-group">
                  <label for="name" class="form-label">
                    <i class="fas fa-tag me-2"></i>
                    Tên cấp độ
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    class="form-control-custom" 
                    [(ngModel)]="currentLevel.name" 
                    name="name"
                    placeholder="Nhập tên cấp độ (VD: Cơ bản, Nâng cao...)" 
                    (focus)="onFocus()">
                  @if(errorMessage) {
                    <div class="error-message">
                      <i class="fas fa-exclamation-circle me-2"></i>
                      {{ errorMessage }}
                    </div>
                  }
                </div>
              </form>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary-custom" (click)="closeModal()">
                <i class="fas fa-times me-2"></i>
                Hủy
              </button>
              <button class="btn-primary-custom" (click)="saveLevel()">
                <i class="fas fa-{{ isEditMode ? 'save' : 'plus' }} me-2"></i>
                {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .level-management-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #f0fdfc 0%, #e6fffa 50%, #d1faf7 100%);
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    /* Header Section */
    .header-section {
      background: linear-gradient(135deg, #80D0C7 0%, #5fb3a9 50%, #4a9c94 100%);
      padding: 4rem 0 3rem;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }

    .header-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(255,255,255,0.1)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><circle cx="10" cy="10" r="1" fill="url(%23a)"/><circle cx="30" cy="5" r="1.5" fill="url(%23a)"/><circle cx="50" cy="15" r="1" fill="url(%23a)"/><circle cx="70" cy="8" r="1.2" fill="url(%23a)"/><circle cx="90" cy="12" r="0.8" fill="url(%23a)"/></svg>') repeat;
      opacity: 0.6;
      animation: float 20s infinite linear;
    }

    @keyframes float {
      0% { transform: translateX(0); }
      100% { transform: translateX(-100px); }
    }

    .page-title {
      color: white;
      font-size: 3rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: relative;
      z-index: 1;
    }

    .page-subtitle {
      color: rgba(255,255,255,0.9);
      font-size: 1.2rem;
      margin: 0.5rem 0 0;
      font-weight: 300;
      position: relative;
      z-index: 1;
    }

    .stats-card {
      background: rgba(255,255,255,0.95);
      border-radius: 20px;
      padding: 2rem;
      text-align: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      position: relative;
      z-index: 1;
      transform: translateY(0);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stats-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .stats-number {
      font-size: 3.5rem;
      font-weight: 800;
      color: #80D0C7;
      margin: 0;
      line-height: 1;
      text-shadow: 0 2px 4px rgba(128, 208, 199, 0.3);
    }

    .stats-label {
      color: #4a5568;
      font-size: 1rem;
      font-weight: 500;
      margin-top: 0.5rem;
      letter-spacing: 0.5px;
    }

    /* Selection Section */
    .selection-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 3rem;
      gap: 2rem;
    }

    .selection-card {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      flex: 1;
      max-width: 400px;
    }

    .selection-header {
      display: flex;
      align-items: center;
      color: #2d3748;
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .selection-header i {
      color: #80D0C7;
    }

    .form-select-custom {
      width: 100%;
      padding: 1rem 1.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 15px;
      font-size: 1rem;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 1rem center;
      background-repeat: no-repeat;
      background-size: 1rem;
      padding-right: 3rem;
    }

    .form-select-custom:focus {
      outline: none;
      border-color: #80D0C7;
      box-shadow: 0 0 0 3px rgba(128, 208, 199, 0.1);
    }

    .btn-add-level {
      background: linear-gradient(135deg, #80D0C7 0%, #5fb3a9 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 25px rgba(128, 208, 199, 0.3);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
    }

    .btn-add-level::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.6s;
    }

    .btn-add-level:hover::before {
      left: 100%;
    }

    .btn-add-level:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(128, 208, 199, 0.4);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: white;
      border-radius: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      margin: 2rem 0;
    }

    .empty-icon {
      font-size: 8rem;
      color: #80D0C7;
      margin-bottom: 2rem;
      opacity: 0.7;
    }

    .empty-title {
      color: #2d3748;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .empty-description {
      color: #718096;
      font-size: 1.2rem;
      margin-bottom: 2.5rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Levels Grid */
    .levels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .level-card {
      background: white;
      border-radius: 25px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      position: relative;
      animation: slideUp 0.6s ease-out forwards;
      opacity: 0;
      transform: translateY(30px);
    }

    @keyframes slideUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .level-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #80D0C7, #5fb3a9, #4a9c94);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .level-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      border-color: #80D0C7;
    }

    .level-card:hover::before {
      opacity: 1;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem 1rem;
    }

    .level-number {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #80D0C7 0%, #5fb3a9 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.3rem;
      font-weight: 700;
      box-shadow: 0 6px 15px rgba(128, 208, 199, 0.3);
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .edit-btn {
      background: linear-gradient(135deg, #4fd1c7 0%, #38b2ac 100%);
      color: white;
    }

    .edit-btn:hover {
      background: linear-gradient(135deg, #38b2ac 0%, #319795 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(56, 178, 172, 0.3);
    }

    .delete-btn {
      background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
      color: white;
    }

    .delete-btn:hover {
      background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(245, 101, 101, 0.3);
    }

    .card-body {
      padding: 0 2rem 2rem;
    }

    .level-name {
      font-size: 1.3rem;
      color: #2d3748;
      font-weight: 600;
      display: flex;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f0fdfc 0%, #e6fffa 100%);
      border-radius: 15px;
    }

    .level-name i {
      color: #80D0C7;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease-in-out;
      backdrop-filter: blur(8px);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 25px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem 2rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 25px 25px 0 0;
    }

    .modal-header h3 {
      margin: 0;
      color: #2d3748;
      font-weight: 700;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
    }

    .modal-header h3 i {
      color: #80D0C7;
    }

    .close-btn {
      background: #f1f5f9;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 1.2rem;
    }

    .close-btn:hover {
      background: #e2e8f0;
      color: #475569;
      transform: scale(1.05);
    }

    .modal-body {
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.75rem;
      color: #374151;
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
    }

    .form-label i {
      color: #80D0C7;
    }

    .form-control-custom {
      width: 100%;
      padding: 1rem 1.5rem;
      border: 2px solid #e5e7eb;
      border-radius: 15px;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-sizing: border-box;
      background: #fafafa;
    }

    .form-control-custom:focus {
      outline: none;
      border-color: #80D0C7;
      box-shadow: 0 0 0 3px rgba(128, 208, 199, 0.1);
      background: white;
    }

    .error-message {
      margin-top: 0.75rem;
      color: #ef4444;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
    }

    .modal-footer {
      padding: 1.5rem 2rem 2rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      background: #f8fafc;
      border-radius: 0 0 25px 25px;
    }

    .btn-primary-custom {
      background: linear-gradient(135deg, #80D0C7 0%, #5fb3a9 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
    }

    .btn-primary-custom:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(128, 208, 199, 0.3);
    }

    .btn-secondary-custom {
      background: #f1f5f9;
      color: #64748b;
      border: 2px solid #e2e8f0;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
    }

    .btn-secondary-custom:hover {
      background: #e2e8f0;
      color: #475569;
      transform: translateY(-2px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
      }
      
      .selection-section {
        flex-direction: column;
        align-items: stretch;
      }
      
      .selection-card {
        max-width: none;
      }
      
      .levels-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      
      .level-card {
        margin: 0 1rem;
      }
      
      .card-header {
        padding: 1rem 1.5rem 0.5rem;
      }
      
      .card-body {
        padding: 0 1.5rem 1.5rem;
      }
      
      .level-name {
        font-size: 1.2rem;
        padding: 1rem;
      }
      
      .modal-content {
        margin: 1rem;
        width: calc(100% - 2rem);
        border-radius: 20px;
      }
      
      .modal-header, .modal-body, .modal-footer {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .header-section {
        padding: 2rem 0;
      }
      
      .page-title {
        font-size: 1.8rem;
      }
      
      .stats-card {
        margin-top: 1.5rem;
        padding: 1.5rem;
      }
      
      .stats-number {
        font-size: 2.5rem;
      }
      
      .btn-add-level {
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
      }
      
      .selection-card {
        padding: 1.5rem;
      }
      
      .level-card {
        margin: 0 0.5rem;
        border-radius: 20px;
      }
      
      .empty-state {
        padding: 3rem 1rem;
      }
      
      .empty-icon {
        font-size: 5rem;
      }
      
      .empty-title {
        font-size: 2rem;
      }
      
      .modal-content {
        border-radius: 15px;
      }
      
      .modal-header {
        border-radius: 15px 15px 0 0;
      }
      
      .modal-footer {
        border-radius: 0 0 15px 15px;
        flex-direction: column;
      }
      
      .btn-primary-custom, 
      .btn-secondary-custom {
        width: 100%;
        justify-content: center;
      }
    }
  `]
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
                this.levels.sort((a, b) => a.name!.localeCompare(b.name!))
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