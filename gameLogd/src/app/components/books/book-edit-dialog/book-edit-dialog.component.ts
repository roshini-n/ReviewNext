import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Book } from '../../../models/book.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-book-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './book-edit-dialog.component.html',
  styleUrls: ['./book-edit-dialog.component.css']
})
export class BookEditDialogComponent {
  bookForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    public dialogRef: MatDialogRef<BookEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Book,
    private fb: FormBuilder
  ) {
    this.bookForm = this.fb.group({
      title: [data.title, Validators.required],
      author: [data.author, Validators.required],
      publisher: [data.publisher],
      publicationDate: [data.publicationDate],
      description: [data.description],
      imageUrl: [data.imageUrl],
      genres: [data.genres || []],
      isbn: [data.isbn],
      pageCount: [data.pageCount],
      language: [data.language]
    });
  }

  addGenre(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const genres = this.bookForm.get('genres')?.value || [];
      genres.push(value);
      this.bookForm.patchValue({ genres });
    }
    event.chipInput!.clear();
  }

  removeGenre(genre: string): void {
    const genres = this.bookForm.get('genres')?.value || [];
    const index = genres.indexOf(genre);
    if (index >= 0) {
      genres.splice(index, 1);
      this.bookForm.patchValue({ genres });
    }
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.bookForm.value
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 