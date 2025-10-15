import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where, orderBy } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, from, map, switchMap, catchError, throwError } from 'rxjs';

export interface UnifiedReview {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string; // 'games', 'books', 'movies', etc.
  itemId: string;
  itemTitle: string;
  rating: number;
  reviewText: string;
  timestamp: any;
  likes?: number;
  dislikes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UnifiedReviewService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private reviewsCollection = collection(this.firestore, 'unified_reviews');

  // Add review for any category
  addReview(review: Omit<UnifiedReview, 'id' | 'userId' | 'userName' | 'userEmail' | 'timestamp'>): Observable<string> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        const newReview: Omit<UnifiedReview, 'id'> = {
          ...review,
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          userEmail: user.email || '',
          timestamp: new Date(),
          likes: 0,
          dislikes: 0
        };

        return from(addDoc(this.reviewsCollection, newReview)).pipe(
          map(docRef => docRef.id)
        );
      }),
      catchError(error => {
        console.error('Error adding review:', error);
        return throwError(() => error);
      })
    );
  }

  // Get reviews for a specific item in any category
  getReviewsForItem(category: string, itemId: string): Observable<UnifiedReview[]> {
    const itemQuery = query(
      this.reviewsCollection,
      where('category', '==', category),
      where('itemId', '==', itemId),
      orderBy('timestamp', 'desc')
    );

    return from(getDocs(itemQuery)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UnifiedReview))
      )
    );
  }

  // Get all reviews for a category
  getReviewsForCategory(category: string): Observable<UnifiedReview[]> {
    const categoryQuery = query(
      this.reviewsCollection,
      where('category', '==', category),
      orderBy('timestamp', 'desc')
    );

    return from(getDocs(categoryQuery)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UnifiedReview))
      )
    );
  }

  // Get reviews by user
  getUserReviews(userId: string): Observable<UnifiedReview[]> {
    const userQuery = query(
      this.reviewsCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    return from(getDocs(userQuery)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UnifiedReview))
      )
    );
  }

  // Update review
  updateReview(reviewId: string, updates: Partial<UnifiedReview>): Observable<void> {
    const reviewDoc = doc(this.firestore, 'unified_reviews', reviewId);
    return from(updateDoc(reviewDoc, updates));
  }

  // Delete review
  deleteReview(reviewId: string): Observable<void> {
    const reviewDoc = doc(this.firestore, 'unified_reviews', reviewId);
    return from(deleteDoc(reviewDoc));
  }

  // Calculate average rating for an item
  getAverageRating(category: string, itemId: string): Observable<number> {
    return this.getReviewsForItem(category, itemId).pipe(
      map(reviews => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
      })
    );
  }

  // Get review count for an item
  getReviewCount(category: string, itemId: string): Observable<number> {
    return this.getReviewsForItem(category, itemId).pipe(
      map(reviews => reviews.length)
    );
  }
}