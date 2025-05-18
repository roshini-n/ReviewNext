import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ElectronicGadget } from '../models/electronic-gadget.model';

@Injectable({
  providedIn: 'root'
})
export class ElectronicGadgetFirebaseService {
  constructor(private firestore: Firestore) {}

  getElectronicGadgets(): Observable<ElectronicGadget[]> {
    const electronicGadgetsRef = collection(this.firestore, 'electronic-gadgets');
    return collectionData(electronicGadgetsRef, { idField: 'id' }) as Observable<ElectronicGadget[]>;
  }

  getElectronicGadgetById(id: string): Observable<ElectronicGadget> {
    const electronicGadgetRef = doc(this.firestore, `electronic-gadgets/${id}`);
    return docData(electronicGadgetRef, { idField: 'id' }) as Observable<ElectronicGadget>;
  }

  getElectronicGadgetsByIds(ids: string[]): Observable<ElectronicGadget[]> {
    const electronicGadgetsRef = collection(this.firestore, 'electronic-gadgets');
    const q = query(electronicGadgetsRef, where('id', 'in', ids));
    return collectionData(q, { idField: 'id' }) as Observable<ElectronicGadget[]>;
  }

  addElectronicGadget(electronicGadget: ElectronicGadget) {
    const electronicGadgetsRef = collection(this.firestore, 'electronic-gadgets');
    return addDoc(electronicGadgetsRef, electronicGadget);
  }

  updateElectronicGadget(id: string, electronicGadget: Partial<ElectronicGadget>) {
    const electronicGadgetRef = doc(this.firestore, `electronic-gadgets/${id}`);
    return updateDoc(electronicGadgetRef, electronicGadget);
  }

  deleteElectronicGadget(id: string) {
    const electronicGadgetRef = doc(this.firestore, `electronic-gadgets/${id}`);
    return deleteDoc(electronicGadgetRef);
  }

  searchElectronicGadgets(searchQuery: string): Observable<ElectronicGadget[]> {
    const electronicGadgetsRef = collection(this.firestore, 'electronic-gadgets');
    const q = query(electronicGadgetsRef, where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));
    return collectionData(q, { idField: 'id' }) as Observable<ElectronicGadget[]>;
  }
} 