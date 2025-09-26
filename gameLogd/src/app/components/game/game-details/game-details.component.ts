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
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LogGamePopupComponent } from '../../log-game-popup/log-game-popup.component';
import { AuthService } from '../../../services/auth.service';
import { GameLogService } from '../../../services/gamelog.service';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/review.model';
import { GeneralDeleteButtonComponent } from '../../shared/general-delete-button/general-delete-button.component';
import { GameReviewEditComponent } from '../game-review-edit/game-review-edit.component';

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
    MatChipsModule,
    MatGridListModule,
    MatDialogModule,
    LogGamePopupComponent,
    GeneralDeleteButtonComponent,
    GameReviewEditComponent,
  ],
  templateUrl: './game-details.component.html',
  styleUrl: './game-details.component.css',
})
export class GameDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private gameLogService = inject(GameLogService);
  private reviewService = inject(ReviewService);
  gameFirebaseService = inject(GameFirebaseService);
  game?: Game;
  rating?: number;
  currentRating: number = 0;
  disabled: boolean = false; // use this to disable buttons based on user logged in status
  reviews: Review[] = [];

  // this is an explicitly defined string, whereas the currentUser is a promise
  currentUserId: string | null = null;
  currenUser = this.authService.getUid();
  gameId: string | null = null;

  async ngOnInit() {
    console.log('Current user:', this.currenUser);
    if (this.currenUser === null || this.currenUser === undefined) {
      this.disabled = true;
    } else {
      this.currentUserId = await this.currenUser;
      this.disabled = false;
    }
    // snag the game id from the route of our url
    this.gameId = this.route.snapshot.paramMap.get('id');

    // grab the game by its id
    if (this.gameId) {
      this.gameFirebaseService.getGameById(this.gameId).subscribe((game) => {
        this.game = game;
      });
    }
    
    this.getReviews();
  }

  openLogGamePopup() {
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
    });

    dialogRef.afterClosed().subscribe((result) => {

      this.getReviews();
      if (result) {
        this.gameLogService.addGameLog(result).subscribe((gameLogId) => {
          console.log('Game log added:', gameLogId);
          if (this.gameId) {
            this.gameFirebaseService.getGameById(this.gameId).subscribe((game) => {
              this.game = game;
              let ratingLabel = document.getElementById("rating")
              if (ratingLabel) {
                ratingLabel.innerText = "Rating: " + game?.rating + "/5"
              }
            });
          }
        });
        console.log('Game logged:', result);
      }
    });
  }

  // grab reviews for this game
  getReviews() {
    if (!this.gameId) return;
    this.reviewService.getReviewsByGameId(this.gameId).subscribe((reviews) => {
      this.reviews = reviews;
      console.log('Reviews:', reviews);
    });
  }

  deleteReview(review: Review) {
    this.reviewService.deleteReview(review.id).subscribe(() => {
      console.log('Review deleted:', review.id);
      this.getReviews();
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

    dialogRef.componentInstance.reviewUpdated.subscribe(() => {
      this.getReviews();
    });

    dialogRef.afterClosed().subscribe(updatedReview => {
      if (updatedReview) {
        this.getReviews();
      }
    });
  }
}
