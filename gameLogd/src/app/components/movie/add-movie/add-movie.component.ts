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
import { MovieFirebaseService } from '../../../services/movieFirebase.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-add-movie',
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
  templateUrl: './add-movie.component.html',
  styleUrls: ['./add-movie.component.css']
})
export class AddMovieComponent implements OnInit {
  private fb = inject(FormBuilder);
  private movieService = inject(MovieFirebaseService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  movieForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  platforms: string[] = [];
  selectedGenres: string[] = [];
  isSubmitting = false;

  // Available options for platforms and genres
  options: string[] = [
    "Netflix", "Amazon Prime", "Disney+", "HBO Max", "Hulu", 
    "Apple TV+", "Paramount+", "Peacock", "Theater", "Blu-ray", 
    "DVD", "VOD", "Other"
  ];

  genres: string[] = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance",
    "Sci-Fi", "Thriller", "War", "Western", "Biography", "History",
    "Music", "Musical", "Sport"
  ];

  filteredOptions!: Observable<string[]>;
  filteredGenres!: Observable<string[]>;

  constructor() {
    this.movieForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      platformInput: [''],
      genreInput: [''],
      releaseDate: ['', Validators.required],
      director: ['', [Validators.required, Validators.minLength(1)]],
      duration: ['', [Validators.required, Validators.min(1)]],
      imageUrl: ['', [Validators.pattern('https?://.*')]],
      language: [''],
      country: ['']
    });
  }

  ngOnInit() {
    // Filter options for platforms and genres
    this.filteredOptions = this.movieForm.get('platformInput')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.options))
    ) || new Observable<string[]>();

    this.filteredGenres = this.movieForm.get('genreInput')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.genres))
    ) || new Observable<string[]>();
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => 
      option.toLowerCase().includes(filterValue)
    );
  }

  addPlatform() {
    const platformValue = this.movieForm.get('platformInput')?.value;
    if (platformValue && !this.platforms.includes(platformValue)) {
      this.platforms.push(platformValue);
    }
    this.movieForm.get('platformInput')?.setValue('');
  }

  removePlatform(platform: string) {
    this.platforms = this.platforms.filter(p => p !== platform);
  }

  addGenre() {
    const genreValue = this.movieForm.get('genreInput')?.value;
    if (genreValue && !this.selectedGenres.includes(genreValue)) {
      this.selectedGenres.push(genreValue);
    }
    this.movieForm.get('genreInput')?.setValue('');
  }

  removeGenre(genre: string) {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
  }

  async sendDataToFirebase() {
    if (!this.movieForm.valid) {
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
    const finalImageUrl = this.movieForm.value.imageUrl || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

    const movieData = {
      title: this.movieForm.value.title || '',
      description: this.movieForm.value.description || '',
      director: this.movieForm.value.director || '',
      releaseDate: this.movieForm.value.releaseDate || '',
      genres: this.selectedGenres,
      duration: this.movieForm.value.duration || 0,
      rating: 0,
      imageUrl: finalImageUrl,
      totalRatingScore: 0,
      numRatings: 0,
      dateAdded: new Date().toISOString(),
      platforms: this.platforms,
      language: this.movieForm.value.language || '',
      country: this.movieForm.value.country || ''
    };

    try {
      await this.movieService.addMovie(movieData);
      this.snackBar.open('Movie added successfully!', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/movies']);
    } catch (error: unknown) {
      console.error('Error adding movie:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      this.snackBar.open('Error adding movie: ' + errorMessage, 'Close', {
        duration: 5000
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/movies']);
  }
} 