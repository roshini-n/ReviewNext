import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { BookCoverService } from '../../../services/book-cover.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule
  ],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css'
})
export class AddBookComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookService = inject(BookFirebaseService);
  private bookCoverService = inject(BookCoverService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  bookForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  platforms: string[] = [];
  selectedGenres: string[] = [];
  isSubmitting = false;
  isSearchingImage = false;

  // Available options for platforms and genres
  options: string[] = [
    "Library", "Amazon Kindle", "Google Books", "Apple Books", "Wattpad", 
    "Scribd", "Project Gutenberg", "Goodreads"
  ];

  genres: string[] = [
    "Action", "Adventure", "Horror", "Fantasy", "Romance", "Thriller", 
    "Mystery", "Historical Fiction", "Biography", "Travel", "Philosophy", "True Crime"
  ];

  filteredOptions!: Observable<string[]>;
  filteredGenres!: Observable<string[]>;

  constructor() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      platformInput: [''],
      genreInput: [''],
      publicationDate: ['', Validators.required],
      author: ['', [Validators.required, Validators.minLength(1)]],
      publisher: ['', [Validators.required, Validators.minLength(1)]],
      imageUrl: ['', [Validators.pattern('https?://.*')]]
    });
  }

  ngOnInit() {
    // Filter options for platforms and genres
    this.filteredOptions = this.bookForm.get('platformInput')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.options))
    ) || new Observable<string[]>();

    this.filteredGenres = this.bookForm.get('genreInput')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.genres))
    ) || new Observable<string[]>();

    // Subscribe to title changes to fetch book image
    this.bookForm.get('title')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(title => title && title.length > 2)
    ).subscribe(title => {
      console.log('AddBookComponent: Title changed:', title);
      this.searchForBookImage(title);
    });

    // Subscribe to author changes to update image if needed
    this.bookForm.get('author')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(author => author && author.length > 2)
    ).subscribe(author => {
      console.log('AddBookComponent: Author changed:', author);
      const title = this.bookForm.get('title')?.value;
      if (title) {
        this.searchForBookImage(title, author);
      }
    });

    // Subscribe to publication date changes to update image if needed
    this.bookForm.get('publicationDate')?.valueChanges.pipe(
      distinctUntilChanged(),
      filter(date => date && this.bookForm.get('title')?.value)
    ).subscribe(date => {
      console.log('AddBookComponent: Publication date changed:', date);
      const title = this.bookForm.get('title')?.value;
      const author = this.bookForm.get('author')?.value;
      if (title) {
        this.searchForBookImage(title, author, date ? new Date(date).getFullYear() : undefined);
      }
    });
  }

  private searchForBookImage(title: string, author?: string, year?: number) {
    console.log('AddBookComponent: Searching for book image with params:', { title, author, year });
    this.isSearchingImage = true;

    this.bookCoverService.searchBook(title, author, year).subscribe({
      next: (imageUrl) => {
        console.log('AddBookComponent: Received image URL:', imageUrl);
        if (imageUrl) {
          this.bookForm.patchValue({ imageUrl }, { emitEvent: false });
          console.log('AddBookComponent: Updated form with image URL:', imageUrl);
        } else {
          console.log('AddBookComponent: No image URL received');
        }
        this.isSearchingImage = false;
      },
      error: (error) => {
        console.error('AddBookComponent: Error fetching book image:', error);
        this.isSearchingImage = false;
      }
    });
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => 
      option.toLowerCase().includes(filterValue)
    );
  }

  addPlatform() {
    const platformValue = this.bookForm.get('platformInput')?.value;
    if (platformValue && !this.platforms.includes(platformValue)) {
      this.platforms.push(platformValue);
    }
    this.bookForm.get('platformInput')?.setValue('');
  }

  removePlatform(platform: string) {
    this.platforms = this.platforms.filter(p => p !== platform);
  }

  addGenre() {
    const genreValue = this.bookForm.get('genreInput')?.value;
    if (genreValue && !this.selectedGenres.includes(genreValue)) {
      this.selectedGenres.push(genreValue);
    }
    this.bookForm.get('genreInput')?.setValue('');
  }

  removeGenre(genre: string) {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
  }

  async sendDataToFirebase() {
    if (!this.bookForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 5000
      });
      return;
    }

    if (this.selectedGenres.length === 0) {
      this.snackBar.open('Please add at least one genre', 'Close', {
        duration: 5000
      });
      return;
    }

    // Default image URL if not provided
    const finalImageUrl = this.bookForm.value.imageUrl || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

    try {
      const bookData = {
        title: this.bookForm.value.title || '',
        platforms: this.platforms,
        author: this.bookForm.value.author || '',
        description: this.bookForm.value.description || '',
        publicationDate: this.bookForm.value.publicationDate || '',
        publisher: this.bookForm.value.publisher || '',
        genres: this.selectedGenres,
        imageUrl: finalImageUrl,
        rating: 0,
        numRatings: 0,
        totalRatingScore: 0,
        pages: 0,
        readersRead: 0,
        dateAdded: new Date().toISOString()
      };

      await this.bookService.addBook(bookData);

      this.snackBar.open('Book added successfully!', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/books']);
    } catch (error: unknown) {
      console.error('Error adding book:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      this.snackBar.open('Error adding book: ' + errorMessage, 'Close', {
        duration: 5000
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/books']);
  }
}