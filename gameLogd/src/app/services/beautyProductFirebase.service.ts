import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BeautyProduct } from '../models/beauty-product.model';

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