import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Review } from '../../../models/review.model';
import { ReviewService } from '../../../services/review.service';

@Component({
  selector: 'app-game-review-edit',
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
  templateUrl: './game-review-edit.component.html',
  styleUrl: './game-review-edit.component.css'
})
export class GameReviewEditComponent {
  // listener for when the review is updated
  @Output() reviewUpdated = new EventEmitter<Review>();
  
  editedReview: Review;
  
  constructor(
    // inject the dialog reference and data
    public dialogRef: MatDialogRef<GameReviewEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { review: Review },
    private reviewService: ReviewService
  ) 
  {
    // pass the data off to the dialog
    this.editedReview = { ...data.review };
  }
  
  updateRating(rating: number): void {
    this.editedReview.rating = rating;
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  onSubmit(): void {
    if (this.editedReview.reviewText?.trim()) {
      this.reviewService.updateReview(this.editedReview.id, this.editedReview).subscribe(() => {
        this.reviewUpdated.emit(this.editedReview);
        this.dialogRef.close(this.editedReview);
      });
    }
  }
}
