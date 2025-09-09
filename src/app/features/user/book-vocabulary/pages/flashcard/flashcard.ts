import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { VocabService } from '../../services/vocab.service';
import { FormsModule } from '@angular/forms';

interface Vocabulary {
  id: string;
  bookId: string;
  front: string;
  back: string;
}

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'flashcard.html',
  styleUrls: ['flashcard.css']
})
export class FlashcardComponent implements OnInit {
  @ViewChild('answerInput') answerInput!: ElementRef;
  @ViewChild('nextButton') nextButton!: ElementRef;

  vocabularies: Vocabulary[] = [];
  answerVocabularies: Vocabulary[] = [];
  currentIndex = 0;
  answerIndex = 0;
  showBack = false;
  mode: 'flashcard' | 'answer' = 'flashcard';
  userAnswer = '';
  answerResult: boolean | null = null;
  showCorrectAnswer = false;
  showCompletionModal = false;
  isTransitioning = false;
  bookId: string | null = null;

  get currentCard(): Vocabulary {
    return this.vocabularies[this.currentIndex];
  }

  get currentAnswerCard(): Vocabulary {
    return this.answerVocabularies[this.answerIndex];
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private vocabService: VocabService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.bookId = this.route.snapshot.paramMap.get('bookId')!;

    this.vocabService.getVocabulariesByBook(this.bookId).subscribe({
      next: (res: any) => {
        this.vocabularies = res.items.map((v: Vocabulary) => ({
          ...v,
          front: v.front?.trim().normalize('NFC'),
          back: v.back?.trim().normalize('NFC'),
        }));

        this.answerVocabularies = this.vocabularies.map(v => ({ ...v }));

        this.shuffleArray(this.answerVocabularies);
        this.currentIndex = 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Lỗi khi load flashcards:", err);
        this.vocabularies = [];
        this.answerVocabularies = [];
      }
    });
  }

  // Utility methods
  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  getProgressPercentage(): number {
    if (this.vocabularies.length === 0) return 0;
    if (this.mode === 'flashcard') {
      return ((this.currentIndex + 1) / this.vocabularies.length) * 50;
    } else {
      return 50 + ((this.answerIndex + 1) / this.vocabularies.length) * 50;
    }
  }

  getCurrentProgress(): number {
    return this.mode === 'flashcard' ? this.currentIndex + 1 : this.answerIndex + 1;
  }

  isLastFlashcard(): boolean {
    return this.currentIndex === this.vocabularies.length - 1;
  }

  isLastAnswer(): boolean {
    return this.answerIndex === this.answerVocabularies.length - 1;
  }

  // Flashcard methods
  flipCard() {
    if (this.mode === 'flashcard' && !this.isTransitioning) {
      this.showBack = !this.showBack;
    }
  }

  nextCard() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;

    if (this.showBack) {
      // If showing back, flip to front first
      this.showBack = false;
      setTimeout(() => {
        this.moveToNextCard();
      }, 300);
    } else {
      // If showing front, move directly
      this.moveToNextCard();
    }
  }

  private moveToNextCard() {
    if (this.currentIndex < this.vocabularies.length - 1) {
      this.currentIndex++;
    } else {
      // Finished flashcards, switch to answer mode
      this.mode = 'answer';
      this.answerIndex = 0;
      this.resetAnswerState();

      // ✅ Focus vào input
      setTimeout(() => {
        this.answerInput?.nativeElement.focus();
      }, 100);
    }
    this.isTransitioning = false;
    this.cdr.detectChanges();
  }

  prevCard() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;

    if (this.showBack) {
      // If showing back, flip to front first
      this.showBack = false;
      setTimeout(() => {
        this.moveToPrevCard();
      }, 300);
    } else {
      // If showing front, move directly
      this.moveToPrevCard();
    }
  }

  private moveToPrevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    this.isTransitioning = false;
  }

  // Answer methods
  checkAnswer() {
    if (!this.currentAnswerCard) return;

    const normalize = (str: string) =>
      str
        .trim()
        .toLowerCase()
        .normalize('NFC')
        .replace(/\s+/g, ' ')
        .replace(/[^\p{L}\p{N}\s]/gu, '');

    const userAnswerNormalized = normalize(this.userAnswer);
    const correctAnswer = normalize(this.currentAnswerCard.front);

    this.answerResult = userAnswerNormalized === correctAnswer;
  }

  handleEnterKey() {
    if (this.answerResult === null) {
      this.checkAnswer();
    } else if (this.answerResult === true || (this.answerResult === false && this.showCorrectAnswer)) {
      this.nextAnswer();
    }
  }

  retryAnswer() {
    this.userAnswer = '';
    this.answerResult = null;
    this.showCorrectAnswer = false;
    // Focus back on input
    setTimeout(() => {
      if (this.answerInput) {
        this.answerInput.nativeElement.focus();
      }
    }, 100);
  }

  showAnswer() {
    this.showCorrectAnswer = true;
    // Focus on next button
    setTimeout(() => {
      if (this.nextButton) {
        this.nextButton.nativeElement.focus();
      }
    }, 100);
  }

  nextAnswer() {
    if (this.answerIndex < this.answerVocabularies.length - 1) {
      this.answerIndex++;
      this.resetAnswerState();

      // ép Angular clear state input
      this.cdr.detectChanges();

      // focus input mới
      setTimeout(() => this.answerInput?.nativeElement.focus(), 50);
    } else {
      this.showCompletionModal = true;
    }
  }

  resetAnswerState() {
    this.userAnswer = '';
    this.answerResult = null;
    this.showCorrectAnswer = false;
  }

  // Modal methods
  restartStudy() {
    this.currentIndex = 0;
    this.answerIndex = 0;
    this.mode = 'flashcard';
    this.showBack = false;
    this.resetAnswerState();
    this.showCompletionModal = false;
    this.isTransitioning = false;
    // Re-shuffle for variety
    this.shuffleArray(this.answerVocabularies);
  }

  closeModal() {
    this.showCompletionModal = false;
    this.router.navigate(['/books']); // Adjust route as needed
  }

  goBack(bookId: string) {
    this.router.navigate(['/home-user/vocab', bookId]);
  }
}