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
  
  // add a new review
  addReview(review: Omit<Review, 'id'>): Observable<Review> {
    const reviewsCollection = collection(this.firestore, 'reviews');
    
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

        return from(addDoc(reviewsCollection, reviewPayload)).pipe(
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
  
  // update an existing review
  updateReview(reviewId: string, changes: Partial<Review>): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    
    // add lastUpdated timestamp
    const updatedChanges = {
      ...changes,
      lastUpdated: new Date()
    };
    
    return from(updateDoc(reviewDoc, updatedChanges));
  }
  
  // delete a review
  deleteReview(reviewId: string): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    
    return from(deleteDoc(reviewDoc));
  }
  
  // get all reviews for a specific game
  getReviewsByGameId(gameId: string): Observable<Review[]> {
    const reviewsQuery = query(
      collection(this.firestore, 'reviews'),
      where('gameId', '==', gameId),
      orderBy('datePosted', 'desc')
    );
    
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }

  // get all reviews for a specific book
  getReviewsByBookId(bookId: string): Observable<Review[]> {
    const reviewsQuery = query(
      collection(this.firestore, 'reviews'),
      where('bookId', '==', bookId),
      orderBy('datePosted', 'desc')
    );
    
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }
  
  // get all reviews by a specific user
  getReviewsByUserId(userId: string): Observable<Review[]> {
    // Avoid requiring a composite index by not combining where + orderBy
    const reviewsQuery = query(
      collection(this.firestore, 'reviews'),
      where('userId', '==', userId)
    );
    
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }
  
  // get a specific review by ID
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
  
  // check if the current user has already reviewed a game
  hasUserReviewedGame(gameId: string): Observable<boolean> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return from([false]);
        
        const reviewsQuery = query(
          collection(this.firestore, 'reviews'),
          where('gameId', '==', gameId),
          where('userId', '==', user.uid)
        );
        
        return collectionData(reviewsQuery).pipe(
          map(reviews => reviews.length > 0)
        );
      })
    );
  }

  // check if the current user has already reviewed a book
  hasUserReviewedBook(bookId: string): Observable<boolean> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return from([false]);
        
        const reviewsQuery = query(
          collection(this.firestore, 'reviews'),
          where('bookId', '==', bookId),
          where('userId', '==', user.uid)
        );
        
        return collectionData(reviewsQuery).pipe(
          map(reviews => reviews.length > 0)
        );
      })
    );
  }

  getReviewsByGadgetId(gadgetId: string): Observable<Review[]> {
    const reviewsQuery = query(
      collection(this.firestore, 'reviews'),
      where('gadgetId', '==', gadgetId),
      orderBy('datePosted', 'desc')
    );
    
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }
}
