import { Component, OnInit, inject } from '@angular/core';
import { Book } from '../../../models/book.model';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LogBookPopupComponent } from '../../log-book-popup/log-book-popup.component';
import { AuthService } from '../../../services/auth.service';
import { BookLogService } from '../../../services/booklog.service';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/review.model';
import { GeneralDeleteButtonComponent } from '../../shared/general-delete-button/general-delete-button.component';
import { BookReviewEditComponent } from '../book-review-edit/book-review-edit.component';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatGridListModule,
    MatDialogModule,
    LogBookPopupComponent,
    GeneralDeleteButtonComponent,
    BookReviewEditComponent,
  ],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css',
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private bookLogService = inject(BookLogService);
  private reviewService = inject(ReviewService);
  bookFirebaseService = inject(BookFirebaseService);
  book?: Book;
  rating?: number;
  currentRating: number = 0;
  disabled: boolean = false;
  reviews: Review[] = [];
  currentUserId: string | null = null;
  currentUser = this.authService.getUid();
  bookId: string | null = null;

  async ngOnInit() {
    if (this.currentUser === null || this.currentUser === undefined) {
      this.disabled = true;
    } else {
      this.currentUserId = await this.currentUser;
      this.disabled = false;
    }

    this.bookId = this.route.snapshot.paramMap.get('id');

    if (this.bookId) {
      this.bookFirebaseService.getBookById(this.bookId).subscribe((book) => {
        this.book = book;
      });
    }
    
    this.getReviews();
  }

  openLogBookPopup() {
    const dialogRef = this.dialog.open(LogBookPopupComponent, {
      width: '500px',
      data: { book: this.book }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getReviews();
      }
    });
  }

  getReviews() {
    if (!this.bookId) return;
    this.reviewService.getReviewsByBookId(this.bookId).subscribe((reviews: Review[]) => {
      this.reviews = reviews;
    });
  }

  editReview(review: Review) {
    if (!review || !review.id) return;

    const dialogRef = this.dialog.open(BookReviewEditComponent, {
      width: '550px',
      panelClass: ['book-review-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: { review: review }
    });

    dialogRef.componentInstance.reviewUpdated.subscribe(() => {
      this.getReviews();
    });

    dialogRef.afterClosed().subscribe(updatedReview => {
      if (updatedReview) {
        this.getReviews();
      }
    });
  }

  deleteReview(review: Review) {
    this.reviewService.deleteReview(review.id).subscribe(() => {
      console.log('Review deleted:', review.id);
      this.getReviews();
    });
  }
}
