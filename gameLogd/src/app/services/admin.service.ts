import { Injectable, inject } from '@angular/core';
<<<<<<< Updated upstream
import { AuthService } from './auth.service';
import { Observable, map, of, forkJoin, combineLatest, switchMap, catchError } from 'rxjs';
=======
>>>>>>> Stashed changes
import {
  Firestore,
  collection,
  collectionData,
  doc,
  deleteDoc,
<<<<<<< Updated upstream
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
=======
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  getCountFromServer
} from '@angular/fire/firestore';
import { Observable, from, forkJoin, map } from 'rxjs';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role: string;
  createdAt: any;
  lastLogin?: any;
  totalReviews: number;
  totalLists: number;
}

export interface AdminReview {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl?: string;
  productType: string;
  productId: string;
  productTitle: string;
  reviewText: string;
  rating: number;
  datePosted: any;
  lastUpdated?: any;
  likes?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalReviews: number;
  totalProducts: number;
  totalLists: number;
  newUsersToday: number;
  reviewsToday: number;
}

export interface ProductStats {
  games: number;
  books: number;
  movies: number;
  webSeries: number;
  electronicGadgets: number;
  beautyProducts: number;
}
>>>>>>> Stashed changes

@Injectable({
  providedIn: 'root'
})
export class AdminService {
<<<<<<< Updated upstream
  
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
=======
  firestore = inject(Firestore);

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [users, reviews, products, lists] = await Promise.all([
        this.getTotalCount('users'),
        this.getTotalCount('reviews'),
        this.getTotalProductsCount(),
        this.getTotalCount('user-lists')
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const [newUsersToday, reviewsToday] = await Promise.all([
        this.getCountSinceDate('users', 'createdAt', todayTimestamp),
        this.getCountSinceDate('reviews', 'datePosted', todayTimestamp)
      ]);

      return {
        totalUsers: users,
        totalReviews: reviews,
        totalProducts: products,
        totalLists: lists,
        newUsersToday,
        reviewsToday
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  private async getTotalCount(collectionName: string): Promise<number> {
    const collectionRef = collection(this.firestore, collectionName);
    const snapshot = await getCountFromServer(collectionRef as any);
    return snapshot.data().count as number;
  }

  private async getTotalProductsCount(): Promise<number> {
    const collections = ['games', 'books', 'movies', 'web-series', 'electronic-gadgets', 'beauty-products'];
    const counts = await Promise.all(
      collections.map(col => this.getTotalCount(col))
    );
    return counts.reduce((total, count) => total + count, 0);
  }

  private async getCountSinceDate(collectionName: string, dateField: string, since: Timestamp): Promise<number> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = query(collectionRef, where(dateField, '>=', since));
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // User Management
  getAllUsers(): Observable<AdminUser[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' }).pipe(
      map((users: any[]) =>
        users.map(user => ({
          ...user,
          totalReviews: user.totalReviews ?? 0,
          totalLists: user.totalLists ?? 0
        }))
      )
    );
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const batch = writeBatch(this.firestore);
      
      // Delete user document
      const userRef = doc(this.firestore, 'users', userId);
      batch.delete(userRef);

      // Delete all user's reviews
      const reviewsQuery = query(
        collection(this.firestore, 'reviews'),
        where('userId', '==', userId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      reviewsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      // Delete all user's ratings
      const ratingsQuery = query(
        collection(this.firestore, 'ratings'),
        where('userId', '==', userId)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);
      ratingsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      // Delete all user's lists
      const listsQuery = query(
        collection(this.firestore, 'user-lists'),
        where('userId', '==', userId)
      );
      const listsSnapshot = await getDocs(listsQuery);
      listsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserDetails(userId: string): Promise<AdminUser | null> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      
      // Get user's review count
      const reviewsQuery = query(
        collection(this.firestore, 'reviews'),
        where('userId', '==', userId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      // Get user's lists count
      const listsQuery = query(
        collection(this.firestore, 'user-lists'),
        where('userId', '==', userId)
      );
      const listsSnapshot = await getDocs(listsQuery);

      return {
        id: userDoc.id,
        ...userData,
        totalReviews: reviewsSnapshot.size,
        totalLists: listsSnapshot.size
      } as AdminUser;
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }

  // Review Management
  getAllReviews(): Observable<AdminReview[]> {
    const reviewsCollection = collection(this.firestore, 'reviews');
    const q = query(reviewsCollection, orderBy('datePosted', 'desc'));
    
    return collectionData(q, { idField: 'id' }) as Observable<AdminReview[]>;
  }

  getReviewsByProduct(productType: string, productId: string): Observable<AdminReview[]> {
    const reviewsCollection = collection(this.firestore, 'reviews');
    const q = query(
      reviewsCollection,
      where('productType', '==', productType),
      where('productId', '==', productId),
      orderBy('datePosted', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<AdminReview[]>;
  }

  getReviewsByUser(userId: string): Observable<AdminReview[]> {
    const reviewsCollection = collection(this.firestore, 'reviews');
    const q = query(
      reviewsCollection,
      where('userId', '==', userId),
      orderBy('datePosted', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<AdminReview[]>;
  }

  async deleteReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(this.firestore, 'reviews', reviewId);
      await deleteDoc(reviewRef);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  async updateReview(reviewId: string, updates: Partial<AdminReview>): Promise<void> {
    try {
      const reviewRef = doc(this.firestore, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        ...updates,
        lastUpdated: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Product Management
  async getProductStats(): Promise<ProductStats> {
    try {
      const [games, books, movies, webSeries, electronicGadgets, beautyProducts] = await Promise.all([
        this.getTotalCount('games'),
        this.getTotalCount('books'),
        this.getTotalCount('movies'),
        this.getTotalCount('web-series'),
        this.getTotalCount('electronic-gadgets'),
        this.getTotalCount('beauty-products')
      ]);

      return {
        games,
        books,
        movies,
        webSeries,
        electronicGadgets,
        beautyProducts
      };
    } catch (error) {
      console.error('Error getting product stats:', error);
      throw error;
    }
  }

  getProductsByCategory(category: string): Observable<any[]> {
    const productsCollection = collection(this.firestore, category);
    return collectionData(productsCollection, { idField: 'id' }).pipe(
      map((items: any[]) =>
        items
          .map(it => ({ ...it, _sortKey: (it.title || it.name || '').toString().toLowerCase() }))
          .sort((a, b) => a._sortKey.localeCompare(b._sortKey))
          .map(({ _sortKey, ...rest }) => rest)
      )
    );
  }

  async deleteProduct(category: string, productId: string): Promise<void> {
    try {
      const batch = writeBatch(this.firestore);
      
      // Delete product document
      const productRef = doc(this.firestore, category, productId);
      batch.delete(productRef);

      // Delete all reviews for this product
      const reviewsQuery = query(
        collection(this.firestore, 'reviews'),
        where('productId', '==', productId),
        where('productType', '==', category)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      reviewsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      // Delete all ratings for this product
      const ratingsQuery = query(
        collection(this.firestore, 'ratings'),
        where('productId', '==', productId),
        where('productType', '==', category)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);
      ratingsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    try {
      const [userStats, reviewStats, productStats] = await Promise.all([
        this.getUserAnalytics(),
        this.getReviewAnalytics(),
        this.getProductStats()
      ]);

      return {
        users: userStats,
        reviews: reviewStats,
        products: productStats
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  private async getUserAnalytics(): Promise<any> {
    // Get users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysTimestamp = Timestamp.fromDate(thirtyDaysAgo);

    const usersQuery = query(
      collection(this.firestore, 'users'),
      where('createdAt', '>=', thirtyDaysTimestamp),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(usersQuery);
    const usersByDay: { [key: string]: number } = {};
    
    snapshot.docs.forEach(doc => {
      const date = doc.data()['createdAt'].toDate().toDateString();
      usersByDay[date] = (usersByDay[date] || 0) + 1;
    });

    return {
      newUsersLast30Days: snapshot.size,
      registrationTrend: usersByDay
    };
  }

  private async getReviewAnalytics(): Promise<any> {
    // Get reviews from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysTimestamp = Timestamp.fromDate(thirtyDaysAgo);

    const reviewsQuery = query(
      collection(this.firestore, 'reviews'),
      where('datePosted', '>=', thirtyDaysTimestamp),
      orderBy('datePosted', 'asc')
    );
    
    const snapshot = await getDocs(reviewsQuery);
    const reviewsByDay: { [key: string]: number } = {};
    const reviewsByCategory: { [key: string]: number } = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data['datePosted'].toDate().toDateString();
      const category = data['productType'];
      
      reviewsByDay[date] = (reviewsByDay[date] || 0) + 1;
      reviewsByCategory[category] = (reviewsByCategory[category] || 0) + 1;
    });

    return {
      reviewsLast30Days: snapshot.size,
      reviewTrend: reviewsByDay,
      reviewsByCategory
    };
  }

  // Search functionality
  searchUsers(searchTerm: string): Observable<AdminUser[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  searchReviews(searchTerm: string): Observable<AdminReview[]> {
    return this.getAllReviews().pipe(
      map(reviews => reviews.filter(review => 
        review.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.username.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }
}
>>>>>>> Stashed changes
