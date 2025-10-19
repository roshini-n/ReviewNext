import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface AvatarOption {
  name: string;
  path: string;
}

@Component({
  selector: 'app-avatar-dialog',
  templateUrl: './avatar-dialog.component.html',
  styleUrls: ['./avatar-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class AvatarDialogComponent {
  selectedAvatar: string | null = null;
  isLoading = false;
  error: string | null = null;

  avatars: AvatarOption[] = [
    { name: 'Cat', path: 'assets/cat.png' },
    { name: 'Chicken', path: 'assets/chicken.png' },
    { name: 'Dinosaur', path: 'assets/dinosaur.png' },
    { name: 'Kitty', path: 'assets/kitty.png' },
    { name: 'Man', path: 'assets/man.png' },
    { name: 'Panda', path: 'assets/panda.png' },
    { name: 'Pikachu', path: 'assets/pikachu.png' },
    { name: 'Robot', path: 'assets/robot.png' },
    { name: 'Superhero', path: 'assets/superhero.png' },
    { name: 'Woman', path: 'assets/woman.png' }
  ];

  constructor(
    public dialogRef: MatDialogRef<AvatarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentAvatar: string }
  ) {
    this.selectedAvatar = data.currentAvatar;
  }

  selectAvatar(avatarPath: string): void {
    this.selectedAvatar = avatarPath;
    this.error = null;
  }

  saveAvatar(): void {
    console.log('saveAvatar called');
    console.log('selectedAvatar:', this.selectedAvatar);

    if (!this.selectedAvatar) {
      this.error = 'Please select an avatar';
      console.error('No avatar selected');
      return;
    }

    console.log('Closing dialog with preset avatar:', this.selectedAvatar);
    this.dialogRef.close(this.selectedAvatar);
  }
}