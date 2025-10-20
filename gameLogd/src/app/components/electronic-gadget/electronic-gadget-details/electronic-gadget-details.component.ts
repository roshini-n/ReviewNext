import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { ReviewService } from '../../../services/review.service';
import { ReviewEventService } from '../../../services/review-event.service';
import { Review } from '../../../models/review.model';
import { GeneralDeleteButtonComponent } from '../../shared/general-delete-button/general-delete-button.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronicGadgetFirebaseService } from '../../../services/electronicGadgetFirebase.service';
import { ElectronicGadget } from '../../../models/electronic-gadget.model';
import { ElectronicGadgetEditDialogComponent } from '../electronic-gadget-edit-dialog/electronic-gadget-edit-dialog.component';
import { LogElectronicGadgetPopupComponent } from '../../log-electronic-gadget-popup/log-electronic-gadget-popup.component';
import { ElectronicGadgetReviewService } from '../../../services/electronicGadgetReview.service';

@Component({
  selector: 'app-electronic-gadget-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatGridListModule,
    MatDialogModule,
    MatTabsModule,
    ReactiveFormsModule,
    GeneralDeleteButtonComponent,
    ElectronicGadgetEditDialogComponent,
    LogElectronicGadgetPopupComponent,
  ],
  templateUrl: './electronic-gadget-details.component.html',
  styleUrl: './electronic-gadget-details.component.css',
})
export class ElectronicGadgetDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private dialog = inject(MatDialog);
  public authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private reviewEventService = inject(ReviewEventService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private electronicGadgetService = inject(ElectronicGadgetFirebaseService);
  private gadgetReviewService = inject(ElectronicGadgetReviewService);

  gadget?: ElectronicGadget;
  rating?: number;
  currentRating: number = 0;
  disabled: boolean = false;
  reviews: Review[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  currenUser = this.authService.getUid();
  gadgetId: string | null = null;
  reviewForm: FormGroup;

  constructor() {
    this.reviewForm = this.fb.group({
      reviewText: ['', [Validators.required, Validators.minLength(10)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  async ngOnInit() {
    console.log('Current user:', this.currenUser);
    if (this.currenUser === null || this.currenUser === undefined) {
      this.disabled = true;
    } else {
      this.currentUserId = await this.currenUser;
      this.disabled = false;
    }

    this.gadgetId = this.route.snapshot.paramMap.get('id');

    if (this.gadgetId) {
      this.isLoading = true;
      this.electronicGadgetService.getElectronicGadgetById(this.gadgetId).subscribe({
        next: (gadget) => {
          this.gadget = gadget;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load gadget details. Please try again later.';
          this.isLoading = false;
          console.error('Error loading gadget:', err);
        }
      });
    }

    this.getReviews();
  }

  getReviews() {
    if (!this.gadgetId) return;
    this.gadgetReviewService.getReviewsByGadgetId(this.gadgetId).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews.map(review => ({
          ...review,
          datePosted: review.datePosted instanceof Date ? review.datePosted : new Date(review.datePosted)
        }));
        this.updateGadgetRating();
        console.log('Reviews loaded:', reviews);
      },
      error: (error: any) => {
        console.error('Error loading reviews:', error);
        this.error = 'Failed to load reviews. Please try again later.';
        this.snackBar.open('Failed to load reviews', 'Close', {
          duration: 3000
        });
      }
    });
  }

  private updateGadgetRating() {
    if (!this.gadget || !this.reviews.length) return;

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / this.reviews.length;

    const updatedGadget = {
      ...this.gadget,
      rating: averageRating,
      numRatings: this.reviews.length,
      totalRatingScore: totalRating
    };

    if (this.gadgetId) {
      this.electronicGadgetService.updateElectronicGadget(this.gadgetId, updatedGadget).then(() => {
        this.gadget = updatedGadget;
      }).catch((error) => {
        console.error('Error updating gadget rating:', error);
      });
    }
  }

  openLogGadgetPopup() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add gadgets to your collection', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.gadget || !this.gadgetId) return;

    const dialogRef = this.dialog.open(LogElectronicGadgetPopupComponent, {
      maxWidth: '550px',
      width: '95vw',
      panelClass: ['gadget-log-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: {
        gadget: this.gadget,
        gadgetId: this.gadgetId
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
      this.updateGadgetRating();
      if (this.gadgetId) {
        this.electronicGadgetService.getElectronicGadgetById(this.gadgetId).subscribe((gadget) => {
          this.gadget = gadget;
        });
      }
    });

    dialogRef.afterClosed().subscribe();
  }

  onEditGadget() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to edit gadgets', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.gadget || !this.gadgetId) return;

    const dialogRef = this.dialog.open(ElectronicGadgetEditDialogComponent, {
      width: '600px',
      data: { ...this.gadget }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          await this.electronicGadgetService.updateElectronicGadget(this.gadgetId!, result);
          this.gadget = result;
          this.snackBar.open('Gadget updated successfully', 'Close', {
            duration: 3000
          });
        } catch (error) {
          console.error('Error updating gadget:', error);
          this.snackBar.open('Failed to update gadget', 'Close', {
            duration: 3000
          });
        }
      }
    });
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
    const dialogRef = this.dialog.open(LogElectronicGadgetPopupComponent, {
      maxWidth: '550px',
      width: '95vw',
      panelClass: ['gadget-log-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: {
        gadget: this.gadget,
        gadgetId: this.gadgetId,
        existingReview: review
      }
    });

    dialogRef.componentInstance.reviewUpdated.subscribe((updatedReview) => {
      const index = this.reviews.findIndex(r => r.id === updatedReview.id);
      if (index !== -1) {
        this.reviews[index] = updatedReview;
      }
      this.updateGadgetRating();
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
      this.gadgetReviewService.deleteReview(review.id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== review.id);
          this.updateGadgetRating();
          // Notify dashboard that a review was deleted
          this.reviewEventService.notifyReviewChanged();
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

  onTabChange(index: number) {
    // Handle tab change if needed
  }
} 