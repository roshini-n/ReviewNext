import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ReviewService } from '../../services/review.service';
import { GameLogService } from '../../services/gamelog.service';
import { BookReviewService } from '../../services/bookreview.service';
import { MovieReviewService } from '../../services/movieReview.service';
import { User } from '../../models/user.model';
import { combineLatest } from 'rxjs';
import { Review } from '../../models/review.model';
import { GameLog } from '../../models/gameLog.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  user: User | null = null;
  username: string = '';
  totalReviews: number = 0;
  private totalGameReviews: number = 0;
  private totalBookReviews: number = 0;
  private totalMovieReviews: number = 0;
  private totalGameLogDerivedReviews: number = 0;
  totalRatings: number = 1;
  totalGameLogs: number = 0;
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private reviewService: ReviewService,
    private gameLogService: GameLogService,
    private bookReviewService: BookReviewService,
    private movieReviewService: MovieReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userService.getUserById(user.uid).subscribe(userData => {
          if (userData) {
            this.user = userData;
            this.username = userData.username;
            this.loadUserStats(user.uid);
          }
        });
      }
    });
  }

  private loadUserStats(userId: string): void {
    console.log('Loading stats for userId:', userId);

    // Combine all review sources into a single live total
    combineLatest([
      this.reviewService.getReviewsByUserId(userId),
      this.bookReviewService.getReviewsByUserId(userId),
      this.movieReviewService.getUserReviews(userId)
    ]).subscribe({
      next: ([gameReviews, bookReviews, movieReviews]) => {
        this.totalGameReviews = gameReviews.length;
        this.totalBookReviews = bookReviews.length;
        this.totalMovieReviews = movieReviews.length;
        this.updateTotalReviews();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    });

    // Load game logs (separate from reviews)
    this.gameLogService.getReviewsByUserId(userId).subscribe({
      next: (gameLogs) => {
        this.totalGameLogs = gameLogs.length;
        const logsWithRating = gameLogs.filter(log => !!log.rating).length;
        const logsWithText = gameLogs.filter((log: any) => typeof log.review === 'string' && log.review.trim().length > 0).length;
        this.totalRatings = logsWithRating;
        this.totalGameLogDerivedReviews = Math.max(logsWithRating, logsWithText);
        this.updateTotalReviews();
      },
      error: (error) => {
        console.error('Error loading game logs:', error);
      }
    });
  }

  private updateTotalReviews(): void {
    const gameReviewCount = this.totalGameReviews > 0 ? this.totalGameReviews : this.totalGameLogDerivedReviews;
    this.totalReviews = gameReviewCount + this.totalBookReviews + this.totalMovieReviews;
    console.log('Total reviews updated:', this.totalReviews, {
      gameReviews: this.totalGameReviews,
      gameRatingsFallback: this.totalRatings,
      book: this.totalBookReviews,
      movie: this.totalMovieReviews
    });
  }

  navigateToCategory(category: string): void {
    this.router.navigate([category]);
  }

} 