import { Component, inject } from '@angular/core';
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
    MatNativeDateModule
  ],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css'
})
export class AddBookComponent {
  private fb = inject(FormBuilder);
  private bookService = inject(BookFirebaseService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  bookForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  genres: string[] = [];
  isSubmitting = false;

  constructor() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      author: ['', [Validators.required, Validators.minLength(1)]],
      publisher: ['', [Validators.required, Validators.minLength(1)]],
      publicationDate: ['', Validators.required],
      pages: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.*')]]
    });
  }

  addGenre(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.genres.push(value);
    }
    event.chipInput!.clear();
  }

  removeGenre(genre: string): void {
    const index = this.genres.indexOf(genre);
    if (index >= 0) {
      this.genres.splice(index, 1);
    }
  }

  onCancel(): void {
    this.router.navigate(['/books']);
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    console.log('Form submitted', this.bookForm.value);
    console.log('Genres:', this.genres);
    console.log('Form valid:', this.bookForm.valid);

    if (this.bookForm.valid && this.genres.length > 0) {
      this.isSubmitting = true;
      try {
        const bookData = {
          ...this.bookForm.value,
          genres: this.genres,
          readersRead: 0,
          rating: 0,
          totalRatingScore: 0,
          numRatings: 0,
          dateAdded: new Date().toISOString()
        };

        console.log('Submitting book data:', bookData);

        await this.bookService.addBook(bookData);
        console.log('Book added successfully');
        
        this.snackBar.open('Book added successfully!', 'Close', {
          duration: 3000
        });
        
        this.router.navigate(['/books']);
      } catch (error) {
        console.error('Error adding book:', error);
        this.snackBar.open('Error adding book: ' + (error as Error).message, 'Close', {
          duration: 5000
        });
      } finally {
        this.isSubmitting = false;
      }
    } else {
      let errorMessage = 'Please fix the following issues:\n';
      if (!this.bookForm.valid) {
        Object.keys(this.bookForm.controls).forEach(key => {
          const control = this.bookForm.get(key);
          if (control?.errors) {
            errorMessage += `- ${key}: ${Object.keys(control.errors).join(', ')}\n`;
          }
        });
      }
      if (this.genres.length === 0) {
        errorMessage += '- Add at least one genre\n';
      }
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000
      });
    }
  }
}