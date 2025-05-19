import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-search-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './book-search-list.component.html',
  styleUrl: './book-search-list.component.css'
})
export class BookSearchListComponent {
  @Input() books: Book[] = [];
  @Output() bookSelected = new EventEmitter<Book>();

  onBookClick(book: Book): void {
    this.bookSelected.emit(book);
  }
}
