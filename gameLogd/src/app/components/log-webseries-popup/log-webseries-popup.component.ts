// filepath: src/app/components/log-webseries-popup/log-webseries-popup.component.ts
import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-log-webseries-popup',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule, ReactiveFormsModule],
  template: `
  <h2 mat-dialog-title>Log Web Series</h2>
  <div mat-dialog-content>
    <form [formGroup]="form">
      <label>Review</label>
      <textarea formControlName="reviewText"></textarea>
      <label>Rating</label>
      <input type="number" formControlName="rating" min="1" max="5" />
    </form>
  </div>
  <div mat-dialog-actions align="end">
    <button mat-button (click)="close()">Cancel</button>
    <button mat-raised-button color="primary" (click)="save()">Save</button>
  </div>
  `
})
export class LogWebSeriesPopupComponent {
  @Output() reviewUpdated = new EventEmitter<any>();
  form: FormGroup;
  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<LogWebSeriesPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({ reviewText: [''], rating: [0] });
  }
  save() { this.reviewUpdated.emit(this.form.value); this.dialogRef.close(this.form.value); }
  close() { this.dialogRef.close(); }
}
