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
import { RangeService } from './question.service';

@Component({
  selector: 'question',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './question.html',
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
export class QuestionComponent implements OnInit {
  // two way binding
  selectedExamType: string = '';
  selectedLevel: string = '';
  selectedSkillLevel: string = '';
  selectedRange: string = ''


  // list
  examTypes$!: Observable<ExamType[]>
  levels$!: Observable<Level[]>
  skillLevels$!: Observable<SkillLevel[]>
  ranges$!: Observable<Range[]>


  constructor(private cd: ChangeDetectorRef, public adminService: AdminService,
    private rangeService: RangeService
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
      this.skillLevels$ = this.adminService.getSkillLevelsByLevelId(this.selectedLevel)
    }
  }

  getRanges() {
    console.log(this.selectedSkillLevel)
    if(this.selectedSkillLevel) {
      this.ranges$ = this.adminService.getRangesBySkillLevelId(this.selectedSkillLevel)
      console.log(this.ranges$)
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
   * Xử lý khi thay đổi skill level
   */
  onSkillLevelChange(): void {
    this.getRanges()
    this.selectedRange = ''
  }

  onRangeChange(): void {
    this.rangeService.setRangeId(this.selectedRange)
  }
}