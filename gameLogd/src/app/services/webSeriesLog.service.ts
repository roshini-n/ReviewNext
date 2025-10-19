import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, query, where, updateDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WebSeriesLog {
  id?: string;
  userId: string;
  seriesId: string;
  status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped';
  rating?: number;
  review?: string;
  dateAdded: Date;
  dateCompleted?: Date;
  currentEpisode?: number;
  currentSeason?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSeriesLogService {
  private firestore = inject(Firestore);
  private seriesLogsCollection = collection(this.firestore, 'webSeriesLogs');

  // Helper to remove undefined values
  private removeUndefined(obj: any): any {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
  }

  // Add a new web series log
  addSeriesLog(log: Omit<WebSeriesLog, 'id'>): Observable<void> {
    const cleanLog = this.removeUndefined(log);
    return from(addDoc(this.seriesLogsCollection, cleanLog).then(() => void 0));
  }

  // Get series logs for a user
  getSeriesLogs(userId: string): Observable<WebSeriesLog[]> {
    const q = query(this.seriesLogsCollection, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(logs => logs as WebSeriesLog[])
    );
  }

  // Update a series log
  updateSeriesLog(logId: string, updates: Partial<WebSeriesLog>): Observable<void> {
    const docRef = doc(this.firestore, `webSeriesLogs/${logId}`);
    const cleanUpdates = this.removeUndefined(updates);
    return from(updateDoc(docRef, cleanUpdates));
  }

  // Delete a series log
  deleteSeriesLog(id: string): Observable<void> {
    const docRef = doc(this.firestore, `webSeriesLogs/${id}`);
    return from(deleteDoc(docRef));
  }
}
