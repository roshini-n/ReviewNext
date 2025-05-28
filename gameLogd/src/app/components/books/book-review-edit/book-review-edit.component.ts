import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Review } from '../../../models/review.model';
import { BookReviewService } from '../../../services/bookreview.service';

@Component({
  selector: 'app-book-review-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './book-review-edit.component.html',
  styleUrl: './book-review-edit.component.css'
})
export class BookReviewEditComponent {
  @Output() reviewUpdated = new EventEmitter<Review>();
  
  editedReview: Review;
  isNewReview: boolean = false;
  
  constructor(
    public dialogRef: MatDialogRef<BookReviewEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      review?: Review;
      bookId?: string;
      bookTitle?: string;
      userId?: string;
    },
    private bookReviewService: BookReviewService
  ) {
    if (data.review) {
      // Editing existing review
      this.editedReview = { ...data.review };
      this.isNewReview = false;
    } else {
      // Creating new review
      this.editedReview = {
        id: '',
        bookId: data.bookId || '',
        userId: data.userId || '',
        reviewText: '',
        rating: 0,
        datePosted: new Date(),
        username: '' // This will be set by the service
      };
      this.isNewReview = true;
    }
  }

  updateRating(rating: number) {
    this.editedReview.rating = rating;
  }

  onSubmit() {
    if (this.isNewReview) {
      const newReview: Omit<Review, 'id'> = {
        bookId: this.editedReview.bookId,
        userId: this.editedReview.userId,
        reviewText: this.editedReview.reviewText,
        rating: this.editedReview.rating,
        datePosted: new Date(),
        username: '' // This will be set by the service
      };

      this.bookReviewService.addReview(newReview).subscribe({
        next: (review: Review) => {
          this.reviewUpdated.emit(review);
          this.dialogRef.close(review);
        },
        error: (error: Error) => {
          console.error('Error adding review:', error);
        }
      });
    } else {
      const changes: Partial<Review> = {
        reviewText: this.editedReview.reviewText,
        rating: this.editedReview.rating,
        lastUpdated: new Date()
      };

      this.bookReviewService.updateReview(this.editedReview.id, changes).subscribe({
        next: () => {
          this.reviewUpdated.emit({...this.editedReview, ...changes});
          this.dialogRef.close({...this.editedReview, ...changes});
        },
        error: (error: Error) => {
          console.error('Error updating review:', error);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
