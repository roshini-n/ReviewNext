import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDoc, orderBy, collectionData } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, throwError, catchError } from 'rxjs';
import { Review } from '../models/review.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BookReviewService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private reviewsCollection = collection(this.firestore, 'bookReviews');

  // Add a new book review
  addReview(review: Omit<Review, 'id'>): Observable<Review> {
    return from(
      addDoc(this.reviewsCollection, review).then((docRef) => ({
        ...review,
        id: docRef.id
      } as Review))
    );
  }

  // Update an existing book review
  updateReview(reviewId: string, changes: Partial<Review>): Observable<Review> {
    const reviewDoc = doc(this.firestore, `bookReviews/${reviewId}`);
    const updatedChanges = {
      ...changes,
      lastUpdated: new Date()
    };
    
    return from(updateDoc(reviewDoc, updatedChanges)).pipe(
      switchMap(() => this.getReviewById(reviewId)),
      map(review => {
        if (!review) {
          throw new Error('Review not found after update');
        }
        return review;
      })
    );
  }

  // Delete a book review
  deleteReview(reviewId: string): Observable<void> {
    const reviewDoc = doc(this.firestore, `bookReviews/${reviewId}`);
    return from(deleteDoc(reviewDoc));
  }

  // Get all reviews for a specific book
  getReviewsByBookId(bookId: string): Observable<Review[]> {
    if (!bookId) {
      return throwError(() => new Error('Book ID is required'));
    }

    const reviewsQuery = query(
      this.reviewsCollection,
      where('bookId', '==', bookId),
      orderBy('datePosted', 'desc')
    );

    return collectionData(reviewsQuery, { idField: 'id' }).pipe(
      map(reviews => reviews as Review[]),
      catchError(error => {
        console.error('Error fetching reviews:', error);
        return throwError(() => new Error('Failed to fetch reviews'));
      })
    );
  }

  // Get all reviews by a specific user
  getReviewsByUserId(userId: string): Observable<Review[]> {
    const reviewsQuery = query(
      this.reviewsCollection,
      where('userId', '==', userId)
    );
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }

  // Get a specific book review by ID
  getReviewById(reviewId: string): Observable<Review | null> {
    const reviewDoc = doc(this.firestore, `bookReviews/${reviewId}`);
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

  // Check if the current user has already reviewed a book
  hasUserReviewedBook(bookId: string): Observable<boolean> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return from([false]);

        const reviewsQuery = query(
          this.reviewsCollection,
          where('bookId', '==', bookId),
          where('userId', '==', user.uid)
        );

        return collectionData(reviewsQuery).pipe(
          map(reviews => reviews.length > 0)
        );
      })
    );
  }
}
