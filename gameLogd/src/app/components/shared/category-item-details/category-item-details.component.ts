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
import { AuthService } from '../../../services/auth.service';
import { ReviewService } from '../../../services/review.service';
import { AdminService } from '../../../services/admin.service';
import { CategoryService } from '../../../services/category.service';
import { Review } from '../../../models/review.model';
import { Category, CategoryItem } from '../../../models/category.model';
import { LogGamePopupComponent } from '../../log-game-popup/log-game-popup.component';
import { UniversalLogPopupComponent } from '../universal-log-popup/universal-log-popup.component';

@Component({
  selector: 'app-category-item-details',
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
    MatAutocompleteModule
  ],
  template: `
    <div class="loading-container" *ngIf="isLoading">
      <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
      <p>Loading...</p>
    </div>

    <div class="error-container" *ngIf="error && !isLoading">
      <mat-icon color="warn">error</mat-icon>
      <p>{{ error }}</p>
      <button mat-raised-button color="primary" (click)="goBack()">Go Back</button>
    </div>

    <div class="item-details-container" *ngIf="!isLoading && !error && item">
      <div class="item-header">
        <div class="item-image">
          <img [src]="item.imageUrl" [alt]="item.title" class="item-cover" onerror="this.src='assets/default-image.png'">
        </div>
        <div class="item-info">
          <h1>{{ item.title }}</h1>
          <div class="item-meta">
            <p><strong>Description:</strong> {{ item.description }}</p>
            <div *ngFor="let field of customFieldsDisplay" class="custom-field">
              <p><strong>{{ field.label }}:</strong> 
                <span [ngSwitch]="field.type">
                  <span *ngSwitchCase="'date'">{{ field.value | date }}</span>
                  <span *ngSwitchCase="'url'">
                    <a [href]="field.value" target="_blank" *ngIf="field.value">{{ field.value }}</a>
                  </span>
                  <span *ngSwitchCase="'array'">
                    <mat-chip-listbox>
                      <mat-chip *ngFor="let item of field.value">{{ item }}</mat-chip>
                    </mat-chip-listbox>
                  </span>
                  <span *ngSwitchCase="'boolean'">{{ field.value ? 'Yes' : 'No' }}</span>
                  <span *ngSwitchDefault>{{ field.value }}</span>
                </span>
              </p>
            </div>
            <p><strong>Rating:</strong> {{ item.rating | number:'1.1-1' }} ({{ item.numRatings }} ratings)</p>
          </div>
          
          @if (authService.currentUserSig()) {
          <div class="item-actions">
            <button mat-raised-button color="primary" (click)="openLogDialog()">
              <mat-icon>add</mat-icon>
              Add to Log
            </button>
            <button mat-raised-button color="accent" (click)="openReviewDialog()" [disabled]="hasUserReviewed">
              <mat-icon>rate_review</mat-icon>
              {{ hasUserReviewed ? 'Already Reviewed' : 'Write Review' }}
            </button>
            <button mat-raised-button color="warn" (click)="onEditItem()" *ngIf="canUserEdit">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
          </div>
          }
        </div>
      </div>

      <mat-tab-group (selectedTabChange)="onTabChange($event.index)">
        <mat-tab label="Details">
          <div class="tab-content description-content">
            <h3>About {{ item.title }}</h3>
            <p>{{ item.description }}</p>
            
            <h4>Additional Information</h4>
            <div class="details-grid">
              <div *ngFor="let field of customFieldsDisplay" class="detail-item">
                <label>{{ field.label }}:</label>
                <span [ngSwitch]="field.type">
                  <span *ngSwitchCase="'date'">{{ field.value | date:'medium' }}</span>
                  <span *ngSwitchCase="'url'">
                    <a [href]="field.value" target="_blank" *ngIf="field.value">{{ field.value }}</a>
                  </span>
                  <span *ngSwitchCase="'array'">
                    <mat-chip-listbox>
                      <mat-chip *ngFor="let arrayItem of field.value">{{ arrayItem }}</mat-chip>
                    </mat-chip-listbox>
                  </span>
                  <span *ngSwitchCase="'boolean'">{{ field.value ? 'Yes' : 'No' }}</span>
                  <span *ngSwitchDefault>{{ field.value }}</span>
                </span>
              </div>
            </div>
          </div>
        </mat-tab>
        
        <mat-tab label="Reviews" (click)="loadReviews()">
          <div class="tab-content reviews-content">
            @if (authService.currentUserSig() && !hasUserReviewed) {
            <div class="add-review-section">
              <button mat-raised-button color="primary" (click)="openReviewDialog()">
                <mat-icon>rate_review</mat-icon>
                Write a Review
              </button>
            </div>
            }
            
            <div *ngIf="reviews.length === 0" class="no-reviews">
              No reviews yet. Be the first to review this {{ category?.name?.toLowerCase() || 'item' }}!
            </div>
            
            <div *ngFor="let review of reviews" class="review-item">
              <mat-card>
                <mat-card-header>
                  <div mat-card-avatar class="review-avatar">
                    <mat-icon>person</mat-icon>
                  </div>
                  <mat-card-title>{{ review.username || 'Anonymous' }}</mat-card-title>
                  <mat-card-subtitle>
                    Rating: {{ review.rating }}/5 • {{ review.datePosted | date:'medium' }}
                  </mat-card-subtitle>
                  @if (isAdmin) {
                  <div class="review-actions">
                    <button mat-icon-button color="warn" *ngIf="isAdmin" (click)="deleteReview(review.id)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  }
                </mat-card-header>
                <mat-card-content>
                  <p>{{ review.reviewText || 'No review text' }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px;
      text-align: center;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .item-details-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .item-header {
      display: flex;
      gap: 30px;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .item-image {
      flex-shrink: 0;
    }

    .item-cover {
      width: 250px;
      height: 350px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .item-info {
      flex: 1;
    }

    .item-info h1 {
      color: #7b1fa2;
      margin: 0 0 20px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .item-meta {
      margin-bottom: 20px;
    }

    .item-meta p, .custom-field p {
      margin: 8px 0;
      line-height: 1.6;
    }

    .item-meta strong {
      color: #4a148c;
    }

    .item-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .item-actions button {
      background: linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%);
      color: white;
    }

    .tab-content {
      padding: 20px;
      min-height: 300px;
    }

    .description-content h3 {
      color: #7b1fa2;
      margin-bottom: 16px;
    }

    .description-content h4 {
      color: #4a148c;
      margin: 24px 0 16px 0;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .detail-item {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #7b1fa2;
    }

    .detail-item label {
      font-weight: 600;
      color: #4a148c;
    }

    .add-review-section {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%);
      border-radius: 12px;
    }

    .no-reviews {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }

    .review-item {
      margin-bottom: 16px;
    }

    .review-item mat-card {
      border-left: 4px solid #7b1fa2;
    }

    .review-avatar {
      background: linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%);
      color: white;
    }

    .review-actions {
      margin-left: auto;
    }

    mat-chip-listbox {
      margin-top: 4px;
    }

    mat-chip {
      background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%);
      color: #4a148c;
    }

    @media (max-width: 768px) {
      .item-header {
        flex-direction: column;
        text-align: center;
      }

      .item-cover {
        width: 200px;
        height: 280px;
        margin: 0 auto;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategoryItemDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  public authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private adminService = inject(AdminService);
  private categoryService = inject(CategoryService);

  item?: CategoryItem;
  category?: Category;
  reviews: Review[] = [];
  isLoading = true;
  error: string | null = null;
  hasUserReviewed = false;
  canUserEdit = false;
  isAdmin = false;
  customFieldsDisplay: any[] = [];

  categoryType: string = '';
  itemId: string = '';

  ngOnInit() {
    // Extract category type from URL path and item ID from route
    const urlPath = this.router.url;
    this.itemId = this.route.snapshot.paramMap.get('id') || '';
    
    // Extract category type from URL (e.g., /books/123 -> books)
    const pathSegments = urlPath.split('/');
    this.categoryType = pathSegments[1] || '';

    if (!this.categoryType || !this.itemId) {
      this.error = 'Invalid category or item ID';
      this.isLoading = false;
      return;
    }

    this.loadItemDetails();
    this.checkAdminStatus();
  }

  private async loadItemDetails() {
    try {
      // Load category info
      const category = await this.categoryService.getCategoryById(this.categoryType).toPromise();
      if (!category) {
        this.error = 'Category not found';
        this.isLoading = false;
        return;
      }
      this.category = category;

      // Load item details
      const item = await this.categoryService.getCategoryItemWithLegacySupport(this.categoryType, this.itemId).toPromise();
      if (!item) {
        this.error = 'Item not found';
        this.isLoading = false;
        return;
      }
      this.item = item;

      this.prepareCustomFieldsDisplay();
      this.loadReviews();
      this.checkUserReviewStatus();
      this.checkEditPermissions();

    } catch (error) {
      console.error('Error loading item details:', error);
      this.error = 'Failed to load item details';
    } finally {
      this.isLoading = false;
    }
  }

  private prepareCustomFieldsDisplay() {
    if (!this.item || !this.category) return;

    this.customFieldsDisplay = this.category.fields
      .filter(field => field.name !== 'title' && field.name !== 'description' && field.name !== 'imageUrl')
      .map(field => ({
        ...field,
        value: this.item!.customFields[field.name] || ''
      }))
      .filter(field => field.value); // Only show fields with values
  }

  private checkAdminStatus() {
    this.adminService.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  public loadReviews() {
    if (!this.itemId || !this.categoryType) return;

    this.reviewService.getReviewsByItemId(this.categoryType, this.itemId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.snackBar.open('Failed to load reviews', 'Close', { duration: 3000 });
      }
    });
  }

  private checkUserReviewStatus() {
    if (!this.itemId || !this.categoryType) return;

    this.reviewService.hasUserReviewedItem(this.categoryType, this.itemId).subscribe({
      next: (hasReviewed) => {
        this.hasUserReviewed = hasReviewed;
      },
      error: (error) => {
        console.error('Error checking review status:', error);
      }
    });
  }

  private async checkEditPermissions() {
    const currentUser = this.authService.currentUserSig();
    const currentUserId = await this.authService.getUid();
    this.canUserEdit = !!(currentUser && (this.isAdmin || currentUserId === this.item?.createdBy));
  }

  openLogDialog() {
    if (!this.item) return;

    const dialogRef = this.dialog.open(UniversalLogPopupComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        itemId: this.item.id,
        itemTitle: this.item.title,
        categoryType: this.categoryType,
        categoryName: this.category?.name || this.categoryType
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open(`Added ${this.item?.title} to your log!`, 'Close', { duration: 3000 });
      }
    });
  }

  openReviewDialog() {
    // This will be implemented with a unified review dialog
    this.snackBar.open('Review dialog coming soon!', 'Close', { duration: 3000 });
  }

  onEditItem() {
    if (!this.item) return;
    this.router.navigate(['/edit', this.categoryType, this.item.id]);
  }

  deleteReview(reviewId: string) {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.snackBar.open('Review deleted successfully', 'Close', { duration: 3000 });
        this.loadReviews();
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.snackBar.open('Failed to delete review', 'Close', { duration: 3000 });
      }
    });
  }

  onTabChange(index: number) {
    if (index === 1) { // Reviews tab
      this.loadReviews();
    }
  }

  goBack() {
    this.router.navigate(['/categories', this.categoryType]);
  }
}