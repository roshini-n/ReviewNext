import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Game } from '../../../models/game.model';

@Component({
  selector: 'app-game-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Game Details</h2>
    <mat-dialog-content>
      <form [formGroup]="editForm">
        <mat-form-field class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Publisher</mat-label>
          <input matInput formControlName="publisher">
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Release Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="releaseDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!editForm.valid">
        Save Changes
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class GameEditDialogComponent implements OnInit {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GameEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Game
  ) {
    this.editForm = this.fb.group({
      description: ['', Validators.required],
      publisher: ['', Validators.required],
      releaseDate: [null, Validators.required]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.editForm.patchValue({
        description: this.data.description,
        publisher: this.data.publisher,
        releaseDate: new Date(this.data.releaseDate)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const updatedGame = {
        ...this.data,
        ...this.editForm.value,
        releaseDate: this.editForm.value.releaseDate.toISOString()
      };
      this.dialogRef.close(updatedGame);
    }
  }
} 