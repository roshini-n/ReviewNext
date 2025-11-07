import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminReview } from '../../../services/admin.service';
import { AdminConfirmDialogComponent } from '../admin-confirm-dialog/admin-confirm-dialog.component';
import { AdminReviewDetailsComponent } from '../admin-review-details/admin-review-details.component';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.css'
})
export class AdminReviewsComponent implements OnInit {
  adminService = inject(AdminService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);

  reviews = signal<AdminReview[]>([]);
  filteredReviews = signal<AdminReview[]>([]);
  loading = signal(true);
  searchTerm = '';
  selectedCategory = 'all';

  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'games', label: 'Games' },
    { value: 'books', label: 'Books' },
    { value: 'movies', label: 'Movies' },
    { value: 'web-series', label: 'Web Series' },
    { value: 'electronic-gadgets', label: 'Electronic Gadgets' },
    { value: 'beauty-products', label: 'Beauty Products' }
  ];

  displayedColumns: string[] = [
    'user',
    'product', 
    'category', 
    'rating', 
    'review', 
    'datePosted', 
    'actions'
  ];

  ngOnInit() {
    this.loadReviews();
  }

  private loadReviews() {
    this.loading.set(true);
    this.adminService.getAllReviews().subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loading.set(false);
        this.snackBar.open('Error loading reviews', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onCategoryChange() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.reviews()];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(review => review.productType === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(review =>
        review.reviewText.toLowerCase().includes(term) ||
        review.productTitle.toLowerCase().includes(term) ||
        review.username.toLowerCase().includes(term)
      );
    }

    this.filteredReviews.set(filtered);
  }

  viewReviewDetails(review: AdminReview) {
    const dialogRef = this.dialog.open(AdminReviewDetailsComponent, {
      width: '800px',
      data: { review }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadReviews();
      }
    });
  }

  async deleteReview(review: AdminReview) {
    const dialogRef = this.dialog.open(AdminConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Review',
        message: `Are you sure you want to delete this review by "${review.username}" for "${review.productTitle}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.adminService.deleteReview(review.id);
          this.snackBar.open('Review deleted successfully', 'Close', { duration: 3000 });
          this.loadReviews();
        } catch (error) {
          console.error('Error deleting review:', error);
          this.snackBar.open('Error deleting review', 'Close', { duration: 3000 });
        }
      }
    });
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch {
      return new Date(timestamp).toLocaleDateString();
    }
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'games': 'primary',
      'books': 'accent',
      'movies': 'warn',
      'web-series': 'primary',
      'electronic-gadgets': 'accent',
      'beauty-products': 'warn'
    };
    return colors[category] || '';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'games': 'Games',
      'books': 'Books',
      'movies': 'Movies',
      'web-series': 'Web Series',
      'electronic-gadgets': 'Electronics',
      'beauty-products': 'Beauty'
    };
    return labels[category] || category;
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  truncateText(text: string, maxLength: number = 100): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getUserAvatarUrl(review: AdminReview): string {
    return review.userAvatarUrl || 'assets/cat.png';
  }
}
