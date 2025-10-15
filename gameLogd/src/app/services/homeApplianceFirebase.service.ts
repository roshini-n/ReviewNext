import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, collectionData } from '@angular/fire/firestore';
import { HomeAppliance } from '../models/home-appliance.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeApplianceFirebaseService {
  private collectionName = 'home_appliances';

  constructor(private firestore: Firestore) {}

  getHomeAppliances(): Observable<HomeAppliance[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    return from(getDocs(collectionRef)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as HomeAppliance))
      )
    );
  }

  getHomeApplianceById(id: string): Observable<HomeAppliance | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(getDoc(docRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          return {
            id: doc.id,
            ...doc.data()
          } as HomeAppliance;
        }
        return null;
      })
    );
  }

  getHomeAppliancesByIds(ids: string[]): Observable<HomeAppliance[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('id', 'in', ids));
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as HomeAppliance))
      )
    );
  }

  addHomeAppliance(homeAppliance: HomeAppliance): Observable<string> {
    const collectionRef = collection(this.firestore, this.collectionName);
    return from(addDoc(collectionRef, homeAppliance)).pipe(
      map(docRef => docRef.id)
    );
  }

  updateHomeAppliance(id: string, homeAppliance: Partial<HomeAppliance>): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, homeAppliance));
  }

  deleteHomeAppliance(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(docRef));
  }

  searchHomeAppliances(searchQuery: string): Observable<HomeAppliance[]> {
    const collectionRef = collection(this.firestore, 'homeAppliances');
    const q = query(collectionRef, where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));
    return collectionData(q, { idField: 'id' }) as Observable<HomeAppliance[]>;
  }
} 