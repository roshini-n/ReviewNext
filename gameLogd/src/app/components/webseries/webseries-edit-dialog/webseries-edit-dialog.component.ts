import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';
import { WebSeries } from '../../../models/web-series.model';

@Component({
  selector: 'app-webseries-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './webseries-edit-dialog.component.html',
  styleUrls: ['./webseries-edit-dialog.component.css']
})
export class WebSeriesEditDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private webSeriesService = inject(WebSeriesFirebaseService);
  private snackBar = inject(MatSnackBar);

  webSeriesForm: FormGroup;
  isSubmitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: WebSeries,
    private dialogRef: MatDialogRef<WebSeriesEditDialogComponent>
  ) {
    this.webSeriesForm = this.fb.group({
      title: [this.data.title, Validators.required],
      creator: [this.data.creator, Validators.required],
      description: [this.data.description, Validators.required],
      platform: [this.data.network, Validators.required],
      imageUrl: [this.data.imageUrl, Validators.required],
      episodes: [this.data.episodes],
      releaseYear: [this.data.releaseDate, [
        Validators.required, 
        Validators.min(1900), 
        Validators.max(new Date().getFullYear())
      ]],
      status: [this.data.status, Validators.required],
      seasons: [this.data.seasons, Validators.required],
      genres: [this.data.genres]
    });
  }

  ngOnInit(): void {
    // Form is already initialized with data in constructor
  }

  onSubmit(): void {
    if (!this.webSeriesForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const webSeriesData = {
      ...this.data,
      ...this.webSeriesForm.value,
      network: this.webSeriesForm.value.platform // Map platform to network
    };

    this.webSeriesService.updateWebSeries(this.data.id!, webSeriesData)
      .then(() => {
        this.snackBar.open('Web series updated successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      })
      .catch((error: Error) => {
        console.error('Error updating web series:', error);
        this.snackBar.open('Error updating web series. Please try again.', 'Close', { duration: 3000 });
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}