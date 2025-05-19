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
  private router = inject(Router);
  private movieService = inject(MovieFirebaseService);
  private movieLogService = inject(MovieLogService);
  private movieReviewService = inject(MovieReviewService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  movie: Movie | undefined;
  isLoggedIn = false;
  currentUserId: string | null = null;
  selectedTab = 0;
  isLoading = true;
  error: string | null = null;

  constructor() {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.uid || null;
    });

    const movieId = this.route.snapshot.paramMap.get('id');
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
    if (!this.isLoggedIn) {
      this.snackBar.open('Please log in to add movies to your log', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement add to log functionality
  }

  onAddReview() {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please log in to add reviews', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement add review functionality
  }

  onEditMovie() {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please log in to edit movies', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement edit movie functionality
  }

  onDeleteMovie() {
    if (!this.isLoggedIn) {
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