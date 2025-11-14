import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminAuthService } from '../../../services/admin-auth.service';
import { ReviewService } from '../../../services/review.service';

@Component({
  selector: 'app-admin-delete-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <button 
      *ngIf="isAdmin && reviewId"
      mat-icon-button 
      color="warn" 
      (click)="confirmDelete()"
      matTooltip="Delete Review (Admin)"
      class="admin-delete-btn">
      <mat-icon>delete</mat-icon>
    </button>
  `,
  styles: [`
    .admin-delete-btn {
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }
    
    .admin-delete-btn:hover {
      opacity: 1;
    }
  `]
})
export class AdminDeleteButtonComponent {
  @Input() reviewId!: string;
  @Input() reviewText?: string;
  @Output() deleted = new EventEmitter<string>();

  private adminAuthService = inject(AdminAuthService);
  private reviewService = inject(ReviewService);
  private snackBar = inject(MatSnackBar);

  isAdmin = false;

  ngOnInit() {
    this.adminAuthService.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  confirmDelete() {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      this.deleteReview();
    }
  }

  private deleteReview() {
    this.reviewService.adminDeleteReview(this.reviewId).subscribe({
      next: () => {
        this.snackBar.open('Review deleted successfully', 'Close', {
          duration: 3000
        });
        this.deleted.emit(this.reviewId);
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.snackBar.open('Error deleting review. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }
}
