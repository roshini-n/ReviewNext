import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { Book } from '../../../models/book.model';
import { BookLogService } from '../../../services/booklog.service';
import { BookReviewService } from '../../../services/bookreview.service';
import { ReviewService } from '../../../services/review.service';
import { AuthService } from '../../../services/auth.service';
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
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Review } from '../../../models/review.model';
import { BookReviewEditComponent } from '../book-review-edit/book-review-edit.component';
import { BookEditDialogComponent } from '../book-edit-dialog/book-edit-dialog.component';
import { LogBookPopupComponent } from '../../log-book-popup/log-book-popup.component';
<<<<<<< Updated upstream
import { UniversalLogPopupComponent } from '../../shared/universal-log-popup/universal-log-popup.component';
import { AdminService } from '../../../services/admin.service';
=======
import { isAdminEmail } from '../../../utils/admin.util';
import { AdminConfirmDialogComponent } from '../../admin/admin-confirm-dialog/admin-confirm-dialog.component';
>>>>>>> Stashed changes

@Component({
  selector: 'app-book-details',
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
    MatAutocompleteModule
  ],
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css']
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private dialog = inject(MatDialog);
  private bookFirebaseService = inject(BookFirebaseService);
  private bookLogService = inject(BookLogService);
  private bookReviewService = inject(BookReviewService);
  private reviewService = inject(ReviewService);
  public authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private adminService = inject(AdminService);

  book?: Book;
  reviews: Review[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  bookId: string | null = null;
  isAdmin: boolean = false;

  async ngOnInit() {
    this.bookId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = await this.authService.getUid();

    // Check if user is admin
    if (this.currentUserId) {
      this.adminService.isAdmin().subscribe({
        next: (isAdmin) => {
          this.isAdmin = isAdmin;
        },
        error: (error) => {
          console.error('Error checking admin status:', error);
          this.isAdmin = false;
        }
      });
    }

    if (this.bookId) {
      this.loadBookDetails();
      this.getReviews();
    }
  }

  private loadBookDetails() {
    if (!this.bookId) return;
    
    this.isLoading = true;
    this.bookFirebaseService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.book = book;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load book details. Please try again later.';
        this.isLoading = false;
        console.error('Error loading book:', err);
      }
    });
  }

  getReviews() {
    if (!this.bookId) return;
    
    this.isLoading = true;
    this.error = null;
    
    this.bookReviewService.getReviewsByBookId(this.bookId).subscribe({
      next: (reviews: Review[]) => {
        console.log('Raw reviews data:', reviews);
        this.reviews = reviews.map(review => ({
          ...review,
          datePosted: review.datePosted instanceof Date ? review.datePosted : new Date(review.datePosted)
        }));
        console.log('Processed reviews:', this.reviews);
        this.updateBookRating();
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading reviews:', error);
        this.error = 'Failed to load reviews. Please try again later.';
        this.isLoading = false;
        this.snackBar.open('Failed to load reviews', 'Close', {
          duration: 3000
        });
      }
    });
  }

  private updateBookRating() {
    if (!this.book || !this.reviews.length) return;

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / this.reviews.length;

    const updatedBook = {
      ...this.book,
      rating: averageRating,
      numRatings: this.reviews.length,
      totalRatingScore: totalRating
    };

    this.bookFirebaseService.updateBook(updatedBook).subscribe({
      next: () => {
        this.book = updatedBook;
        console.log('Book rating updated:', updatedBook);
      },
      error: (error) => {
        console.error('Error updating book rating:', error);
        this.snackBar.open('Failed to update book rating', 'Close', {
          duration: 3000
        });
      }
    });
  }

  onAddReview() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add reviews', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.book || !this.bookId || !this.currentUserId) return;

    const dialogRef = this.dialog.open(BookReviewEditComponent, {
      width: '550px',
      panelClass: ['book-review-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: {
        bookId: this.bookId,
        bookTitle: this.book.title,
        userId: this.currentUserId
      }
    });

    dialogRef.componentInstance.reviewUpdated.subscribe((updatedReview) => {
      // Update the reviews array with the new/updated review
      const index = this.reviews.findIndex(r => r.id === updatedReview.id);
      if (index !== -1) {
        this.reviews[index] = updatedReview;
      } else {
        this.reviews.unshift(updatedReview);
      }
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

    dialogRef.componentInstance.reviewUpdated.subscribe((updatedReview) => {
      // Update the reviews array with the updated review
      const index = this.reviews.findIndex(r => r.id === updatedReview.id);
      if (index !== -1) {
        this.reviews[index] = updatedReview;
      }
    });
  }

  deleteReview(review: Review) {
    if (!review || !review.id) return;
<<<<<<< Updated upstream
    this.bookReviewService.deleteReview(review.id).subscribe({
      next: () => {
        // Remove the review from the array
        this.reviews = this.reviews.filter(r => r.id !== review.id);
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.error = 'Failed to delete review. Please try again later.';
=======

    const isOwner = review.userId === this.currentUserId;
    const admin = this.isAdmin();
    if (!isOwner && !admin) {
      this.snackBar.open('You can only delete your own reviews', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(AdminConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Review',
        message: admin && !isOwner ? 'Delete this review as Admin? This cannot be undone.' : 'Are you sure you want to delete your review? This cannot be undone.',
        confirmText: 'Delete',
        confirmColor: 'warn'
>>>>>>> Stashed changes
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.bookReviewService.deleteReview(review.id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== review.id);
          this.reviewEventService.notifyReviewChanged();
          this.snackBar.open('Review deleted', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          this.error = 'Failed to delete review. Please try again later.';
          this.snackBar.open('Failed to delete review', 'Close', { duration: 3000 });
        }
      });
    });
  }

  onEditBook() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to edit books', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.book || !this.bookId) return;

    const dialogRef = this.dialog.open(BookEditDialogComponent, {
      width: '500px',
      data: this.book
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookFirebaseService.updateBook(result).subscribe({
          next: () => {
            this.book = result;
            this.snackBar.open('Book updated successfully', 'Close', {
              duration: 3000
            });
          },
          error: (error: Error) => {
            console.error('Error updating book:', error);
            this.snackBar.open('Failed to update book', 'Close', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  onDeleteBook() {
    if (!this.authService.currentUserSig() || !this.book || !this.bookId) return;

    if (confirm('Are you sure you want to delete this book?')) {
      this.bookFirebaseService.deleteBook(this.bookId).then(() => {
        this.snackBar.open('Book deleted successfully', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/books']);
      }).catch((error: Error) => {
        console.error('Error deleting book:', error);
        this.snackBar.open('Failed to delete book', 'Close', {
          duration: 3000
        });
      });
    }
  }

  openLogBookPopup() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add books to your log', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.book || !this.bookId) return;

    const dialogRef = this.dialog.open(UniversalLogPopupComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        itemId: this.book.id,
        itemTitle: this.book.title,
        categoryType: 'books',
        categoryName: 'Books'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open(`Added ${this.book?.title} to your log!`, 'Close', { duration: 3000 });
        // Optionally reload book details if needed
        this.loadBookDetails();
      }
    });
  }

  onTabChange(index: number) {
    // Handle tab change if needed
  }

  isAdmin(): boolean {
    const user = this.authService.currentUserSig();
    return isAdminEmail(user?.email);
  }
}
