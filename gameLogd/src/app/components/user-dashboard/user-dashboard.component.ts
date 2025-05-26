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
  totalRatings: number = 0;
  totalGameLogs: number = 0;
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private reviewService: ReviewService,
    private gameLogService: GameLogService
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
    // Load reviews
    this.reviewService.getReviewsByUserId(userId).subscribe(reviews => {
      this.totalReviews = reviews.length;
    });

    // Load game logs
    this.gameLogService.getReviewsByUserId(userId).subscribe(gameLogs => {
      this.totalGameLogs = gameLogs.length;
      this.totalRatings = gameLogs.filter(log => log.rating).length;
      this.isLoading = false;
    });
  }
} 