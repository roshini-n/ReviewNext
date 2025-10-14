import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { BeautyProduct } from '../models/beauty-product.model';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BeautyProductFirebaseService {
  constructor(private firestore: Firestore) {}

  getBeautyProducts(): Observable<BeautyProduct[]> {
    const beautyProductsRef = collection(this.firestore, 'beauty-products');
    return collectionData(beautyProductsRef, { idField: 'id' }) as Observable<BeautyProduct[]>;
  }

  getBeautyProductById(id: string): Observable<BeautyProduct> {
    const beautyProductRef = doc(this.firestore, `beauty-products/${id}`);
    return docData(beautyProductRef, { idField: 'id' }) as Observable<BeautyProduct>;
  }

  getBeautyProductsByIds(ids: string[]): Observable<BeautyProduct[]> {
    const beautyProductsRef = collection(this.firestore, 'beauty-products');
    const q = query(beautyProductsRef, where('id', 'in', ids));
    return collectionData(q, { idField: 'id' }) as Observable<BeautyProduct[]>;
  }

  addBeautyProduct(beautyProduct: BeautyProduct) {
    const beautyProductsRef = collection(this.firestore, 'beauty-products');
    return addDoc(beautyProductsRef, beautyProduct);
  }

  updateBeautyProduct(id: string, beautyProduct: Partial<BeautyProduct>) {
    const beautyProductRef = doc(this.firestore, `beauty-products/${id}`);
    return updateDoc(beautyProductRef, beautyProduct);
  }

  deleteBeautyProduct(id: string) {
    const beautyProductRef = doc(this.firestore, `beauty-products/${id}`);
    return deleteDoc(beautyProductRef);
  }

  searchBeautyProducts(searchQuery: string): Observable<BeautyProduct[]> {
    const beautyProductsRef = collection(this.firestore, 'beautyProducts');
    const q = query(beautyProductsRef, where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));
    return collectionData(q, { idField: 'id' }) as Observable<BeautyProduct[]>;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BeautyProductsApiService {
  // For testing, we'll use mock data first
  private mockData: { [key: string]: any } = {
    'loreal moisturizer': {
      imageUrl: 'https://example.com/loreal-moisturizer.jpg',
      usageInstructions: 'Apply to clean, dry skin morning and night.'
    },
    'maybelline mascara': {
      imageUrl: 'https://example.com/maybelline-mascara.jpg',
      usageInstructions: 'Apply from root to tip in zigzag motion.'
    },
    'nivea cream': {
      imageUrl: 'https://example.com/nivea-cream.jpg',
      usageInstructions: 'Apply generously to face and body as needed.'
    }
  };

  constructor(private http: HttpClient) {}

  searchProduct(title: string, brand: string): Observable<any> {
    const query = `${brand} ${title}`.toLowerCase();
    
    // For testing, use mock data
    const mockResult = Object.entries(this.mockData).find(([key]) => 
      query.includes(key.toLowerCase())
    );

    return of(mockResult ? mockResult[1] : null).pipe(
      delay(300), // Simulate API delay
      catchError(error => {
        console.error('Error fetching product details:', error);
        return of(null);
      })
    );
  }
}