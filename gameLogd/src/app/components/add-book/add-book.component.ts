import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BookFirebaseService } from '../../services/bookFirebase.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatAutocompleteModule],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css'
})
export class AddBookComponent implements OnInit {
  bookFirebaseService = inject(BookFirebaseService);

  // Book form group to collect input data
  bookForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    platformInput: new FormControl(''),
    genreInput: new FormControl(''),
    releaseDate: new FormControl(''),
    author: new FormControl(''),
    publisher: new FormControl(''),
    imageUrl: new FormControl('')
  });

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

  // Arrays to hold selected platforms and genres
  platforms: string[] = [];
  selectedGenres: string[] = [];

  ngOnInit() {
    // Filter options for platforms and genres
    this.filteredOptions = this.bookForm.controls.platformInput.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.options))
    );

    this.filteredGenres = this.bookForm.controls.genreInput.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.genres))
    );
  }

  // Helper method to filter options
  private _filter(value: string, list: string[]): string[] {
    const filterValue = value.toLowerCase();
    return list.filter(option => option.toLowerCase().includes(filterValue));
  }

  // Add platform to selected platforms list
  addPlatform() {
    const platformValue = this.bookForm.controls.platformInput.value;
    if (platformValue && !this.platforms.includes(platformValue)) {
      this.platforms.push(platformValue);
    }
    this.bookForm.controls.platformInput.setValue('');
  }

  // Remove platform from selected platforms list
  removePlatform(platform: string) {
    this.platforms = this.platforms.filter(p => p !== platform);
  }

  // Add genre to selected genres list
  addGenre() {
    const genreValue = this.bookForm.controls.genreInput.value;
    if (genreValue && !this.selectedGenres.includes(genreValue)) {
      this.selectedGenres.push(genreValue);
    }
    this.bookForm.controls.genreInput.setValue('');
  }

  // Remove genre from selected genres list
  removeGenre(genre: string) {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
  }

  // Send book data to Firebase
  sendDataToFirebase() {
    if (!this.bookForm.valid) {
      alert("Please fill in all required fields");
      return;
    }

    // Default image URL if not provided
    const finalImageUrl = this.bookForm.value.imageUrl || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

    // Call addBook from BookFirebaseService
    this.bookFirebaseService.addBook(
      this.bookForm.value.title || '',
      this.platforms,
      this.bookForm.value.author || '',
      this.bookForm.value.description || '',
      this.bookForm.value.releaseDate || '',
      this.bookForm.value.publisher || '',
      this.selectedGenres,
      finalImageUrl,
      0,  // Rating initially set to 0
      0,  // Number of Ratings initially set to 0
      0   // Total Rating Score initially set to 0
    ).subscribe((response) => {
      console.log('Book added with ID: ', response);
    });

    // Reset form and selected items
    this.bookForm.reset();
    this.platforms = [];
    this.selectedGenres = [];
    alert("Book has been added!");
  }
}
