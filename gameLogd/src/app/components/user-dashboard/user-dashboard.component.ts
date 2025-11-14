import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { GameLogService } from '../../services/gamelog.service';
import { WebSeriesLogService } from '../../services/webSeriesLog.service';
import { ElectronicGadgetLogService } from '../../services/electronicGadgetLog.service';
import { BeautyProductLogService } from '../../services/beautyProductLog.service';
import { MovieLogService } from '../../services/movieLog.service';
import { BookLogService } from '../../services/booklog.service';
import { ReviewService } from '../../services/review.service';
import { BookReviewService } from '../../services/bookreview.service';
import { MovieReviewService } from '../../services/movieReview.service';
import { BeautyProductReviewService } from '../../services/beautyProductReview.service';
import { ElectronicGadgetReviewService } from '../../services/electronicGadgetReview.service';
import { WebSeriesReviewService } from '../../services/webSeriesReview.service';
import { ReviewEventService } from '../../services/review-event.service';
import { User } from '../../models/user.model';
import { combineLatest, Subscription } from 'rxjs';

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
export class UserDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  username: string = '';
  totalReviews: number = 0;  // Logs with rating OR review text (or both)
  totalRatings: number = 0;  // Logs with rating > 0
  totalLogs: number = 0;     // Logs with review TEXT (not rating-only)
  private totalGameLogs: number = 0;
  private totalBookLogs: number = 0;
  private totalMovieLogs: number = 0;
  private totalWebSeriesLogs: number = 0;
  private totalElectronicGadgetLogs: number = 0;
  private totalBeautyProductLogs: number = 0;
  isLoading: boolean = true;
  isAdmin: boolean = false;
  private reviewChangeSubscription?: Subscription;
  private currentUserId?: string;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    public adminAuthService: AdminAuthService,
    private gameLogService: GameLogService,
    private bookLogService: BookLogService,
    private movieLogService: MovieLogService,
    private webSeriesLogService: WebSeriesLogService,
    private electronicGadgetLogService: ElectronicGadgetLogService,
    private beautyProductLogService: BeautyProductLogService,
    private reviewService: ReviewService,
    private bookReviewService: BookReviewService,
    private movieReviewService: MovieReviewService,
    private beautyProductReviewService: BeautyProductReviewService,
    private electronicGadgetReviewService: ElectronicGadgetReviewService,
    private webSeriesReviewService: WebSeriesReviewService,
    private reviewEventService: ReviewEventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    
    // Check admin status
    this.adminAuthService.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    
    // Subscribe to review change events
    this.reviewChangeSubscription = this.reviewEventService.reviewChanged$.subscribe(() => {
      console.log('Review changed event received, reloading stats...');
      if (this.currentUserId) {
        this.loadUserStats(this.currentUserId);
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.reviewChangeSubscription) {
      this.reviewChangeSubscription.unsubscribe();
    }
  }

  private loadUserData(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
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

    // Load all reviews from the reviews collections
    combineLatest([
      this.reviewService.getReviewsByUserId(userId),
      this.bookReviewService.getReviewsByUserId(userId),
      this.movieReviewService.getUserReviews(userId),
      this.beautyProductReviewService.getUserReviews(userId),
      this.electronicGadgetReviewService.getUserReviews(userId),
      this.webSeriesReviewService.getUserReviews(userId)
    ]).subscribe({
      next: ([gameReviews = [], bookReviews = [], movieReviews = [], beautyReviews = [], gadgetReviews = [], seriesReviews = []]) => {
        // Combine all reviews
        const allReviews = [...gameReviews, ...bookReviews, ...movieReviews, ...beautyReviews, ...gadgetReviews, ...seriesReviews];
        
        console.log('All reviews loaded:', allReviews.length);
        
        // Total Reviews = all reviews (each review entry counts as one)
        this.totalReviews = allReviews.length;
        
        // Total Ratings = reviews with rating > 0
        this.totalRatings = allReviews.filter((review: any) => review.rating && review.rating > 0).length;
        
        // Total Logs = reviews with review TEXT (not counting rating-only)
        this.totalLogs = allReviews.filter((review: any) => {
          const hasReview = review.reviewText && typeof review.reviewText === 'string' && review.reviewText.trim().length > 0;
          return hasReview;
        }).length;
        
        // Count by category
        this.totalGameLogs = gameReviews.length;
        this.totalBookLogs = bookReviews.length;
        this.totalMovieLogs = movieReviews.length;
        this.totalBeautyProductLogs = beautyReviews.length;
        this.totalElectronicGadgetLogs = gadgetReviews.length;
        this.totalWebSeriesLogs = seriesReviews.length;
        
        console.log('Dashboard stats updated:', {
          totalReviews: this.totalReviews,
          totalRatings: this.totalRatings,
          totalLogs: this.totalLogs,
          breakdown: {
            gameReviews: this.totalGameLogs,
            bookReviews: this.totalBookLogs,
            movieReviews: this.totalMovieLogs,
            beautyReviews: this.totalBeautyProductLogs,
            gadgetReviews: this.totalElectronicGadgetLogs,
            seriesReviews: this.totalWebSeriesLogs
          }
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    });
  }

  navigateToCategory(category: string): void {
    this.router.navigate([category]);
  }
} 