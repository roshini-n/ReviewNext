import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MovieFirebaseService } from '../../../services/movieFirebase.service';
import { Movie } from '../../../models/movie.model';
import { MovieLogService } from '../../../services/movieLog.service';
import { MovieReviewService } from '../../../services/movieReview.service';
import { ReviewService } from '../../../services/review.service';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { AdminConfirmDialogComponent } from '../../admin/admin-confirm-dialog/admin-confirm-dialog.component';
import { isAdminEmail } from '../../../utils/admin.util';

@Component({
  selector: 'app-movie-details',
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
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private movieService = inject(MovieFirebaseService);
  private movieLogService = inject(MovieLogService);
  private movieReviewService = inject(MovieReviewService);
  private reviewService = inject(ReviewService);
  public authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  movie: Movie | undefined;
  selectedTab = 0;
  isLoading = true;
  error: string | null = null;
  reviews: Review[] = [];
  currentUserId: string | null = null;
  movieId: string | null = null;

  ngOnInit() {
    const movieId = this.route.snapshot.paramMap.get('id');
    this.movieId = movieId;
    this.authService.getUid().then(uid => this.currentUserId = uid);
    if (movieId) {
      this.loadMovieDetails(movieId);
    }
  }

  private loadMovieDetails(movieId: string) {
    this.movieService.getMovieById(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movie details:', error);
        this.error = 'Failed to load movie details';
        this.isLoading = false;
      }
    });
  }

  onAddToLog() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add movies to your log', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement add to log functionality
  }

  onAddReview() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add reviews', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement add review functionality
  }

  deleteReview(review: Review) {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to delete reviews', 'Close', { duration: 3000 });
      return;
    }
    if (!review || !review.id) return;
    const isOwner = review.userId === this.currentUserId;
    const admin = isAdminEmail(this.authService.currentUserSig()?.email);
    if (!isOwner && !admin) {
      this.snackBar.open('You can only delete your own reviews', 'Close', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(AdminConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete Review', message: 'This action cannot be undone.', confirmText: 'Delete', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.movieReviewService.deleteReview(review.id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== review.id);
          this.snackBar.open('Review deleted successfully', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to delete review', 'Close', { duration: 3000 })
      });
    });
  }

  editReview(review: Review) {
    // TODO: Implement movie review edit dialog
  }

  onEditMovie() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to edit movies', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement edit movie functionality
  }

  onDeleteMovie() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to delete movies', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement delete movie functionality
  }

  onTabChange(index: number) {
    this.selectedTab = index;
  }

  isAdmin(): boolean {
    const user = this.authService.currentUserSig();
    return isAdminEmail(user?.email);
  }
}