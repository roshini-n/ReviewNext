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
import { WebSeries } from '../../models/web-series.model';
import { WebSeriesLogService, WebSeriesLog } from '../../services/webSeriesLog.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebSeriesReviewService } from '../../services/webSeriesReview.service';
import { Review } from '../../models/review.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-log-webseries-popup',
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
  templateUrl: './log-webseries-popup.component.html',
  styleUrl: './log-webseries-popup.component.css',
})
export class LogWebSeriesPopupComponent implements OnInit {
  seriesLogService = inject(WebSeriesLogService);
  authService = inject(AuthService);
  seriesReviewService = inject(WebSeriesReviewService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  @Output() logUpdated: EventEmitter<void> = new EventEmitter<void>();
  @Output() reviewUpdated = new EventEmitter<Review>();

  logForm: FormGroup;
  hoverRating: number = 0;
  seriesId: string = '';
  username: string = '';
  isLoading = false;
  errorMessage = '';
  userId: string | null = null;
  isEditMode = false;
  existingReview: Review | null = null;

  ratingTexts: string[] = ['Not rated', 'Awful', 'Poor', 'Ok', 'Good', 'Great'];

  constructor(
    public dialogRef: MatDialogRef<LogWebSeriesPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { series: WebSeries, seriesId?: string, review?: Review },
    private snackBar: MatSnackBar
  ) {
    this.logForm = this.fb.group({
      dateAdded: [new Date(), Validators.required],
      dateCompleted: [''],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      review: ['', Validators.required],
      status: ['watching', Validators.required],
      currentSeason: [1],
      currentEpisode: [1]
    });

    if (data.review) {
      this.isEditMode = true;
      this.existingReview = data.review;
      this.logForm.patchValue({
        dateAdded: data.review.datePosted,
        dateCompleted: data.review.lastUpdated || data.review.datePosted,
        rating: data.review.rating,
        review: data.review.reviewText,
        status: 'completed'
      });
    }

    this.seriesId = data.seriesId || data.series.id;
  }

  async ngOnInit() {
    this.userId = await this.authService.getUid();
    this.username = this.authService.getUsername() || 'Anonymous';
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
      this.snackBar.open('You must be logged in to log a series', 'Close', {
        duration: 2000,
      });
      return;
    }

    if (this.logForm.valid) {
      this.isLoading = true;
      const formData = this.logForm.value;

      try {
        // 1. Build the log object
        const logData: Omit<WebSeriesLog, 'id'> = {
          userId: currentUser,
          seriesId: this.seriesId,
          dateAdded: formData.dateAdded,
          dateCompleted: formData.dateCompleted || undefined,
          rating: formData.rating,
          review: formData.review,
          status: formData.status,
          currentSeason: formData.currentSeason,
          currentEpisode: formData.currentEpisode
        };

        // 2. Save the log
        await firstValueFrom(this.seriesLogService.addSeriesLog(logData));

        // 3. Save the review using WebSeriesReviewService
        const reviewData: Omit<Review, 'id'> = {
          userId: currentUser,
          seriesId: this.seriesId,
          rating: formData.rating,
          reviewText: formData.review,
          datePosted: new Date(),
          username: this.username,
          seriesTitle: this.data.series.title,
          likes: 0
        };

        let savedReview: Review;
        if (this.isEditMode && this.existingReview) {
          savedReview = await firstValueFrom(
            this.seriesReviewService.updateReview(this.existingReview.id, {
              rating: formData.rating,
              reviewText: formData.review,
              lastUpdated: new Date()
            })
          );
        } else {
          savedReview = await firstValueFrom(this.seriesReviewService.addReview(reviewData));
        }

        // 4. Emit events and close dialog
        this.logUpdated.emit();
        this.reviewUpdated.emit(savedReview);
        this.dialogRef.close(savedReview);

        this.snackBar.open('Series log and review saved successfully', 'Close', {
          duration: 3000
        });
      } catch (error) {
        console.error('Error saving series log:', error);
        this.snackBar.open('Failed to save series log', 'Close', {
          duration: 3000
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
