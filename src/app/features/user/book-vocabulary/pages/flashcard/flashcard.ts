import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,ActivatedRoute  } from '@angular/router';
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
  templateUrl: './flashcard.html',
  styleUrls: ['./flashcard.css']
})
export class FlashcardComponent {
  vocabularies: Vocabulary[] = [];
  answerVocabularies: Vocabulary[] = []; 
  currentIndex = 0;
  answerIndex = 0;
  showBack = false;
  mode: 'flashcard' | 'answer' = 'flashcard';
  userAnswer = '';
  answerResult: boolean | null = null;

  get currentCard(): Vocabulary {
    return this.vocabularies[this.currentIndex];
  }

    get currentAnswerCard(): Vocabulary {
    return this.answerVocabularies[this.answerIndex];
  }

  constructor(private router: Router, private route: ActivatedRoute, private vocabService: VocabService){

  }
  ngOnInit() {
  const bookId = this.route.snapshot.paramMap.get('bookId')!;
  
    this.vocabService.getVocabulariesByBook(bookId).subscribe({
    next: (res: any) => {
      this.vocabularies = res.items;
      this.answerVocabularies = res.items.map((v: Vocabulary) => ({ ...v }));
    },
    error: (err) => {
      console.error("Lỗi khi load flashcards:", err);
      this.vocabularies = [];
      this.answerVocabularies = [];
    }
  });
}
  flipCard() {
    if (this.mode === 'flashcard') {
    this.showBack = !this.showBack;
  }
  }

  nextCard() {
if (this.currentIndex < this.vocabularies.length - 1) {
    this.currentIndex++;
  } else {
    this.currentIndex = 0;
  }
  this.showBack = false;
  }

  prevCard() {
   if (this.currentIndex > 0) this.currentIndex--;
    this.showBack = false;
    
  }

  checkAnswer() {
    if (!this.currentAnswerCard) return;
    this.answerResult = this.userAnswer.trim().toLowerCase() ===
                        this.currentAnswerCard.front.toLowerCase();
  }
  nextAnswer() {
    if (this.answerIndex < this.answerVocabularies.length - 1) {
      this.answerIndex++;
    } else {
      this.answerIndex = 0;
    }
    this.userAnswer = '';
    this.answerResult = null;
  }
}
