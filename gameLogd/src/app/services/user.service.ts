import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  QueryConstraint,
  updateDoc
} from '@angular/fire/firestore';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { setDoc } from 'firebase/firestore';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore = inject(Firestore);
  usersCollection = collection(this.firestore, 'users');
  
  getUsers(): Observable<User[]>{
    return collectionData(this.usersCollection, {
        idField: 'id',
    }) as Observable<User[]>;
  }

  getUserById(id: string): Observable<User | undefined>{
    const userDocRef = doc(this.firestore, `users/${id}`);

    return from(getDoc(userDocRef)).pipe(
        map((doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const user: User = {
                    bio: data['bio'] ?? '',
                    id: '',
                    email: '',
                    username: data['username'] ?? '',
                    personalLog: [],
                    ratings: [],
                    avatarUrl: data['avatarUrl'] ?? '',
                };
                return user
            }
            return undefined
        })
    )
  }

  updateUser(id: string, userData: Partial<User>): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${id}`);

    return from(updateDoc(userDocRef, {...userData}))
  }


}
