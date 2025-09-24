import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  publisher?: string[];
}

interface OpenLibraryResponse {
  docs: OpenLibraryBook[];
  numFound: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookCoverService {
  private readonly baseUrl = 'https://openlibrary.org/search.json';

  constructor(private http: HttpClient) {}

  searchBook(title: string, author?: string, year?: number): Observable<string> {
    console.log('BookCoverService: Starting search for book:', { title, author, year });
    
    if (!title || title.length < 2) {
      console.log('BookCoverService: Title too short, skipping search');
      return new Observable(observer => {
        observer.next('');
        observer.complete();
      });
    }

    // Clean the title for better matching
    const cleanTitle = this.cleanTitle(title);
    console.log('BookCoverService: Cleaned title:', cleanTitle);

    // Build the search query
    let query = `title:${encodeURIComponent(title)}`;
    if (author) {
      query += `+author:${encodeURIComponent(author)}`;
    }
    if (year) {
      query += `+first_publish_year:${year}`;
    }

    const url = `${this.baseUrl}?q=${query}&limit=10`;
    console.log('BookCoverService: Making request to Open Library API:', url);

    return this.http.get<OpenLibraryResponse>(url).pipe(
      map(response => {
        console.log('BookCoverService: Open Library response:', response);
        
        if (!response.docs || response.docs.length === 0) {
          console.log('BookCoverService: No results found');
          return '';
        }

        // Try to find exact match first
        const exactMatch = response.docs.find(book => {
          const bookTitle = this.cleanTitle(book.title);
          const isExactMatch = bookTitle === cleanTitle ||
                             bookTitle.includes(cleanTitle) ||
                             cleanTitle.includes(bookTitle);
          console.log('BookCoverService: Checking exact match:', {
            bookTitle,
            cleanTitle,
            isExactMatch
          });
          return isExactMatch;
        });

        if (exactMatch?.cover_i) {
          console.log('BookCoverService: Found exact match:', exactMatch.title);
          const imageUrl = this.getCoverUrl(exactMatch.cover_i);
          console.log('BookCoverService: Image URL:', imageUrl);
          return imageUrl;
        }

        // If no exact match, try to find closest match
        const closestMatch = response.docs.find(book => {
          const bookTitle = this.cleanTitle(book.title);
          const similarity = this.calculateSimilarity(bookTitle, cleanTitle);
          console.log('BookCoverService: Checking similarity:', {
            bookTitle,
            cleanTitle,
            similarity
          });
          return bookTitle.includes(cleanTitle) || 
                 cleanTitle.includes(bookTitle) ||
                 similarity > 0.7;
        });

        if (closestMatch?.cover_i) {
          console.log('BookCoverService: Found closest match:', closestMatch.title);
          const imageUrl = this.getCoverUrl(closestMatch.cover_i);
          console.log('BookCoverService: Image URL:', imageUrl);
          return imageUrl;
        }

        // If still no match, return the first result with a cover
        const firstWithCover = response.docs.find(book => book.cover_i);
        if (firstWithCover?.cover_i) {
          console.log('BookCoverService: Using first result with cover:', firstWithCover.title);
          const imageUrl = this.getCoverUrl(firstWithCover.cover_i);
          console.log('BookCoverService: Image URL:', imageUrl);
          return imageUrl;
        }

        console.log('BookCoverService: No suitable image found');
        return '';
      }),
      catchError(error => {
        console.error('BookCoverService: Error searching book:', error);
        return throwError(() => new Error('Failed to search for book image'));
      })
    );
  }

  private cleanTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
      .replace(/the/g, '') // Remove common words
      .replace(/book/g, '')
      .replace(/edition/g, '')
      .replace(/deluxe/g, '')
      .replace(/special/g, '')
      .replace(/collectors/g, '')
      .replace(/hardcover/g, '')
      .replace(/paperback/g, '')
      .replace(/kindle/g, '')
      .replace(/ebook/g, '')
      .trim();
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  private editDistance(str1: string, str2: string): number {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return track[str2.length][str1.length];
  }

  private getCoverUrl(coverId: number): string {
    // Open Library provides different sizes: S (small), M (medium), L (large)
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  }
} 