import { Injectable, inject, signal } from '@angular/core';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  Auth,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  user,
  signOut,
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { UserInterface } from '../user.interface';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { UserActivityService } from './user-activity.service';
import { RoutePersistenceService } from './route-persistence.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);

  constructor(
    private userActivityService: UserActivityService,
    private routePersistenceService: RoutePersistenceService
  ) {
    // Set up auto-logout listener
    this.userActivityService.userLoggedOut$.subscribe(() => {
      this.logout().subscribe();
    });

    // Start activity monitoring when user logs in
    this.user$.subscribe(user => {
      if (user) {
        this.userActivityService.initializeActivityMonitoring();
      } else {
        this.userActivityService.stopActivityMonitoring();
      }
    });
  }

  register(
    email: string,
    username: string,
    password: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(async (response) => {
      // update the user profile
      await updateProfile(response.user, { displayName: username });

      // create user document in Firestore
      const userData: User = {
        id: response.user.uid,
        email: email,
        username: username,
        // createdAt: new Date(),
        personalLog: [],
        ratings: [],
        reviewIds: [],
        bio: '',
        avatarUrl: '',
      };

      // add the user to the 'users' collection with their UID as the document ID
      return setDoc(doc(this.firestore, 'users', response.user.uid), userData);
    });

    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {
      // After successful login, redirect to the last visited route if exists
      const lastRoute = this.routePersistenceService.getLastRoute();
      if (lastRoute && lastRoute !== '/') {
        this.routePersistenceService.redirectToLastRoute();
      }
    });
    return from(promise);
  }

  resetPassword(email:string){
    const promise = sendPasswordResetEmail(this.firebaseAuth, email).then(() => {});
    return from(promise);
}

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth).then(() => {
      // Stop activity monitoring on logout
      this.userActivityService.stopActivityMonitoring();
    });
    return from(promise);
  }

  getUid(): Promise<string> {
    const auth = getAuth();
    return new Promise((resolve, reject) => {
      onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            resolve(user.uid);
          } else {
            // User is signed out
            resolve('');
          }
        },
        reject
      );
    });
  }

  // get the current user's username
  getUsername(): string | undefined {
    const user = this.currentUserSig();
    return user?.username;
  }
}
