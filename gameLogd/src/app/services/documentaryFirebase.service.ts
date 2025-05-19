import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Documentary } from '../models/documentary.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentaryFirebaseService {
  constructor(private firestore: Firestore) {}

  getDocumentaries(): Observable<Documentary[]> {
    const documentariesRef = collection(this.firestore, 'documentaries');
    return collectionData(documentariesRef, { idField: 'id' }) as Observable<Documentary[]>;
  }

  getDocumentaryById(id: string): Observable<Documentary> {
    const documentaryRef = doc(this.firestore, `documentaries/${id}`);
    return docData(documentaryRef, { idField: 'id' }) as Observable<Documentary>;
  }

  getDocumentariesByIds(ids: string[]): Observable<Documentary[]> {
    const documentariesRef = collection(this.firestore, 'documentaries');
    const q = query(documentariesRef, where('id', 'in', ids));
    return collectionData(q, { idField: 'id' }) as Observable<Documentary[]>;
  }

  addDocumentary(documentary: Documentary) {
    const documentariesRef = collection(this.firestore, 'documentaries');
    return addDoc(documentariesRef, documentary);
  }

  updateDocumentary(id: string, documentary: Partial<Documentary>) {
    const documentaryRef = doc(this.firestore, `documentaries/${id}`);
    return updateDoc(documentaryRef, documentary);
  }

  deleteDocumentary(id: string) {
    const documentaryRef = doc(this.firestore, `documentaries/${id}`);
    return deleteDoc(documentaryRef);
  }

  searchDocumentaries(searchQuery: string): Observable<Documentary[]> {
    const documentariesRef = collection(this.firestore, 'documentaries');
    const q = query(documentariesRef, where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));
    return collectionData(q, { idField: 'id' }) as Observable<Documentary[]>;
  }
} 