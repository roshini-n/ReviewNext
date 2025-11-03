import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-book-log-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './book-log-menu.component.html',
  styleUrl: './book-log-menu.component.css'
})
export class BookLogMenuComponent {
  @Output() logBook = new EventEmitter<void>();
  @Output() addToReadingList = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<void>();
  @Output() markAsCurrentlyReading = new EventEmitter<void>();
  @Output() markAsWantToRead = new EventEmitter<void>();
}
