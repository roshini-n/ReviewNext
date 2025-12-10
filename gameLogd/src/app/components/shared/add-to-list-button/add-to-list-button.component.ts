import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { GameListService } from '../../../services/gameList.service';
import { WishlistConfirmationDialogComponent } from '../wishlist-confirmation-dialog/wishlist-confirmation-dialog.component';

@Component({
  selector: 'app-add-to-list-button',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './add-to-list-button.component.html',
  styleUrls: ['./add-to-list-button.component.css']
})
export class AddToListButtonComponent {
  @Input() itemId!: string;
  @Input() itemType: 'game' | 'book' | 'movie' | 'webSeries' | 'gadget' | 'beautyProduct' = 'game';
  
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private gameListService = inject(GameListService);

  isInWishlist = false;

  async addToWishlist(): Promise<void> {
    // Check if user is logged in
    const user = this.authService.currentUserSig();
    if (!user) {
      this.snackBar.open('Please log in to add items to your wishlist', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    const userId = await this.authService.getUid();

    // Get all user's lists
    this.gameListService.getListsByUserId(userId).subscribe({
      next: async (lists) => {
        // Check if Wishlist already exists
        const wishlist = lists.find(list => list.title.toLowerCase() === 'wishlist');
        
        if (wishlist) {
          // Add to existing wishlist
          if (!wishlist.games.includes(this.itemId)) {
            wishlist.games.push(this.itemId);
            this.gameListService.updateList(wishlist.id, {
              title: wishlist.title,
              description: wishlist.description,
              games: wishlist.games,
              userId: wishlist.userId
            }).subscribe({
              next: () => {
                this.isInWishlist = true;
                this.showSuccessDialog();
              },
              error: (error) => {
                console.error('Error updating wishlist:', error);
                this.snackBar.open('Failed to add to wishlist', 'Close', { duration: 3000 });
              }
            });
          } else {
            this.snackBar.open('Item already in wishlist!', 'Close', { duration: 2000 });
          }
        } else {
          // Create new wishlist
          this.gameListService.addList({
            title: 'Wishlist',
            description: 'My wishlist items',
            games: [this.itemId],
            userId: userId
          }).subscribe({
            next: () => {
              this.isInWishlist = true;
              this.showSuccessDialog();
            },
            error: (error) => {
              console.error('Error creating wishlist:', error);
              this.snackBar.open('Failed to create wishlist', 'Close', { duration: 3000 });
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading lists:', error);
        this.snackBar.open('Failed to load lists', 'Close', { duration: 3000 });
      }
    });
  }

  async showSuccessDialog(): Promise<void> {
    this.dialog.open(WishlistConfirmationDialogComponent, {
      width: '400px',
      data: { itemType: this.itemType }
    });
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToWishlist();
  }
}
