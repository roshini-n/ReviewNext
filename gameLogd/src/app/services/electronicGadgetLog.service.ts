import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, query, where, updateDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ElectronicGadgetLog {
  id?: string;
  userId: string;
  gadgetId: string;
  status: 'owned' | 'wishlist' | 'sold' | 'testing';
  rating?: number;
  review?: string;
  dateAdded: Date;
  datePurchased?: Date;
  purchasePrice?: number;
  condition?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ElectronicGadgetLogService {
  private firestore = inject(Firestore);
  private gadgetLogsCollection = collection(this.firestore, 'electronicGadgetLogs');

  // Add a new gadget log
  addGadgetLog(log: Omit<ElectronicGadgetLog, 'id'>): Observable<void> {
    return from(addDoc(this.gadgetLogsCollection, log).then(() => void 0));
  }

  // Get gadget logs for a user
  getGadgetLogs(userId: string): Observable<ElectronicGadgetLog[]> {
    const q = query(this.gadgetLogsCollection, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(logs => logs as ElectronicGadgetLog[])
    );
  }

  // Update a gadget log
  updateGadgetLog(logId: string, updates: Partial<ElectronicGadgetLog>): Observable<void> {
    const docRef = doc(this.firestore, `electronicGadgetLogs/${logId}`);
    return from(updateDoc(docRef, updates));
  }

  // Delete a gadget log
  deleteGadgetLog(id: string): Observable<void> {
    const docRef = doc(this.firestore, `electronicGadgetLogs/${id}`);
    return from(deleteDoc(docRef));
  }
}
