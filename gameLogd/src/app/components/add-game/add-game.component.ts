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
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
    MatAutocompleteModule
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
    "NES", "SNES", "N64", "PS", "PS2", "PS3", "PS4", "PS5",
    "Xbox", "Xbox 360", "Xbox One", "Xbox Series X|S", "PC", "Switch", "Wii", 
    "Wii U", "Gamecube", "Gameboy", "Gameboy Color", "Gameboy Advance", 
    "DS", "3DS", "PSP", "PS Vita", "Mobile", "Other"
  ];
  
  genres: string[] = [
    "Action", "Adventure", "RPG", "Shooter", "Horror", "Platformer", 
    "Puzzle", "Fighting", "Racing", "Strategy", "Simulation", "Sports", 
    "Looter Shooter", "MMO", "Roguelike", "Metroidvania", "Visual Novel"
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

  async sendDataToFirebase() {
    if (!this.gameForm.valid) {
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
    const finalImageUrl = this.gameForm.value.imageUrl || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

    try {
      await this.gameService.addGame(
        this.gameForm.value.title || '',
        this.platforms,
        this.gameForm.value.developer || '',
        this.gameForm.value.description || '',
        this.gameForm.value.releaseDate || '',
        this.gameForm.value.publisher || '',
        this.selectedGenres,
        finalImageUrl,
        0, // rating
        0, // numRatings
        0  // totalRatingScore
      ).toPromise();

      this.snackBar.open('Game added successfully!', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/games']);
    } catch (error: unknown) {
      console.error('Error adding game:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      this.snackBar.open('Error adding game: ' + errorMessage, 'Close', {
        duration: 5000
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/games']);
  }
}
