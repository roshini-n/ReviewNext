// filepath: src/app/components/webseries/webseries-edit-dialog/webseries-edit-dialog.component.ts
import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-webseries-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule, ReactiveFormsModule],
  template: `
  <h2 mat-dialog-title>Edit Web Series</h2>
  <div mat-dialog-content>
    <form [formGroup]="form">
      <label>Title</label>
      <input formControlName="title" />
    </form>
  </div>
  <div mat-dialog-actions align="end">
    <button mat-button (click)="close()">Cancel</button>
    <button mat-raised-button color="primary" (click)="save()">Save</button>
  </div>
  `
})
export class WebSeriesEditDialogComponent {
  @Output() saved = new EventEmitter<any>();
  form: FormGroup;
  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<WebSeriesEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({ title: [data?.title || ''] });
  }
  save() { this.saved.emit(this.form.value); this.dialogRef.close(this.form.value); }
  close() { this.dialogRef.close(); }
}
