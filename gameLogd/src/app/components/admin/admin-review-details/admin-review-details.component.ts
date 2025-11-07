import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AdminReview } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-review-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="review-details-dialog">
      <h2 mat-dialog-title>Review Details</h2>
      <div mat-dialog-content>
        <mat-card>
          <mat-card-content>
            <p><strong>User:</strong> {{ data.review.username }}</p>
            <p><strong>Product:</strong> {{ data.review.productTitle }}</p>
            <p><strong>Category:</strong> {{ data.review.productType }}</p>
            <p><strong>Rating:</strong> {{ data.review.rating }}/5</p>
            <p><strong>Date Posted:</strong> {{ formatDate(data.review.datePosted) }}</p>
            <div style="margin-top: 16px;">
              <strong>Review Text:</strong>
              <p style="margin-top: 8px; line-height: 1.6;">{{ data.review.reviewText }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="close()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .review-details-dialog {
      min-width: 500px;
      max-width: 600px;
    }
  `]
})
export class AdminReviewDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<AdminReviewDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { review: AdminReview }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch {
      return new Date(timestamp).toLocaleDateString();
    }
  }
}
