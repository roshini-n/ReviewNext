import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { ReviewService } from '../../services/review.service';
import { User } from '../../models/user.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminDeleteConfirmDialogComponent } from './admin-delete-confirm-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isAdmin: boolean = false;
  userReviews: Map<string, any[]> = new Map();
  private adminService = inject(AdminService);
  private reviewService = inject(ReviewService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  searchQuery: string = '';
  isLoading: boolean = true;
  users: User[] = [];
  filteredUsers: User[] = [];
  adminStats: any = {};
  userStatistics: Map<string, any> = new Map();

  private searchSubject = new BehaviorSubject<string>('');
  
  displayedColumns: string[] = ['avatar', 'username', 'email', 'reviews', 'logs', 'totalActivity', 'actions'];

  ngOnInit(): void {
    this.adminService.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    this.loadAdminData();
    this.setupSearch();
  }

  private loadAdminData(): void {
    // Load admin statistics
    this.adminService.getAdminStats().subscribe({
      next: (stats) => {
        this.adminStats = stats;
      },
      error: (error) => {
        console.error('Error loading admin stats:', error);
        this.snackBar.open('Error loading admin statistics', 'Close', { duration: 3000 });
      }
    });

    // Load all users
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
          this.loadUserStatistics(users);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private performSearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    this.adminService.searchUsers(searchTerm).subscribe({
      next: (users) => {
        this.filteredUsers = users;
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.snackBar.open('Error searching users', 'Close', { duration: 3000 });
      }
    });
  }

    private loadUserStatistics(users: User[]): void {
    users.forEach(user => {
      this.adminService.getUserStatistics(user.id).subscribe({
        next: (stats) => {
          this.userStatistics.set(user.id, stats);
        },
        error: (error) => {
          console.error(`Error loading statistics for user ${user.username}:`, error);
        }
      });
      // Load reviews for each user
  this.reviewService.getReviewsByUserId(user.id).subscribe({
        next: (reviews) => {
          this.userReviews.set(user.id, reviews);
        },
        error: (error) => {
          console.error(`Error loading reviews for user ${user.username}:`, error);
        }
      });
    });
    }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(AdminDeleteConfirmDialogComponent, {
      width: '400px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.performDeleteUser(user);
      }
    });
  }

  private performDeleteUser(user: User): void {
    this.adminService.deleteUser(user.id).then(() => {
      this.snackBar.open(`User ${user.username} deleted successfully`, 'Close', { duration: 3000 });
      // Refresh the user list
      this.loadAdminData();
    }).catch(error => {
      console.error('Error deleting user:', error);
      this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
    });
  }

  getTotalReviews(user: User): number {
    const stats = this.userStatistics.get(user.id);
    return stats?.reviews || 0;
  }

  getTotalLogs(user: User): number {
    const stats = this.userStatistics.get(user.id);
    return stats?.totalLogs || 0;
  }

  getTotalActivity(user: User): number {
    const stats = this.userStatistics.get(user.id);
    return stats?.totalActivity || 0;
  }

  refreshData(): void {
    this.isLoading = true;
    this.loadAdminData();
  }

  deleteReview(reviewId: string, userId: string): void {
    if (!reviewId || !userId) return;
    
    const confirmDelete = confirm('Are you sure you want to delete this review? This action cannot be undone.');
    if (!confirmDelete) return;
    
    this.adminService.deleteReviewById(reviewId)
      .then(() => {
        this.snackBar.open('Review deleted successfully', 'Close', { duration: 3000 });
        // Refresh the user's reviews
        this.reviewService.getReviewsByUserId(userId).subscribe({
          next: (reviews) => this.userReviews.set(userId, reviews)
        });
      })
      .catch(() => this.snackBar.open('Error deleting review', 'Close', { duration: 3000 }));
  }

  openCategoryManagement(): void {
    this.router.navigate(['/admin/categories']);
  }
}