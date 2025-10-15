import { Component, OnInit, inject } from '@angular/core';
import { Game } from '../../../models/game.model';
import { GameFirebaseService } from '../../../services/gameFirebase.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { LogGamePopupComponent } from '../../log-game-popup/log-game-popup.component';
import { UniversalLogPopupComponent } from '../../shared/universal-log-popup/universal-log-popup.component';
import { AuthService } from '../../../services/auth.service';
import { GameLogService } from '../../../services/gamelog.service';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/review.model';
import { GeneralDeleteButtonComponent } from '../../shared/general-delete-button/general-delete-button.component';
import { GameReviewEditComponent } from '../game-review-edit/game-review-edit.component';
import { GameEditDialogComponent } from '../game-edit-dialog/game-edit-dialog.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatGridListModule,
    MatDialogModule,
    MatTabsModule,
    ReactiveFormsModule,
    GeneralDeleteButtonComponent,
  ],
  templateUrl: './game-details.component.html',
  styleUrl: './game-details.component.css',
})
export class GameDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private dialog = inject(MatDialog);
  public authService = inject(AuthService);
  private gameLogService = inject(GameLogService);
  private reviewService = inject(ReviewService);
  private fb = inject(FormBuilder);
  gameFirebaseService = inject(GameFirebaseService);
  private snackBar = inject(MatSnackBar);
  private adminService = inject(AdminService);
  
  game?: Game;
  rating?: number;
  currentRating: number = 0;
  disabled: boolean = false;
  reviews: Review[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  currenUser = this.authService.getUid();
  gameId: string | null = null;
  reviewForm: FormGroup;
  isAdmin: boolean = false;

  constructor() {
    this.reviewForm = this.fb.group({
      reviewText: ['', [Validators.required, Validators.minLength(10)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  async ngOnInit() {
    console.log('Current user:', this.currenUser);
    if (this.currenUser === null || this.currenUser === undefined) {
      this.disabled = true;
    } else {
      this.currentUserId = await this.currenUser;
      this.disabled = false;
      
      // Check if user is admin
      this.adminService.isAdmin().subscribe({
        next: (isAdmin) => {
          this.isAdmin = isAdmin;
        },
        error: (error) => {
          console.error('Error checking admin status:', error);
          this.isAdmin = false;
        }
      });
    }
    
    this.gameId = this.route.snapshot.paramMap.get('id');

    if (this.gameId) {
      this.isLoading = true;
      this.gameFirebaseService.getGameById(this.gameId).subscribe({
        next: (game) => {
          this.game = game;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load game details. Please try again later.';
          this.isLoading = false;
          console.error('Error loading game:', err);
        }
      });
    }
    
    this.getReviews();
  }

  openLogGamePopup() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add games to your log', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.game || !this.gameId) return;

    const dialogRef = this.dialog.open(LogGamePopupComponent, {
      maxWidth: '550px',
      width: '95vw',
      panelClass: ['game-log-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: {
        game: this.game,
        gameId: this.gameId,
      },
    });

    dialogRef.componentInstance.logUpdated.subscribe(() => {
      this.getReviews();
      if (this.gameId) {
        this.gameFirebaseService.getGameById(this.gameId).subscribe((game) => {
          this.game = game;
        });
      }
    });

    dialogRef.afterClosed().subscribe();
  }

  getReviews() {
    if (!this.gameId) return;
    this.reviewService.getReviewsByGameId(this.gameId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        console.log('Reviews loaded:', reviews);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.error = 'Failed to load reviews. Please try again later.';
      }
    });
  }

  editReview(review: Review) {
    if (!review || !review.id) return;

    const dialogRef = this.dialog.open(GameReviewEditComponent, {
      width: '550px',
      panelClass: ['game-review-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: { review: review }
    });

    dialogRef.componentInstance.reviewUpdated.subscribe((updatedReview) => {
      const index = this.reviews.findIndex(r => r.id === updatedReview.id);
      if (index !== -1) {
        this.reviews[index] = updatedReview;
      }
    });
  }

  deleteReview(review: Review) {
    if (!review || !review.id) return;
    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== review.id);
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.error = 'Failed to delete review. Please try again later.';
      }
    });
  }

  onAddReview() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add reviews', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.game || !this.gameId || !this.currentUserId) return;

    const dialogRef = this.dialog.open(GameReviewEditComponent, {
      width: '550px',
      panelClass: ['game-review-dialog', 'minimal-theme-dialog'],
      autoFocus: false,
      backdropClass: 'minimal-backdrop',
      data: {
        gameId: this.gameId,
        gameTitle: this.game.title,
        userId: this.currentUserId
      }
    });

    dialogRef.componentInstance.reviewUpdated.subscribe((updatedReview) => {
      const index = this.reviews.findIndex(r => r.id === updatedReview.id);
      if (index !== -1) {
        this.reviews[index] = updatedReview;
      } else {
        this.reviews.unshift(updatedReview);
      }
    });
  }

  onEditGame() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to edit games', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.game) return;

    const dialogRef = this.dialog.open(GameEditDialogComponent, {
      width: '500px',
      data: this.game
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gameFirebaseService.updateGame(result).subscribe({
          next: () => {
            this.game = result;
          },
          error: (error: Error) => {
            console.error('Error updating game:', error);
            this.snackBar.open('Failed to update game', 'Close', {
              duration: 3000,
            });
          }
        });
      }
    });
  }

  onTabChange(index: number) {
    // Handle tab change if needed
  }
}
