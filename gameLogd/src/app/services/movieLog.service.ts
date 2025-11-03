import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, query, where, updateDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MovieLog {
  id?: string;
  userId: string;
  movieId: string;
  status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped';
  rating?: number;
  review?: string;
  dateAdded: Date;
  dateCompleted?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MovieLogService {
  private firestore = inject(Firestore);
  private movieLogsCollection = collection(this.firestore, 'movieLogs');

  // Helper to remove undefined values
  private removeUndefined(obj: any): any {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
  }

  // Add a new movie log
  addMovieLog(log: Omit<MovieLog, 'id'>): Observable<void> {
    const cleanLog = this.removeUndefined(log);
    return from(addDoc(this.movieLogsCollection, cleanLog).then(() => void 0));
  }

  // Get movie logs for a user
  getMovieLogs(userId: string): Observable<MovieLog[]> {
    const q = query(this.movieLogsCollection, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(logs => logs as MovieLog[])
    );
  }

  // Delete a movie log
  deleteMovieLog(id: string): Observable<void> {
    const docRef = doc(this.firestore, `movieLogs/${id}`);
    return from(deleteDoc(docRef));
  }

  // Update a movie log
  updateMovieLog(logId: string, updates: Partial<MovieLog>): Observable<void> {
    const docRef = doc(this.firestore, `movieLogs/${logId}`);
    const cleanUpdates = this.removeUndefined(updates);
    return from(updateDoc(docRef, cleanUpdates));
  }
}