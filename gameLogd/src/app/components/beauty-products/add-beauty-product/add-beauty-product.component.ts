import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
  ],
  templateUrl: './add-beauty-product.component.html',
  styleUrls: ['./add-beauty-product.component.css']
})
export class AddBeautyProductComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private beautyProductService = inject(BeautyProductFirebaseService);

  beautyProductForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    imageUrl: ['', [Validators.required]],
    price: ['', [Validators.required, Validators.min(0)]],
    brand: ['', [Validators.required]],
    category: ['', [Validators.required]],
    size: ['', [Validators.required]],
    ingredients: ['', [Validators.required]],
    skinType: ['', [Validators.required]],
    benefits: ['', [Validators.required]],
    usage: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.beautyProductForm.valid) {
      const newProduct: BeautyProduct = {
        ...this.beautyProductForm.value,
        rating: 0,
        totalRatingScore: 0,
        numRatings: 0,
        sales: 0,
        releaseDate: new Date().toISOString(),
        manufacturer: '',
        distributor: ''
      };

      this.beautyProductService.addBeautyProduct(newProduct)
        .then(() => {
          this.router.navigate(['/beauty-products']);
        })
        .catch(error => {
          console.error('Error adding beauty product:', error);
        });
    }
  }
} 