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
    MatTabsModule
  ],
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
  image: string = "";
  

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


  loadUser(): void{
    if (!this.userId) return;
    this.userService.getUserById(this.userId).subscribe((user: User | undefined) => {
      if (user){
        this.bio = user.bio;
        this.username = user.username;
        this.image = user.avatarUrl || 'assets/default-avatar.png';
        this.cd.markForCheck();
      }
      else{
        console.log("User not found")
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

  openImageDialog(enterAnimationDuration: string, exitAnimationDuration: string) : void {
    const dialogRef = this.dialog.open(ImageDialog, {
      width: '400px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {userId: this.userId, currentImage: this.image},
    });
    dialogRef.afterClosed().subscribe((newImageUrl) => {
      if (newImageUrl) {
        this.image = newImageUrl;
        this.loadUser(); // Reload user data to ensure consistency
        this.cd.detectChanges();
      }
    })
  }
}

//==================================Components==========================================

// Component for the bio dialog
@Component({
  selector: 'dialog-animations-example-dialog',
  templateUrl: 'dialog-animations-example-dialog.html',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormField, MatLabel],
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
  imports: [MatButtonModule, MatDialogClose, MatDialogContent, FormsModule, MatFormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class ImageDialog {
  readonly dialogRef = inject(MatDialogRef<ImageDialog>);
  gameFirebaseService = inject(GameFirebaseService);
  userService = inject(UserService)
  image = ''

  constructor(@Inject(MAT_DIALOG_DATA) public data: {userId: string, currentImage: string}) {}

  // Submit button
  submitImage(imageUrl: string){
    this.userService.updateUser(this.data.userId, {avatarUrl: imageUrl}).subscribe(() => {
      this.dialogRef.close(imageUrl)
      location.reload();
    })
  }
}