import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

export interface WishlistConfirmationData {
  itemType: string;
}

@Component({
  selector: 'app-wishlist-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './wishlist-confirmation-dialog.component.html',
  styleUrls: ['./wishlist-confirmation-dialog.component.css']
})
export class WishlistConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WishlistConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WishlistConfirmationData,
    private router: Router
  ) {}

  viewWishlist(): void {
    this.dialogRef.close();
    this.router.navigate(['/my_lists']);
  }

  close(): void {
    this.dialogRef.close();
  }
}
