import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookCoverService {
  private readonly searchUrl = 'https://openlibrary.org/search.json';
  private readonly coverBaseUrl = 'https://covers.openlibrary.org/b';

  constructor(private http: HttpClient) {}

  searchBook(title: string, author?: string, year?: number): Observable<string> {
    // Build a simple search query
    const query = this.buildSearchQuery(title, author, year);
    
    return this.http.get<any>(`${this.searchUrl}?q=${query}&limit=10`).pipe(
      map(response => {
        if (!response.docs || response.docs.length === 0) {
          return '';
        }

        // First try to find a book with a cover
        const bookWithCover = response.docs.find((book: any) => book.cover_i);
        if (bookWithCover) {
          return `${this.coverBaseUrl}/id/${bookWithCover.cover_i}-L.jpg`;
        }

        // If no cover found, try to get ISBN and use that
        const bookWithIsbn = response.docs.find((book: any) => book.isbn?.[0]);
        if (bookWithIsbn) {
          return `${this.coverBaseUrl}/isbn/${bookWithIsbn.isbn[0]}-L.jpg`;
        }

        return '';
      }),
      catchError(() => of(''))
    );
  }

  private buildSearchQuery(title: string, author?: string, year?: number): string {
    let query = `title:${encodeURIComponent(title)}`;
    
    if (author) {
      query += ` author:${encodeURIComponent(author)}`;
    }
    
    if (year) {
      query += ` publish_year:${year}`;
    }
    
    return query;
  }
} 