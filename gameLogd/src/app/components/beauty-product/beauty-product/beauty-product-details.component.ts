import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { BeautyProductFirebaseService } from '../../../services/beauty-product-firebase.service';
import { ReviewService } from '../../../services/review.service';
import { AdminConfirmDialogComponent } from '../../admin/admin-confirm-dialog/admin-confirm-dialog.component';
import { LogBeautyProductPopupComponent } from '../log-beauty-product-popup/log-beauty-product-popup.component';
import { isAdminEmail } from '../../../utils/admin-utils';
import { BeautyProduct } from '../../../models/beauty-product.model';

@Component({
  selector: 'app-beauty-product-details',
  templateUrl: './beauty-product-details.component.html',
  styleUrls: ['./beauty-product-details.component.scss']
})
export class BeautyProductDetailsComponent implements OnInit {
  product: BeautyProduct | null = null;
  productId: string | null = null;
  isLoading = true;
  error: string | null = null;
  reviews: any[] = [];

  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private beautyProductFirebaseService = inject(BeautyProductFirebaseService);
  private productReviewService = inject(ReviewService);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      if (this.productId) {
        this.loadProduct();
        this.loadReviews();
      }
    });
  }

  loadProduct(): void {
    this.beautyProductFirebaseService.getBeautyProduct(this.productId!).subscribe({
      next: (product) => {
        if (product) {
          this.product = product as any;
          this.isLoading = false;
        } else {
          this.error = 'Product not found.';
          this.isLoading = false;
        }
      },
      error: (error: Error) => {
        console.error('Error loading product:', error);
        this.error = 'Failed to load product.';
        this.isLoading = false;
      }
    });
  }

  loadReviews(): void {
    this.productReviewService.getReviewsByItemId('beauty-product', this.productId!).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error: Error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  updateProduct(updatedProduct: Partial<BeautyProduct>): void {
    this.beautyProductFirebaseService.updateBeautyProduct(this.productId!, updatedProduct as any).then(() => {
      this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
    }).catch((error: Error) => {
      console.error('Error updating product:', error);
      this.snackBar.open('Failed to update product', 'Close', { duration: 3000 });
    });
  }

  openLogPopup(): void {
    const dialogRef = this.dialog.open(LogBeautyProductPopupComponent, {
      width: '400px',
      data: { product: this.product }
    });

    dialogRef.afterClosed().subscribe();
  }

  deleteReview(review: any): void {
    const dialogRef = this.dialog.open(AdminConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to delete this review?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productReviewService.deleteReview(review.id).subscribe({
          next: () => {
            this.reviews = this.reviews.filter(r => r.id !== review.id);
            this.updateProductRating();
            this.snackBar.open('Review deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error: Error) => {
            console.error('Error deleting review:', error);
            this.snackBar.open('Failed to delete review', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  updateProductRating(): void {
    // Implement the logic to update the product rating based on the reviews
  }

  isAdmin(): boolean {
    const user = this.authService.currentUserSig();
    return isAdminEmail(user?.email);
  }
}