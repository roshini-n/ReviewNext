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
import { GameFirebaseService } from '../../../services/gameFirebase.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-game',
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
    MatAutocompleteModule,
    RouterModule
  ],
  templateUrl: './add-game.component.html',
  styleUrl: './add-game.component.css'
})
export class AddGameComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gameService = inject(GameFirebaseService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  gameForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  platforms: string[] = [];
  selectedGenres: string[] = [];
  isSubmitting = false;

  // Available options for platforms and genres
  options: string[] = [
    "PC", "PlayStation 5", "PlayStation 4", "Xbox Series X", "Xbox One",
    "Nintendo Switch", "Mobile", "VR", "Mac", "Linux"
  ];

  genres: string[] = [
    "Action", "Adventure", "RPG", "Strategy", "Sports", "Racing",
    "Puzzle", "Horror", "Fighting", "Platformer", "Simulation", "MMO"
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
  }

  // Helper method to filter options
  private _filter(value: string, list: string[]): string[] {
    const filterValue = value.toLowerCase();
    return list.filter(option => option.toLowerCase().includes(filterValue));
  }

  // Add platform to selected platforms list
  addPlatform() {
    const platformValue = this.gameForm.get('platformInput')?.value;
    if (platformValue && !this.platforms.includes(platformValue)) {
      this.platforms.push(platformValue);
    }
    this.gameForm.get('platformInput')?.setValue('');
  }

  // Remove platform from selected platforms list
  removePlatform(platform: string) {
    this.platforms = this.platforms.filter(p => p !== platform);
  }

  // Add genre to selected genres list
  addGenre() {
    const genreValue = this.gameForm.get('genreInput')?.value;
    if (genreValue && !this.selectedGenres.includes(genreValue)) {
      this.selectedGenres.push(genreValue);
    }
    this.gameForm.get('genreInput')?.setValue('');
  }

  // Remove genre from selected genres list
  removeGenre(genre: string) {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
  }

  onCancel(): void {
    this.router.navigate(['/games']);
  }

  async sendDataToFirebase() {
    if (!this.gameForm.valid || this.selectedGenres.length === 0) {
      this.snackBar.open('Please fill in all required fields and add at least one genre', 'Close', {
        duration: 5000
      });
      return;
    }

    // Default image URL if not provided
    const finalImageUrl = this.gameForm.value.imageUrl || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

    const gameData = {
      title: this.gameForm.value.title || '',
      developer: this.gameForm.value.developer || '',
      description: this.gameForm.value.description || '',
      publisher: this.gameForm.value.publisher || '',
      releaseDate: this.gameForm.value.releaseDate || '',
      genres: this.selectedGenres,
      platforms: this.platforms,
      playersPlayed: 0,
      rating: 0,
      imageUrl: finalImageUrl,
      totalRatingScore: 0,
      numRatings: 0,
      dateAdded: new Date().toISOString()
    };

    try {
      await this.gameService.addGame(gameData);
      this.snackBar.open('Game added successfully!', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/games']);
    } catch (error) {
      console.error('Error adding game:', error);
      this.snackBar.open('Error adding game: ' + (error as Error).message, 'Close', {
        duration: 5000
      });
    }
  }
}