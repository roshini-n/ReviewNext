import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { GameLogService } from '../../services/gamelog.service';
import { WebSeriesLogService } from '../../services/webSeriesLog.service';
import { ElectronicGadgetLogService } from '../../services/electronicGadgetLog.service';
import { BeautyProductLogService } from '../../services/beautyProductLog.service';
import { MovieLogService } from '../../services/movieLog.service';
import { BookLogService } from '../../services/booklog.service';
import { User } from '../../models/user.model';
import { combineLatest } from 'rxjs';

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

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private gameLogService: GameLogService,
    private bookLogService: BookLogService,
    private movieLogService: MovieLogService,
    private webSeriesLogService: WebSeriesLogService,
    private electronicGadgetLogService: ElectronicGadgetLogService,
    private beautyProductLogService: BeautyProductLogService,
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

    // Load all category logs and calculate stats from them
    combineLatest([
      this.gameLogService.getReviewsByUserId(userId),
      this.bookLogService.getBookLogsByUserId(userId),
      this.movieLogService.getMovieLogs(userId),
      this.webSeriesLogService.getSeriesLogs(userId),
      this.electronicGadgetLogService.getGadgetLogs(userId),
      this.beautyProductLogService.getProductLogs(userId)
    ]).subscribe({
      next: ([gameLogs, bookLogs, movieLogs, seriesLogs, gadgetLogs, beautyLogs]) => {
        // Count individual category logs
        this.totalGameLogs = gameLogs.length;
        this.totalBookLogs = bookLogs.length;
        this.totalMovieLogs = movieLogs.length;
        this.totalWebSeriesLogs = seriesLogs.length;
        this.totalElectronicGadgetLogs = gadgetLogs.length;
        this.totalBeautyProductLogs = beautyLogs.length;

        // Combine all logs
        const allLogs = [...gameLogs, ...bookLogs, ...movieLogs, ...seriesLogs, ...gadgetLogs, ...beautyLogs];
        
        // Total Logs = logs with review TEXT (not counting rating-only logs)
        this.totalLogs = allLogs.filter((log: any) => {
          const hasReview = log.review && typeof log.review === 'string' && log.review.trim().length > 0;
          return hasReview;
        }).length;
        
        // Total Ratings = logs with rating > 0
        this.totalRatings = allLogs.filter((log: any) => log.rating && log.rating > 0).length;
        
        // Total Reviews = logs with rating OR review text (or both)
        this.totalReviews = allLogs.filter((log: any) => {
          const hasRating = log.rating && log.rating > 0;
          const hasReview = log.review && typeof log.review === 'string' && log.review.trim().length > 0;
          return hasRating || hasReview;
        }).length;
        
        console.log('Dashboard stats updated:', {
          totalReviews: this.totalReviews,
          totalRatings: this.totalRatings,
          totalLogs: this.totalLogs,
          breakdown: {
            gameLogs: this.totalGameLogs,
            bookLogs: this.totalBookLogs,
            movieLogs: this.totalMovieLogs,
            webSeriesLogs: this.totalWebSeriesLogs,
            gadgetLogs: this.totalElectronicGadgetLogs,
            beautyLogs: this.totalBeautyProductLogs
          }
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        this.isLoading = false;
      }
    });
  }

  navigateToCategory(category: string): void {
    this.router.navigate([category]);
  }
} 