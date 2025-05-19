import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { Book } from '../../../models/book.model';
import { BookLogService } from '../../../services/bookLog.service';
import { BookReviewService } from '../../../services/bookReview.service';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule
  ],
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css']
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private bookService = inject(BookFirebaseService);
  private bookLogService = inject(BookLogService);
  private bookReviewService = inject(BookReviewService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  book: Book | undefined;
  isLoggedIn = false;
  currentUserId: string | null = null;
  selectedTab = 0;
  isLoading = true;
  error: string | null = null;

  constructor() {}

  ngOnInit() {
    // Subscribe to user state changes
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.currentUserId = user?.uid || null;
    });

    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBookDetails(bookId);
    }
  }

  private loadBookDetails(bookId: string) {
    this.bookService.getBookById(bookId).subscribe({
      next: (book) => {
        this.book = book;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading book details:', error);
        this.error = 'Failed to load book details';
        this.isLoading = false;
      }
    });
  }

  onAddToLog() {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please log in to add books to your log', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement add to log functionality
  }

  onAddReview() {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please log in to add reviews', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement add review functionality
  }

  onEditBook() {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please log in to edit books', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement edit book functionality
  }

  onDeleteBook() {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please log in to delete books', 'Close', {
        duration: 3000
      });
      return;
    }
    // Implement delete book functionality
  }

  onTabChange(index: number) {
    this.selectedTab = index;
  }
}
