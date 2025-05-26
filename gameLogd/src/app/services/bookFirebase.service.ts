import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  QueryConstraint,
  documentId,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookFirebaseService {
  firestore = inject(Firestore);
  booksCollection = collection(this.firestore, 'books');

  // Get all books with their IDs
  getBooks(): Observable<Book[]> {
    return collectionData(this.booksCollection, { 
        idField: 'id' 
    }).pipe(
      map((books) => books.map((book) => this.mapToBookModel(book as any)))
    );
  }

  // Get book by ID
  getBookById(id: string): Observable<Book | undefined> {
    const bookDocRef = doc(this.firestore, `books/${id}`);
    return from(getDoc(bookDocRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return this.mapToBookModel({ id: docSnap.id, ...data });
        }
        return undefined;
      })
    );
  }

  // Add new book
  addBook(book: any): Observable<void> {
    const booksRef = collection(this.firestore, 'books');
    return from(addDoc(booksRef, book).then(() => {}));
  }

  // Update a book
  updateBook(id: string, book: Partial<Book>): Promise<void> {
    const bookDocRef = doc(this.firestore, `books/${id}`);
    return updateDoc(bookDocRef, book);
  }

  // Delete a book
  deleteBook(id: string): Promise<void> {
    const bookDocRef = doc(this.firestore, `books/${id}`);
    return deleteDoc(bookDocRef);
  }

  // Search books by field
  searchBooks(searchTerm: string, field: string): Observable<Book[]> {
    if (!searchTerm || searchTerm.trim() === '') return of([]);

    const booksQuery = query(
      this.booksCollection,
      where(field, '>=', searchTerm),
      where(field, '<=', searchTerm + '\uf8ff')
    );

    return collectionData(booksQuery, { idField: 'id' }).pipe(
      map((books) => books.map((book) => this.mapToBookModel(book as any)))
    );
  }

  // Map raw Firebase data to Book model
  private mapToBookModel(data: any): Book {
    return {
      id: data.id || '',
      title: data.title || '',
      description: data.description || '',
      author: data.author || '',
      publisher: data.publisher || '',
      publicationDate: data.publicationDate || '',
      genres: Array.isArray(data.genres) ? data.genres : [],
      pages: data.pages || 0,
      readersRead: data.readersRead || 0,
      rating: data.rating || 0,
      imageUrl: data.imageUrl || '',
      totalRatingScore: data.totalRatingScore || 0,
      numRatings: data.numRatings || 0,
      dateAdded: data.dateAdded || new Date().toISOString()
    };
  }
}
