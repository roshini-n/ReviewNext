import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { Book } from '../../../models/book.model';
import { Carousel, CarouselModule } from 'primeng/carousel';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [
    CommonModule,
    Carousel,
    CarouselModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './book.component.html',
  styleUrl: './book.component.css',
})
export class BookComponent implements OnInit {
  allBooks: Book[] = [];
  trendingBooks: Book[] = [];
  topRatedBooks: Book[] = [];
  popularBooks: Book[] = [];
  bookFirebaseService = inject(BookFirebaseService);
  authService = inject(AuthService);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookFirebaseService.getBooks().subscribe((books: Book[]) => {
      this.allBooks = books;
      this.trendingBooks = books;
      this.topRatedBooks = books.filter(book => book.rating >= 3.5);
      this.popularBooks = books;
    });
  }
}
