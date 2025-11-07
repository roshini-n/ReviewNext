import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    MatIconModule
  ]
})
export class UsernameDialog {
  username: string = '';

  constructor(
    public dialogRef: MatDialogRef<UsernameDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { currentUsername: string },
    private userService: UserService
  ) {
    this.username = data.currentUsername;
  }

  submitUsername(): void {
    if (!this.username.trim()) {
      return;
    }

    this.userService.updateUsername(this.username.trim()).subscribe({
      next: () => {
        this.dialogRef.close(this.username.trim());
      },
      error: (error) => {
        console.error('Error updating username:', error);
        // You might want to show an error message to the user here
      }
    });
  }
} 