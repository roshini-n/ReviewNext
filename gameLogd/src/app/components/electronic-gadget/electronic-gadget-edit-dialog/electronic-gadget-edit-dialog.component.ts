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
import { ElectronicGadget } from '../../../models/electronic-gadget.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-electronic-gadget-edit-dialog',
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
  templateUrl: './electronic-gadget-edit-dialog.component.html',
  styleUrls: ['./electronic-gadget-edit-dialog.component.css']
})
export class ElectronicGadgetEditDialogComponent {
  gadgetForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    public dialogRef: MatDialogRef<ElectronicGadgetEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ElectronicGadget,
    private fb: FormBuilder
  ) {
    this.gadgetForm = this.fb.group({
      name: [data.name, Validators.required],
      brand: [data.brand, Validators.required],
      price: [data.price, [Validators.required, Validators.min(0)]],
      description: [data.description],
      category: [data.category, Validators.required],
      releaseDate: [data.releaseDate],
      features: [data.features || []],
      specifications: [data.specifications || []],
      imageUrl: [data.imageUrl],
      availability: [data.availability], // e.g., 'In Stock', 'Out of Stock'
      rating: [data.rating, [Validators.min(0), Validators.max(5)]],
      warranty: [data.warranty], // e.g., '1 year', '2 years'
      color: [data.color],
      model: [data.model]
    });
  }

  addFeature(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const features = this.gadgetForm.get('features')?.value || [];
      features.push(value);
      this.gadgetForm.patchValue({ features: features });
    }
    event.chipInput!.clear();
  }

  removeFeature(feature: string): void {
    const features = this.gadgetForm.get('features')?.value || [];
    const index = features.indexOf(feature);
    if (index >= 0) {
      features.splice(index, 1);
      this.gadgetForm.patchValue({ features: features });
    }
  }

  addSpecification(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const specifications = this.gadgetForm.get('specifications')?.value || [];
      specifications.push(value);
      this.gadgetForm.patchValue({ specifications: specifications });
    }
    event.chipInput!.clear();
  }

  removeSpecification(spec: string): void {
    const specifications = this.gadgetForm.get('specifications')?.value || [];
    const index = specifications.indexOf(spec);
    if (index >= 0) {
      specifications.splice(index, 1);
      this.gadgetForm.patchValue({ specifications: specifications });
    }
  }

  onSubmit(): void {
    if (this.gadgetForm.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.gadgetForm.value
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}