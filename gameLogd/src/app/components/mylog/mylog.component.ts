import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GameLogService } from '../../services/gamelog.service';
import { BookLogService } from '../../services/booklog.service';
import { MovieLogService } from '../../services/movieLog.service';
import { WebSeriesLogService } from '../../services/webSeriesLog.service';
import { ElectronicGadgetLogService } from '../../services/electronicGadgetLog.service';
import { BeautyProductLogService } from '../../services/beautyProductLog.service';
import { GameLog } from '../../models/gameLog.model';
import { BookLog } from '../../models/bookLog.model';
import { AuthService } from '../../services/auth.service';
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { BookFirebaseService } from '../../services/bookFirebase.service';
import { MovieFirebaseService } from '../../services/movieFirebase.service';
import { WebSeriesFirebaseService } from '../../services/webSeriesFirebase.service';
import { ElectronicGadgetFirebaseService } from '../../services/electronicGadgetFirebase.service';
import { BeautyProductFirebaseService } from '../../services/beautyProductFirebase.service';
import { Game } from '../../models/game.model';
import { Book } from '../../models/book.model';
import { Movie } from '../../models/movie.model';
import { WebSeries } from '../../models/web-series.model';
import { ElectronicGadget } from '../../models/electronic-gadget.model';
import { BeautyProduct } from '../../models/beauty-product.model';
import { CombinedLogGame } from '../../models/combinedLogGame.model';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { GeneralDeleteButtonComponent } from '../shared/general-delete-button/general-delete-button.component';

@Component({
  selector: 'app-mylog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    GeneralDeleteButtonComponent
  ],
  templateUrl: './mylog.component.html',
  styleUrl: './mylog.component.css',
})
export class MylogComponent implements OnInit {
  gameLogs: GameLog[] = [];
  userId: string = '';
  usersGames: Game[] = [];
  combinedLogs: any[] = [];

  // All category logs
  allLogs: any[] = [];
  bookLogs: any[] = [];
  movieLogs: any[] = [];
  webSeriesLogs: any[] = [];
  electronicGadgetLogs: any[] = [];
  beautyProductLogs: any[] = [];

  constructor(
    private gamelogService: GameLogService,
    private bookLogService: BookLogService,
    private movieLogService: MovieLogService,
    private webSeriesLogService: WebSeriesLogService,
    private electronicGadgetLogService: ElectronicGadgetLogService,
    private beautyProductLogService: BeautyProductLogService,
    private authService: AuthService,
    private gameService: GameFirebaseService,
    private bookService: BookFirebaseService,
    private movieService: MovieFirebaseService,
    private webSeriesService: WebSeriesFirebaseService,
    private electronicGadgetService: ElectronicGadgetFirebaseService,
    private beautyProductService: BeautyProductFirebaseService,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getUserIdAndLoadAllLogs();
  }

  async getUserIdAndLoadAllLogs(): Promise<void> {
    try {
      this.userId = await this.authService.getUid();
      console.log('Loading logs for user:', this.userId);
      
      await Promise.all([
        this.loadGameLogs(),
        this.loadBookLogs(),
        this.loadMovieLogs(),
        this.loadWebSeriesLogs(),
        this.loadElectronicGadgetLogs(),
        this.loadBeautyProductLogs()
      ]);
      
      console.log('All categories loaded. Combining...');
      this.combineAllLogs();
      console.log('Final counts:', {
        games: this.combinedLogs.length,
        books: this.bookLogs.length,
        movies: this.movieLogs.length,
        webSeries: this.webSeriesLogs.length,
        gadgets: this.electronicGadgetLogs.length,
        beauty: this.beautyProductLogs.length,
        total: this.allLogs.length
      });
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
  }

  private convertTimestamp(timestamp: any): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return undefined;
  }

  // ==================== GAME LOGS ====================
  async loadGameLogs(): Promise<void> {
    return new Promise((resolve) => {
      this.gamelogService.getReviewsByUserId(this.userId).subscribe({
        next: (logs: GameLog[]) => {
          if (logs.length === 0) {
            this.combinedLogs = [];
            resolve();
            return;
          }

          const gameIds = logs.map(log => log.gameId).filter(id => id);
          if (gameIds.length === 0) {
            this.combinedLogs = [];
            resolve();
            return;
          }

          this.gameService.getGamesByIds(gameIds).subscribe({
            next: (games: Game[]) => {
              this.combinedLogs = logs.map(log => {
                const game = games.find(g => g.id === log.gameId);
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
                    category: 'game' as const,
                  } as any;
                }
                return null;
              }).filter(log => log !== null);
              
              console.log('Game logs loaded:', this.combinedLogs.length);
              resolve();
            },
            error: (error) => {
              console.error('Error loading games:', error);
              this.combinedLogs = [];
              resolve();
            }
          });
        },
        error: (error) => {
          console.error('Error loading game logs:', error);
          this.combinedLogs = [];
          resolve();
        }
      });
    });
  }

  // ==================== BOOK LOGS ====================
  async loadBookLogs(): Promise<void> {
    return new Promise((resolve) => {
      this.bookLogService.getBookLogsByUserId(this.userId).subscribe({
        next: (logs: BookLog[]) => {
          if (logs.length === 0) {
            this.bookLogs = [];
            resolve();
            return;
          }

          const bookIds = logs.map(log => log.bookId).filter(id => id);
          if (bookIds.length === 0) {
            this.bookLogs = [];
            resolve();
            return;
          }

          // Fetch books one by one using forkJoin
          const bookObservables = bookIds.map(id => 
            this.bookService.getBookById(id).pipe(catchError(() => of(null)))
          );

          if (bookObservables.length === 0) {
            this.bookLogs = [];
            resolve();
            return;
          }

          forkJoin(bookObservables).subscribe({
            next: (books: (Book | null | undefined)[]) => {
              this.bookLogs = logs.map(log => {
                const book = books.find(b => b && b.id === log.bookId);
                if (book) {
                  return {
                    gamelogId: log.id,
                    gameId: log.bookId,
                    review: log.review,
                    rating: log.rating,
                    startDate: this.convertTimestamp(log.startDate),
                    endDate: this.convertTimestamp(log.endDate),
                    userId: log.userId,
                    title: book.title,
                    imageUrl: book.imageUrl,
                    developer: book.author,
                    category: 'book' as const,
                  };
                }
                return null;
              }).filter(log => log !== null);
              
              console.log('Book logs loaded:', this.bookLogs.length);
              resolve();
            },
            error: (error) => {
              console.error('Error loading books:', error);
              this.bookLogs = [];
              resolve();
            }
          });
        },
        error: (error) => {
          console.error('Error loading book logs:', error);
          this.bookLogs = [];
          resolve();
        }
      });
    });
  }

  // ==================== MOVIE LOGS ====================
  async loadMovieLogs(): Promise<void> {
    return new Promise((resolve) => {
      this.movieLogService.getMovieLogs(this.userId).subscribe({
        next: (logs: any[]) => {
          if (logs.length === 0) {
            this.movieLogs = [];
            resolve();
            return;
          }

          const movieIds = logs.map(log => log.movieId).filter(id => id);
          if (movieIds.length === 0) {
            this.movieLogs = [];
            resolve();
            return;
          }

          // Fetch movies one by one using forkJoin
          const movieObservables = movieIds.map(id => 
            this.movieService.getMovieById(id).pipe(catchError(() => of(null)))
          );

          if (movieObservables.length === 0) {
            this.movieLogs = [];
            resolve();
            return;
          }

          forkJoin(movieObservables).subscribe({
            next: (movies: (Movie | null)[]) => {
              this.movieLogs = logs.map(log => {
                const movie = movies.find(m => m && m.id === log.movieId);
                if (movie) {
                  return {
                    gamelogId: log.id,
                    gameId: log.movieId,
                    review: log.review,
                    rating: log.rating,
                    startDate: this.convertTimestamp(log.dateAdded),
                    endDate: this.convertTimestamp(log.dateCompleted),
                    userId: log.userId,
                    title: movie.title,
                    imageUrl: movie.imageUrl,
                    developer: movie.director,
                    category: 'movie' as const,
                  };
                }
                return null;
              }).filter(log => log !== null);
              
              console.log('Movie logs loaded:', this.movieLogs.length);
              resolve();
            },
            error: (error) => {
              console.error('Error loading movies:', error);
              this.movieLogs = [];
              resolve();
            }
          });
        },
        error: (error) => {
          console.error('Error loading movie logs:', error);
          this.movieLogs = [];
          resolve();
        }
      });
    });
  }

  // ==================== WEB SERIES LOGS ====================
  async loadWebSeriesLogs(): Promise<void> {
    return new Promise((resolve) => {
      this.webSeriesLogService.getSeriesLogs(this.userId).subscribe({
        next: (logs: any[]) => {
          if (logs.length === 0) {
            this.webSeriesLogs = [];
            resolve();
            return;
          }

          const seriesIds = logs.map(log => log.seriesId).filter(id => id);
          if (seriesIds.length === 0) {
            this.webSeriesLogs = [];
            resolve();
            return;
          }

          // Fetch web series one by one using forkJoin
          const seriesObservables = seriesIds.map(id => 
            this.webSeriesService.getWebSeriesById(id).pipe(catchError(() => of(null)))
          );

          if (seriesObservables.length === 0) {
            this.webSeriesLogs = [];
            resolve();
            return;
          }

          forkJoin(seriesObservables).subscribe({
            next: (series: (WebSeries | null)[]) => {
              this.webSeriesLogs = logs.map(log => {
                const webSeries = series.find(s => s && s.id === log.seriesId);
                if (webSeries) {
                  return {
                    gamelogId: log.id,
                    gameId: log.seriesId,
                    review: log.review,
                    rating: log.rating,
                    startDate: this.convertTimestamp(log.dateAdded),
                    endDate: this.convertTimestamp(log.dateCompleted),
                    userId: log.userId,
                    title: webSeries.title,
                    imageUrl: webSeries.imageUrl,
                    developer: webSeries.creator,
                    category: 'webSeries' as const,
                  };
                }
                return null;
              }).filter(log => log !== null);
              
              console.log('Web series logs loaded:', this.webSeriesLogs.length);
              resolve();
            },
            error: (error) => {
              console.error('Error loading web series:', error);
              this.webSeriesLogs = [];
              resolve();
            }
          });
        },
        error: (error) => {
          console.error('Error loading web series logs:', error);
          this.webSeriesLogs = [];
          resolve();
        }
      });
    });
  }

  // ==================== ELECTRONIC GADGET LOGS ====================
  async loadElectronicGadgetLogs(): Promise<void> {
    return new Promise((resolve) => {
      this.electronicGadgetLogService.getGadgetLogs(this.userId).subscribe({
        next: (logs: any[]) => {
          if (logs.length === 0) {
            this.electronicGadgetLogs = [];
            resolve();
            return;
          }

          const gadgetIds = logs.map(log => log.gadgetId).filter(id => id);
          if (gadgetIds.length === 0) {
            this.electronicGadgetLogs = [];
            resolve();
            return;
          }

          // Fetch gadgets one by one using forkJoin
          const gadgetObservables = gadgetIds.map(id => 
            this.electronicGadgetService.getElectronicGadgetById(id).pipe(catchError(() => of(null)))
          );

          if (gadgetObservables.length === 0) {
            this.electronicGadgetLogs = [];
            resolve();
            return;
          }

          forkJoin(gadgetObservables).subscribe({
            next: (gadgets: (ElectronicGadget | null)[]) => {
              this.electronicGadgetLogs = logs.map(log => {
                const gadget = gadgets.find(g => g && g.id === log.gadgetId);
                if (gadget) {
                  return {
                    gamelogId: log.id,
                    gameId: log.gadgetId,
                    review: log.review,
                    rating: log.rating,
                    startDate: this.convertTimestamp(log.dateAdded),
                    endDate: this.convertTimestamp(log.datePurchased),
                    userId: log.userId,
                    title: gadget.name,
                    imageUrl: gadget.imageUrl,
                    developer: gadget.brand,
                    category: 'electronicGadget' as const,
                  };
                }
                return null;
              }).filter(log => log !== null);
              
              console.log('Electronic gadget logs loaded:', this.electronicGadgetLogs.length);
              resolve();
            },
            error: (error) => {
              console.error('Error loading electronic gadgets:', error);
              this.electronicGadgetLogs = [];
              resolve();
            }
          });
        },
        error: (error) => {
          console.error('Error loading electronic gadget logs:', error);
          this.electronicGadgetLogs = [];
          resolve();
        }
      });
    });
  }

  // ==================== BEAUTY PRODUCT LOGS ====================
  async loadBeautyProductLogs(): Promise<void> {
    return new Promise((resolve) => {
      this.beautyProductLogService.getProductLogs(this.userId).subscribe({
        next: (logs: any[]) => {
          if (logs.length === 0) {
            this.beautyProductLogs = [];
            resolve();
            return;
          }

          const productIds = logs.map(log => log.productId).filter(id => id);
          if (productIds.length === 0) {
            this.beautyProductLogs = [];
            resolve();
            return;
          }

          // Fetch products one by one using forkJoin
          const productObservables = productIds.map(id => 
            this.beautyProductService.getBeautyProductById(id).pipe(catchError(() => of(null)))
          );

          if (productObservables.length === 0) {
            this.beautyProductLogs = [];
            resolve();
            return;
          }

          forkJoin(productObservables).subscribe({
            next: (products: (BeautyProduct | null)[]) => {
              this.beautyProductLogs = logs.map(log => {
                const product = products.find(p => p && p.id === log.productId);
                if (product) {
                  return {
                    gamelogId: log.id,
                    gameId: log.productId,
                    review: log.review,
                    rating: log.rating,
                    startDate: this.convertTimestamp(log.dateAdded),
                    endDate: this.convertTimestamp(log.dateOpened),
                    userId: log.userId,
                    title: product.name,
                    imageUrl: product.imageUrl,
                    developer: product.brand,
                    category: 'beautyProduct' as const,
                  };
                }
                return null;
              }).filter(log => log !== null);
              
              console.log('Beauty product logs loaded:', this.beautyProductLogs.length);
              resolve();
            },
            error: (error) => {
              console.error('Error loading beauty products:', error);
              this.beautyProductLogs = [];
              resolve();
            }
          });
        },
        error: (error) => {
          console.error('Error loading beauty product logs:', error);
          this.beautyProductLogs = [];
          resolve();
        }
      });
    });
  }

  // ==================== COMBINE ALL LOGS ====================
  combineAllLogs(): void {
    this.allLogs = [
      ...this.combinedLogs,
      ...this.bookLogs,
      ...this.movieLogs,
      ...this.webSeriesLogs,
      ...this.electronicGadgetLogs,
      ...this.beautyProductLogs
    ];
    console.log('Total logs loaded:', this.allLogs.length);
  }

  deleteLog(combinedLog: any): void {
    console.log('Deleting log:', combinedLog);
    
    let deleteObservable;
    
    // Use the appropriate service based on category
    switch (combinedLog.category) {
      case 'game':
        deleteObservable = this.gamelogService.deleteLog(combinedLog.gamelogId);
        break;
      case 'book':
        deleteObservable = this.bookLogService.deleteBookLog(combinedLog.gamelogId);
        break;
      case 'movie':
        deleteObservable = this.movieLogService.deleteMovieLog(combinedLog.gamelogId);
        break;
      case 'webSeries':
        deleteObservable = this.webSeriesLogService.deleteSeriesLog(combinedLog.gamelogId);
        break;
      case 'electronicGadget':
        deleteObservable = this.electronicGadgetLogService.deleteGadgetLog(combinedLog.gamelogId);
        break;
      case 'beautyProduct':
        deleteObservable = this.beautyProductLogService.deleteProductLog(combinedLog.gamelogId);
        break;
      default:
        console.error('Unknown category:', combinedLog.category);
        alert('Unable to delete log: unknown category');
        return;
    }
    
    deleteObservable.subscribe({
      next: async () => {
        console.log(`Log for "${combinedLog.title}" (${combinedLog.category}) deleted successfully.`);
        // Reload all logs to reflect the deletion
        await this.getUserIdAndLoadAllLogs();
      },
      error: (error) => {
        console.error('Error deleting log:', error);
        alert('Failed to delete the log. Please try again.');
      },
    });
  }

  getCategoryDisplayName(category: string): string {
    const names: { [key: string]: string } = {
      'game': 'Game',
      'book': 'Book',
      'movie': 'Movie',
      'webSeries': 'Web Series',
      'electronicGadget': 'Electronic Gadget',
      'beautyProduct': 'Beauty Product'
    };
    return names[category] || category;
  }
}
