import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { IGDBService } from '../../services/igdb.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  templateUrl: './add-game.component.html',
  styleUrl: './add-game.component.css'
})
export class AddGameComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gameService = inject(GameFirebaseService);
  private igdbService = inject(IGDBService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  gameForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  platforms: string[] = [];
  selectedGenres: string[] = [];
  isSubmitting = false;
  isSearchingImage = false;

  // Available options for platforms and genres
  options: string[] = [
    "PC", "PlayStation 5", "PlayStation 4", "Xbox Series X|S", "Xbox One",
    "Nintendo Switch", "Nintendo 3DS", "Nintendo Wii U", "Mobile", "VR",
    "Other"
  ];

  genres: string[] = [
    "Action", "Adventure", "RPG", "Strategy", "Sports", "Racing",
    "Puzzle", "Platformer", "Fighting", "Shooter", "Simulation",
    "Horror", "MMO", "MOBA", "Battle Royale", "Card Game", "Board Game",
    "Educational", "Music", "Party", "Sandbox"
  ];

  filteredOptions!: Observable<string[]>;
  filteredGenres!: Observable<string[]>;

  constructor() {
    this.gameForm = this.fb.group({
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
    this.filteredOptions = this.gameForm.get('platformInput')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.options))
    ) || new Observable<string[]>();

    this.filteredGenres = this.gameForm.get('genreInput')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.genres))
    ) || new Observable<string[]>();

    // Subscribe to title changes to fetch game image
    this.gameForm.get('title')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(title => title && title.length > 2)
    ).subscribe(title => {
      this.isSearchingImage = true;
      const releaseDate = this.gameForm.get('releaseDate')?.value;
      const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;
      
      this.igdbService.searchGame(title, year).subscribe({
        next: (result) => {
          console.log('Received search result:', result);
          if (result.imageUrl) {
            console.log('Setting form values:', {
              imageUrl: result.imageUrl,
              developer: result.developer,
              publisher: result.publisher
            });
            this.gameForm.patchValue({ 
              imageUrl: result.imageUrl,
              developer: result.developer,
              publisher: result.publisher
            }, { emitEvent: false });
            console.log('Form values after update:', this.gameForm.value);
          }
          this.isSearchingImage = false;
        },
        error: (error) => {
          console.error('Error fetching game information:', error);
          this.isSearchingImage = false;
        }
      });
    });
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => 
      option.toLowerCase().includes(filterValue)
    );
  }

  addPlatform() {
    const platformValue = this.gameForm.get('platformInput')?.value;
    if (platformValue && !this.platforms.includes(platformValue)) {
      this.platforms.push(platformValue);
    }
    this.gameForm.get('platformInput')?.setValue('');
  }

  removePlatform(platform: string) {
    this.platforms = this.platforms.filter(p => p !== platform);
  }

  addGenre() {
    const genreValue = this.gameForm.get('genreInput')?.value;
    if (genreValue && !this.selectedGenres.includes(genreValue)) {
      this.selectedGenres.push(genreValue);
    }
    this.gameForm.get('genreInput')?.setValue('');
  }

  removeGenre(genre: string) {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
  }

  onSubmit() {
    if (this.gameForm.valid && this.platforms.length > 0 && this.selectedGenres.length > 0) {
      this.isSubmitting = true;
      const newGame = {
        ...this.gameForm.value,
        platforms: this.platforms,
        genres: this.selectedGenres,
        rating: 0,
        totalRatingScore: 0,
        numRatings: 0,
        views: 0,
        releaseDate: this.gameForm.get('releaseDate')?.value.toISOString(),
        dateAdded: new Date().toISOString()
      };

      this.gameService.addGame(newGame).subscribe({
        next: () => {
          this.snackBar.open('Game added successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/games']);
        },
        error: (error) => {
          console.error('Error adding game:', error);
          this.snackBar.open('Error adding game. Please try again.', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    } else {
      let errorMessage = 'Please fill in all required fields';
      if (this.platforms.length === 0) {
        errorMessage += ' and add at least one platform';
      }
      if (this.selectedGenres.length === 0) {
        errorMessage += ' and add at least one genre';
      }
      this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.router.navigate(['/games']);
  }
}
