import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { GameListService } from '../../../services/gameList.service';
import { GameList } from '../../../models/gameList.model';

export interface AddToListDialogData {
  itemId: string;
  itemType: string;
}

@Component({
  selector: 'app-add-to-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './add-to-list-dialog.component.html',
  styleUrls: ['./add-to-list-dialog.component.css']
})
export class AddToListDialogComponent implements OnInit {
  private authService = inject(AuthService);
  private gameListService = inject(GameListService);
  
  lists: GameList[] = [];
  isLoading = true;
  showCreateForm = false;
  newListTitle = '';
  newListDescription = '';

  constructor(
    public dialogRef: MatDialogRef<AddToListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddToListDialogData
  ) {}

  async ngOnInit(): Promise<void> {
    const userId = await this.authService.getUid();
    this.gameListService.getListsByUserId(userId).subscribe({
      next: (lists) => {
        this.lists = lists;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading lists:', error);
        this.isLoading = false;
      }
    });
  }

  async addToWishlist(): Promise<void> {
    const userId = await this.authService.getUid();
    
    // Check if Wishlist already exists
    const wishlist = this.lists.find(list => list.title.toLowerCase() === 'wishlist');
    
    if (wishlist) {
      // Add to existing wishlist
      if (!wishlist.games.includes(this.data.itemId)) {
        wishlist.games.push(this.data.itemId);
        this.gameListService.updateList(wishlist.id, {
          title: wishlist.title,
          description: wishlist.description,
          games: wishlist.games,
          userId: wishlist.userId
        }).subscribe({
          next: () => this.dialogRef.close(true),
          error: (error) => console.error('Error updating wishlist:', error)
        });
      } else {
        this.dialogRef.close(false);
      }
    } else {
      // Create new wishlist
      this.gameListService.addList({
        title: 'Wishlist',
        description: 'My wishlist items',
        games: [this.data.itemId],
        userId: userId
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (error) => console.error('Error creating wishlist:', error)
      });
    }
  }

  async createNewList(): Promise<void> {
    const listTitle = prompt('Enter list name:');
    if (!listTitle || listTitle.trim() === '') {
      return;
    }

    const listDescription = prompt('Enter list description (optional):') || '';
    const userId = await this.authService.getUid();

    this.gameListService.addList({
      title: listTitle.trim(),
      description: listDescription.trim(),
      games: [this.data.itemId],
      userId: userId
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: (error) => console.error('Error creating new list:', error)
    });
  }

  addToList(list: GameList): void {
    if (!list.games.includes(this.data.itemId)) {
      list.games.push(this.data.itemId);
      this.gameListService.updateList(list.id, {
        title: list.title,
        description: list.description,
        games: list.games,
        userId: list.userId
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (error) => console.error('Error adding to list:', error)
      });
    } else {
      this.dialogRef.close(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
