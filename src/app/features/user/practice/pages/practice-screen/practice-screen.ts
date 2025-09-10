import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PracticeResult, Question, UserAnswer } from '../../../../../models/practice.model';
import { TopikDataService } from '../../services/topik-data.service';
import { CommonModule } from '@angular/common';
import { PracticeService } from '../../services/practice.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './practice-screen.html',
  styleUrls: ['./practice-screen.css']
})
export class PracticeComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dataPracticeService = inject(TopikDataService);
  private practiceResultService = inject(PracticeService);
  private sanitizer = inject(DomSanitizer);
  private cd = inject(ChangeDetectorRef)
  questions: Question[] = [];
  currentQuestionIndex = 0;
  userAnswers: UserAnswer[] = [];
  selectedAnswerId: string | null = null;

  showSubmitModal = false;
  showExitModal = false;

  isLoading = signal(true);
  hasError = signal(false);
  errorMessage = '';
  rangeId: string | null = null;

  async ngOnInit() {
    this.rangeId = this.route.snapshot.paramMap.get('rangeId') || '';
    if (this.rangeId) {
      await this.loadQuestions();
      this.getAudioHtml(this.questions[this.currentQuestionIndex]!.contextInformation!.content)

    } else {
      this.hasError.set(true);
      this.errorMessage = 'Range ID không hợp lệ';
      this.isLoading.set(false);
    }
  }

  async loadQuestions() {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.dataPracticeService.getPracticeQuestions(this.rangeId!).subscribe({
      next: (questions) => {

        this.questions = questions;
        this.cd.detectChanges()
        this.initializeUserAnswers();
        this.isLoading.set(false);

      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.hasError.set(true);
        this.errorMessage = 'Không thể tải câu hỏi. Vui lòng thử lại sau.';
        this.isLoading.set(false);
      }
    });
  }

  initializeUserAnswers() {
    this.userAnswers = this.questions.map(question => ({
      questionId: question.questionInformation.id,
      selectedAnswerId: null,
      isCorrect: false
    }));
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    return this.questions.length > 0 ? (this.currentQuestionIndex + 1) / this.questions.length * 100 : 0;
  }

  get answeredCount(): number {
    return this.userAnswers.filter(answer => answer.selectedAnswerId !== null).length;
  }

  selectAnswer(answerId: string) {
    this.selectedAnswerId = answerId;
    this.userAnswers[this.currentQuestionIndex].selectedAnswerId = answerId;

    const correctAnswer = this.currentQuestion?.answerDetails.find(answer => answer.isCorrect);
    this.userAnswers[this.currentQuestionIndex].isCorrect = answerId === correctAnswer?.id;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.loadCurrentAnswer();
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.loadCurrentAnswer();
    }
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
    this.loadCurrentAnswer();
  }

  loadCurrentAnswer() {
    this.selectedAnswerId = this.userAnswers[this.currentQuestionIndex].selectedAnswerId;
  }

  isQuestionAnswered(index: number): boolean {
    return this.userAnswers[index]?.selectedAnswerId !== null;
  }

  submitPractice() {
    this.showSubmitModal = true;
  }

  exitPractice() {
    this.showExitModal = true;
  }

  confirmSubmit() {
    this.showSubmitModal = false;

    // Logic nộp bài gốc
    const result: PracticeResult = {
      totalQuestions: this.questions.length,
      correctAnswers: this.userAnswers.filter(answer => answer.isCorrect).length,
      wrongAnswers: this.userAnswers.filter(answer => answer.selectedAnswerId !== null && !answer.isCorrect).length,
      unanswered: this.userAnswers.filter(answer => answer.selectedAnswerId === null).length,
      score: 0,
      userAnswers: this.userAnswers,
      questions: this.questions
    };

    result.score = Math.round((result.correctAnswers / result.totalQuestions) * 100);

    // Gọi service hoặc navigate tùy theo cách bạn đang làm
    this.practiceResultService.setResult(result);
    this.router.navigate(['/home-user/result-screen']);
  }

  cancelSubmit() {
    this.showSubmitModal = false;
  }

  confirmExit() {
    this.showExitModal = false;
    this.router.navigate(['/home-user']);
  }

  cancelExit() {
    this.showExitModal = false;
  }

  retry() {
    this.loadQuestions();
  }

  hasAudioContent(content: string): boolean {
    if (!content) return false;
    return content.includes('<audio');
  }

  hasImageContent(content: string): boolean {
    if (!content) return false;
    return content.includes('<img');
  }

  getAudioHtml(content?: string): SafeHtml | null {
    if (!content) return null;

    // match src trong <audio ...>
    const match = content.match(/<audio[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (match) {
      const src = match[1];
      // Tạo lại thẻ audio với source
      const audioHtml = `
      <audio controls preload="none">
        <source src="${src}" type="audio/mpeg">
        <p>Trình duyệt không hỗ trợ audio.</p>
      </audio>
    `;
      return this.getSafeHtml(audioHtml);
    }

    return null;
  }

  getImageUrl(content?: string): string | null {
    if (!content || !this.hasImageContent(content)) return null;

    // Tìm thẻ img và extract src
    const imgMatch = content.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/);
    return imgMatch ? imgMatch[1] : null;
  }

  getTextContent(content?: string): string {
    if (!content) return '';

    // Loại bỏ tất cả HTML tags và trả về text thuần
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  getAnswerText(value: string): string {
    if (!value) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  getSafeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}