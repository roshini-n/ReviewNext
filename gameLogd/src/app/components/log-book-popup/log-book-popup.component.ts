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
import { Book } from '../../models/book.model';
import { BookLog } from '../../models/bookLog.model';
import { BookLogService } from '../../services/booklog.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookReviewService } from '../../services/bookreview.service';
import { Review } from '../../models/review.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-log-book-popup',
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
  templateUrl: './log-book-popup.component.html',
  styleUrl: './log-book-popup.component.css',
})
export class LogBookPopupComponent implements OnInit {
  bookLogService = inject(BookLogService);
  authService = inject(AuthService);
  bookReviewService = inject(BookReviewService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  @Output() logUpdated: EventEmitter<void> = new EventEmitter<void>();
  @Output() reviewUpdated = new EventEmitter<Review>();

  logForm: FormGroup;
  hoverRating: number = 0;
  bookId: string = '';
  username: string = '';
  isLoading = false;
  errorMessage = '';
  userId: string | null = null;
  isEditMode = false;
  existingReview: Review | null = null;

  ratingTexts: string[] = ['Not rated', 'Awful', 'Poor', 'Ok', 'Good', 'Great'];

  constructor(
    public dialogRef: MatDialogRef<LogBookPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book: Book, review?: Review },
    private snackBar: MatSnackBar
  ) {
    this.logForm = this.fb.group({
      dateStarted: ['', Validators.required],
      dateCompleted: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      review: ['', Validators.required],
      status: ['reading', Validators.required]
    });

    if (data.review) {
      this.isEditMode = true;
      this.existingReview = data.review;
      this.logForm.patchValue({
        dateStarted: data.review.datePosted,
        dateCompleted: data.review.lastUpdated || data.review.datePosted,
        rating: data.review.rating,
        review: data.review.reviewText,
        status: 'completed'
      });
    }

    this.bookId = data.book.id;
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
      this.snackBar.open('You must be logged in to log a book', 'Close', {
        duration: 2000,
      });
      return;
    }

    if (this.logForm.valid) {
      this.isLoading = true;
      const formData = this.logForm.value;

      try {
        // 1. Build the log object
        const logData: Omit<BookLog, 'id'> = {
          userId: currentUser,
          bookId: this.bookId,
          startDate: formData.dateStarted,
          endDate: formData.dateCompleted,
          rating: formData.rating,
          review: formData.review,
          status: formData.status,
        };

        // 2. Save the log
        await this.bookLogService.addBookLog(logData);

        // 3. Save the review using BookReviewService
        const reviewData: Omit<Review, 'id'> = {
          userId: currentUser,
          bookId: this.bookId,
          rating: formData.rating,
          reviewText: formData.review,
          datePosted: new Date(),
          username: this.username,
          bookTitle: this.data.book.title,
          likes: 0
        };

        let savedReview: Review;
        if (this.isEditMode && this.existingReview) {
          savedReview = await firstValueFrom(
            this.bookReviewService.updateReview(this.existingReview.id, {
              rating: formData.rating,
              reviewText: formData.review,
              lastUpdated: new Date()
            })
          );
        } else {
          savedReview = await firstValueFrom(this.bookReviewService.addReview(reviewData));
        }

        // 4. Emit events and close dialog
        this.logUpdated.emit();
        this.reviewUpdated.emit(savedReview);
        this.dialogRef.close(savedReview);

        this.snackBar.open('Book log and review saved successfully', 'Close', {
          duration: 3000
        });
      } catch (error) {
        console.error('Error saving book log:', error);
        this.snackBar.open('Failed to save book log', 'Close', {
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
