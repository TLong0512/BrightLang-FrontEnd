import { Component, OnInit, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamStateService, ExamResult } from '../../services/exam-state.service';
import { TestService, SubmitTestRequestDto } from '../../services/exam.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-result.html',
  styleUrls: ['./test-result.css']
})
export class TestResultComponent implements OnInit {
  createRoadmap = output<{ level: string; targetLevel: string }>();
  retakeExam = output<void>();
  viewResults = output<void>();
  shareResult = output<void>();
  saveResult = output<ExamResult>();
  
  examStateService = inject(ExamStateService);
  testService = inject(TestService);
  
  examResult = signal<ExamResult | null>(null);
  isProcessing = signal<boolean>(false);
  showRoadmapConfirm = signal<boolean>(false);
  submitError = signal<string | null>(null);

  router = inject(Router);

  ngOnInit(): void {
    this.submitExamAndCalculateResult();
  }

  private async submitExamAndCalculateResult(): Promise<void> {
    const examData = this.examStateService.examData();
    const userAnswers = this.examStateService.userAnswers();
    
    if (!examData || !examData.testId) {
      this.calculateLocalResult();
      return;
    }

    this.isProcessing.set(true);
    this.submitError.set(null);

    try {
      // Prepare submission data for backend
      const submitRequest = this.prepareSubmissionData();
      
      // Submit to backend
      this.testService.submitTest(examData.testId, submitRequest).subscribe({
        next: (response) => {
          console.log('Test submitted successfully:', response);
          
          // Calculate local result for immediate display
          const localResult = this.examStateService.calculateResult();
          if (localResult) {
            this.examResult.set(localResult);
            this.examStateService.setExamResult(localResult);
          }
          this.isProcessing.set(false);
        },
        error: (error) => {
          console.error('Failed to submit exam:', error);
          this.submitError.set('Không thể gửi bài lên server. Hiển thị kết quả tạm thời.');
          
          // Fallback to local calculation
          this.calculateLocalResult();
          this.isProcessing.set(false);
        }
      });
    } catch (error) {
      console.error('Error in submission process:', error);
      this.calculateLocalResult();
      this.isProcessing.set(false);
    }
  }

  private prepareSubmissionData(): SubmitTestRequestDto {
    const userAnswers = this.examStateService.userAnswers();
    const flatQuestions = this.examStateService.flatQuestions();
    
    const listAnswerIds: string[] = [];
    const listTrueAnswerIds: string[] = [];

    // Collect all user-selected answer IDs
    flatQuestions.forEach(question => {
      const questionUserAnswers = userAnswers.get(question.id) || [];
      
      // Convert answer indices to answer IDs
      questionUserAnswers.forEach(answerIndex => {
        if (typeof answerIndex === 'number' && question.answers && question.answers[answerIndex]) {
          listAnswerIds.push(question.answers[answerIndex].id);
        } else if (typeof answerIndex === 'string') {
          // If answerIndex is already an ID
          listAnswerIds.push(answerIndex);
        }
      });

      // Collect correct answer IDs
      if (question.answers) {
        question.answers.forEach(answer => {
          if (answer.isCorrect) {
            listTrueAnswerIds.push(answer.id);
          }
        });
      }
    });

    return {
      listAnswerIds,
      listTrueAnswerIds
    };
  }

  private calculateLocalResult(): void {
    const localResult = this.examStateService.calculateResult();
    if (localResult) {
      this.examResult.set(localResult);
      this.examStateService.setExamResult(localResult);
    }
    this.isProcessing.set(false);
  }

  // Result display methods
  getResultIcon(): string {
    const percentage = this.examResult()?.percentage || 0;
    if (percentage >= 90) return 'fa-trophy fa-4x';
    if (percentage >= 80) return 'fa-medal fa-4x';
    if (percentage >= 70) return 'fa-thumbs-up fa-4x';
    if (percentage >= 60) return 'fa-smile fa-4x';
    return 'fa-meh fa-4x';
  }

  getResultColor(): string {
    const percentage = this.examResult()?.percentage || 0;
    if (percentage >= 90) return '#ffd700';
    if (percentage >= 80) return '#ff6b6b';
    if (percentage >= 70) return '#4ecdc4';
    if (percentage >= 60) return '#45b7d1';
    return '#96ceb4';
  }

  getResultTitle(): string {
    const percentage = this.examResult()?.percentage || 0;
    if (percentage >= 90) return 'XUẤT SẮC!';
    if (percentage >= 80) return 'RẤT TỐT!';
    if (percentage >= 70) return 'TỐT!';
    if (percentage >= 60) return 'KHÁ!';
    return 'CẦN CỐ GẮNG THÊM!';
  }

  getResultSubtitle(): string {
    const percentage = this.examResult()?.percentage || 0;
    if (percentage >= 90) return 'Bạn đã đạt kết quả tuyệt vời!';
    if (percentage >= 80) return 'Kết quả rất ấn tượng!';
    if (percentage >= 70) return 'Bạn đã làm tốt!';
    if (percentage >= 60) return 'Kết quả khá ổn!';
    return 'Hãy luyện tập thêm nhé!';
  }

  getScoreGradient(): string {
    const percentage = this.examResult()?.percentage || 0;
    if (percentage >= 90) return 'linear-gradient(45deg, #ffd700, #ffed4e)';
    if (percentage >= 80) return 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
    if (percentage >= 70) return 'linear-gradient(45deg, #4ecdc4, #44a08d)';
    if (percentage >= 60) return 'linear-gradient(45deg, #45b7d1, #3a9fd8)';
    return 'linear-gradient(45deg, #96ceb4, #85c5a6)';
  }

  // Level assessment methods
  getAssessedLevel(): string {
    const percentage = this.examResult()?.percentage || 0;
    if (percentage >= 85) return 'TOPIK 6';
    if (percentage >= 75) return 'TOPIK 5';
    if (percentage >= 65) return 'TOPIK 4';
    if (percentage >= 55) return 'TOPIK 3';
    if (percentage >= 45) return 'TOPIK 2';
    return 'TOPIK 1';
  }

  getLevelBadgeClass(): string {
    const level = this.getAssessedLevel();
    switch(level) {
      case 'TOPIK 6': return 'bg-warning text-dark';
      case 'TOPIK 5': return 'bg-success';
      case 'TOPIK 4': return 'bg-info';
      case 'TOPIK 3': return 'bg-primary';
      case 'TOPIK 2': return 'bg-secondary';
      default: return 'bg-dark';
    }
  }

  getRecommendationClass(): string {
    const percentage = this.examResult()?.percentage || 0;
    if (percentage >= 80) return 'alert-success';
    if (percentage >= 70) return 'alert-info';
    if (percentage >= 60) return 'alert-warning';
    return 'alert-danger';
  }

  // Section scoring methods using ExamResult data
  getListeningScore(): number {
    return this.examResult()?.listeningScore || 0;
  }

  getReadingScore(): number {
    return this.examResult()?.readingScore || 0;
  }

  getListeningTotal(): number {
    const questions = this.examStateService.flatQuestions();
    return questions.filter(q => q.contextType === 'listening').length;
  }

  getReadingTotal(): number {
    const questions = this.examStateService.flatQuestions();
    return questions.filter(q => q.contextType === 'reading').length;
  }

  getListeningPercentage(): number {
    return this.examResult()?.listeningScore || 0;
  }

  getReadingPercentage(): number {
    return this.examResult()?.readingScore || 0;
  }

  // Roadmap methods
  canImprove(): boolean {
    return this.getAssessedLevel() !== 'TOPIK 6';
  }

  getTargetLevel(): string {
    const currentLevel = this.getAssessedLevel();
    const levels = ['TOPIK 1', 'TOPIK 2', 'TOPIK 3', 'TOPIK 4', 'TOPIK 5', 'TOPIK 6'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'TOPIK 6';
  }

  // Utility methods
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  // Action handlers
  onCreateRoadmap(): void {
    const roadmapData = {
      level: this.getAssessedLevel(),
      targetLevel: this.getTargetLevel()
    };
    this.createRoadmap.emit(roadmapData);
    this.showRoadmapConfirm.set(true);
  }

  declineRoadmap(): void {
    this.showRoadmapConfirm.set(true);
  }

  onViewDetailedResults(): void {
    
    const testId = this.examStateService.examData()?.testId;
    console.log('id: ',testId );
    if (testId) {
      this.router.navigate(['/home-user/test-review', testId]);
    } else {
      console.error('No test ID found');
    }
    this.viewResults.emit();
  }

  onRetakeExam(): void {
    this.router.navigate(['/home-user/level-test']);
  }

  onSaveResult(): void {
    const result = this.examResult();
    if (result) {
      this.saveResult.emit(result);
    }
  }

  onShareResult(): void {
    this.shareResult.emit();
  }
}