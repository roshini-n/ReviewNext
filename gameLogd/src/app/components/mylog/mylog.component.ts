import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameLogService } from '../../services/gamelog.service';
import { GameLog } from '../../models/gameLog.model';
import { AuthService } from '../../services/auth.service';
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { Game } from '../../models/game.model';
import { CombinedLogGame } from '../../models/combinedLogGame.model';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GeneralDeleteButtonComponent } from '../shared/general-delete-button/general-delete-button.component';
import { LogGamePopupComponent } from '../log-game-popup/log-game-popup.component';

@Component({
  selector: 'app-mylog',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    GeneralDeleteButtonComponent
  ],
  templateUrl: './mylog.component.html',
  styleUrl: './mylog.component.css',
})
export class MylogComponent implements OnInit {
  gameLogs: GameLog[] = [];
  userId: string = '';
  usersGames: Game[] = [];
  combinedLogs: CombinedLogGame[] = [];

  constructor(
    private gamelogService: GameLogService,
    private authService: AuthService,
    private gameService: GameFirebaseService,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getUserIdAndLoadLogs();
    await this.loadAllGamesFromLogs(this.gameLogs); // await so we know that our users gameLogs have been gotten
    await this.combineLogsAndGames();
  }

  async getUserIdAndLoadLogs(): Promise<void> {
    try {
      this.userId = await this.authService.getUid();
      await this.loadUserGameLogs();
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
  }

  // method to user our GameLogService to get the game logs for the current user
  async loadUserGameLogs(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.gamelogService.getReviewsByUserId(this.userId).subscribe({
        next: (gameLogs: GameLog[]) => {
          this.gameLogs = gameLogs;
          console.log('Game logs loaded:', this.gameLogs);
          resolve();
        },
        error: (error) => {
          console.error('Error fetching game logs:', error);
          reject(error);
        },
      });
    });
  }

  // method to get all games from gameLogService
  async loadAllGamesFromLogs(gameLogs: GameLog[]): Promise<void> {
    let games: string[] = [];
    console.log('Game logs:', gameLogs);
    for (let log of gameLogs) {
      // Check if gameId exists and isn't empty
      if (log.gameId && log.gameId !== '') {
        games.push(log.gameId);
      } else {
        console.warn('Log missing gameId:', log);
      }
    }

    console.log('Fetching games with IDs:', games);

    if (games.length === 0) {
      console.log('No valid game IDs found in logs');
      this.usersGames = [];
      return;
    }

    this.gameService.getGamesByIds(games).subscribe({
      next: async (games: Game[]) => {
        this.usersGames = games;
        console.log("User's games loaded:", this.usersGames);
        await this.combineLogsAndGames();
      },
      error: (error) => {
        console.error('Error fetching games:', error);
        alert('Error fetching games');
      },
    });
  }

  private convertTimestamp(timestamp: any): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    return timestamp;
  }

  async combineLogsAndGames(): Promise<void> {
    try {
      const combinedLogs = this.gameLogs
        .map((log) => {
          const game = this.usersGames.find((game) => game.id === log.gameId);
          if (game) {
            return {
              gamelogId: log.id,
              gameId: log.gameId,
              review: log.review,
              rating: log.rating,
              startDate: this.convertTimestamp(log.dateStarted),
              endDate: this.convertTimestamp(log.dateCompleted),
              userId: log.userId,
              title: game.title,
              description: game.description,
              platforms: game.platforms,
              releaseDate: game.releaseDate,
              developer: game.developer,
              publisher: game.publisher,
              playersPlayed: game.playersPlayed,
              imageUrl: game.imageUrl,
            } as CombinedLogGame;
          }
          return null;
        })
        .filter((log): log is CombinedLogGame => log !== null);

      this.combinedLogs = combinedLogs;
      console.log('Combined logs created:', this.combinedLogs);
    } catch (error) {
      console.error('Error combining logs and games:', error);
    }
  }

  editGameLog(combinedLog: CombinedLogGame): void {
    const dialogData = {
      game: combinedLog,
      log: {
        id: combinedLog.gamelogId,
        dateStarted: combinedLog.startDate,
        dateCompleted: combinedLog.endDate,
        review: combinedLog.review,
        rating: combinedLog.rating,
        isReplay: combinedLog.isReplay,
        containsSpoilers: false,
        gameId: combinedLog.gameId,
        userId: combinedLog.userId
      },
      isEdit: true // indicates that this is an edit operation
    };

    const dialogRef = this.dialog.open(LogGamePopupComponent, {
      data: dialogData,
      panelClass: ['custom-dialog-container', 'fade-in-dialog'],
      width: '500px',
      autoFocus: false,
      disableClose: false,
      backdropClass: 'dialog-backdrop'
    });

    dialogRef.afterClosed().subscribe(async (result) => {
  
      console.log('Dialog closed, refreshing data...');
      
      try {
        await this.loadUserGameLogs();
        await this.loadAllGamesFromLogs(this.gameLogs);
        await this.combineLogsAndGames();
        
        if (result) {
          console.log('Dialog result:', result);
        } else {
          console.log('Dialog was closed without returning result');
        }
      } catch (error) {
        console.error('Error refreshing data after log edit:', error);
      }
    });
  }

  deleteLog(combinedLog: CombinedLogGame): void {
    this.gamelogService.deleteLog(combinedLog.gamelogId).subscribe({
      next: async () => {
        console.log(`Log for "${combinedLog.title}" deleted successfully.`);
        await this.loadUserGameLogs();
        await this.loadAllGamesFromLogs(this.gameLogs);
        await this.combineLogsAndGames();
      },
      error: (error) => {
        console.error('Error deleting log:', error);
        alert('Failed to delete the log. Please try again.');
      },
    });
  }
}
