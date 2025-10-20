import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, query, where, updateDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BeautyProductLog {
  id?: string;
  userId: string;
  productId: string;
  status: 'using' | 'wishlist' | 'finished' | 'discontinued';
  rating?: number;
  review?: string;
  dateAdded: Date;
  dateOpened?: Date;
  purchasePrice?: number;
  purchaseLocation?: string;
  skinType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BeautyProductLogService {
  private firestore = inject(Firestore);
  private productLogsCollection = collection(this.firestore, 'beautyProductLogs');

  // Helper to remove undefined values and convert Dates to Timestamps
  private removeUndefined(obj: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        // Convert Date objects to Firestore Timestamps
        if (value instanceof Date) {
          cleaned[key] = Timestamp.fromDate(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  // Add a new product log
  addProductLog(log: Omit<BeautyProductLog, 'id'>): Observable<void> {
    const cleanLog = this.removeUndefined(log);
    return from(addDoc(this.productLogsCollection, cleanLog).then(() => void 0));
  }

  // Get product logs for a user
  getProductLogs(userId: string): Observable<BeautyProductLog[]> {
    const q = query(this.productLogsCollection, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(logs => logs as BeautyProductLog[])
    );
  }

  // Update a product log
  updateProductLog(logId: string, updates: Partial<BeautyProductLog>): Observable<void> {
    const docRef = doc(this.firestore, `beautyProductLogs/${logId}`);
    const cleanUpdates = this.removeUndefined(updates);
    return from(updateDoc(docRef, cleanUpdates));
  }

  // Delete a product log
  deleteProductLog(id: string): Observable<void> {
    const docRef = doc(this.firestore, `beautyProductLogs/${id}`);
    return from(deleteDoc(docRef));
  }
}
