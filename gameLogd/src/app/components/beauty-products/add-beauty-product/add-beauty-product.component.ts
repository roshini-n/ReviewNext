import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { BeautyProductFirebaseService } from '../../../services/beautyProductFirebase.service';
import { BeautyProductsApiService } from '../../../services/beauty-products-api.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-add-beauty-product',
  templateUrl: './add-beauty-product.component.html',
  styleUrls: ['./add-beauty-product.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class AddBeautyProductComponent implements OnInit {
  beautyProductForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private beautyProductService: BeautyProductFirebaseService,
    private beautyProductsApi: BeautyProductsApiService
  ) {
    this.beautyProductForm = this.fb.group({
      title: ['', Validators.required],
      brand: ['', Validators.required],
      description: ['', Validators.required], // ✅ user enters manually
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],   // ✅ auto-filled from API
      benefits: [''],
      usageInstructions: ['']                // ✅ auto-filled from API
    });
  }

  ngOnInit(): void {
    // Listen for title and brand changes
    const title$ = this.beautyProductForm.get('title')!.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    );

    const brand$ = this.beautyProductForm.get('brand')!.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    );

    // Re-run search when either field changes
    title$.pipe(switchMap(() => this.searchProduct())).subscribe();
    brand$.pipe(switchMap(() => this.searchProduct())).subscribe();
  }

  private searchProduct() {
    const title = this.beautyProductForm.get('title')?.value;
    const brand = this.beautyProductForm.get('brand')?.value;

    if (title && brand) {
      return this.beautyProductsApi.searchProduct(title, brand).pipe(
        switchMap(result => {
          if (result) {
            this.beautyProductForm.patchValue(
              {
                imageUrl: result.imageUrl || '',
                usageInstructions: result.usageInstructions || ''
                // ❌ no description patching, user types it manually
              },
              { emitEvent: false }
            );
          }
          return of(null); // always return observable
        })
      );
    }

    return of(null);
  }

  onSubmit(): void {
    console.log('onSubmit called');
    console.log('Form valid:', this.beautyProductForm.valid);
    console.log('Form value:', this.beautyProductForm.value);
    console.log('Form errors:', this.getFormValidationErrors());
    
    if (this.beautyProductForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      console.log('Starting submission...');

      const beautyProductData = {
        ...this.beautyProductForm.value,
        createdAt: new Date()
      };

      console.log('Beauty product data to save:', beautyProductData);

      this.beautyProductService.addBeautyProduct(beautyProductData)
        .then((docRef) => {
          console.log('Beauty product added successfully with ID:', docRef.id);
          this.router.navigate(['/beauty-products']);
        })
        .catch((error: Error) => {
          console.error('Error adding beauty product:', error);
          console.error('Error details:', error.message);
          alert('Failed to add beauty product: ' + error.message);
          this.isSubmitting = false;
        });
    } else {
      console.log('Form is invalid or already submitting');
      if (!this.beautyProductForm.valid) {
        console.log('Invalid fields:', this.getFormValidationErrors());
        alert('Please fill in all required fields');
      }
    }
  }

  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.beautyProductForm.controls).forEach(key => {
      const controlErrors = this.beautyProductForm.get(key)?.errors;
      if (controlErrors) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  onCancel(): void {
    this.router.navigate(['/beauty-products']);
  }
}
