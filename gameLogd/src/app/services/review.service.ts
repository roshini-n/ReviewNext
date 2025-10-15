import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDoc, orderBy, collectionData } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, catchError, throwError } from 'rxjs';
import { Review } from '../models/review.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
  // Unified reviews collection for all categories
  private reviewsCollection = collection(this.firestore, 'reviews');
  
  // Add a new review for any category
  addReview(review: Omit<Review, 'id'>): Observable<Review> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }
        
        const reviewPayload = {
          ...review,
          userId: review.userId || user.uid,
          datePosted: new Date(),
          likes: 0,
          username: user.displayName || 'Anonymous'
        };

        return from(addDoc(this.reviewsCollection, reviewPayload)).pipe(
          switchMap(docRef => {
            const newReview: Review = {
              ...reviewPayload,
              id: docRef.id,
              username: user.displayName || 'Anonymous'
            };
            return from(updateDoc(docRef, { id: docRef.id })).pipe(
              map(() => newReview)
            );
          })
        );
      })
    );
  }
  
  // Update an existing review
  updateReview(reviewId: string, changes: Partial<Review>): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    
    // Add lastUpdated timestamp
    const updatedChanges = {
      ...changes,
      lastUpdated: new Date()
    };
    
    return from(updateDoc(reviewDoc, updatedChanges));
  }
  
  // Delete a review
  deleteReview(reviewId: string): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    return from(deleteDoc(reviewDoc));
  }
  
  // Get reviews by category item ID (unified method for all categories)
  getReviewsByCategoryItem(categoryType: string, itemId: string): Observable<Review[]> {
    const fieldName = this.getCategoryFieldName(categoryType);
    const reviewsQuery = query(
      this.reviewsCollection,
      where(fieldName, '==', itemId),
      orderBy('datePosted', 'desc')
    );
    
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }

  // Get all reviews for a specific game
  getReviewsByGameId(gameId: string): Observable<Review[]> {
    return this.getReviewsByCategoryItem('game', gameId);
  }

  // Get all reviews for a specific book
  getReviewsByBookId(bookId: string): Observable<Review[]> {
    return this.getReviewsByCategoryItem('book', bookId);
  }

  // Get all reviews for a specific movie
  getReviewsByMovieId(movieId: string): Observable<Review[]> {
    return this.getReviewsByCategoryItem('movie', movieId);
  }

  // Get all reviews for a specific gadget
  getReviewsByGadgetId(gadgetId: string): Observable<Review[]> {
    return this.getReviewsByCategoryItem('gadget', gadgetId);
  }

  // Get all reviews for any custom category
  getReviewsByItemId(categoryType: string, itemId: string): Observable<Review[]> {
    return this.getReviewsByCategoryItem(categoryType, itemId);
  }
  
  // Get all reviews by a specific user
  getReviewsByUserId(userId: string): Observable<Review[]> {
    const reviewsQuery = query(
      this.reviewsCollection,
      where('userId', '==', userId)
    );
    
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }
  
  // Get a specific review by ID
  getReviewById(reviewId: string): Observable<Review | null> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    return from(getDoc(reviewDoc)).pipe(
      map(doc => {
        if (doc.exists()) {
          const data = doc.data() as Review;
          return { ...data, id: doc.id };
        } else {
          return null;
        }
      })
    );
  }
  
  // Check if user has already reviewed an item (unified method)
  hasUserReviewedItem(categoryType: string, itemId: string): Observable<boolean> {
    const fieldName = this.getCategoryFieldName(categoryType);
    
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return from([false]);
        
        const reviewsQuery = query(
          this.reviewsCollection,
          where(fieldName, '==', itemId),
          where('userId', '==', user.uid)
        );
        
        return collectionData(reviewsQuery).pipe(
          map(reviews => reviews.length > 0)
        );
      })
    );
  }

  // Check if the current user has already reviewed a game
  hasUserReviewedGame(gameId: string): Observable<boolean> {
    return this.hasUserReviewedItem('game', gameId);
  }

  // Check if the current user has already reviewed a book
  hasUserReviewedBook(bookId: string): Observable<boolean> {
    return this.hasUserReviewedItem('book', bookId);
  }

  // Check if the current user has already reviewed a movie
  hasUserReviewedMovie(movieId: string): Observable<boolean> {
    return this.hasUserReviewedItem('movie', movieId);
  }

  // Check if the current user has already reviewed a gadget
  hasUserReviewedGadget(gadgetId: string): Observable<boolean> {
    return this.hasUserReviewedItem('gadget', gadgetId);
  }

  // Helper method to get the correct field name for each category
  private getCategoryFieldName(categoryType: string): string {
    const fieldMap: { [key: string]: string } = {
      'game': 'gameId',
      'book': 'bookId',
      'movie': 'movieId',
      'gadget': 'gadgetId',
      'electronic-gadget': 'gadgetId',
      'app': 'appId',
      'web-series': 'webSeriesId',
      'beauty-product': 'beautyProductId',
      'home-appliance': 'homeApplianceId',
      'documentary': 'documentaryId'
    };
    
    return fieldMap[categoryType] || `${categoryType}Id`;
  }

  // Get all reviews (for admin purposes)
  getAllReviews(): Observable<Review[]> {
    const reviewsQuery = query(
      this.reviewsCollection,
      orderBy('datePosted', 'desc')
    );
    
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }
}
