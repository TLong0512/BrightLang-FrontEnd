import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,ActivatedRoute  } from '@angular/router';
import { VocabService } from '../../services/vocab.service';

interface Vocabulary {
  id: number;
  bookId: string;
  front: string;
  back: string;
}

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flashcard.html',
  styleUrls: ['./flashcard.css']
})
export class FlashcardComponent {
  vocabularies: any[] = [];
  currentIndex = 0;
  showBack = false;

  get currentCard(): Vocabulary {
    return this.vocabularies[this.currentIndex];
  }

  
  constructor(private router: Router, private route: ActivatedRoute, private vocabService: VocabService){

  }
  ngOnInit() {
  const bookId = this.route.snapshot.paramMap.get('bookId')!;
  
    this.vocabService.getVocabulariesByBook(bookId).subscribe({
    next: (res: any) => {
      this.vocabularies = res.items;
    },
    error: (err) => {
      console.error("Lỗi khi load flashcards:", err);
      this.vocabularies = [];
    }
  });
}
  flipCard() {
    this.showBack = !this.showBack;
  }

  nextCard() {
    if (this.currentIndex < this.vocabularies.length - 1) {
      this.currentIndex++;
      this.showBack = false;
    }
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.showBack = false;
    }
  }
}
