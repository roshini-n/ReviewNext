import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookCoverService } from '../../services/book-cover.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent implements OnInit {
  bookForm: FormGroup;
  isLoading = false;
  imageUrl: string = '';
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookCoverService: BookCoverService
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1800), Validators.max(this.currentYear)]],
      rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      review: ['', Validators.required],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    // Create a combined observable for title and author changes
    const titleChanges = this.bookForm.get('title')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    );

    const authorChanges = this.bookForm.get('author')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    );

    // Subscribe to both changes
    titleChanges?.subscribe(() => this.searchBookCover());
    authorChanges?.subscribe(() => this.searchBookCover());
  }

  private searchBookCover() {
    const title = this.bookForm.get('title')?.value;
    const author = this.bookForm.get('author')?.value;
    const year = this.bookForm.get('year')?.value;

    if (title) {
      this.isLoading = true;
      this.bookCoverService.searchBook(title, author, year).subscribe({
        next: (imageUrl) => {
          this.imageUrl = imageUrl;
          this.bookForm.patchValue({ imageUrl });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching book image:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onSubmit() {
    if (this.bookForm.valid) {
      // Here you would typically save the book review to your database
      console.log('Book review submitted:', this.bookForm.value);
      this.router.navigate(['/books']);
    }
  }
} 