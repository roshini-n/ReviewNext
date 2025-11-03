import { Component, inject, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { ElectronicGadget } from '../../models/electronic-gadget.model';
import { ElectronicGadgetLogService, ElectronicGadgetLog } from '../../services/electronicGadgetLog.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronicGadgetReviewService } from '../../services/electronicGadgetReview.service';
import { Review } from '../../models/review.model';
import { firstValueFrom } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-log-electronic-gadget-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './log-electronic-gadget-popup.component.html',
  styleUrl: './log-electronic-gadget-popup.component.css',
})
export class LogElectronicGadgetPopupComponent implements OnInit {
  gadgetLogService = inject(ElectronicGadgetLogService);
  authService = inject(AuthService);
  gadgetReviewService = inject(ElectronicGadgetReviewService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  @Output() logUpdated: EventEmitter<void> = new EventEmitter<void>();
  @Output() reviewUpdated = new EventEmitter<Review>();

  logForm: FormGroup;
  hoverRating: number = 0;
  gadgetId: string = '';
  username: string = '';
  isLoading = false;
  errorMessage = '';
  userId: string | null = null;
  isEditMode = false;
  existingReview: Review | null = null;

  ratingTexts: string[] = ['Not rated', 'Awful', 'Poor', 'Ok', 'Good', 'Great'];

  constructor(
    public dialogRef: MatDialogRef<LogElectronicGadgetPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { gadget: ElectronicGadget, gadgetId?: string, review?: Review },
    private snackBar: MatSnackBar
  ) {
    this.logForm = this.fb.group({
      dateAdded: [new Date(), Validators.required],
      datePurchased: [''],
      rating: [0, [Validators.min(0), Validators.max(5)]],
      review: ['', Validators.maxLength(500)],
      status: ['owned', Validators.required],
      purchasePrice: [''],
      condition: ['new']
    });

    if (data.review) {
      this.isEditMode = true;
      this.existingReview = data.review;
      this.logForm.patchValue({
        dateAdded: data.review.datePosted,
        datePurchased: data.review.lastUpdated || data.review.datePosted,
        rating: data.review.rating,
        review: data.review.reviewText,
        status: 'owned'
      });
    }

    this.gadgetId = data.gadgetId || data.gadget.id || '';
  }

  async ngOnInit() {
    this.userId = await this.authService.getUid();
    this.username = this.authService.getUsername() || 'Anonymous';
    
    // Debug logging
    console.log('Gadget popup initialized with data:', {
      gadget: this.data.gadget,
      gadgetId: this.gadgetId,
      gadgetTitle: (this.data.gadget as any)?.title,
      gadgetName: this.data.gadget?.name
    });
  }

  setRating(rating: number) {
    this.logForm.patchValue({ rating });
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }

  async onSubmitClick(): Promise<void> {
    const currentUser = await this.authService.getUid();
    if (!currentUser) {
      this.snackBar.open('You must be logged in to log a gadget', 'Close', {
        duration: 2000,
      });
      return;
    }

    if (this.logForm.valid) {
      this.isLoading = true;
      const formData = this.logForm.value;

      try {
        // 1. Build the log object
        const logData: any = {
          userId: currentUser,
          gadgetId: this.gadgetId,
          dateAdded: formData.dateAdded instanceof Date ? formData.dateAdded : new Date(formData.dateAdded),
          rating: formData.rating,
          review: formData.review,
          status: formData.status,
          condition: formData.condition
        };
        
        // Add optional fields only if they have values
        if (formData.datePurchased) {
          logData.datePurchased = formData.datePurchased instanceof Date ? formData.datePurchased : new Date(formData.datePurchased);
        }
        if (formData.purchasePrice) {
          logData.purchasePrice = formData.purchasePrice;
        }

        // 2. Save the log
        await firstValueFrom(this.gadgetLogService.addGadgetLog(logData));

        // 3. Save the review using ElectronicGadgetReviewService (only if rating or review text exists)
        const hasReviewContent = formData.rating > 0 || (formData.review && formData.review.trim().length > 0);
        
        let savedReview: Review | null = null;
        if (hasReviewContent) {
          // Build review data with only defined values
          const reviewData: any = {
            userId: currentUser,
            gadgetId: this.gadgetId,
            rating: formData.rating || 0,
            reviewText: formData.review || '',
            datePosted: Timestamp.now(),
            username: this.username,
            likes: 0
          };
          
          // Only add gadgetTitle if we have the gadget data (try title first, then name)
          const gadgetTitle = (this.data.gadget as any)?.title || this.data.gadget?.name;
          if (gadgetTitle) {
            reviewData.gadgetTitle = gadgetTitle;
          }
          
          console.log('Saving review with data:', reviewData);

          if (this.isEditMode && this.existingReview) {
            savedReview = await firstValueFrom(
              this.gadgetReviewService.updateReview(this.existingReview.id, {
                rating: formData.rating,
                reviewText: formData.review,
                lastUpdated: Timestamp.now() as any
              })
            );
          } else {
            savedReview = await firstValueFrom(this.gadgetReviewService.addReview(reviewData));
          }
        }

        // 4. Emit events and close dialog
        this.logUpdated.emit();
        if (savedReview) {
          this.reviewUpdated.emit(savedReview);
        }
        this.dialogRef.close(savedReview);

        this.snackBar.open('Gadget log and review saved successfully', 'Close', {
          duration: 3000
        });
      } catch (error: any) {
        console.error('Error saving gadget log:', error);
        const errorMessage = error?.message || 'Failed to save gadget log';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
          duration: 5000
        });
      } finally {
        this.isLoading = false;
      }
    }
  }

  onCancelClick() {
    this.dialogRef.close();
  }
}
