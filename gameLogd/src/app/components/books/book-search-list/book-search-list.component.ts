import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-search-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './book-search-list.component.html',
  styleUrl: './book-search-list.component.css'
})
export class BookSearchListComponent {
  @Input() books: Book[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyMessage = 'No books found.';
  @Output() bookSelected = new EventEmitter<Book>();

  onBookClick(book: Book): void {
    this.bookSelected.emit(book);
  }
}
