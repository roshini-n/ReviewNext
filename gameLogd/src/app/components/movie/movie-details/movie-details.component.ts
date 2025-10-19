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
import { MovieEditDialogComponent } from '../movie-edit-dialog/movie-edit-dialog.component';
import { LogMoviePopupComponent } from '../../log-movie-popup/log-movie-popup.component';
import { Review } from '../../../models/review.model';

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
    MatAutocompleteModule,
    LogMoviePopupComponent
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

  async ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = await this.authService.getUid();

    if (this.movieId) {
      this.loadMovieDetails(this.movieId);
      this.getReviews();
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

    if (!this.movie || !this.movieId) return;

    const dialogRef = this.dialog.open(LogMoviePopupComponent, {
      maxWidth: '550px',
      width: '95vw',
      panelClass: ['movie-log-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: {
        movie: this.movie,
        movieId: this.movieId,
      },
    });

    dialogRef.componentInstance.reviewUpdated.subscribe((updatedReview) => {
      console.log('Review updated:', updatedReview);
      const index = this.reviews.findIndex(r => r.id === updatedReview.id);
      if (index !== -1) {
        this.reviews[index] = updatedReview;
      } else {
        this.reviews.unshift(updatedReview);
      }
      this.updateMovieRating();
      if (this.movieId) {
        this.loadMovieDetails(this.movieId);
      }
    });

    dialogRef.afterClosed().subscribe();
  }

  getReviews() {
    if (!this.movieId) return;
    
    this.movieReviewService.getReviewsByMovieId(this.movieId).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews.map(review => ({
          ...review,
          datePosted: review.datePosted instanceof Date ? review.datePosted : new Date(review.datePosted)
        }));
        this.updateMovieRating();
      },
      error: (error: Error) => {
        console.error('Error loading reviews:', error);
        this.snackBar.open('Failed to load reviews', 'Close', {
          duration: 3000
        });
      }
    });
  }

  private updateMovieRating() {
    if (!this.movie || !this.reviews.length) return;

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / this.reviews.length;

    const updatedMovie = {
      ...this.movie,
      rating: averageRating,
      numRatings: this.reviews.length,
      totalRatingScore: totalRating
    };

    if (this.movieId) {
      this.movieService.updateMovie(this.movieId, updatedMovie).then(() => {
        this.movie = updatedMovie;
      }).catch((error) => {
        console.error('Error updating movie rating:', error);
      });
    }
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

  onEditMovie() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to edit movies', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.movie) return;

    const dialogRef = this.dialog.open(MovieEditDialogComponent, {
      width: '600px',
      data: { ...this.movie }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const movieId = this.route.snapshot.paramMap.get('id');
          if (!movieId) return;
          await this.movieService.updateMovie(movieId, result);
          this.movie = result;
          this.snackBar.open('Movie updated successfully', 'Close', {
            duration: 3000
          });
        } catch (error) {
          console.error('Error updating movie:', error);
          this.snackBar.open('Failed to update movie', 'Close', {
            duration: 3000
          });
        }
      }
    });
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
} 