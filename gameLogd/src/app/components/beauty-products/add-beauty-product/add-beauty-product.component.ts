import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BeautyProductFirebaseService } from '../../../services/beautyProductFirebase.service';
import { BeautyProduct } from '../../../models/beauty-product.model';

@Component({
  selector: 'app-add-beauty-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-beauty-product.component.html',
  styleUrls: ['./add-beauty-product.component.css']
})
export class AddBeautyProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private beautyProductService = inject(BeautyProductFirebaseService);

  beautyProductForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.beautyProductForm = this.fb.group({
      title: ['', Validators.required],
      brand: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      benefits: [''],
      usageInstructions: ['']
    });
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  onSubmit(): void {
    if (this.beautyProductForm.valid) {
      const beautyProductData = this.beautyProductForm.value;
      this.beautyProductService.addBeautyProduct(beautyProductData)
        .then(() => {
          this.router.navigate(['/beauty-products']);
        })
        .catch((error: Error) => {
          console.error('Error adding beauty product:', error);
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/beauty-products']);
  }
} 