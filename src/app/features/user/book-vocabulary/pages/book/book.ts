import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { BookService, Book } from '../../services/book.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { HttpContext } from "@angular/common/http";
// import { Modal } from 'bootstrap';
@Component({
    selector: 'book',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './book.html',
    styleUrl: './book.css',
})

export class BookComponent implements OnInit {
    books: Book[] = [];
    addBookForm!: FormGroup;
    updateBookForm!: FormGroup;
    isUpdateModalOpen = false;
    isDeleteModalOpen = false;
    selectedBook: any;
    // userId= HttpContext.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid")?.Value;
  constructor(private fb: FormBuilder, private service: BookService, private router: Router,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.addBookForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
    
    this.updateBookForm = this.fb.group({
    title: ['', Validators.required],
    description: ['']
  });
   
    this.loadBooks();
  }

   loadBooks(): void {
    this.service.getBooks().subscribe({
      next: (data: any) => {
        this.books = data.items;
        this.cd.detectChanges();
        console.log('konnichiwa', this.books) 
      },
      error: (err) => console.error(err)
    });
  }
  

  
  openBook(id: string) {
    console.log('Open book with id:', id);
      this.router.navigate(['/home-user/vocab', id]).then(ok => console.log('navigate?', ok));
  }

  editBook(book: Book, event?: Event) {
    event?.stopPropagation();
  this.selectedBook = book;
  this.updateBookForm.patchValue({
    title: book.name,
    description: book.description
  });
  this.isUpdateModalOpen = true;
  };

  closeUpdateModal() {
    this.isUpdateModalOpen = false;
    this.selectedBook = null;
  }


updateBook() {
  if (this.updateBookForm.valid) {
    const updated = {
      ...this.selectedBook,
      name: this.updateBookForm.value.title,
      description: this.updateBookForm.value.description
    };

    this.service.updateBook(updated).subscribe({
      next: (res) => {
        // const index = this.books.findIndex(b => b.id === res.id);
        // if (index !== -1) this.books[index] = res;
        // this.updateBookForm.reset();
        // this.closeUpdateModal();
         this.books = this.books.map(b => b.id === res.id ? res : b);
        this.closeUpdateModal();
        this.cd.detectChanges();
        window.location.reload();
      },
      error: (err) => console.error("Lỗi khi sửa book:", err)
    });
  }
}

  deleteBook(id: string, event?: Event) {
    event?.stopPropagation();
    console.log('Delete book id:', id);
    this.selectedBook = this.books.find(b => b.id === id);
    this.isDeleteModalOpen = true;
  }
  closeDeleteModal() {
  this.isDeleteModalOpen = false;
  this.selectedBook = null;
}
  confirmDeleteBook() {
  if (!this.selectedBook) return;
  this.service.deleteBook(this.selectedBook.id).subscribe({
    next: () => {
      this.books = this.books.filter(b => b.id !== this.selectedBook.id);
      this.closeDeleteModal();
      this.cd.detectChanges();
    },
    error: (err) => console.error("Lỗi khi xóa book:", err)
  });
}
  addBook(event?: Event){
     event?.preventDefault();
    if (this.addBookForm.invalid) return;

    const newBook = {
      name: this.addBookForm.value.title,
      description: this.addBookForm.value.description
    };

    this.service.addBook(newBook).subscribe({
      next: (res) => {
        this.books = [...this.books, res];
        this.addBookForm.reset();
        this.cd.detectChanges();
        window.location.reload();
      },
      error: (err) => console.error("Lỗi khi thêm book:", err)
    });
  
  }
  
}
