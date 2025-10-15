import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, map, of, forkJoin, combineLatest, switchMap, catchError } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDocs,
  docData,
  updateDoc
} from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { ReviewService } from './review.service';
import { GameLogService } from './gamelog.service';
import { MovieLogService } from './movieLog.service';
import { BookLogService } from './booklog.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private gameLogService = inject(GameLogService);
  private movieLogService = inject(MovieLogService);
  private bookLogService = inject(BookLogService);
  
  // Define admin email - you can expand this to use a database collection later
  private readonly ADMIN_EMAILS = ['admin@example.com'];

  constructor() { }

  /**
   * Check if current user is admin.
   * Priority: Firestore user doc (isAdmin true or role==='admin') OR fallback to static email list
   */
  isAdmin(): Observable<boolean> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of(false);
        const email = user.email || '';
        const staticAdmin = !!email && this.ADMIN_EMAILS.includes(email);
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return docData(userDocRef).pipe(
          map((data: any) => {
            if (!data) return staticAdmin;
            return !!data.isAdmin || data.role === 'admin' || staticAdmin;
          }),
          catchError(() => of(staticAdmin))
        );
      })
    );
  }

  /** Promote/Demote a user (can be used from an admin UI later) */
  async setUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
    if (!userId) throw new Error('User ID required');
    const userDocRef = doc(this.firestore, 'users', userId);
    await updateDoc(userDocRef, { isAdmin });
  }

  /**
   * Get all users from the system
   */
  getAllUsers(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'users');
    const usersQuery = query(usersCollection, orderBy('username', 'asc'));
    
    return collectionData(usersQuery, { idField: 'id' }).pipe(
      map((users) => users.map((user) => this.mapToUserModel(user as any)))
    );
  }

  /**
   * Search users by username or email
   */
  searchUsers(searchTerm: string): Observable<User[]> {
    if (!searchTerm.trim()) {
      return this.getAllUsers();
    }

    const usersCollection = collection(this.firestore, 'users');
    
    return collectionData(usersCollection, { idField: 'id' }).pipe(
      map((users) => {
        const filteredUsers = users.filter((user: any) => {
          const username = (user.username || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          const search = searchTerm.toLowerCase();
          
          return username.includes(search) || email.includes(search);
        });
        
        return filteredUsers.map((user) => this.mapToUserModel(user as any));
      })
    );
  }

  /**
   * Delete a user by ID
   */
  async deleteUser(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Don't allow deletion of admin users
    const userDoc = doc(this.firestore, `users/${userId}`);
    
    try {
      await deleteDoc(userDoc);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Delete any review by its ID (admin only)
   */
  async deleteReviewById(reviewId: string): Promise<void> {
    if (!reviewId) throw new Error('Review ID is required');
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    try {
      await deleteDoc(reviewDoc);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Failed to delete review');
    }
  }

  /**
   * Get admin dashboard statistics
   */
  getAdminStats(): Observable<any> {
    return this.getAllUsers().pipe(
      map(users => ({
        totalUsers: users.length,
        adminUsers: users.filter(user => this.ADMIN_EMAILS.includes(user.email)).length,
        regularUsers: users.filter(user => !this.ADMIN_EMAILS.includes(user.email)).length
      }))
    );
  }

  /**
   * Get user statistics including reviews, ratings, and logs
   */
  getUserStatistics(userId: string): Observable<any> {
    return combineLatest([
      this.getUserReviewCount(userId),
      this.getUserGameLogCount(userId),
      this.getUserMovieLogCount(userId),
      this.getUserBookLogCount(userId)
    ]).pipe(
      map(([reviewCount, gameLogCount, movieLogCount, bookLogCount]) => ({
        reviews: reviewCount,
        gameLogs: gameLogCount,
        movieLogs: movieLogCount,
        bookLogs: bookLogCount,
        totalLogs: gameLogCount + movieLogCount + bookLogCount,
        totalActivity: reviewCount + gameLogCount + movieLogCount + bookLogCount
      }))
    );
  }

  /**
   * Get user review count
   */
  private getUserReviewCount(userId: string): Observable<number> {
    const reviewsCollection = collection(this.firestore, 'reviews');
    const userReviewsQuery = query(reviewsCollection, where('userId', '==', userId));
    
    return collectionData(userReviewsQuery).pipe(
      map(reviews => reviews.length)
    );
  }

  /**
   * Get user game log count
   */
  private getUserGameLogCount(userId: string): Observable<number> {
    const gameLogsCollection = collection(this.firestore, 'gameLogs');
    const userGameLogsQuery = query(gameLogsCollection, where('userId', '==', userId));
    
    return collectionData(userGameLogsQuery).pipe(
      map(logs => logs.length)
    );
  }

  /**
   * Get user movie log count
   */
  private getUserMovieLogCount(userId: string): Observable<number> {
    const movieLogsCollection = collection(this.firestore, 'movieLogs');
    const userMovieLogsQuery = query(movieLogsCollection, where('userId', '==', userId));
    
    return collectionData(userMovieLogsQuery).pipe(
      map(logs => logs.length)
    );
  }

  /**
   * Get user book log count
   */
  private getUserBookLogCount(userId: string): Observable<number> {
    const bookLogsCollection = collection(this.firestore, 'bookLogs');
    const userBookLogsQuery = query(bookLogsCollection, where('userId', '==', userId));
    
    return collectionData(userBookLogsQuery).pipe(
      map(logs => logs.length)
    );
  }

  /**
   * Map raw Firebase data to User model
   */
  private mapToUserModel(data: any): User {
    return {
      id: data.id || '',
      email: data.email || '',
      username: data.username || '',
      avatarUrl: data.avatarUrl || '',
      bio: data.bio || '',
      personalLog: Array.isArray(data.personalLog) ? data.personalLog : [],
      reviewIds: Array.isArray(data.reviewIds) ? data.reviewIds : [],
      ratings: Array.isArray(data.ratings) ? data.ratings : [],
      favorites: Array.isArray(data.favorites) ? data.favorites : [],
      currentlyPlaying: Array.isArray(data.currentlyPlaying) ? data.currentlyPlaying : []
    };
  }
}