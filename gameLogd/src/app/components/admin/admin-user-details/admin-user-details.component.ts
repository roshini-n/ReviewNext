import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { AdminUser } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-user-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule
  ],
  template: `
    <div class="user-details-dialog">
      <h2 mat-dialog-title>User Details</h2>
      <div mat-dialog-content>
        <mat-card>
          <mat-card-content>
            <p><strong>Username:</strong> {{ data.user.username }}</p>
            <p><strong>Email:</strong> {{ data.user.email }}</p>
            <p><strong>Role:</strong> {{ data.user.role }}</p>
            <p><strong>Joined:</strong> {{ formatDate(data.user.createdAt) }}</p>
            <p><strong>Total Reviews:</strong> {{ data.user.totalReviews }}</p>
            <p><strong>Total Lists:</strong> {{ data.user.totalLists }}</p>
          </mat-card-content>
        </mat-card>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="close()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .user-details-dialog {
      min-width: 400px;
    }
  `]
})
export class AdminUserDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<AdminUserDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: AdminUser }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch {
      return new Date(timestamp).toLocaleDateString();
    }
  }
}
