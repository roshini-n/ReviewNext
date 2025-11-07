import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css'
})
export class AdminSettingsComponent {
  adminService = inject(AdminService);
  snackBar = inject(MatSnackBar);

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  async exportUserData() {
    try {
      // This would implement user data export functionality
      this.snackBar.open('User data export initiated', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error exporting user data', 'Close', { duration: 3000 });
    }
  }

  async exportReviewData() {
    try {
      // This would implement review data export functionality
      this.snackBar.open('Review data export initiated', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error exporting review data', 'Close', { duration: 3000 });
    }
  }

  async exportProductData() {
    try {
      // This would implement product data export functionality
      this.snackBar.open('Product data export initiated', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error exporting product data', 'Close', { duration: 3000 });
    }
  }

  openFirebaseConsole() {
    window.open('https://console.firebase.google.com/project/gamelogd', '_blank');
  }

  openAnalytics() {
    window.open('https://analytics.google.com/', '_blank');
  }

  viewDocumentation() {
    // This would link to your project documentation
    this.snackBar.open('Documentation feature coming soon', 'Close', { duration: 3000 });
  }

  viewSystemLogs() {
    // This would implement system logs viewing
    this.snackBar.open('System logs feature coming soon', 'Close', { duration: 3000 });
  }
}
