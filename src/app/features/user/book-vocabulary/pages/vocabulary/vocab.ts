import { ActivatedRoute, RouterModule } from '@angular/router';
import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VocabService } from '../../services/vocab.service';
import { Router } from '@angular/router';
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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './vocab.html',
  styleUrls: ['./vocab.css']
})
export class VocabularyComponent implements OnInit {
  vocabularies: Vocabulary[] = [];
  bookId!: string;
  editingVocabId: string | null = null;
  isDeleteModalOpen = false;
  selectedVocab: Vocabulary | null = null;
 
  constructor(
    private vocabService: VocabService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    
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
      next: (data: any) => {
        this.vocabularies = data.items;
        this.cd.detectChanges();
        console.log('konnichiwa', this.vocabularies)
      },
      error: (err) => {
        console.error('Lỗi khi load vocab:', err);
      }
    });
  }
  addNewRow() {
    const newVocab: Vocabulary = {
    id: '',
    bookId: this.bookId,
    front: '',
    back: ''
  };
  
  this.vocabularies.unshift(newVocab);
  }
  
  saveNewVocab(vocab: Vocabulary) {
    this.vocabService.addVocabulary(vocab).subscribe({
      next: (res: Vocabulary) => {
        vocab.id = res.id;
        this.cd.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  editVocab(vocab: Vocabulary) {
  console.log("Sửa vocab:", vocab);
   this.editingVocabId = vocab.id;
  }
  saveEditVocab(vocab: Vocabulary) {
    this.vocabService.updateVocabulary(vocab).subscribe({
      next: () => {
        this.editingVocabId = null;
        this.cd.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  openDeleteModal(vocab: Vocabulary) {
    this.selectedVocab = vocab;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.selectedVocab = null;
    this.isDeleteModalOpen = false;
  }
  confirmDeleteVocab() {
    if (this.selectedVocab) {
      this.vocabService.deleteVocabulary(this.selectedVocab.id).subscribe({
        next: () => {
          this.vocabularies = this.vocabularies.filter(v => v.id !== this.selectedVocab!.id);
          this.closeDeleteModal();
          this.cd.detectChanges();
        },
        error: err => console.error(err)
      });
    }
  }

// deleteVocab(id: string) {
//   if(confirm("Bạn có chắc chắn muốn xoá từ này?")) {
//     this.vocabService.deleteVocabulary(id).subscribe({
//       next: () => {
//           this.vocabularies = this.vocabularies.filter(v => v.id !== id);
//         },
//         error: err => console.error(err)   
//       });
//   }
// }
startLearning() {
  if (this.vocabularies.length > 0) {
    this.router.navigate(['/home-user/flashcard', this.bookId]);
    // , {
    //   state: { vocabs: this.vocabularies }
    // });;
  }
}
  
}
