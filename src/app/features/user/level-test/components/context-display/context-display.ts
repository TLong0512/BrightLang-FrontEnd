import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamContext, Question } from '../../../../../models/exam.model';
import { AudioPlayerComponent } from '../audio-player/audio-player';

// Add this interface for the question data
export interface QuestionWithContext {
  id: number;
  type: 'single' | 'multiple';
  question: string;
  options: string[];
  correctAnswers: number[];
  userAnswers?: number[];
  contextId: number;
  contextType: 'reading' | 'listening' | 'mixed';
  contextTitle?: string;
  contextContent?: string;
  contextAudioUrl?: string;
  contextImageUrl?: string;
}

@Component({
  selector: 'app-context-display',
  standalone: true,
  imports: [CommonModule, AudioPlayerComponent],
  template: `
    <!-- Context Section (only show when showContext is true) -->
    <div *ngIf="showContext && context" class="context-container mb-4">
      <!-- Context Header -->
      <div class="context-header card border-0 shadow-sm mb-3">
        <div class="card-header context-type-header" [class]="getContextHeaderClass()">
          <div class="d-flex align-items-center justify-content-between">
            <h5 class="mb-0 text-white">
              <i class="fas" [class]="getContextIcon()" class="me-2"></i>
              {{ context.title || getDefaultContextTitle() }}
            </h5>
            <span class="badge bg-light text-dark">
              {{ getContextTypeLabel() }}
            </span>
          </div>
        </div>

        <div *ngIf="contextProgress" class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">Tiến độ context</small>
            <small class="text-muted">{{ contextProgress.current }}/{{ contextProgress.total }}</small>
          </div>
          <div class="progress mt-1" style="height: 4px;">
            <div 
              class="progress-bar" 
              [class]="getProgressBarClass()"
              [style.width.%]="getProgressPercentage()">
            </div>
          </div>
        </div>
      </div>

      <!-- Context Content -->
      <div class="context-content">
        <!-- Audio Player -->
        <div *ngIf="context.type === 'listening' && context.audioUrl" class="audio-section mb-4">
          <app-audio-player [audioUrl]="context.audioUrl" />
        </div>

        <!-- Image Display -->
        <div *ngIf="context.imageUrl" class="image-section mb-4 text-center">
          <div class="context-image-wrapper">
            <img 
              [src]="context.imageUrl" 
              class="img-fluid rounded context-image" 
              [alt]="context.title || 'Context Image'"
              (error)="onImageError($event)"
              (click)="toggleImageModal()">
            <button 
              class="btn btn-sm btn-outline-light image-expand-btn"
              (click)="toggleImageModal()"
              title="Phóng to ảnh">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>

        <!-- Reading Content -->
        <div *ngIf="(context.type === 'reading' || context.type === 'mixed') && context.content" class="reading-section">
          <div class="card border-0 shadow-sm reading-card">
            <div class="card-body p-4">
              <div class="reading-content" [innerHTML]="getFormattedContent()"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="context-instructions alert alert-light border-0 mt-3">
        <div class="d-flex align-items-center">
          <i class="fas fa-info-circle text-info me-2"></i>
          <small class="text-muted mb-0">{{ getContextInstructions() }}</small>
        </div>
      </div>
    </div>

    <!-- Question Section -->
    <div *ngIf="question" class="question-container">
      <div class="card border-0 shadow-sm question-card">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="fas fa-question-circle me-2"></i>
            Câu {{ questionNumber }}
          </h5>
        </div>
        <div class="card-body p-4">
          <div class="question-text mb-4">
            <h6 class="question-title">{{ question.question }}</h6>
          </div>

          <!-- Answer Options -->
          <div class="answer-options">
            <div *ngFor="let option of question.options; let i = index" class="form-check mb-3">
              <input
                class="form-check-input"
                [type]="question.type === 'single' ? 'radio' : 'checkbox'"
                [name]="'question-' + question.id"
                [id]="'q' + question.id + '-option-' + i"
                [checked]="isSelected(i)"
                (change)="onOptionChange(i, $event)">
              <label class="form-check-label" [for]="'q' + question.id + '-option-' + i">
                <span class="option-letter me-2">{{ getOptionLetter(i) }}.</span>
                {{ option }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div *ngIf="showImageModal()" class="modal show d-block image-modal" tabindex="-1" (click)="closeImageModal()">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content bg-transparent border-0" (click)="$event.stopPropagation()">
          <div class="modal-header border-0 pb-1">
            <h5 class="modal-title text-white">{{ context?.title }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeImageModal()"></button>
          </div>
          <div class="modal-body text-center p-2">
            <img [src]="context?.imageUrl" class="img-fluid rounded" style="max-height: 80vh;" [alt]="context?.title || 'Context Image'">
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="showImageModal()" class="modal-backdrop show"></div>
  `,
  styles: [`
    /* Animation */
    .context-container, .question-container { 
      animation: fadeInUp 0.5s ease-out; 
    }
    
    @keyframes fadeInUp { 
      from { opacity: 0; transform: translateY(20px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    
    /* Context Headers */
    .context-type-header.listening { 
      background: linear-gradient(45deg, #FF6B6B, #FF8E53) !important; 
    }
    .context-type-header.reading { 
      background: linear-gradient(45deg, #4ECDC4, #44A08D) !important; 
    }
    .context-type-header.mixed { 
      background: linear-gradient(45deg, #A8E6CF, #7FCDCD) !important; 
    }
    
    /* Image Wrapper */
    .context-image-wrapper { 
      position: relative; 
      display: inline-block; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 8px 25px rgba(0,0,0,0.15); 
      transition: transform 0.3s ease; 
    }
    .context-image-wrapper:hover { 
      transform: scale(1.02); 
    }
    
    .context-image { 
      max-height: 400px; 
      width: auto; 
      cursor: pointer; 
      transition: filter 0.3s ease; 
    }
    .context-image:hover { 
      filter: brightness(1.1); 
    }
    
    .image-expand-btn { 
      position: absolute; 
      top: 10px; 
      right: 10px; 
      backdrop-filter: blur(10px); 
      background: rgba(0,0,0,0.3) !important; 
      border: 1px solid rgba(255,255,255,0.2) !important; 
      transition: all 0.3s ease; 
    }
    .image-expand-btn:hover { 
      background: rgba(0,0,0,0.5) !important; 
      transform: scale(1.1); 
    }
    
    /* Reading Card */
    .reading-card { 
      border-radius: 15px; 
      background: rgba(255, 255, 255, 0.98); 
    }
    
    .reading-content { 
      font-size: 16px; 
      line-height: 1.7; 
      color: #333; 
      white-space: pre-line; 
    }
    
    .reading-content h1, .reading-content h2, .reading-content h3 { 
      color: #2c3e50; 
      margin-bottom: 1rem; 
    }
    
    .reading-content p { 
      margin-bottom: 1rem; 
      text-align: justify; 
    }
    
    .reading-content ul, .reading-content ol { 
      margin-bottom: 1rem; 
      padding-left: 2rem; 
    }
    
    .reading-content li { 
      margin-bottom: 0.5rem; 
    }
    
    /* Audio Section */
    .audio-section { 
      background: rgba(255, 255, 255, 0.95); 
      border-radius: 15px; 
      padding: 1rem; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
    }
    
    /* Instructions */
    .context-instructions { 
      border-radius: 10px; 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
    }
    
    /* Progress Bars */
    .progress-bar.listening { 
      background: linear-gradient(45deg, #FF6B6B, #FF8E53); 
    }
    .progress-bar.reading { 
      background: linear-gradient(45deg, #4ECDC4, #44A08D); 
    }
    .progress-bar.mixed { 
      background: linear-gradient(45deg, #A8E6CF, #7FCDCD); 
    }
    
    /* Question Card */
    .question-card {
      border-radius: 15px;
    }
    
    .question-title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.5;
    }
    
    .answer-options {
      max-width: 100%;
    }
    
    .form-check {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 12px 15px;
      transition: all 0.3s ease;
      background: #fafafa;
    }
    
    .form-check:hover {
      background: #f0f8ff;
      border-color: #007bff;
    }
    
    .form-check-input:checked ~ .form-check-label {
      color: #007bff;
      font-weight: 500;
    }
    
    .option-letter {
      font-weight: bold;
      color: #6c757d;
      min-width: 25px;
      display: inline-block;
    }
    
    .form-check-label {
      cursor: pointer;
      font-size: 16px;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
    }
    
    /* Image Modal */
    .image-modal { 
      background: rgba(0,0,0,0.8); 
    }
    .image-modal .modal-content { 
      box-shadow: none; 
    }
    .image-modal .modal-header { 
      background: rgba(0,0,0,0.3); 
      border-radius: 0.5rem 0.5rem 0 0; 
    }
  `]
})
export class ContextDisplayComponent {
  @Input() question: QuestionWithContext | null = null;
  @Input() context: ExamContext | null = null;
  @Input() questionNumber: number = 1;
  @Input() showContext: boolean = false;
  @Input() contextProgress: { current: number; total: number } | null = null;

  @Output() answerSelected = new EventEmitter<{ questionId: number; selectedAnswers: number[] }>();

  private selectedAnswers: number[] = [];
  private _showImageModal = false;

  ngOnInit() {
    // Initialize selected answers from the question's userAnswers
    if (this.question?.userAnswers) {
      this.selectedAnswers = [...this.question.userAnswers];
    }
  }

  ngOnChanges() {
    // Update selected answers when question changes
    if (this.question?.userAnswers) {
      this.selectedAnswers = [...this.question.userAnswers];
    } else {
      this.selectedAnswers = [];
    }
  }

  // Image modal methods
  showImageModal(): boolean { 
    return this._showImageModal; 
  }
  
  toggleImageModal(): void { 
    this._showImageModal = !this._showImageModal; 
  }
  
  closeImageModal(): void { 
    this._showImageModal = false; 
  }

  // Option selection methods
  onOptionChange(optionIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!this.question) return;

    if (this.question.type === 'single') {
      // Radio button: only one answer allowed
      this.selectedAnswers = input.checked ? [optionIndex] : [];
    } else {
      // Checkbox: multiple answers allowed
      if (input.checked) {
        if (!this.selectedAnswers.includes(optionIndex)) {
          this.selectedAnswers.push(optionIndex);
        }
      } else {
        this.selectedAnswers = this.selectedAnswers.filter(x => x !== optionIndex);
      }
    }

    // Emit the selected answers
    this.answerSelected.emit({
      questionId: this.question.id,
      selectedAnswers: [...this.selectedAnswers]
    });
  }

  isSelected(optionIndex: number): boolean {
    return this.selectedAnswers.includes(optionIndex);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  }

  // Context-related methods
  getContextHeaderClass(): string { 
    const type = this.context?.type || 'reading'; 
    return `context-type-header ${type}`; 
  }
  
  getContextIcon(): string { 
    switch (this.context?.type) { 
      case 'listening': return 'fa-headphones'; 
      case 'reading': return 'fa-book-open'; 
      case 'mixed': return 'fa-layer-group'; 
      default: return 'fa-file-text'; 
    } 
  }
  
  getContextTypeLabel(): string { 
    switch (this.context?.type) { 
      case 'listening': return 'NGHE'; 
      case 'reading': return 'ĐỌC'; 
      case 'mixed': return 'TỔNG HỢP'; 
      default: return 'CONTEXT'; 
    } 
  }
  
  getDefaultContextTitle(): string { 
    switch (this.context?.type) { 
      case 'listening': return 'Bài Nghe'; 
      case 'reading': return 'Bài Đọc'; 
      case 'mixed': return 'Bài Tổng Hợp'; 
      default: return 'Context'; 
    } 
  }
  
  getContextInstructions(): string { 
    switch (this.context?.type) { 
      case 'listening': return 'Nghe audio và trả lời các câu hỏi bên dưới. Bạn có thể nghe lại nhiều lần.'; 
      case 'reading': return 'Đọc kỹ đoạn văn trên và trả lời các câu hỏi bên dưới.'; 
      case 'mixed': return 'Xem kỹ nội dung (văn bản/hình ảnh) và trả lời các câu hỏi bên dưới.'; 
      default: return 'Xem kỹ nội dung và trả lời các câu hỏi bên dưới.'; 
    } 
  }

  // Progress methods
  getProgressPercentage(): number { 
    if (!this.contextProgress) return 0;
    return this.contextProgress.total > 0 ? 
      (this.contextProgress.current / this.contextProgress.total) * 100 : 0; 
  }
  
  getProgressBarClass(): string { 
    const type = this.context?.type || 'reading'; 
    return `progress-bar ${type}`; 
  }

  // Content formatting
  getFormattedContent(): string {
    const content = this.context?.content || '';
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '<li>')
      .replace(/<li>/g, '</p><ul><li>')
      .replace(/(<li>.*?)(?=<p>|$)/g, '$1</li></ul><p>')
      .replace(/<p><\/p>/g, '')
      .replace(/(<ul><li>.*?<\/li>)<\/ul><p>/g, '$1</ul>')
      .replace(/<p><ul>/g, '<ul>')
      .replace(/<\/ul><p>/g, '</ul>');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.error('Failed to load context image:', img.src);
  }
}