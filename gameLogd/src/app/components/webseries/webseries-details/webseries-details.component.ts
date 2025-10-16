import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
import { GeneralDeleteButtonComponent } from '../../shared/general-delete-button/general-delete-button.component';
import { AuthService } from '../../../services/auth.service';
import { Review } from '../../../models/review.model';
import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';
import { WebSeries } from '../../../models/web-series.model';
import { Firestore, collection, query, where, orderBy, collectionData } from '@angular/fire/firestore';

@Component({
  selector: 'app-webseries-details',
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
    MatProgressSpinnerModule,
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
    MatAutocompleteModule,
    GeneralDeleteButtonComponent
  ],
  templateUrl: './webseries-details.component.html',
  styleUrls: ['./webseries-details.component.css']
})
export class WebSeriesDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  public authService = inject(AuthService);
  private webSeriesFirebaseService = inject(WebSeriesFirebaseService);
  private firestore = inject(Firestore);

  webSeries?: WebSeries;
  reviews: Review[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  seriesId: string | null = null;

  async ngOnInit() {
    this.seriesId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = await this.authService.getUid();

    if (this.seriesId) {
      this.loadSeriesDetails();
      this.getReviews();
    }
  }

  private loadSeriesDetails() {
    if (!this.seriesId) return;
    
    this.isLoading = true;
    this.webSeriesFirebaseService.getWebSeriesById(this.seriesId).subscribe({
      next: (series) => {
        if (series) {
          this.webSeries = series;
          this.isLoading = false;
        } else {
          this.error = 'Web series not found.';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load series details. Please try again later.';
        this.isLoading = false;
        console.error('Error loading series:', err);
      }
    });
  }

  private getReviews() {
    if (!this.seriesId) return;

    const reviewsQuery = query(
      collection(this.firestore, 'reviews'),
      where('seriesId', '==', this.seriesId),
      orderBy('datePosted', 'desc')
    );
    
    collectionData(reviewsQuery, { idField: 'id' }).subscribe({
      next: (reviews) => {
        this.reviews = reviews as Review[];
      },
      error: (error: Error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  onEditSeries() {
    if (!this.webSeries || !this.seriesId) return;

    // TODO: Implement edit dialog
    // const dialogRef = this.dialog.open(WebSeriesEditDialogComponent, {
    //   width: '600px',
    //   data: { ...this.webSeries }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.loadSeriesDetails();
    //   }
    // });
  }

  onTabChange(index: number) {
    // Handle tab change if needed
  }

  openLogSeriesPopup() {
    if (!this.authService.currentUserSig()) {
      this.snackBar.open('Please log in to add series to your watchlist', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!this.webSeries || !this.seriesId) return;

    // TODO: Implement watchlist popup dialog
    // const dialogRef = this.dialog.open(LogSeriesPopupComponent, {
    //   maxWidth: '550px',
    //   width: '95vw',
    //   panelClass: ['series-log-dialog', 'minimal-theme-dialog'],
    //   autoFocus: false,
    //   backdropClass: 'minimal-backdrop',
    //   data: {
    //     series: this.webSeries,
    //     seriesId: this.seriesId
    //   }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     // Handle after adding to watchlist
    //     this.snackBar.open('Series added to your watchlist', 'Close', {
    //       duration: 3000
    //     });
    //   }
    // });
  }
}