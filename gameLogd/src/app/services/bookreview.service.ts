import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDoc, orderBy, collectionData } from '@angular/fire/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { Book } from '../models/book.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BookReviewService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  // Add a new book review
  addReview(review: Omit<Book, 'id'>): Observable<string> {
  const reviewsCollection = collection(this.firestore, 'book_reviews');

  return from(addDoc(reviewsCollection, review)).pipe(
    map(docRef => {
      updateDoc(docRef, { id: docRef.id });
      return docRef.id;
    })
  );
}


  // Update a book review
  updateReview(reviewId: string, changes: Partial<Book>): Observable<void> {
    const reviewDoc = doc(this.firestore, `book_reviews/${reviewId}`);
    const updatedChanges = {
      ...changes,
      lastUpdated: new Date()
    };
    return from(updateDoc(reviewDoc, updatedChanges));
  }

  // Delete a book review
  deleteReview(reviewId: string): Observable<void> {
    const reviewDoc = doc(this.firestore, `book_reviews/${reviewId}`);
    return from(deleteDoc(reviewDoc));
  }

  // Get all reviews for a specific book
  getReviewsByBookId(bookId: string): Observable<Book[]> {
    const reviewsQuery = query(
      collection(this.firestore, 'book_reviews'),
      where('bookId', '==', bookId),
      orderBy('datePosted', 'desc')
    );
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Book[]>;
  }

  // Get all reviews by a specific user
  getReviewsByUserId(userId: string): Observable<Book[]> {
    const reviewsQuery = query(
      collection(this.firestore, 'book_reviews'),
      where('userId', '==', userId),
      orderBy('datePosted', 'desc')
    );
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Book[]>;
  }

  // Get a specific book review by ID
  getReviewById(reviewId: string): Observable<Book | null> {
    const reviewDoc = doc(this.firestore, `book_reviews/${reviewId}`);
    return from(getDoc(reviewDoc)).pipe(
      map(doc => {
        if (doc.exists()) {
          const data = doc.data() as Book;
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
          collection(this.firestore, 'book_reviews'),
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
