import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  authService = inject(AuthService);
  adminService = inject(AdminService);
  router = inject(Router);

  private readonly adminEmails = [
    'admin@example.com',
    'roshininaguru12@gmail.com',
    'admin@reviewnext.com',
    'super@admin.com'
  ];

  dashboardStats = signal({
    totalUsers: 0,
    totalReviews: 0,
    totalProducts: 0,
    totalLists: 0,
    newUsersToday: 0,
    reviewsToday: 0
  });

  sidenavOpened = true;

  ngOnInit() {
    // Verify admin access
    this.verifyAdminAccess();
    
    // Load dashboard statistics
    this.loadDashboardStats();
  }

  private verifyAdminAccess() {
    this.authService.user$.pipe(take(1)).subscribe((user: any) => {
      if (!user?.email || !this.adminEmails.includes(user.email)) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private async loadDashboardStats() {
    try {
      const stats = await this.adminService.getDashboardStats();
      this.dashboardStats.set(stats);
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToReviews() {
    this.router.navigate(['/admin/reviews']);
  }

  navigateToProducts() {
    this.router.navigate(['/admin/products']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/admin/analytics']);
  }

  navigateToSettings() {
    this.router.navigate(['/admin/settings']);
  }
}
