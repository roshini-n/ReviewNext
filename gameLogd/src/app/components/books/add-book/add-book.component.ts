import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { BookCoverService } from '../../../services/book-cover.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule
  ],
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookService = inject(BookFirebaseService);
  private bookCoverService = inject(BookCoverService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  bookForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    imageUrl: ['', [Validators.required]],
    author: ['', [Validators.required]],
    publisher: ['', [Validators.required]],
    platformInput: [''],
    genreInput: [''],
    publicationDate: ['', [Validators.required]]
  });

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  platforms: string[] = [];
  selectedGenres: string[] = [];
  isSubmitting = false;
  isSearchingImage = false;

  // Available options for platforms and genres
  options: string[] = [
    "Hardcover", "Paperback", "E-book", "Audiobook", "Kindle",
    "Nook", "Google Books", "Apple Books", "Kobo", "Other"
  ];

  genres: string[] = [
    "Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction",
    "Fantasy", "Horror", "Thriller", "Biography", "History",
    "Self-Help", "Business", "Science", "Technology", "Philosophy",
    "Poetry", "Drama", "Comedy", "Adventure", "Children's"
  ];

  filteredOptions!: Observable<string[]>;
  filteredGenres!: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.bookForm.get('platformInput')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.options))
    );

    this.filteredGenres = this.bookForm.get('genreInput')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.genres))
    );

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

  onSubmit() {
    console.log('Form valid:', this.bookForm.valid);
    console.log('Platforms:', this.platforms);
    console.log('Genres:', this.selectedGenres);
    console.log('Form values:', this.bookForm.value);
    console.log('Form errors:', this.bookForm.errors);

    // Check if form is valid and has required fields
    if (!this.bookForm.valid) {
      let errorMessage = 'Please fill in all required fields:';
      if (!this.bookForm.get('title')?.valid) {
        errorMessage += '\n- Title is required';
      }
      if (!this.bookForm.get('description')?.valid) {
        errorMessage += '\n- Description is required';
      }
      if (!this.bookForm.get('author')?.valid) {
        errorMessage += '\n- Author is required';
      }
      if (!this.bookForm.get('publisher')?.valid) {
        errorMessage += '\n- Publisher is required';
      }
      if (!this.bookForm.get('publicationDate')?.valid) {
        errorMessage += '\n- Publication date is required';
      }
      if (!this.bookForm.get('imageUrl')?.valid) {
        errorMessage += '\n- Image URL is required';
      }
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      return;
    }

    // Check if platforms and genres are selected
    if (this.platforms.length === 0) {
      this.snackBar.open('Please add at least one platform', 'Close', { duration: 3000 });
      return;
    }

    if (this.selectedGenres.length === 0) {
      this.snackBar.open('Please add at least one genre', 'Close', { duration: 3000 });
      return;
    }

    // If all validations pass, proceed with submission
    this.isSubmitting = true;
    const formValue = this.bookForm.value;
    const newBook = {
      title: formValue.title,
      description: formValue.description,
      author: formValue.author,
      publisher: formValue.publisher,
      publicationDate: formValue.publicationDate.toISOString(),
      imageUrl: formValue.imageUrl,
      platforms: this.platforms,
      genres: this.selectedGenres,
      rating: 0,
      totalRatingScore: 0,
      numRatings: 0,
      views: 0,
      dateAdded: new Date().toISOString()
    };

    this.bookService.addBook(newBook).subscribe({
      next: () => {
        this.snackBar.open('Book added successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/books']);
      },
      error: (error: Error) => {
        console.error('Error adding book:', error);
        this.snackBar.open('Error adding book. Please try again.', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/books']);
  }
}