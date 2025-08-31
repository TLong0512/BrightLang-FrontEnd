import { ActivatedRoute } from '@angular/router';
import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VocabService } from '../../services/vocab.service';
import { Router } from '@angular/router';

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
  templateUrl: './vocab.html',
  styleUrls: ['./vocab.css']
})
export class VocabularyComponent implements OnInit {
  
  vocabularies: Vocabulary[] = [];
  bookId!: string;
  filterVocabularies = '';
 
  addNewRow() {
 
  }
  constructor(
    private vocabService: VocabService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // const bookId = Number(this.route.snapshot.paramMap.get('bookId'));
    // this.vocabService.getVocabulariesByBook(bookId).subscribe({
    //   next: (data) => {
    //     this.vocabularies = data;
    //   },
    //   error: (err) => {
    //     console.error('Lỗi khi load vocab:', err);
    //   }
    // });
     this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.bookId = id; 
        this.loadVocabularies();
      }
    });
  }
  loadVocabularies(): void {
    this.vocabService.getVocabulariesByBook(this.bookId).subscribe({
      next: (data) => {
        this.vocabularies = data;
        this.cd.detectChanges();
        console.log('konnichiwa', this.vocabularies)
      },
      error: (err) => {
        console.error('Lỗi khi load vocab:', err);
      }
    });
  }

  editVocab(vocab: Vocabulary) {
  console.log("Sửa vocab:", vocab);
  // mở modal hoặc form sửa
}

deleteVocab(id: number) {
  if(confirm("Bạn có chắc chắn muốn xoá từ này?")) {
    this.vocabService.deleteVocabulary(id).subscribe(() => {
      this.vocabularies = this.vocabularies.filter(v => v.id !== id);
    });
  }
}
startLearning() {
  if (this.vocabularies.length > 0) {
    this.router.navigate(['/flashcard', this.bookId]);
    // , {
    //   state: { vocabs: this.vocabularies }
    // });;
  }
}
  
}
