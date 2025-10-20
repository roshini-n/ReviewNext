import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, NgModule, OnInit, provideExperimentalZonelessChangeDetection } from '@angular/core';
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
import { AvatarDialogComponent } from '../avatar-dialog/avatar-dialog.component';

@Component({
  selector: 'app-profile',
  imports: [
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
    AvatarDialogComponent
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
  image: string = "assets/robot.png"; // Set default avatar to an existing asset
  imageTimestamp: number = Date.now(); // Force image refresh
  isUpdatingAvatar = false;
  defaultAvatar = "assets/robot.png";
  console = console; // Expose console to template for debugging
  

  // Logout
  logout() : void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
  constructor(private userService: UserService, private cd: ChangeDetectorRef) {}


  // Update the user when the page loads in
  ngOnInit(): void{
    // Getting current user
    this.authService.getUid().then((uid) =>{
      if (uid){
        this.userId = uid
        this.loadUser();
      }
    });
  }


  loadUser(): void {
    if (!this.userId) return;
    
    // Use observeUserById for live updates
    this.userService.observeUserById(this.userId).subscribe({
      next: (user: User | undefined) => {
        if (user) {
          console.log('✅ Profile: Loaded user data:', user);
          console.log('✅ Profile: Avatar URL from Firestore:', user.avatarUrl);
          
          this.bio = user.bio;
          this.username = user.username;
          
          // Update avatar image with proper fallback
          const newAvatarUrl = user.avatarUrl?.trim();
          if (newAvatarUrl && newAvatarUrl !== '') {
            console.log('✅ Profile: Setting avatar to:', newAvatarUrl);
            console.log('✅ Profile: Previous image was:', this.image);
            this.image = newAvatarUrl;
            this.imageTimestamp = Date.now(); // Force image refresh
            console.log('✅ Profile: New image is now:', this.image);
          } else {
            console.log('⚠️ Profile: No avatar URL, using default');
            this.image = this.defaultAvatar;
            this.imageTimestamp = Date.now();
          }
          
          // Force change detection to update the view immediately
          setTimeout(() => {
            this.cd.markForCheck();
            this.cd.detectChanges();
            console.log('✅ Profile: Change detection triggered');
          }, 0);
        } else {
          console.log("❌ Profile: User not found");
          this.image = this.defaultAvatar;
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.error('❌ Profile: Error loading user:', error);
        this.image = this.defaultAvatar;
        this.cd.detectChanges();
      }
    });
  }

  onImageError(event: any): void {
    console.error('Image failed to load:', this.image);
    // Fallback to default avatar if image fails to load
    event.target.src = this.defaultAvatar;
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

    console.log('🔵 Profile: Opening avatar dialog with current image:', this.image);
    const dialogRef = this.dialog.open(AvatarDialogComponent, {
      width: '500px',
      panelClass: 'avatar-dialog',
      data: { currentAvatar: this.image },
      disableClose: false // Allow closing
    });
    
    dialogRef.afterClosed().subscribe((newAvatarPath: string) => {
      console.log('🔵 Profile: Dialog closed with result:', newAvatarPath);
      console.log('🔵 Profile: Result type:', typeof newAvatarPath);
      console.log('🔵 Profile: Current userId:', this.userId);
      
      if (newAvatarPath && this.userId) {
        this.isUpdatingAvatar = true;
        console.log('🔵 Profile: Updating avatar for user:', this.userId, 'with path:', newAvatarPath);
        console.log('🔵 Profile: Old image:', this.image);
        
        // Immediately update the local image for instant feedback
        this.image = newAvatarPath;
        this.imageTimestamp = Date.now(); // Force image refresh
        console.log('🔵 Profile: New image set to:', this.image);
        console.log('🔵 Profile: Timestamp updated to:', this.imageTimestamp);
        
        // Force immediate UI update
        this.cd.detectChanges();
        console.log('🔵 Profile: First detectChanges() called');
        
        this.userService.updateUser(this.userId, { avatarUrl: newAvatarPath })
          .subscribe({
            next: () => {
              console.log('✅ Profile: Avatar updated successfully in Firestore');
              this.isUpdatingAvatar = false;
              // Force another change detection
              setTimeout(() => {
                this.cd.markForCheck();
                this.cd.detectChanges();
                console.log('✅ Profile: Final detectChanges() called');
              }, 100);
            },
            error: (error) => {
              console.error('❌ Profile: Error updating avatar in Firestore:', error);
              console.error('❌ Profile: Error details:', error.message, error.code);
              // Revert to previous image on error
              this.loadUser();
              this.isUpdatingAvatar = false;
              this.cd.markForCheck();
              alert('Failed to update avatar: ' + (error.message || 'Unknown error'));
            }
          });
      } else {
        console.log('⚠️ Profile: Dialog closed without selection or user not authenticated');
        if (!newAvatarPath) console.log('⚠️ Profile: No avatar path returned');
        if (!this.userId) console.log('⚠️ Profile: No userId available');
      }
    });
  }
}

//==================================Components==========================================

// Component for the bio dialog
@Component({
  selector: 'dialog-animations-example-dialog',
  templateUrl: 'dialog-animations-example-dialog.html',
  styleUrl: 'dialog-animations-example-dialog.css',
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
  styleUrl: 'username-dialog.css',
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
  imports: [MatButtonModule, FormsModule, ResetPasswordComponent, MatDialogActions, MatDialogClose],
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