import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';
import { UserService } from './user.service';
import { ReviewService } from './review.service';
import { GameFirebaseService } from './gameFirebase.service';
import { BookFirebaseService } from './bookFirebase.service';
import { MovieFirebaseService } from './movieFirebase.service';
import { WebSeriesFirebaseService } from './webSeriesFirebase.service';
import { ElectronicGadgetFirebaseService } from './electronicGadgetFirebase.service';
import { BeautyProductFirebaseService } from './beautyProductFirebase.service';

export interface AdminAnalytics {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newRegistrations: number;
  };
  contentStats: {
    totalReviews: number;
    totalRatings: number;
    gameCount: number;
    bookCount: number;
    movieCount: number;
    webSeriesCount: number;
    electronicGadgetCount: number;
    beautyProductCount: number;
  };
  engagementMetrics: {
    averageRating: number;
    reviewsPerUser: number;
    mostActiveCategory: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  private reviewService = inject(ReviewService);
  private gameService = inject(GameFirebaseService);
  private bookService = inject(BookFirebaseService);
  private movieService = inject(MovieFirebaseService);
  private webSeriesService = inject(WebSeriesFirebaseService);
  private electronicGadgetService = inject(ElectronicGadgetFirebaseService);
  private beautyProductService = inject(BeautyProductFirebaseService);

  /**
   * Get comprehensive analytics data for admin dashboard
   */
  getAnalytics(): Observable<AdminAnalytics> {
    return combineLatest([
      this.getUserStats(),
      this.getContentStats(),
      this.getEngagementMetrics()
    ]).pipe(
      map(([userStats, contentStats, engagementMetrics]) => ({
        userStats,
        contentStats,
        engagementMetrics
      }))
    );
  }

  /**
   * Get user statistics
   */
  private getUserStats(): Observable<AdminAnalytics['userStats']> {
    return this.userService.getUsers().pipe(
      map(users => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        // For this demo, we'll consider all users as active
        // In a real app, you'd track last login dates
        const totalUsers = users.length;
        const activeUsers = Math.floor(totalUsers * 0.7); // Simulate 70% active rate
        const newRegistrations = Math.floor(totalUsers * 0.1); // Simulate 10% new in last 30 days
        
        return {
          totalUsers,
          activeUsers,
          newRegistrations
        };
      })
    );
  }

  /**
   * Get content statistics
   */
  private getContentStats(): Observable<AdminAnalytics['contentStats']> {
    return combineLatest([
      this.getAllReviews(),
      this.gameService.getGames(),
      this.bookService.getBooks(),
      this.movieService.getMovies(),
      this.webSeriesService.getWebSeries(),
      this.electronicGadgetService.getElectronicGadgets(),
      this.beautyProductService.getBeautyProducts()
    ]).pipe(
      map(([reviews, games, books, movies, webSeries, electronicGadgets, beautyProducts]) => {
        const totalReviews = reviews.length;
        const totalRatings = reviews.filter(review => review.rating > 0).length;
        
        return {
          totalReviews,
          totalRatings,
          gameCount: games.length,
          bookCount: books.length,
          movieCount: movies.length,
          webSeriesCount: webSeries.length,
          electronicGadgetCount: electronicGadgets.length,
          beautyProductCount: beautyProducts.length
        };
      })
    );
  }

  /**
   * Get engagement metrics
   */
  private getEngagementMetrics(): Observable<AdminAnalytics['engagementMetrics']> {
    return combineLatest([
      this.getAllReviews(),
      this.userService.getUsers()
    ]).pipe(
      map(([reviews, users]) => {
        const validRatings = reviews.filter(review => review.rating > 0);
        const averageRating = validRatings.length > 0 
          ? validRatings.reduce((sum, review) => sum + review.rating, 0) / validRatings.length
          : 0;
        
        const reviewsPerUser = users.length > 0 ? reviews.length / users.length : 0;
        
        // Determine most active category based on review counts
        const categoryCounts = {
          games: reviews.filter(r => r.gameId).length,
          books: reviews.filter(r => r.bookId).length,
          movies: reviews.filter(r => r.movieId).length,
          webSeries: reviews.filter(r => r.webSeriesId).length,
          electronicGadgets: reviews.filter(r => r.gadgetId).length,
          beautyProducts: reviews.filter(r => r.beautyProductId).length
        };
        
        const mostActiveCategory = Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'games';
        
        return {
          averageRating: Math.round(averageRating * 100) / 100,
          reviewsPerUser: Math.round(reviewsPerUser * 100) / 100,
          mostActiveCategory
        };
      })
    );
  }

  /**
   * Get all reviews from different collections
   */
  private getAllReviews(): Observable<any[]> {
    // For simplicity, we'll get from the main reviews collection
    // In practice, you might need to combine multiple collections
    const reviewsRef = collection(this.firestore, 'reviews');
    return collectionData(reviewsRef, { idField: 'id' });
  }

  /**
   * Get user growth data for charts
   */
  getUserGrowthData(): Observable<{ date: string, count: number }[]> {
    return this.userService.getUsers().pipe(
      map(users => {
        // Simulate growth data - in real app, you'd have timestamps
        const mockData = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
          const count = Math.floor(users.length * (0.3 + (6-i) * 0.1)); // Simulate growth
          mockData.push({
            date: date.toLocaleDateString(),
            count
          });
        }
        return mockData;
      })
    );
  }

  /**
   * Get content distribution data for charts
   */
  getContentDistribution(): Observable<{ category: string, count: number }[]> {
    return this.getContentStats().pipe(
      map(stats => [
        { category: 'Games', count: stats.gameCount },
        { category: 'Books', count: stats.bookCount },
        { category: 'Movies', count: stats.movieCount },
        { category: 'Web Series', count: stats.webSeriesCount },
        { category: 'Electronic Gadgets', count: stats.electronicGadgetCount },
        { category: 'Beauty Products', count: stats.beautyProductCount }
      ])
    );
  }
}
