import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  orderBy,
  collectionData,
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { GameLog } from '../models/gameLog.model';
import { AuthService } from './auth.service';
import { GameFirebaseService } from './gameFirebase.service';

@Injectable({
  providedIn: 'root',
})
export class GameLogService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private gameFirebaseService = inject(GameFirebaseService);
  private gameLogCollection = collection(this.firestore, 'gamelogs');


  // add a new GameLog
  addGameLog(gameLog: Omit<GameLog, 'id'>): Observable<string> {
    return from(this.authService.getUid()).pipe(
      switchMap((userId) => {
        if (!userId) {
          throw new Error('User ID is not available.');
        }
        
        //If our log has a rating, update totalReviewScore, numReviews, and rating for logged game
        if (gameLog.rating) {
          const gameDoc = doc(this.firestore, `games/${gameLog.gameId}`);
          return this.gameFirebaseService.getGameById(gameLog.gameId).pipe(
            switchMap(game => {
              if (!game) {
                throw new Error('Game not found');
              }
              return from(updateDoc(gameDoc, {
                rating: ((game.totalRatingScore + gameLog.rating!) / (game.numRatings + 1)).toFixed(2),
                numRatings: game.numRatings + 1,
                totalRatingScore: game.totalRatingScore + gameLog.rating!
              })).pipe(
                switchMap(() => {
                  return from(addDoc(this.gameLogCollection, {
                    ...gameLog,
                    datePosted: new Date(),
                    userId: userId,
                    likes: 0,
                    gameId: gameLog.gameId,
                  })).pipe(
                    switchMap((docRef) => {
                      return from(updateDoc(doc(this.gameLogCollection, docRef.id), {
                        id: docRef.id,
                      })).pipe(map(() => docRef.id));
                    })
                  );
                })
              );
            })
          );
        } else {
          return from(addDoc(this.gameLogCollection, {
            ...gameLog,
            datePosted: new Date(),
            userId: userId,
            likes: 0,
            gameId: gameLog.gameId,
          })).pipe(
            switchMap((docRef) => {
              return from(updateDoc(doc(this.gameLogCollection, docRef.id), {
                id: docRef.id,
              })).pipe(map(() => docRef.id));
            })
          );
        }
      })
    );
  }

  // update an existing GameLog
  updateReview(gameLogId: string, changes: Partial<GameLog>): Observable<void> {
    const reviewDoc = doc(this.firestore, `gamelogs/${gameLogId}`);

    // add lastUpdated timestamp
    const updatedChanges = {
      ...changes,
      lastUpdated: new Date(),
    };

    return from(updateDoc(reviewDoc, updatedChanges));
  }

  // delete a gameLog
  deleteLog(gameLogId: string): Observable<void> {
    const reviewDoc = doc(this.firestore, `gamelogs/${gameLogId}`);
    return from(deleteDoc(reviewDoc));
  }

  // get all gameLogs for a specific game
  getReviewsByGameId(gameId: string): Observable<GameLog[]> {
    const reviewsQuery = query(
      collection(this.firestore, 'gamelogs'),
      where('gameId', '==', gameId),
      orderBy('datePosted', 'desc')
    );

    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<
      GameLog[]
    >;
  }

  // get all gameLogs by a specific user
  getReviewsByUserId(userId: string): Observable<GameLog[]> {
    const q = query(this.gameLogCollection, where('userId', '==', userId));

    return collectionData(q, { idField: 'id' }).pipe(
      map((logs: any[]) => {
        return logs.map((log) => {
          // have to make sure we get that gameId
          if (!log.gameId) {
            alert('Log is missing a gameId, please refresh the page.');
          }

          return {
            ...log,
            gameId: log.gameId || '',
          } as GameLog;
        });
      })
    );
  }

  // get a specific review by ID
  getReviewById(gameLogId: string): Observable<GameLog | null> {
    const reviewDoc = doc(this.firestore, `gamelogs/${gameLogId}`);
    return from(getDoc(reviewDoc)).pipe(
      map((doc) => {
        if (doc.exists()) {
          const data = doc.data() as GameLog;
          return { ...data, id: doc.id };
        } else {
          return null;
        }
      })
    );
  }

  updateGameLog(gameLogId: string, changes: Partial<GameLog>): Observable<void> {
    const reviewDoc = doc(this.firestore, `gamelogs/${gameLogId}`);
    return from(updateDoc(reviewDoc, changes));
  }

  // check if the current user has already reviewed a game
}
