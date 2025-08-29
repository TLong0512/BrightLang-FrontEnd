import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { BookService, Book } from '../../services/book.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { HttpContext } from "@angular/common/http";
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
   
   
    this.loadBooks();
  }

   loadBooks(): void {
    this.service.getBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.cd.detectChanges();
        console.log('konnichiwa', this.books) 
      },
      error: (err) => console.error(err)
    });
  }
  
//   loadBooksByUser() {
//   this.service.getBooksByUserId(this.userId).subscribe(data => this.books = data);
//  }
  
  openBook(id: string) {
    console.log('Open book with id:', id);
    this.router.navigate(['/vocab',id]);
  }

  editBook(book: any, event: Event) {
    event.stopPropagation();
    console.log('Edit book:', book);
  }

  deleteBook(id: string, event: Event) {
    event.stopPropagation();
    console.log('Delete book id:', id);
  }
  addBook(){

  }
  
}
