import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, NgModule, OnInit, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink} from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { GameFirebaseService } from '../../../services/gameFirebase.service';
import { UserService } from '../../../services/user.service';
import { MatLabel } from '@angular/material/form-field';
import { User } from '../../../models/user.model';
import { Inject } from '@angular/core';
import { ResetPasswordComponent } from '../../reset-password/reset-password.component';
import { doc } from '@angular/fire/firestore';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReviewService } from '../../../services/review.service';
import { GameListService } from '../../../services/gameList.service';
import { GameLogService } from '../../../services/gamelog.service';
import { MovieLogService } from '../../../services/movieLog.service';
import { BookLogService } from '../../../services/booklog.service';
import { Observable, combineLatest, map } from 'rxjs';
import { AvatarDialogComponent } from '../avatar-dialog/avatar-dialog.component'; // re-added for dialog usage

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    MatButtonModule, 
    MatDividerModule, 
    MatListModule, 
    MatCardModule, 
    RouterLink, 
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatTabsModule,
    MatTooltipModule
  ],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit{

  // Auth stuff
  authService = inject(AuthService);
  router = inject(Router);

  // Dialog
  readonly dialog = inject(MatDialog);

  // User info
  userId: string | null = null;
  username: string | undefined;
  bio: string | undefined;
  image: string = "assets/default-avatar.png"; // Set default avatar
  isUpdatingAvatar = false;

  // Statistics
  totalReviews = 0;
  totalLists = 0;
  totalGameLogs = 0;
  totalMovieLogs = 0;
  totalBookLogs = 0;
  

  // Logout
  logout() : void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
  
  constructor(
    private userService: UserService, 
    private cd: ChangeDetectorRef,
    private reviewService: ReviewService,
    private gameListService: GameListService,
    private gameLogService: GameLogService,
    private movieLogService: MovieLogService,
    private bookLogService: BookLogService
  ) {}

  // Profile statistics methods
  getTotalReviews(): number {
    return this.totalReviews;
  }

  getTotalRatings(): number {
    return this.totalGameLogs + this.totalMovieLogs + this.totalBookLogs; // All logs that include ratings
  }

  getTotalLists(): number {
    return this.totalLists;
  }

  // Load user statistics
  private loadUserStatistics(): void {
    if (!this.userId) return;

    // Load reviews count
    this.reviewService.getReviewsByUserId(this.userId).subscribe({
      next: (reviews) => {
        this.totalReviews = reviews.length;
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error loading reviews:', error)
    });

    // Load lists count
    this.gameListService.getListsByUserId(this.userId).subscribe({
      next: (lists) => {
        this.totalLists = lists.length;
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error loading lists:', error)
    });

    // Load game logs count
    this.gameLogService.getReviewsByUserId(this.userId).subscribe({
      next: (logs) => {
        this.totalGameLogs = logs.length;
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error loading game logs:', error)
    });

    // Load movie logs count
    this.movieLogService.getMovieLogs(this.userId).subscribe({
      next: (logs) => {
        this.totalMovieLogs = logs.length;
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error loading movie logs:', error)
    });

    // Load book logs count  
    this.bookLogService.getBookLogsByUserId(this.userId).subscribe({
      next: (logs) => {
        this.totalBookLogs = logs.length;
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error loading book logs:', error)
    });
  }


  // Update the user when the page loads in
  ngOnInit(): void{
    // Getting current user
    this.authService.getUid().then((uid) =>{
      if (uid){
        this.userId = uid
        this.loadUser();
        this.loadUserStatistics();
      }
    });
  }


  loadUser(): void {
    if (!this.userId) return;
    
    this.userService.getUserById(this.userId).subscribe({
      next: (user: User | undefined) => {
        if (user) {
          console.log('Loaded user data:', user);
          this.bio = user.bio;
          this.username = user.username;
          
          // Only update the image if we're not in the middle of an avatar update
          if (!this.isUpdatingAvatar) {
            const newAvatarUrl = user.avatarUrl?.trim() || 'assets/default-avatar.png';
            if (this.image !== newAvatarUrl) {
              console.log('Updating avatar from:', this.image, 'to:', newAvatarUrl);
              this.image = newAvatarUrl;
            }
          }
          
          this.cd.markForCheck();
          this.cd.detectChanges();
        } else {
          console.log("User not found");
        }
      },
      error: (error) => {
        console.error('Error loading user:', error);
        // Could show an error message to the user here
      }
    });
  }

  //==================================Open dialogs==========================================

  openUsernameDialog(enterAnimationDuration: string, exitAnimationDuration: string) : void {
    const dialogRef = this.dialog.open(UsernameDialog, {
      width: '400px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {userId: this.userId, currentUsername: this.username},
    });
    dialogRef.afterClosed().subscribe((newUsername) => {
      if (newUsername) {
        this.username = newUsername;
        this.loadUser(); // Reload user data to ensure consistency
        this.cd.detectChanges();
      }
    });
  }


  openBioDialog(enterAnimationDuration: string, exitAnimationDuration: string) : void {
    const dialogRef = this.dialog.open(DialogAnimationsExampleDialog, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {userId: this.userId},
    });
    dialogRef.afterClosed().subscribe((newBio) => {
      if (newBio) {
        this.bio = newBio
        this.cd.detectChanges();
      }
    })
  }

  openPasswordDialog(enterAnimationDuration: string, exitAnimationDuration: string) : void {
    const dialogRef = this.dialog.open(PasswordDialog, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {userId: this.userId},
    });
    dialogRef.afterClosed().subscribe((newBio) => {
      this.cd.detectChanges();
    })
  }

  openAvatarDialog(): void {
    if (this.isUpdatingAvatar) {
      return; // Prevent multiple dialogs
    }

    console.log('Opening avatar dialog with current image:', this.image);
    const dialogRef = this.dialog.open(AvatarDialogComponent, {
      width: '500px',
      panelClass: 'avatar-dialog',
      data: { currentAvatar: this.image },
      disableClose: true // Prevent clicking outside to close while updating
    });
    
    dialogRef.afterClosed().subscribe((newAvatarPath: string) => {
      console.log('Dialog closed with result:', newAvatarPath);
      if (newAvatarPath && this.userId) {
        this.isUpdatingAvatar = true;
        console.log('Updating avatar for user:', this.userId);
        
        this.userService.updateUser(this.userId, { avatarUrl: newAvatarPath })
          .subscribe({
            next: () => {
              console.log('Avatar updated successfully');
              this.image = newAvatarPath;
              this.isUpdatingAvatar = false;
              this.cd.markForCheck();
              this.cd.detectChanges();
            },
            error: (error) => {
              console.error('Error updating avatar:', error);
              this.isUpdatingAvatar = false;
              this.cd.markForCheck();
              // Could show an error message to the user here
            }
          });
      }
    });
  }
}

//==================================Components==========================================

// Component for the bio dialog
@Component({
  selector: 'dialog-animations-example-dialog',
  templateUrl: 'dialog-animations-example-dialog.html',
  imports: [MatButtonModule, MatDialogClose, MatDialogContent, FormsModule, MatFormField, MatLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class DialogAnimationsExampleDialog {
  readonly dialogRef = inject(MatDialogRef<DialogAnimationsExampleDialog>);
  gameFirebaseService = inject(GameFirebaseService);
  userService = inject(UserService)
  bio = ''

  constructor(@Inject(MAT_DIALOG_DATA) public data: {userId: string}) {}

  // Submit button
  submitBio(){
    this.userService.updateUser(this.data.userId, {bio: this.bio}).subscribe(() => {
      this.dialogRef.close(this.bio)
      location.reload();
    })
  }
}

// Component for the username dialog
@Component({
  selector: 'username-dialog',
  templateUrl: 'username-dialog.html',
  imports: [
    MatButtonModule, 
    MatDialogActions, 
    MatDialogClose, 
    MatDialogTitle, 
    MatDialogContent, 
    FormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class UsernameDialog {
  readonly dialogRef = inject(MatDialogRef<UsernameDialog>);
  userService = inject(UserService);
  username = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: {userId: string, currentUsername: string}) {
    this.username = data.currentUsername || '';
  }

  submitUsername() {
    if (!this.username.trim()) {
      return;
    }
    
    this.userService.updateUser(this.data.userId, {username: this.username.trim()}).subscribe({
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

// Component for the password dialog
@Component({
  selector: 'password-dialog',
  templateUrl: 'password-dialog.html',
  imports: [MatButtonModule, FormsModule, ResetPasswordComponent, MatDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class PasswordDialog {
  readonly dialogRef = inject(MatDialogRef<PasswordDialog>);
  gameFirebaseService = inject(GameFirebaseService);
  userService = inject(UserService)

  constructor(@Inject(MAT_DIALOG_DATA) public data: {userId: string}) {}
}

// Component for profile picture
@Component({
  selector: 'image-dialog',
  templateUrl: 'image-dialog.html',
  imports: [
    CommonModule,
    MatButtonModule, 
    MatDialogClose, 
    MatDialogContent, 
    MatDialogTitle, 
    MatDialogActions,
    MatProgressSpinnerModule,
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class ImageDialog {
  readonly dialogRef = inject(MatDialogRef<ImageDialog>);
  userService = inject(UserService);
  
  selectedAvatar: string | null = null;
  isUpdating = false;
  errorMessage: string | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {userId: string, currentImage: string}) {
    this.selectedAvatar = this.data.currentImage;
  }

  selectAvatar(imageUrl: string) {
    this.selectedAvatar = imageUrl;
    this.errorMessage = null; // Clear any previous errors
  }

  // Submit button
  submitImage(imageUrl: string) {
    if (!imageUrl) {
      this.errorMessage = 'Please select an avatar first';
      return;
    }
    
    this.isUpdating = true;
    this.errorMessage = null;

    this.userService.updateUser(this.data.userId, {avatarUrl: imageUrl}).subscribe({
      next: () => {
        this.dialogRef.close(imageUrl);
      },
      error: (error) => {
        console.error('Error updating profile picture:', error);
        this.isUpdating = false;
        this.errorMessage = 'Failed to update profile picture. Please try again.';
      }
    });
  }
}