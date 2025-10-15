import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Confirm User Deletion</h2>
      </div>

      <div mat-dialog-content class="dialog-content">
        <p>Are you sure you want to delete the following user?</p>
        <div class="user-details">
          <div class="user-info">
            <strong>Username:</strong> {{ data.user.username }}
          </div>
          <div class="user-info">
            <strong>Email:</strong> {{ data.user.email }}
          </div>
          <div class="user-info">
            <strong>User ID:</strong> {{ data.user.id }}
          </div>
        </div>
        <div class="warning-message">
          <mat-icon>info</mat-icon>
          <span>This action cannot be undone. All user data including reviews, ratings, and lists will be permanently deleted.</span>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          <mat-icon>delete</mat-icon>
          Delete User
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 28px;
    }

    h2 {
      margin: 0;
      color: #333;
    }

    .dialog-content {
      margin-bottom: 20px;
    }

    .user-details {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }

    .user-info {
      margin-bottom: 8px;
    }

    .user-info:last-child {
      margin-bottom: 0;
    }

    .warning-message {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      margin-top: 16px;
    }

    .warning-message mat-icon {
      color: #856404;
      font-size: 20px;
      margin-top: 2px;
    }

    .warning-message span {
      color: #856404;
      font-size: 14px;
      line-height: 1.4;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
    }
  `]
})
export class AdminDeleteConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AdminDeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  onCancel(): void {
    this.dialogRef.close('cancel');
  }

  onConfirm(): void {
    this.dialogRef.close('confirm');
  }
}