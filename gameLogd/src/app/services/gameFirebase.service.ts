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
  documentId,
} from '@angular/fire/firestore';
import { Observable, from, of, throwError } from 'rxjs';
import { Game } from '../models/game.model';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GameFirebaseService {
  firestore = inject(Firestore);
  gamesCollection = collection(this.firestore, 'games');
  // grab all games here and their specifc firebase id
  getGames(): Observable<Game[]> {
    return collectionData(this.gamesCollection, {
      idField: 'id',
    }).pipe(
      map((games) => games.map((game) => this.mapToGameModel(game as any)))
    );
  }

  //region GET

  // this function will grab a single game by its id
  // and return it as an observable if it exists else we return undefined
  getGameById(id: string): Observable<Game | undefined> {
    // set our reference to grab the game w/ the id we want
    const gameDocRef = doc(this.firestore, `games/${id}`);

    // here we try to grab each attribute and map to said item if they exist else we put an empty string
    return from(getDoc(gameDocRef)).pipe(
      map((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          return this.mapToGameModel({ id: doc.id, ...data });
        }
        return undefined;
      })
    );
  }

  getGamesByIds(ids: string[]): Observable<Game[]> {
    if (ids.length === 0) {
      return of([]);
    }

    // get rid of nulls to prevent errors later on
    const validIds = ids.filter(
      (id) => id !== null && id !== undefined && id !== ''
    );

    if (validIds.length === 0) {
      return of([]);
    }

    const gamesQuery = query(
      this.gamesCollection,
      where(documentId(), 'in', validIds)
    );
    return from(getDocs(gamesQuery)).pipe(
      map((querySnapshot) => {
        return querySnapshot.docs.map((doc) => {
          return this.mapToGameModel({ id: doc.id, ...doc.data() });
        });
      })
    );
  }

  //endregion get

  // helper method to have consistent models that represent the same as firebase
  private mapToGameModel(data: any): Game {
    return {
      id: data.id || '',
      title: data.title || '',
      description: data.description || '',
      platforms: Array.isArray(data.platforms) ? data.platforms : [],
      releaseDate: data.releaseDate || '',
      developer: data.developer || '',
      publisher: data.publisher || '',
      rating: data.rating || 0,
      imageUrl: data.imageUrl || '',
      playersPlayed: data.playersPlayed || 0,
      numRatings: data.numRatings || 0,
      totalRatingScore: data.totalRatingScore || 0
    };
  }

  addGame(
    title: string,
    platforms: string[],
    developer: string,
    description: string,
    releaseDate: string,
    publisher: string,
    genres: String[],
    imageUrl: string,
    rating: number,
    numRatings: number,
    totalRatingScore: number,
  ): Observable<String> {
    const gameToCreate = {
      title,
      platforms,
      developer,
      description,
      releaseDate,
      publisher,
      genres,
      imageUrl,
      rating,
      numRatings,
      totalRatingScore
    };
    const promise = addDoc(this.gamesCollection, gameToCreate).then(
      (response) => response.id
    );
    // converts our promise to an observable
    return from(promise);
  }

  // search for games by title, currenlty grabbing all games and filtering client side. we dont want this. going to update it.
  searchGames(searchTerm: string, field: string): Observable<Game[]> {
    console.log('Service searching for:', searchTerm);

    if (!searchTerm || searchTerm.trim() === '') {
      return of([]);
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    // Firestore query with a where clause
    const gamesQuery = query(
      this.gamesCollection,
      where(field, '>=', searchTerm),
      where(field, '<=', searchTerm + '\uf8ff')
    );

    console.log('Query:', gamesQuery);

    return collectionData(gamesQuery, { idField: 'id' }).pipe(
      map((games) => games.map((game) => this.mapToGameModel(game as any)))
    );
  }
}
