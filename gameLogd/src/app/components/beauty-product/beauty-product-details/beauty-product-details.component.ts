import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { GeneralDeleteButtonComponent } from '../../shared/general-delete-button/general-delete-button.component';
import { AuthService } from '../../../services/auth.service';
import { Review } from '../../../models/review.model';
import { BeautyProductFirebaseService } from '../../../services/beautyProductFirebase.service';
import { BeautyProduct } from '../../../models/beauty-product.model';
import { Firestore, collection, query, where, orderBy, collectionData } from '@angular/fire/firestore';
import { BeautyProductEditDialogComponent } from '../beauty-product-edit-dialog/beauty-product-edit-dialog.component';

@Component({
  selector: 'app-beauty-product-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    GeneralDeleteButtonComponent,
    BeautyProductEditDialogComponent
  ],
  templateUrl: './beauty-product-details.component.html',
  styleUrls: ['./beauty-product-details.component.css']
})
export class BeautyProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  public authService = inject(AuthService);
  private beautyProductFirebaseService = inject(BeautyProductFirebaseService);
  private firestore = inject(Firestore);

  product?: BeautyProduct;
  reviews: Review[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  productId: string | null = null;

  async ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = await this.authService.getUid();

    if (this.productId) {
      this.loadProductDetails();
      this.getReviews();
    }
  }

  private loadProductDetails() {
    if (!this.productId) return;
    
    this.isLoading = true;
    this.beautyProductFirebaseService.getBeautyProductById(this.productId).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.isLoading = false;
        } else {
          this.error = 'Product not found.';
          this.isLoading = false;
        }
      },
      error: (error: Error) => {
        this.error = 'Failed to load product details. Please try again later.';
        this.isLoading = false;
        console.error('Error loading product:', error);
      }
    });
  }

  private getReviews() {
    if (!this.productId) return;

    const reviewsQuery = query(
      collection(this.firestore, 'reviews'),
      where('productId', '==', this.productId),
      orderBy('datePosted', 'desc')
    );
    
    collectionData(reviewsQuery, { idField: 'id' }).subscribe({
      next: (reviews) => {
        this.reviews = reviews as Review[];
      },
      error: (error: Error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  onEditProduct() {
    if (!this.product || !this.productId) return;

    const dialogRef = this.dialog.open(BeautyProductEditDialogComponent, {
      width: '600px',
      data: { ...this.product }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          await this.beautyProductFirebaseService.updateBeautyProduct(this.productId!, result);
          this.product = result;
          this.snackBar.open('Product updated successfully', 'Close', {
            duration: 3000
          });
        } catch (error) {
          console.error('Error updating product:', error);
          this.snackBar.open('Failed to update product', 'Close', {
            duration: 3000
          });
        }
      }
    });
  }

  onTabChange(index: number) {
    // Handle tab change if needed
  }

  openLogProductPopup() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add products to your collection', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.product || !this.productId) return;

    // TODO: Implement collection popup dialog
    // const dialogRef = this.dialog.open(LogProductPopupComponent, {
    //   maxWidth: '550px',
    //   width: '95vw',
    //   panelClass: ['product-log-dialog', 'minimal-theme-dialog'],
    //   autoFocus: false,
    //   backdropClass: 'minimal-backdrop',
    //   data: {
    //     product: this.product,
    //     productId: this.productId
    //   }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     // Handle after adding to collection
    //     this.snackBar.open('Product added to your collection', 'Close', {
    //       duration: 3000
    //     });
    //   }
    // });
  }
}