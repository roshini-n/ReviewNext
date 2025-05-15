import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { Book } from '../../../models/book.model';
import { Carousel, CarouselModule } from 'primeng/carousel';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  books: Book[] = [];
  bookFirebaseService = inject(BookFirebaseService);

  ngOnInit(): void {
    this.books = [];
    this.bookFirebaseService.getBooks().subscribe(books => {
      this.books = books;
    });
  }
}
