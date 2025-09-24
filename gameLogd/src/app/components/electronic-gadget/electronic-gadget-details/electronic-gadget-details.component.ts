import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/review.model';
import { GeneralDeleteButtonComponent } from '../../shared/general-delete-button/general-delete-button.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronicGadgetFirebaseService } from '../../../services/electronicGadgetFirebase.service';
import { ElectronicGadget } from '../../../models/electronic-gadget.model';

@Component({
  selector: 'app-electronic-gadget-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatGridListModule,
    MatDialogModule,
    MatTabsModule,
    ReactiveFormsModule,
    GeneralDeleteButtonComponent,
  ],
  templateUrl: './electronic-gadget-details.component.html',
  styleUrl: './electronic-gadget-details.component.css',
})
export class ElectronicGadgetDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private dialog = inject(MatDialog);
  public authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private electronicGadgetService = inject(ElectronicGadgetFirebaseService);
  
  gadget?: ElectronicGadget;
  rating?: number;
  currentRating: number = 0;
  disabled: boolean = false;
  reviews: Review[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  currenUser = this.authService.getUid();
  gadgetId: string | null = null;
  reviewForm: FormGroup;

  constructor() {
    this.reviewForm = this.fb.group({
      reviewText: ['', [Validators.required, Validators.minLength(10)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  async ngOnInit() {
    console.log('Current user:', this.currenUser);
    if (this.currenUser === null || this.currenUser === undefined) {
      this.disabled = true;
    } else {
      this.currentUserId = await this.currenUser;
      this.disabled = false;
    }
    
    this.gadgetId = this.route.snapshot.paramMap.get('id');

    if (this.gadgetId) {
      this.isLoading = true;
      this.electronicGadgetService.getElectronicGadgetById(this.gadgetId).subscribe({
        next: (gadget) => {
          this.gadget = gadget;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load gadget details. Please try again later.';
          this.isLoading = false;
          console.error('Error loading gadget:', err);
        }
      });
    }
    
    this.getReviews();
  }

  getReviews() {
    if (!this.gadgetId) return;
    this.reviewService.getReviewsByGadgetId(this.gadgetId).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews;
        console.log('Reviews loaded:', reviews);
      },
      error: (error: any) => {
        console.error('Error loading reviews:', error);
        this.error = 'Failed to load reviews. Please try again later.';
      }
    });
  }

  openLogGadgetPopup() {
    // TODO: Implement log gadget popup
  }

  onEditGadget() {
    // TODO: Implement edit gadget functionality
  }

  editReview(review: Review) {
    // TODO: Implement edit review functionality
  }

  deleteReview(review: Review) {
    // TODO: Implement delete review functionality
  }

  onTabChange(index: number) {
    // Handle tab change if needed
  }
} 