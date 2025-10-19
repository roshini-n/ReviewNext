import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, query, where, updateDoc } from '@angular/fire/firestore';
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

  // Add a new product log
  addProductLog(log: Omit<BeautyProductLog, 'id'>): Observable<void> {
    return from(addDoc(this.productLogsCollection, log).then(() => void 0));
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
    return from(updateDoc(docRef, updates));
  }

  // Delete a product log
  deleteProductLog(id: string): Observable<void> {
    const docRef = doc(this.firestore, `beautyProductLogs/${id}`);
    return from(deleteDoc(docRef));
  }
}
