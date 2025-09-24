import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BookLog } from '../models/bookLog.model';

@Injectable({
  providedIn: 'root',
})
export class BookLogService {
  private firestore = inject(Firestore);
  private bookLogCollection = collection(this.firestore, 'bookLogs');

  // Get all book logs
  getBookLogs(): Observable<BookLog[]> {
    const bookLogsRef = collection(this.firestore, 'bookLogs');
    return collectionData(bookLogsRef, { idField: 'id' }).pipe(
      map(logs => logs.map(log => this.mapToBookLogModel(log)))
    );
  }

  // Get book logs by user ID
  getBookLogsByUserId(userId: string): Observable<BookLog[]> {
    const bookLogsRef = collection(this.firestore, 'bookLogs');
    const q = query(bookLogsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(logs => logs.map(log => this.mapToBookLogModel(log)))
    );
  }

  // Get book logs by book ID
  getBookLogsByBookId(bookId: string): Observable<BookLog[]> {
    const bookLogsRef = collection(this.firestore, 'bookLogs');
    const q = query(bookLogsRef, where('bookId', '==', bookId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(logs => logs.map(log => this.mapToBookLogModel(log)))
    );
  }

  // Add a new book log
  addBookLog(bookLog: Omit<BookLog, 'id'>): Promise<void> {
    const bookLogsRef = collection(this.firestore, 'bookLogs');
    return addDoc(bookLogsRef, bookLog).then();
  }

  // Update a book log
  updateBookLog(id: string, bookLog: Partial<BookLog>): Promise<void> {
    const bookLogDocRef = doc(this.firestore, `bookLogs/${id}`);
    return updateDoc(bookLogDocRef, bookLog);
  }

  // Delete a book log
  deleteBookLog(id: string): Promise<void> {
    const bookLogDocRef = doc(this.firestore, `bookLogs/${id}`);
    return deleteDoc(bookLogDocRef);
  }

  // Get book logs by user ID
  getLogsByUserId(userId: string): Observable<BookLog[]> {
    const userQuery = query(
      this.bookLogCollection, 
      where('userId', '==', userId),
      orderBy('datePosted', 'desc')
    );

    return collectionData(userQuery, { idField: 'id' }).pipe(
      map(logs => logs.map(log => ({
        ...log,
        bookId: log['bookId'] || ''
      }) as BookLog)),
      catchError(error => {
        console.error('Error getting user logs:', error);
        return throwError(() => new Error('Failed to get user logs.'));
      })
    );
  }

  // Helper method to map data to BookLog model
  private mapToBookLogModel(data: any): BookLog {
    return {
      id: data.id || '',
      userId: data.userId || '',
      bookId: data.bookId || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      rating: data.rating || 0,
      review: data.review || '',
      status: data.status || 'reading'
    };
  }
}
