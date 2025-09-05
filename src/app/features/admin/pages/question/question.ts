import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnlyDigitsDirective } from '../../directive/only-number';
import { MaxNumberDirective } from '../../directive/max-number';
import Swal from 'sweetalert2';
import { AdminService } from '../../services/admin.service';
import { ExamType, Level, SkillLevel, Range } from '../../models/question-bank.model';
import { map, Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { QuestionAddService } from './services/question-add.service';
import { QuestionListService } from './services/question-list.service';

@Component({
  selector: 'question',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './question.html',
  styles: [`
    /* Custom styles để bổ sung cho Bootstrap */
    
    /* FIX: Đảm bảo dropdown không bị che - Tăng z-index và position */
    .form-select {
      position: relative;
      z-index: 1050 !important;
    }
    
    /* Khi focus, tăng z-index cao hơn nữa */
    .form-select:focus {
      z-index: 1060 !important;
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    /* Đảm bảo container có overflow visible */
    .card-body {
      overflow: visible !important;
      position: relative;
    }
    
    .row {
      overflow: visible !important;
      position: relative;
    }
    
    /* Thêm class đặc biệt cho dropdown có thể bị che */
    .dropdown-with-space {
      margin-bottom: 20px;
    }
    
    /* Đảm bảo select option không bị ẩn */
    .form-select option {
      background-color: white;
      color: black;
    }

    /* FIX: Đảm bảo card không bị overflow hidden */
    .card {
      border: none;
      border-radius: 12px;
      overflow: visible !important;
    }

    .card-header {
      border-radius: 12px 12px 0 0 !important;
      border-bottom: none;
      overflow: visible !important;
    }

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

    /* FIX: Thêm margin cho các row để tránh overlap */
    .mt-3 {
      margin-top: 1.5rem !important;
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

      /* Mobile: Giảm z-index conflict */
      .form-select {
        z-index: 1040 !important;
      }
      
      .form-select:focus {
        z-index: 1050 !important;
      }
    }

    /* FIX: Đặc biệt cho browser cụ thể */
    @supports (-webkit-appearance: none) {
      .form-select {
        -webkit-appearance: none;
        background-position: right 0.75rem center;
      }
    }

    /* FIX: Đảm bảo dropdown arrow không bị ẩn */
    .form-select::after {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
  `]
})
export class QuestionComponent implements OnInit {
  // two way binding
  selectedExamType: string = '';
  selectedLevel: string = '';
  selectedSkillLevel: string = '';
  selectedRange: string = ''

  // list
  examTypes$!: Observable<ExamType[]>
  levels$!: Observable<Level[]>
  skillLevels!: SkillLevel[]
  ranges$!: Observable<Range[]>;

  constructor(
    private cd: ChangeDetectorRef, 
    public adminService: AdminService,
    private sharedService: QuestionAddService,
    private questionListService: QuestionListService
  ) { }

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
      this.adminService.getSkillLevelsByLevelId(this.selectedLevel).subscribe({
        next: (data) => {
          // FIX: Đảm bảo data clean và không có duplicate
          this.skillLevels = data.filter((skill, index, self) => 
            index === self.findIndex((s) => s.id === skill.id)
          );
          console.log('Loaded skillLevels:', this.skillLevels);
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Error loading skill levels:', error);
          this.skillLevels = [];
          this.cd.detectChanges();
        }
      });
    }
  }

  getRanges() {
    console.log('Selected Skill Level:', this.selectedSkillLevel);
    if(this.selectedSkillLevel) {
      this.ranges$ = this.adminService.getRangesBySkillLevelId(this.selectedSkillLevel);
      
      // FIX: Subscribe để debug và đảm bảo data load đúng
      this.ranges$.subscribe({
        next: (data) => {
          console.log('Loaded ranges:', data);
        },
        error: (error) => {
          console.error('Error loading ranges:', error);
        }
      });
      
      this.cd.detectChanges();
    }
  }

  // Xử lý khi thay đổi exam type
  onExamTypeChange(): void {
    this.getLevels();
    // FIX: Reset tất cả các selection phía sau
    this.selectedLevel = '';
    this.selectedSkillLevel = '';
    this.selectedRange = '';
    this.skillLevels = [];
    
    // FIX: Force change detection
    this.cd.detectChanges();
  }

  /**
   * Xử lý khi thay đổi level
   */
  onLevelChange(): void {
    this.getSkillLevels();
    // FIX: Reset tất cả các selection phía sau
    this.selectedSkillLevel = '';
    this.selectedRange = '';
    
    // FIX: Force change detection
    this.cd.detectChanges();
  }

  /**
   * Xử lý khi thay đổi skill level
   */
  onSkillLevelChange(): void {
    this.getRanges();
    let skillLevel = this.skillLevels.find(s => s.id == this.selectedSkillLevel);
    if(skillLevel) {
      this.sharedService.setValues(this.selectedExamType, skillLevel!.skillId!);
    }
    
    // FIX: Reset range selection
    this.selectedRange = '';
    
    // FIX: Force change detection
    this.cd.detectChanges();
  }

  onRangeChange(): void {
    this.questionListService.setValues(this.selectedRange);
    
    // FIX: Force change detection
    this.cd.detectChanges();
  }
}