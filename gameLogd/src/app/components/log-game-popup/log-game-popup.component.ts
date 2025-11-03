import { Component, inject, Inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { Game } from '../../models/game.model';
import { GameLog } from '../../models/gameLog.model';
import { GameLogService } from '../../services/gamelog.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReviewService } from '../../services/review.service';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-log-game-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './log-game-popup.component.html',
  styleUrl: './log-game-popup.component.css',
})
export class LogGamePopupComponent {
  gameLogSevice = inject(GameLogService);
  authService = inject(AuthService);
  reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);

  @Output() logUpdated: EventEmitter<void> = new EventEmitter<void>();
  @Output() reviewUpdated: EventEmitter<any> = new EventEmitter<any>();

  logForm: FormGroup;
  rating: number = 0;
  hoverRating: number = 0;
  gameId: string = '';
  username: string = '';

  ratingTexts: string[] = ['Not rated', 'Awful', 'Poor', 'Ok', 'Good', 'Great'];

  constructor(
    public dialogRef: MatDialogRef<LogGamePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { game: Game; gameId?: string; log?: GameLog },
    private snackBar: MatSnackBar
  ) {
    // get game ID from route or data passed through dialog
    this.route.paramMap.subscribe((params) => {
      const routeGameId = params.get('id');
      this.gameId = routeGameId || data.gameId || data.game?.id || '';
      console.log('Game ID from route or data:', this.gameId);
    });

    // set data for the form if brought in from the edit game log
    this.logForm = new FormGroup({
      dateStarted: new FormControl(data.log?.dateStarted || null),
      dateCompleted: new FormControl(data.log?.dateCompleted || null),
      review: new FormControl(data.log?.review || '', [
        Validators.maxLength(500),
      ]),
      isReplay: new FormControl(data.log?.isReplay || false),
      containsSpoilers: new FormControl(data.log?.containsSpoilers || false),
    });
    
    // set rating if it exists in the log data
    if (data.log?.rating) {
      this.rating = data.log.rating;
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  async onSubmitClick(): Promise<void> {
    const currentUser = await this.authService.getUid();

    console.log('=== GAME LOG DEBUG ===');
    console.log('Current User ID:', currentUser);
    console.log('Game ID:', this.gameId);
    console.log('Rating:', this.rating);
    console.log('Form Data:', this.logForm.value);

    if (!currentUser) {
      console.error('User ID is not available.');
      alert('Please log in to review a game!');
      return;
    }

    if (this.authService.getUsername() === null) {
      ('Username is not available.');
      return;
    }
    else
    {
      this.username = this.authService.getUsername() || '';
    }
    if (this.data.log?.gameId){
      const updatedLog = {
        id: this.data.log.id,
        dateStarted: this.logForm.value.dateStarted,
        dateCompleted: this.logForm.value.dateCompleted,
        review: this.logForm.value.review,
        isReplay: this.logForm.value.isReplay,
        rating: this.rating
      };

      if (this.data.log.id) {
        this.gameLogSevice.updateGameLog(this.data.log.id, updatedLog).subscribe(() => {
          // Update or create review if rating or review text is provided
          if ((this.rating > 0 || this.logForm.value.review) && this.data.log?.gameId) {
            const reviewData = {
              gameId: this.data.log.gameId,
              userId: currentUser,
              rating: this.rating || 0,
              reviewText: this.logForm.value.review || '',
              username: this.username,
              datePosted: new Date()
            };

            // Check if review already exists for this user and game
            this.reviewService.hasUserReviewedGame(this.data.log.gameId).subscribe({
              next: (hasReviewed) => {
                if (hasReviewed && this.data.log?.gameId) {
                  // Find and update existing review
                  this.reviewService.getReviewsByGameId(this.data.log.gameId).subscribe({
                    next: (reviews) => {
                      const userReview = reviews.find(r => r.userId === currentUser);
                      if (userReview && userReview.id) {
                        this.reviewService.updateReview(userReview.id, reviewData).subscribe({
                          next: () => {
                            const updatedReview = { ...userReview, ...reviewData };
                            this.reviewUpdated.emit(updatedReview);
                            this.dialogRef.close();
                            this.snackBar.open('Game log and review updated successfully', 'Close', {
                              duration: 2000,
                            });
                            this.logUpdated.emit();
                          }
                        });
                      }
                    }
                  });
                } else {
                  // Create new review
                  this.reviewService.addReview(reviewData).subscribe({
                    next: (createdReview) => {
                      this.reviewUpdated.emit(createdReview);
                      this.dialogRef.close();
                      this.snackBar.open('Game log updated and review added', 'Close', {
                        duration: 2000,
                      });
                      this.logUpdated.emit();
                    }
                  });
                }
              }
            });
          } else {
            this.dialogRef.close();
            this.snackBar.open('Game log updated successfully', 'Close', {
              duration: 2000,
            });
            this.logUpdated.emit();
          }
        });
      } else {
        console.error('Game log ID is missing.');
        this.snackBar.open('Failed to update game log: ID is missing', 'Close', {
          duration: 2000,
        });
      }
    }
    else {
      if (!this.logForm.valid) {
        this.snackBar.open('Please fill in all required fields', 'Close', { duration: 2000 });
        return;
      }

      this.gameLogSevice.addGameLog({
        ...this.logForm.value,
        gameId: this.gameId,
        endDate: this.logForm.value.dateCompleted,
        startDate: this.logForm.value.dateStarted,
        userId: currentUser,
        rating: this.rating,
      }).subscribe({
        next: () => {
          // Create a review if rating or review text is provided
          if (this.rating > 0 || this.logForm.value.review) {
            const reviewData = {
              gameId: this.gameId,
              userId: currentUser,
              rating: this.rating || 0,
              reviewText: this.logForm.value.review || '',
              username: this.username,
              datePosted: new Date()
            };

            this.reviewService.addReview(reviewData).subscribe({
              next: (createdReview) => {
                console.log('Review created:', createdReview);
                this.reviewUpdated.emit(createdReview);
                this.dialogRef.close();
                this.snackBar.open('Game logged and reviewed successfully', 'Close', {
                  duration: 2000,
                });
                this.logUpdated.emit();
              },
              error: (reviewError: any) => {
                console.error('Error creating review:', reviewError);
                // Still close dialog as game log was successful
                this.dialogRef.close();
                this.snackBar.open('Game logged, but review failed to save', 'Close', {
                  duration: 3000,
                });
                this.logUpdated.emit();
              }
            });
          } else {
            this.dialogRef.close();
            this.snackBar.open('Game logged successfully', 'Close', {
              duration: 2000,
            });
            this.logUpdated.emit();
          }
        },
        error: (error: any) => {
          console.error('Error saving game log:', error);
          const errorMessage = error?.message || 'Failed to add log';
          this.snackBar.open(`Error: ${errorMessage}`, 'Close', { 
            duration: 5000 
          });
        }
      });
    }
  }

  setRating(rating: number): void {
    this.rating = rating;
  }

  isStarFilled(starNumber: number): boolean {
    return starNumber <= this.rating;
  }

  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }

  clearHoverRating(): void {
    this.hoverRating = 0;
  }

  isStarHovered(starNumber: number): boolean {
    return this.hoverRating > 0 && starNumber <= this.hoverRating;
  }

  getRatingText(): string {
    return this.ratingTexts[this.rating] || '';
  }
}