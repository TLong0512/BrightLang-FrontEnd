import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { PracticeResult, Question, UserAnswer } from '../../../../../models/practice.model';
import { TopikDataService } from '../../services/topik-data.service';
import { CommonModule } from '@angular/common';
import { PracticeService } from '../../services/practice.service';

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

  ngOnInit() {
    this.rangeId = this.route.snapshot.paramMap.get('rangeId') || '';
    if (this.rangeId) {
      this.loadQuestions();
    } else {
      this.hasError.set(true);
      this.errorMessage = 'Range ID không hợp lệ';
      this.isLoading.set(false);
    }
  }

  loadQuestions() {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.dataPracticeService.getPracticeQuestions(this.rangeId!).subscribe({
      next: (questions) => {
        this.questions = questions;
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
    return content.toLowerCase().includes('.mp3') ||
      content.toLowerCase().includes('.wav') ||
      content.toLowerCase().includes('.m4a') ||
      content.toLowerCase().includes('audio');
  }

  hasImageContent(content: string): boolean {
    if (!content) return false;
    return content.toLowerCase().includes('.jpg') ||
      content.toLowerCase().includes('.png') ||
      content.toLowerCase().includes('.jpeg') ||
      content.toLowerCase().includes('.gif') ||
      content.toLowerCase().includes('image');
  }

  getAudioUrl(content?: string): string | null {
    if (!content) return null;

    const audioExtensions = ['.mp3', '.wav', '.m4a'];
    for (const ext of audioExtensions) {
      const index = content.toLowerCase().indexOf(ext);
      if (index !== -1) {
        const start = content.lastIndexOf(' ', index) + 1;
        const end = content.indexOf(' ', index + ext.length);
        return content.substring(start, end === -1 ? undefined : end).trim();
      }
    }
    return null; // không tìm thấy file audio → trả về null
  }


  getImageUrl(content?: string): string | null {
    if (!content) return null;

    const imageExtensions = ['.jpg', '.png', '.jpeg', '.gif'];
    for (const ext of imageExtensions) {
      const index = content.toLowerCase().indexOf(ext);
      if (index !== -1) {
        const start = content.lastIndexOf(' ', index) + 1;
        const end = content.indexOf(' ', index + ext.length);
        return content.substring(start, end === -1 ? undefined : end).trim();
      }
    }
    return null; // không có ảnh → không render
  }

  getTextContent(content?: string): string {
    if (!content) return '';

    // Nếu có audio hoặc image, loại bỏ URL và chỉ lấy text
    if (this.hasAudioContent(content) || this.hasImageContent(content)) {
      const extensions = ['.mp3', '.wav', '.m4a', '.jpg', '.png', '.jpeg', '.gif'];
      let textContent = content;

      for (const ext of extensions) {
        const regex = new RegExp(`\\S*${ext.replace('.', '\\.')}\\S*`, 'gi');
        textContent = textContent.replace(regex, '').trim();
      }

      return textContent;
    }

    return content;
  }
}