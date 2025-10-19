import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, query, where, updateDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class WebSeriesReviewService {
  private firestore = inject(Firestore);
  private reviewsCollection = collection(this.firestore, 'webSeriesReviews');

  // Add a new review (using Review model)
  addReview(review: Omit<Review, 'id'>): Observable<Review> {
    return from(
      addDoc(this.reviewsCollection, review).then((docRef) => ({
        ...review,
        id: docRef.id
      } as Review))
    );
  }

  // Update an existing review
  updateReview(reviewId: string, updates: Partial<Review>): Observable<Review> {
    const docRef = doc(this.firestore, `webSeriesReviews/${reviewId}`);
    return from(
      updateDoc(docRef, updates).then(() => ({
        id: reviewId,
        ...updates
      } as Review))
    );
  }

  // Get reviews by series ID
  getReviewsBySeriesId(seriesId: string): Observable<Review[]> {
    const q = query(this.reviewsCollection, where('seriesId', '==', seriesId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(reviews => reviews as Review[])
    );
  }

  // Get reviews by a user
  getUserReviews(userId: string): Observable<Review[]> {
    const q = query(this.reviewsCollection, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(reviews => reviews as Review[])
    );
  }

  // Delete a review
  deleteReview(id: string): Observable<void> {
    const docRef = doc(this.firestore, `webSeriesReviews/${id}`);
    return from(deleteDoc(docRef));
  }
}
