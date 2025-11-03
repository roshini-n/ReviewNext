import { Component, inject, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { BeautyProduct } from '../../models/beauty-product.model';
import { BeautyProductLogService, BeautyProductLog } from '../../services/beautyProductLog.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BeautyProductReviewService } from '../../services/beautyProductReview.service';
import { Review } from '../../models/review.model';
import { firstValueFrom } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-log-beauty-product-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './log-beauty-product-popup.component.html',
  styleUrl: './log-beauty-product-popup.component.css',
})
export class LogBeautyProductPopupComponent implements OnInit {
  productLogService = inject(BeautyProductLogService);
  authService = inject(AuthService);
  productReviewService = inject(BeautyProductReviewService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  @Output() logUpdated: EventEmitter<void> = new EventEmitter<void>();
  @Output() reviewUpdated = new EventEmitter<Review>();

  logForm: FormGroup;
  hoverRating: number = 0;
  productId: string = '';
  username: string = '';
  isLoading = false;
  errorMessage = '';
  userId: string | null = null;
  isEditMode = false;
  existingReview: Review | null = null;

  ratingTexts: string[] = ['Not rated', 'Awful', 'Poor', 'Ok', 'Good', 'Great'];

  constructor(
    public dialogRef: MatDialogRef<LogBeautyProductPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: BeautyProduct, productId?: string, review?: Review },
    private snackBar: MatSnackBar
  ) {
    this.logForm = this.fb.group({
      dateAdded: [new Date(), Validators.required],
      dateOpened: [''],
      rating: [0, [Validators.min(0), Validators.max(5)]],
      review: ['', Validators.maxLength(500)],
      status: ['using', Validators.required],
      purchasePrice: [''],
      purchaseLocation: [''],
      skinType: ['normal']
    });

    if (data.review) {
      this.isEditMode = true;
      this.existingReview = data.review;
      this.logForm.patchValue({
        dateAdded: data.review.datePosted,
        dateOpened: data.review.lastUpdated || data.review.datePosted,
        rating: data.review.rating,
        review: data.review.reviewText,
        status: 'using'
      });
    }

    this.productId = data.productId || data.product.id || '';
  }

  async ngOnInit() {
    this.userId = await this.authService.getUid();
    this.username = this.authService.getUsername() || 'Anonymous';
    
    // Debug logging
    console.log('Product popup initialized with data:', {
      product: this.data.product,
      productId: this.productId,
      productTitle: (this.data.product as any)?.title,
      productName: this.data.product?.name
    });
  }

  setRating(rating: number) {
    this.logForm.patchValue({ rating });
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }

  async onSubmitClick(): Promise<void> {
    const currentUser = await this.authService.getUid();
    if (!currentUser) {
      this.snackBar.open('You must be logged in to log a product', 'Close', {
        duration: 2000,
      });
      return;
    }

    if (this.logForm.valid) {
      this.isLoading = true;
      const formData = this.logForm.value;

      try {
        // 1. Build the log object
        const logData: any = {
          userId: currentUser,
          productId: this.productId,
          dateAdded: formData.dateAdded instanceof Date ? formData.dateAdded : new Date(formData.dateAdded),
          rating: formData.rating,
          review: formData.review,
          status: formData.status,
          skinType: formData.skinType
        };
        
        // Add optional fields only if they have values
        if (formData.dateOpened) {
          logData.dateOpened = formData.dateOpened instanceof Date ? formData.dateOpened : new Date(formData.dateOpened);
        }
        if (formData.purchasePrice) {
          logData.purchasePrice = formData.purchasePrice;
        }
        if (formData.purchaseLocation) {
          logData.purchaseLocation = formData.purchaseLocation;
        }

        // 2. Save the log
        await firstValueFrom(this.productLogService.addProductLog(logData));

        // 3. Save the review using BeautyProductReviewService (only if rating or review text exists)
        const hasReviewContent = formData.rating > 0 || (formData.review && formData.review.trim().length > 0);
        
        let savedReview: Review | null = null;
        if (hasReviewContent) {
          // Build review data with only defined values
          const reviewData: any = {
            userId: currentUser,
            productId: this.productId,
            rating: formData.rating || 0,
            reviewText: formData.review || '',
            datePosted: Timestamp.now(),
            username: this.username,
            likes: 0
          };
          
          // Only add productTitle if we have the product data (try title first, then name)
          const productTitle = (this.data.product as any)?.title || this.data.product?.name;
          if (productTitle) {
            reviewData.productTitle = productTitle;
          }
          
          console.log('Saving review with data:', reviewData);

          if (this.isEditMode && this.existingReview) {
            savedReview = await firstValueFrom(
              this.productReviewService.updateReview(this.existingReview.id, {
                rating: formData.rating,
                reviewText: formData.review,
                lastUpdated: Timestamp.now() as any
              })
            );
          } else {
            savedReview = await firstValueFrom(this.productReviewService.addReview(reviewData));
          }
        }

        // 4. Emit events and close dialog
        this.logUpdated.emit();
        if (savedReview) {
          this.reviewUpdated.emit(savedReview);
        }
        this.dialogRef.close(savedReview);

        this.snackBar.open('Product log and review saved successfully', 'Close', {
          duration: 3000
        });
      } catch (error: any) {
        console.error('Error saving product log:', error);
        const errorMessage = error?.message || 'Failed to save product log';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
          duration: 5000
        });
      } finally {
        this.isLoading = false;
      }
    }
  }

  onCancelClick() {
    this.dialogRef.close();
  }
}
