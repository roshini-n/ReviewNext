import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-username-dialog',
  templateUrl: './username-dialog.html',
  styleUrls: ['./username-dialog.css'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ]
})
export class UsernameDialog {
  username: string = '';
  private userId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<UsernameDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { currentUsername: string; userId: string },
    private userService: UserService
  ) {
    this.username = data.currentUsername;
    this.userId = data.userId;
  }

  submitUsername(): void {
    if (!this.username.trim()) {
      return;
    }

    if (!this.userId) {
      console.error('Missing userId for username update');
      return;
    }

    this.userService.updateUser(this.userId, { username: this.username.trim() }).subscribe({
      next: () => {
        this.dialogRef.close(this.username.trim());
      },
      error: (error: Error) => {
        console.error('Error updating username:', error);
      }
    });
  }
}