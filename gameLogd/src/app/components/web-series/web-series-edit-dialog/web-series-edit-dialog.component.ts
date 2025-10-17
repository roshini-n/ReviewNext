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
import { WebSeries } from '../../../models/web-series.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-web-series-edit-dialog',
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
  templateUrl: './web-series-edit-dialog.component.html',
  styleUrls: ['./web-series-edit-dialog.component.css']
})
export class WebSeriesEditDialogComponent {
  seriesForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    public dialogRef: MatDialogRef<WebSeriesEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WebSeries,
    private fb: FormBuilder
  ) {
    this.seriesForm = this.fb.group({
      title: [data.title, Validators.required],
      platform: [data.platform, Validators.required],
      description: [data.description],
      releaseDate: [data.releaseDate],
      imageUrl: [data.imageUrl],
      seasons: [data.seasons, [Validators.required, Validators.min(1)]],
      episodes: [data.episodes, [Validators.required, Validators.min(1)]],
      genres: [data.genres || []],
      cast: [data.cast || []],
      creator: [data.creator],
      language: [data.language],
      rating: [data.rating, [Validators.min(0), Validators.max(5)]],
      status: [data.status] // e.g., 'Ongoing', 'Completed', 'Cancelled'
    });
  }

  addGenre(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const genres = this.seriesForm.get('genres')?.value || [];
      genres.push(value);
      this.seriesForm.patchValue({ genres: genres });
    }
    event.chipInput!.clear();
  }

  removeGenre(genre: string): void {
    const genres = this.seriesForm.get('genres')?.value || [];
    const index = genres.indexOf(genre);
    if (index >= 0) {
      genres.splice(index, 1);
      this.seriesForm.patchValue({ genres: genres });
    }
  }

  addCastMember(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const cast = this.seriesForm.get('cast')?.value || [];
      cast.push(value);
      this.seriesForm.patchValue({ cast: cast });
    }
    event.chipInput!.clear();
  }

  removeCastMember(actor: string): void {
    const cast = this.seriesForm.get('cast')?.value || [];
    const index = cast.indexOf(actor);
    if (index >= 0) {
      cast.splice(index, 1);
      this.seriesForm.patchValue({ cast: cast });
    }
  }

  onSubmit(): void {
    if (this.seriesForm.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.seriesForm.value
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}