import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminAnalyticsService } from '../../../services/admin-analytics.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  private adminAnalyticsService = inject(AdminAnalyticsService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  systemInfo = {
    version: '1.0.0',
    environment: 'Production',
    lastBackup: new Date(),
    databaseStatus: 'Online',
    storageUsage: '2.4 GB',
    uptime: '15 days'
  };

  externalLinks = [
    {
      title: 'Firebase Console',
      description: 'Manage Firebase project settings and database',
      url: 'https://console.firebase.google.com',
      icon: 'cloud'
    },
    {
      title: 'Google Analytics',
      description: 'View detailed analytics and user behavior',
      url: 'https://analytics.google.com',
      icon: 'analytics'
    },
    {
      title: 'GitHub Repository',
      description: 'Access source code and version control',
      url: 'https://github.com',
      icon: 'code'
    },
    {
      title: 'Documentation',
      description: 'View technical documentation and guides',
      url: '/docs',
      icon: 'description'
    }
  ];

  ngOnInit(): void {
    // In a real implementation, you would fetch actual system info
  }

  exportAllData(): void {
    this.showMessage('Preparing comprehensive data export...');
    
    // Export users
    this.userService.getUsers().subscribe(users => {
      this.downloadJSON(users, 'users-export.json');
    });
    
    // In a real implementation, you would export all data types
    this.showMessage('Data export completed successfully');
  }

  exportUsers(): void {
    this.showMessage('Exporting users data...');
    this.userService.getUsers().subscribe({
      next: (users) => {
        const csvData = this.convertUsersToCSV(users);
        this.downloadCSV(csvData, 'users-export.csv');
        this.showMessage('Users exported successfully');
      },
      error: (error) => {
        console.error('Error exporting users:', error);
        this.showMessage('Error exporting users');
      }
    });
  }

  exportAnalytics(): void {
    this.showMessage('Exporting analytics data...');
    this.adminAnalyticsService.getAnalytics().subscribe({
      next: (analytics) => {
        this.downloadJSON(analytics, 'analytics-export.json');
        this.showMessage('Analytics exported successfully');
      },
      error: (error) => {
        console.error('Error exporting analytics:', error);
        this.showMessage('Error exporting analytics');
      }
    });
  }

  backupDatabase(): void {
    // In a real implementation, this would trigger a Firebase backup
    this.showMessage('Database backup initiated - Check Firebase Console for progress');
  }

  clearCache(): void {
    // Clear browser cache
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
        this.showMessage('Cache cleared successfully');
      });
    } else {
      this.showMessage('Cache clearing not supported in this browser');
    }
  }

  restartServices(): void {
    // In a real implementation, this would restart backend services
    this.showMessage('Service restart initiated - This may take a few minutes');
  }

  openExternalLink(url: string): void {
    window.open(url, '_blank');
  }

  viewLogs(): void {
    // In a real implementation, you would show system logs
    this.showMessage('System logs viewer - Feature coming soon');
  }

  generateReport(): void {
    this.showMessage('Generating comprehensive system report...');
    
    this.adminAnalyticsService.getAnalytics().subscribe({
      next: (analytics) => {
        const report = this.createSystemReport(analytics);
        this.downloadText(report, 'system-report.txt');
        this.showMessage('System report generated successfully');
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.showMessage('Error generating system report');
      }
    });
  }

  private createSystemReport(analytics: any): string {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    return `
ReviewNext System Report
Generated: ${date} at ${time}

=== SYSTEM INFORMATION ===
Version: ${this.systemInfo.version}
Environment: ${this.systemInfo.environment}
Database Status: ${this.systemInfo.databaseStatus}
Storage Usage: ${this.systemInfo.storageUsage}
Uptime: ${this.systemInfo.uptime}
Last Backup: ${this.systemInfo.lastBackup.toLocaleDateString()}

=== USER STATISTICS ===
Total Users: ${analytics.userStats.totalUsers}
Active Users: ${analytics.userStats.activeUsers}
New Registrations (30 days): ${analytics.userStats.newRegistrations}

=== CONTENT STATISTICS ===
Total Reviews: ${analytics.contentStats.totalReviews}
Total Ratings: ${analytics.contentStats.totalRatings}
Games: ${analytics.contentStats.gameCount}
Books: ${analytics.contentStats.bookCount}
Movies: ${analytics.contentStats.movieCount}
Web Series: ${analytics.contentStats.webSeriesCount}
Electronic Gadgets: ${analytics.contentStats.electronicGadgetCount}
Beauty Products: ${analytics.contentStats.beautyProductCount}

=== ENGAGEMENT METRICS ===
Average Rating: ${analytics.engagementMetrics.averageRating}
Reviews Per User: ${analytics.engagementMetrics.reviewsPerUser}
Most Active Category: ${analytics.engagementMetrics.mostActiveCategory}

=== RECOMMENDATIONS ===
• Monitor user engagement trends
• Regular database backups recommended
• Consider performance optimizations for high-traffic periods
• Review content moderation policies

Report generated by ReviewNext Admin System
    `;
  }

  private convertUsersToCSV(users: any[]): string {
    const headers = ['Username', 'Email', 'Bio', 'Join Date'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        `"${user.username}"`,
        `"${user.email}"`,
        `"${(user.bio || '').replace(/"/g, '""')}"`,
        `"${new Date().toLocaleDateString()}"` // In real app, use actual join date
      ].join(','))
    ];
    return csvContent.join('\n');
  }

  private downloadCSV(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadBlob(blob, fileName);
  }

  private downloadJSON(data: any, fileName: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    this.downloadBlob(blob, fileName);
  }

  private downloadText(textContent: string, fileName: string): void {
    const blob = new Blob([textContent], { type: 'text/plain' });
    this.downloadBlob(blob, fileName);
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
