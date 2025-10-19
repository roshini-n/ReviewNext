import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, query, where, updateDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Review } from '../models/review.model';

export interface MovieReview {
  id?: string;
  userId: string;
  movieId: string;
  rating: number;
  review: string;
  dateAdded: Date;
  likes: number;
  dislikes: number;
}

@Injectable({
  providedIn: 'root'
})
export class MovieReviewService {
  private firestore = inject(Firestore);
  private reviewsCollection = collection(this.firestore, 'movieReviews');

  // Add a new movie review
  addMovieReview(review: Omit<MovieReview, 'id'>): Observable<void> {
    return from(addDoc(this.reviewsCollection, review).then(() => void 0));
  }

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
    const docRef = doc(this.firestore, `movieReviews/${reviewId}`);
    return from(
      updateDoc(docRef, updates).then(() => ({
        id: reviewId,
        ...updates
      } as Review))
    );
  }

  // Get reviews for a movie
  getMovieReviews(movieId: string): Observable<MovieReview[]> {
    const q = query(this.reviewsCollection, where('movieId', '==', movieId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(reviews => reviews as MovieReview[])
    );
  }

  // Get reviews by movie ID (using Review model)
  getReviewsByMovieId(movieId: string): Observable<Review[]> {
    const q = query(this.reviewsCollection, where('movieId', '==', movieId));
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
    const docRef = doc(this.firestore, `movieReviews/${id}`);
    return from(deleteDoc(docRef));
  }
} 