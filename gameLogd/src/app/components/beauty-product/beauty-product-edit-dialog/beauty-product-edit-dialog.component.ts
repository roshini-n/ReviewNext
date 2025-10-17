import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { BeautyProduct } from '../../../models/beauty-product.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-beauty-product-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './beauty-product-edit-dialog.component.html',
  styleUrls: ['./beauty-product-edit-dialog.component.css']
})
export class BeautyProductEditDialogComponent {
  productForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    public dialogRef: MatDialogRef<BeautyProductEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BeautyProduct,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: [data.name, Validators.required],
      brand: [data.brand, Validators.required],
      category: [data.category, Validators.required],
      price: [data.price, [Validators.required, Validators.min(0)]],
      description: [data.description],
      imageUrl: [data.imageUrl],
      skinConcerns: [data.skinConcerns || []],
      benefits: [data.benefits || []],
      howToUse: [data.howToUse],
      ingredients: [data.ingredients]
    });
  }

  addSkinConcern(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const concerns = this.productForm.get('skinConcerns')?.value || [];
      concerns.push(value);
      this.productForm.patchValue({ skinConcerns: concerns });
    }
    event.chipInput!.clear();
  }

  removeSkinConcern(concern: string): void {
    const concerns = this.productForm.get('skinConcerns')?.value || [];
    const index = concerns.indexOf(concern);
    if (index >= 0) {
      concerns.splice(index, 1);
      this.productForm.patchValue({ skinConcerns: concerns });
    }
  }

  addBenefit(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const benefits = this.productForm.get('benefits')?.value || [];
      benefits.push(value);
      this.productForm.patchValue({ benefits: benefits });
    }
    event.chipInput!.clear();
  }

  removeBenefit(benefit: string): void {
    const benefits = this.productForm.get('benefits')?.value || [];
    const index = benefits.indexOf(benefit);
    if (index >= 0) {
      benefits.splice(index, 1);
      this.productForm.patchValue({ benefits: benefits });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.productForm.value
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}