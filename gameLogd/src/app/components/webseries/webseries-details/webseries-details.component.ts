import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSeriesEditDialogComponent } from '../webseries-edit-dialog/webseries-edit-dialog.component';
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
import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';
import { WebSeries } from '../../../models/web-series.model';
import { Firestore, collection, query, where, orderBy, collectionData } from '@angular/fire/firestore';
import { LogWebSeriesPopupComponent } from '../../log-webseries-popup/log-webseries-popup.component';
import { WebSeriesReviewService } from '../../../services/webSeriesReview.service';

@Component({
  selector: 'app-webseries-details',
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
    WebSeriesEditDialogComponent,
    LogWebSeriesPopupComponent
  ],
  templateUrl: './webseries-details.component.html',
  styleUrls: ['./webseries-details.component.css']
})
export class WebSeriesDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  public authService = inject(AuthService);
  private webSeriesFirebaseService = inject(WebSeriesFirebaseService);
  private firestore = inject(Firestore);
  private seriesReviewService = inject(WebSeriesReviewService);

  webSeries?: WebSeries;
  reviews: Review[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  seriesId: string | null = null;

  async ngOnInit() {
    this.seriesId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = await this.authService.getUid();

    if (this.seriesId) {
      this.loadSeriesDetails();
      this.getReviews();
    }
  }

  private loadSeriesDetails() {
    if (!this.seriesId) return;
    
    this.isLoading = true;
    this.webSeriesFirebaseService.getWebSeriesById(this.seriesId).subscribe({
      next: (series) => {
        if (series) {
          this.webSeries = series;
          this.isLoading = false;
        } else {
          this.error = 'Web series not found.';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load series details. Please try again later.';
        this.isLoading = false;
        console.error('Error loading series:', err);
      }
    });
  }

  private getReviews() {
    if (!this.seriesId) return;

    this.seriesReviewService.getReviewsBySeriesId(this.seriesId).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews.map(review => ({
          ...review,
          datePosted: review.datePosted instanceof Date ? review.datePosted : new Date(review.datePosted)
        }));
        this.updateSeriesRating();
      },
      error: (error: Error) => {
        console.error('Error loading reviews:', error);
        this.snackBar.open('Failed to load reviews', 'Close', {
          duration: 3000
        });
      }
    });
  }

  private updateSeriesRating() {
    if (!this.webSeries || !this.reviews.length) return;

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / this.reviews.length;

    const updatedSeries = {
      ...this.webSeries,
      rating: averageRating,
      numRatings: this.reviews.length,
      totalRatingScore: totalRating
    };

    if (this.seriesId) {
      this.webSeriesFirebaseService.updateWebSeries(this.seriesId, updatedSeries).then(() => {
        this.webSeries = updatedSeries;
      }).catch((error) => {
        console.error('Error updating series rating:', error);
      });
    }
  }

  onEditSeries() {
    if (!this.webSeries || !this.seriesId) return;

    const dialogRef = this.dialog.open(WebSeriesEditDialogComponent, {
      width: '600px',
      data: { ...this.webSeries }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSeriesDetails();
      }
    });
  }

  onTabChange(index: number) {
    // Handle tab change if needed
  }

  openLogSeriesPopup() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add series to your watchlist', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.webSeries || !this.seriesId) return;

    const dialogRef = this.dialog.open(LogWebSeriesPopupComponent, {
      maxWidth: '550px',
      width: '95vw',
      panelClass: ['series-log-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: {
        series: this.webSeries,
        seriesId: this.seriesId
      }
    });

    dialogRef.componentInstance.reviewUpdated.subscribe((updatedReview) => {
      console.log('Review updated:', updatedReview);
      const index = this.reviews.findIndex(r => r.id === updatedReview.id);
      if (index !== -1) {
        this.reviews[index] = updatedReview;
      } else {
        this.reviews.unshift(updatedReview);
      }
      this.updateSeriesRating();
      if (this.seriesId) {
        this.loadSeriesDetails();
      }
    });

    dialogRef.afterClosed().subscribe();
  }

  editReview(review: Review) {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to edit reviews', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!review || !review.id || review.userId !== this.currentUserId) {
      this.snackBar.open('You can only edit your own reviews', 'Close', {
        duration: 3000
      });
      return;
    }

    // Open edit dialog with review data
    const dialogRef = this.dialog.open(LogWebSeriesPopupComponent, {
      maxWidth: '550px',
      width: '95vw',
      panelClass: ['series-log-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: {
        series: this.webSeries,
        seriesId: this.seriesId,
        existingReview: review
      }
    });

    dialogRef.componentInstance.reviewUpdated.subscribe((updatedReview) => {
      const index = this.reviews.findIndex(r => r.id === updatedReview.id);
      if (index !== -1) {
        this.reviews[index] = updatedReview;
      }
      this.updateSeriesRating();
    });
  }

  deleteReview(review: Review) {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to delete reviews', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!review || !review.id || review.userId !== this.currentUserId) {
      this.snackBar.open('You can only delete your own reviews', 'Close', {
        duration: 3000
      });
      return;
    }

    if (confirm('Are you sure you want to delete this review?')) {
      this.seriesReviewService.deleteReview(review.id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== review.id);
          this.updateSeriesRating();
          this.snackBar.open('Review deleted successfully', 'Close', {
            duration: 3000
          });
        },
        error: (error: Error) => {
          console.error('Error deleting review:', error);
          this.snackBar.open('Failed to delete review', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }
}