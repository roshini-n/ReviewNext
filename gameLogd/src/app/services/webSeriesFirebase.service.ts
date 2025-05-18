import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { WebSeries } from '../models/web-series.model';

@Injectable({
  providedIn: 'root'
})
export class WebSeriesFirebaseService {
  constructor(private firestore: Firestore) {}

  getWebSeries(): Observable<WebSeries[]> {
    const webSeriesRef = collection(this.firestore, 'web-series');
    return collectionData(webSeriesRef, { idField: 'id' }) as Observable<WebSeries[]>;
  }

  getWebSeriesById(id: string): Observable<WebSeries> {
    const webSeriesRef = doc(this.firestore, `web-series/${id}`);
    return docData(webSeriesRef, { idField: 'id' }) as Observable<WebSeries>;
  }

  getWebSeriesByIds(ids: string[]): Observable<WebSeries[]> {
    const webSeriesRef = collection(this.firestore, 'web-series');
    const q = query(webSeriesRef, where('id', 'in', ids));
    return collectionData(q, { idField: 'id' }) as Observable<WebSeries[]>;
  }

  addWebSeries(webSeries: WebSeries) {
    const webSeriesRef = collection(this.firestore, 'web-series');
    return addDoc(webSeriesRef, webSeries);
  }

  updateWebSeries(id: string, webSeries: Partial<WebSeries>) {
    const webSeriesRef = doc(this.firestore, `web-series/${id}`);
    return updateDoc(webSeriesRef, webSeries);
  }

  deleteWebSeries(id: string) {
    const webSeriesRef = doc(this.firestore, `web-series/${id}`);
    return deleteDoc(webSeriesRef);
  }

  searchWebSeries(searchQuery: string): Observable<WebSeries[]> {
    const webSeriesRef = collection(this.firestore, 'webSeries');
    const q = query(webSeriesRef, where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));
    return collectionData(q, { idField: 'id' }) as Observable<WebSeries[]>;
  }
} 