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
import { Movie } from '../../../models/movie.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-movie-edit-dialog',
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
  templateUrl: './movie-edit-dialog.component.html',
  styleUrls: ['./movie-edit-dialog.component.css']
})
export class MovieEditDialogComponent {
  movieForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    public dialogRef: MatDialogRef<MovieEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Movie,
    private fb: FormBuilder
  ) {
    this.movieForm = this.fb.group({
      title: [data.title, Validators.required],
      director: [data.director, Validators.required],
      description: [data.description],
      releaseDate: [data.releaseDate],
      duration: [data.duration],
      genres: [data.genres || []],
      cast: [data.cast || []],
      imageUrl: [data.imageUrl],
      language: [data.language],
      rating: [data.rating, [Validators.min(0), Validators.max(5)]]
    });
  }

  addGenre(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const genres = this.movieForm.get('genres')?.value || [];
      genres.push(value);
      this.movieForm.patchValue({ genres: genres });
    }
    event.chipInput!.clear();
  }

  removeGenre(genre: string): void {
    const genres = this.movieForm.get('genres')?.value || [];
    const index = genres.indexOf(genre);
    if (index >= 0) {
      genres.splice(index, 1);
      this.movieForm.patchValue({ genres: genres });
    }
  }

  addCastMember(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const cast = this.movieForm.get('cast')?.value || [];
      cast.push(value);
      this.movieForm.patchValue({ cast: cast });
    }
    event.chipInput!.clear();
  }

  removeCastMember(actor: string): void {
    const cast = this.movieForm.get('cast')?.value || [];
    const index = cast.indexOf(actor);
    if (index >= 0) {
      cast.splice(index, 1);
      this.movieForm.patchValue({ cast: cast });
    }
  }

  onSubmit(): void {
    if (this.movieForm.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.movieForm.value
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}