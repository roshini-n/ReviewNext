import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatAutocompleteModule],
  templateUrl: './add-game.component.html',
  styleUrl: './add-game.component.css'
})
export class AddGameComponent implements OnInit {
  gameFirebaseService = inject(GameFirebaseService);

  gameForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    platformInput: new FormControl(''),
    genreInput: new FormControl(''),
    releaseDate: new FormControl(''),
    developer: new FormControl(''),
    publisher: new FormControl(''),
    imageUrl: new FormControl('')
  });

  options: string[] = [
    "NES", "SNES", "N64", "PS", "PS2", "PS3", "PS4",
    "Xbox", "Xbox 360", "Xbox One", "PC", "Switch", "Wii", 
    "Wii U", "Gamecube", "Gameboy", "Gameboy Color", "Gameboy Advance", 
    "DS", "3DS", "PSP", "PS Vita", "Mobile", "Other"
  ];
  
  genres: string[] = [
    "Action", "Adventure", "RPG", "Shooter", "Horror", "Platformer", 
    "Puzzle", "Fighting", "Racing", "Strategy", "Simulation", "Sports", "Looter Shooter", "MMO"
  ];

  filteredOptions!: Observable<string[]>;
  filteredGenres!: Observable<string[]>;

  platforms: string[] = [];
  selectedGenres: string[] = [];

  ngOnInit() {
    this.filteredOptions = this.gameForm.controls.platformInput.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.options))
    );

    this.filteredGenres = this.gameForm.controls.genreInput.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.genres))
    );
  }

  private _filter(value: string, list: string[]): string[] {
    const filterValue = value.toLowerCase();
    return list.filter(option => option.toLowerCase().includes(filterValue));
  }

  addPlatform() {
    const platformValue = this.gameForm.controls.platformInput.value;
    if (platformValue && !this.platforms.includes(platformValue)) {
      this.platforms.push(platformValue);
    }
    this.gameForm.controls.platformInput.setValue('');
  }

  removePlatform(platform: string) {
    this.platforms = this.platforms.filter(p => p !== platform);
  }

  addGenre() {
    const genreValue = this.gameForm.controls.genreInput.value;
    if (genreValue && !this.selectedGenres.includes(genreValue)) {
      this.selectedGenres.push(genreValue);
    }
    this.gameForm.controls.genreInput.setValue('');
  }

  removeGenre(genre: string) {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
  }

  sendDataToFirebase() {
    if (!this.gameForm.valid) {
      alert("Please fill in all required fields");
      return;
    }
    
    const finalImageUrl = this.gameForm.value.imageUrl || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

    this.gameFirebaseService.addGame(
      this.gameForm.value.title || '',
      this.platforms,
      this.gameForm.value.developer || '',
      this.gameForm.value.description || '',
      this.gameForm.value.releaseDate || '',
      this.gameForm.value.publisher || '',
      this.selectedGenres,
      finalImageUrl,
      0,
      0,
      0
    );

    this.gameForm.reset();
    this.platforms = [];
    this.selectedGenres = [];
    
    alert("Game has been added!");
  }
}
