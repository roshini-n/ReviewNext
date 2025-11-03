import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  docData,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  QueryConstraint,
  updateDoc
} from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { setDoc } from 'firebase/firestore';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore = inject(Firestore);
  storage = inject(Storage);
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

  // Stream live updates for a user document (e.g., avatar changes)
  observeUserById(id: string): Observable<User | undefined> {
    const userDocRef = doc(this.firestore, `users/${id}`);
    return docData(userDocRef).pipe(
      map((data: any | undefined) => {
        if (!data) return undefined;
        const user: User = {
          bio: data['bio'] ?? '',
          id: '',
          email: '',
          username: data['username'] ?? '',
          personalLog: [],
          ratings: [],
          avatarUrl: data['avatarUrl'] ?? '',
        };
        return user;
      })
    );
  }

  updateUser(id: string, userData: Partial<User>): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${id}`);
    console.log('Updating user document:', id, 'with data:', userData);

    return from(updateDoc(userDocRef, {...userData})).pipe(
      catchError((error) => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('Failed to update user data'));
      })
    );
  }

  /**
   * Upload a profile photo to Firebase Storage and return the download URL
   * @param userId - The user's UID
   * @param file - The image file to upload
   * @returns Observable<string> - The download URL of the uploaded image
   */
  uploadProfilePhoto(userId: string, file: File): Observable<string> {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return throwError(() => new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)'));
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return throwError(() => new Error('File size too large. Maximum size is 5MB'));
    }

    // Create a reference to the storage location
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filePath = `profilePhotos/${userId}.${fileExtension}`;
    const storageRef = ref(this.storage, filePath);

    console.log('Uploading profile photo to:', filePath);

    // Upload the file and get the download URL
    return from(uploadBytes(storageRef, file)).pipe(
      switchMap((snapshot) => {
        console.log('Upload successful, getting download URL');
        return from(getDownloadURL(snapshot.ref));
      }),
      catchError((error) => {
        console.error('Error uploading profile photo:', error);
        return throwError(() => new Error('Failed to upload profile photo'));
      })
    );
  }

  /**
   * Delete a user's profile photo from Firebase Storage
   * @param userId - The user's UID
   */
  deleteProfilePhoto(userId: string): Observable<void> {
    const filePath = `profilePhotos/${userId}`;
    const storageRef = ref(this.storage, filePath);

    return from(deleteObject(storageRef)).pipe(
      catchError((error) => {
        console.error('Error deleting profile photo:', error);
        // Don't throw error if file doesn't exist
        return of(void 0);
      })
    );
  }


}
