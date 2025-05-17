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
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
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
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  bookForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  platforms: string[] = [];
  selectedGenres: string[] = [];
  isSubmitting = false;

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
      releaseDate: ['', Validators.required],
      developer: ['', [Validators.required, Validators.minLength(1)]],
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
  }

  // Helper method to filter options
  private _filter(value: string, list: string[]): string[] {
    const filterValue = value.toLowerCase();
    return list.filter(option => option.toLowerCase().includes(filterValue));
  }

  // Add platform to selected platforms list
  addPlatform() {
    const platformValue = this.bookForm.get('platformInput')?.value;
    if (platformValue && !this.platforms.includes(platformValue)) {
      this.platforms.push(platformValue);
    }
    this.bookForm.get('platformInput')?.setValue('');
  }

  // Remove platform from selected platforms list
  removePlatform(platform: string) {
    this.platforms = this.platforms.filter(p => p !== platform);
  }

  // Add genre to selected genres list
  addGenre() {
    const genreValue = this.bookForm.get('genreInput')?.value;
    if (genreValue && !this.selectedGenres.includes(genreValue)) {
      this.selectedGenres.push(genreValue);
    }
    this.bookForm.get('genreInput')?.setValue('');
  }

  // Remove genre from selected genres list
  removeGenre(genre: string) {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
  }

  onCancel(): void {
    this.router.navigate(['/books']);
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

    const bookData = {
      title: this.bookForm.value.title || '',
      author: this.bookForm.value.developer || '', // Using developer field as author
      description: this.bookForm.value.description || '',
      publisher: this.bookForm.value.publisher || '',
      publicationDate: this.bookForm.value.releaseDate || '',
      genres: this.selectedGenres,
      platforms: this.platforms,
      pages: 0, // Not used in this form
      readersRead: 0,
      rating: 0,
      imageUrl: finalImageUrl,
      totalRatingScore: 0,
      numRatings: 0,
      dateAdded: new Date().toISOString()
    };

    try {
      await this.bookService.addBook(bookData);
      this.snackBar.open('Book added successfully!', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/books']);
    } catch (error) {
      console.error('Error adding book:', error);
      this.snackBar.open('Error adding book: ' + (error as Error).message, 'Close', {
        duration: 5000
      });
    }
  }
}