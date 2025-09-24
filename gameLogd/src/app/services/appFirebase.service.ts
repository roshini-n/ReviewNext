import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { App } from '../models/app.model';

@Injectable({
  providedIn: 'root'
})
export class AppFirebaseService {
  constructor(private firestore: Firestore) {}

  getApps(): Observable<App[]> {
    const appsRef = collection(this.firestore, 'apps');
    return collectionData(appsRef, { idField: 'id' }) as Observable<App[]>;
  }

  getAppById(id: string): Observable<App> {
    const appRef = doc(this.firestore, `apps/${id}`);
    return docData(appRef, { idField: 'id' }) as Observable<App>;
  }

  getAppsByIds(ids: string[]): Observable<App[]> {
    const appsRef = collection(this.firestore, 'apps');
    const q = query(appsRef, where('id', 'in', ids));
    return collectionData(q, { idField: 'id' }) as Observable<App[]>;
  }

  addApp(app: App) {
    const appsRef = collection(this.firestore, 'apps');
    return addDoc(appsRef, app);
  }

  updateApp(id: string, app: Partial<App>) {
    const appRef = doc(this.firestore, `apps/${id}`);
    return updateDoc(appRef, app);
  }

  deleteApp(id: string) {
    const appRef = doc(this.firestore, `apps/${id}`);
    return deleteDoc(appRef);
  }

  searchApps(searchQuery: string): Observable<App[]> {
    const appsRef = collection(this.firestore, 'apps');
    const q = query(appsRef, where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));
    return collectionData(q, { idField: 'id' }) as Observable<App[]>;
  }
} 