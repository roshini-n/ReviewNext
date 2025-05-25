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
        Validators.minLength(10),
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
          this.dialogRef.close();
          this.snackBar.open('Game log updated successfully', 'Close', {
            duration: 2000,
          });
          this.logUpdated.emit(); // Emit the event
        });
      } else {
        console.error('Game log ID is missing.');
        this.snackBar.open('Failed to update game log: ID is missing', 'Close', {
          duration: 2000,
        });
      }
    }
    else{
      this.gameLogSevice.addGameLog({
        ...this.logForm.value,
        gameId: this.gameId,
        endDate: this.logForm.value.dateCompleted,
        startDate: this.logForm.value.dateStarted,
        userId: currentUser,
        rating: this.rating,
      }).subscribe({
        next: () => {
          this.reviewService.addReview({
            gameId: this.gameId,
            username: this.username,
            userId: currentUser,
            reviewText: this.logForm.value.review,
            datePosted: new Date(),
            gameTitle: this.data.game?.title || '',
            rating: this.rating,
          }).subscribe({
            next: () => {
              if (this.logForm.valid) {
                this.dialogRef.close({
                  ...this.logForm.value,
                  gameId: this.gameId,
                  rating: this.rating,
                });
                this.snackBar.open('Game logged successfully', 'Close', {
                  duration: 2000,
                });
                this.logUpdated.emit();
              }
            },
            error: () => {
              this.snackBar.open('Failed to add review', 'Close', { duration: 2000 });
            }
          });
        },
        error: () => {
          this.snackBar.open('Failed to add log', 'Close', { duration: 2000 });
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