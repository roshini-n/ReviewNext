import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { MovieFirebaseService } from '../../../services/movieFirebase.service';
import { TMDBService } from '../../../services/tmdb.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-add-movie',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
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
  templateUrl: './add-movie.component.html',
  styleUrls: ['./add-movie.component.css']
})
export class AddMovieComponent implements OnInit {
  private fb = inject(FormBuilder);
  private movieService = inject(MovieFirebaseService);
  private tmdbService = inject(TMDBService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  movieForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    imageUrl: ['', [Validators.required]],
    director: ['', [Validators.required]],
    platformInput: [''],
    genreInput: [''],
    releaseDate: ['', [Validators.required]],
    duration: ['', [Validators.required, Validators.min(1)]],
    language: [''],
    country: ['']
  });

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  platforms: string[] = [];
  selectedGenres: string[] = [];
  isSubmitting = false;
  isSearchingImage = false;

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

  ngOnInit() {
    this.filteredOptions = this.movieForm.get('platformInput')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.options))
    );

    this.filteredGenres = this.movieForm.get('genreInput')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.genres))
    );

    // Subscribe to title changes to fetch movie image
    this.movieForm.get('title')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(title => {
        if (title && title.length >= 2) {
          this.isSearchingImage = true;
          const releaseDate = this.movieForm.get('releaseDate')?.value;
          const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;
          return this.tmdbService.searchMovie(title, year);
        }
        return [];
      })
    ).subscribe({
      next: (imageUrl) => {
        if (imageUrl) {
          this.movieForm.patchValue({ imageUrl });
        }
        this.isSearchingImage = false;
      },
      error: (error) => {
        console.error('Error fetching movie image:', error);
        this.isSearchingImage = false;
      }
    });

    // Also update image when release date changes
    this.movieForm.get('releaseDate')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(releaseDate => {
        const title = this.movieForm.get('title')?.value;
        if (title && title.length >= 2) {
          this.isSearchingImage = true;
          const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;
          return this.tmdbService.searchMovie(title, year);
        }
        return [];
      })
    ).subscribe({
      next: (imageUrl) => {
        if (imageUrl) {
          this.movieForm.patchValue({ imageUrl });
        }
        this.isSearchingImage = false;
      },
      error: (error) => {
        console.error('Error fetching movie image:', error);
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

  onSubmit() {
    console.log('Form valid:', this.movieForm.valid);
    console.log('Platforms:', this.platforms);
    console.log('Genres:', this.selectedGenres);
    console.log('Form values:', this.movieForm.value);
    console.log('Form errors:', this.movieForm.errors);

    // Check if form is valid and has required fields
    if (!this.movieForm.valid) {
      let errorMessage = 'Please fill in all required fields:';
      if (!this.movieForm.get('title')?.valid) {
        errorMessage += '\n- Title is required';
      }
      if (!this.movieForm.get('description')?.valid) {
        errorMessage += '\n- Description is required';
      }
      if (!this.movieForm.get('director')?.valid) {
        errorMessage += '\n- Director is required';
      }
      if (!this.movieForm.get('releaseDate')?.valid) {
        errorMessage += '\n- Release date is required';
      }
      if (!this.movieForm.get('duration')?.valid) {
        errorMessage += '\n- Duration is required and must be greater than 0';
      }
      if (!this.movieForm.get('imageUrl')?.valid) {
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
    const formValue = this.movieForm.value;
    const newMovie = {
      title: formValue.title,
      description: formValue.description,
      director: formValue.director,
      releaseDate: formValue.releaseDate.toISOString(),
      duration: parseInt(formValue.duration),
      imageUrl: formValue.imageUrl,
      platforms: this.platforms,
      genres: this.selectedGenres,
      language: formValue.language || '',
      country: formValue.country || '',
      rating: 0,
      totalRatingScore: 0,
      numRatings: 0,
      views: 0,
      dateAdded: new Date().toISOString()
    };

    this.movieService.addMovie(newMovie).subscribe({
      next: () => {
        this.snackBar.open('Movie added successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/movies']);
      },
      error: (error) => {
        console.error('Error adding movie:', error);
        this.snackBar.open('Error adding movie. Please try again.', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/movies']);
  }
} 