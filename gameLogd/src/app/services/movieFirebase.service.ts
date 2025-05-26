import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieFirebaseService {
  private firestore = inject(Firestore);
  private moviesCollection = collection(this.firestore, 'movies');

  constructor() { }

  getMovies(): Observable<Movie[]> {
    return collectionData(this.moviesCollection, { idField: 'id' }) as Observable<Movie[]>;
  }

  getMovieById(id: string): Observable<Movie> {
    const movieDoc = doc(this.moviesCollection, id);
    return docData(movieDoc, { idField: 'id' }) as Observable<Movie>;
  }

  addMovie(movie: Omit<Movie, 'id'>): Observable<void> {
    const movieData = {
      ...movie,
      dateAdded: new Date().toISOString(),
      rating: 0,
      totalRatingScore: 0,
      numRatings: 0,
      views: 0
    };
    return from(addDoc(this.moviesCollection, movieData).then(() => {}));
  }

  updateMovie(id: string, movie: Partial<Movie>): Promise<void> {
    const movieDoc = doc(this.moviesCollection, id);
    return updateDoc(movieDoc, movie);
  }

  deleteMovie(id: string): Promise<void> {
    const movieDoc = doc(this.moviesCollection, id);
    return deleteDoc(movieDoc);
  }

  getTopRatedMovies(limitCount: number = 10): Observable<Movie[]> {
    const q = query(
      this.moviesCollection,
      where('rating', '>=', 3.5),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Movie[]>;
  }

  getRecentlyAddedMovies(limitCount: number = 10): Observable<Movie[]> {
    const q = query(
      this.moviesCollection,
      orderBy('dateAdded', 'desc'),
      limit(limitCount)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Movie[]>;
  }

  getMoviesByGenre(genre: string): Observable<Movie[]> {
    const q = query(
      this.moviesCollection,
      where('genres', 'array-contains', genre)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Movie[]>;
  }

  searchMovies(searchTerm: string): Observable<Movie[]> {
    return this.getMovies().pipe(
      map(movies => movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }
} 