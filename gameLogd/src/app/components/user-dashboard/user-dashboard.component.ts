import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ReviewService } from '../../services/review.service';
import { GameLogService } from '../../services/gamelog.service';
import { BookReviewService } from '../../services/bookreview.service';
import { MovieReviewService } from '../../services/movieReview.service';
import { User } from '../../models/user.model';
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
  totalRatings: number = 0;
  totalGameLogs: number = 0;
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private reviewService: ReviewService,
    private gameLogService: GameLogService,
    private bookReviewService: BookReviewService,
    private movieReviewService: MovieReviewService
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
    
    // Load game reviews
    this.reviewService.getReviewsByUserId(userId).subscribe({
      next: (reviews) => {
        console.log('Game reviews received:', reviews.length, reviews);
        this.totalGameReviews = reviews.length;
        this.updateTotalReviews();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading game reviews:', error);
        this.isLoading = false;
      }
    });

    // Load book reviews
    this.bookReviewService.getReviewsByUserId(userId).subscribe({
      next: (bookReviews) => {
        console.log('Book reviews received:', bookReviews.length, bookReviews);
        this.totalBookReviews = bookReviews.length;
        this.updateTotalReviews();
      },
      error: (error) => {
        console.error('Error loading book reviews:', error);
      }
    });

    // Load movie reviews
    this.movieReviewService.getUserReviews(userId).subscribe({
      next: (movieReviews) => {
        console.log('Movie reviews received:', movieReviews.length, movieReviews);
        this.totalMovieReviews = movieReviews.length;
        this.updateTotalReviews();
      },
      error: (error) => {
        console.error('Error loading movie reviews:', error);
      }
    });

    // Load game logs
    this.gameLogService.getReviewsByUserId(userId).subscribe({
      next: (gameLogs) => {
        console.log('Game logs received:', gameLogs.length, gameLogs);
        this.totalGameLogs = gameLogs.length;
        this.totalRatings = gameLogs.filter(log => log.rating).length;
      },
      error: (error) => {
        console.error('Error loading game logs:', error);
      }
    });
  }

  private updateTotalReviews(): void {
    this.totalReviews = this.totalGameReviews + this.totalBookReviews + this.totalMovieReviews;
    console.log('Total reviews updated:', this.totalReviews, {
      game: this.totalGameReviews,
      book: this.totalBookReviews,
      movie: this.totalMovieReviews
    });
  }

} 