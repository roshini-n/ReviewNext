import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

interface LogDialogData {
  itemId: string;
  itemTitle: string;
  categoryType: string;
  categoryName: string;
}

@Component({
  selector: 'app-universal-log-popup',
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
    MatSelectModule
  ],
  template: `
    <div class="log-dialog">
      <h2 mat-dialog-title>
        <mat-icon>add_circle</mat-icon>
        Add {{ data.itemTitle }} to Log
      </h2>
      
      <mat-dialog-content>
        <form [formGroup]="logForm" class="log-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Date {{ actionLabel }}</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date" required>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="logForm.get('date')?.hasError('required')">
              Date is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status" required>
              <mat-option value="completed">{{ getCompletedLabel() }}</mat-option>
              <mat-option value="in-progress">{{ getInProgressLabel() }}</mat-option>
              <mat-option value="planned">{{ getPlannedLabel() }}</mat-option>
              <mat-option value="dropped">Dropped</mat-option>
            </mat-select>
            <mat-error *ngIf="logForm.get('status')?.hasError('required')">
              Status is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rating (1-5)</mat-label>
            <mat-select formControlName="rating">
              <mat-option value="">No Rating</mat-option>
              <mat-option value="1">1 - Poor</mat-option>
              <mat-option value="2">2 - Fair</mat-option>
              <mat-option value="3">3 - Good</mat-option>
              <mat-option value="4">4 - Very Good</mat-option>
              <mat-option value="5">5 - Excellent</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput 
                      formControlName="notes" 
                      rows="4" 
                      placeholder="Add your thoughts, progress notes, or any other details..."></textarea>
          </mat-form-field>

          <!-- Category-specific fields based on type -->
          <div *ngIf="showCategorySpecificFields()" class="category-specific">
            <h3>Additional Information</h3>
            
            <!-- Game-specific fields -->
            <ng-container *ngIf="data.categoryType === 'games' || data.categoryType === 'game'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Hours Played</mat-label>
                <input matInput type="number" formControlName="hoursPlayed" min="0" step="0.5">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Platform</mat-label>
                <input matInput formControlName="platform" placeholder="e.g., PC, PlayStation, Xbox">
              </mat-form-field>
            </ng-container>

            <!-- Book-specific fields -->
            <ng-container *ngIf="data.categoryType === 'books' || data.categoryType === 'book'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Pages Read</mat-label>
                <input matInput type="number" formControlName="pagesRead" min="0">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reading Format</mat-label>
                <mat-select formControlName="format">
                  <mat-option value="physical">Physical Book</mat-option>
                  <mat-option value="ebook">E-book</mat-option>
                  <mat-option value="audiobook">Audiobook</mat-option>
                </mat-select>
              </mat-form-field>
            </ng-container>

            <!-- Movie-specific fields -->
            <ng-container *ngIf="data.categoryType === 'movies' || data.categoryType === 'movie'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Watched Where</mat-label>
                <input matInput formControlName="watchedWhere" placeholder="e.g., Netflix, Cinema, DVD">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Watched With</mat-label>
                <input matInput formControlName="watchedWith" placeholder="e.g., Family, Friends, Alone">
              </mat-form-field>
            </ng-container>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                [disabled]="logForm.invalid || isSubmitting"
                (click)="onSubmit()">
          <mat-icon *ngIf="!isSubmitting">save</mat-icon>
          <mat-icon *ngIf="isSubmitting" class="spinning">refresh</mat-icon>
          {{ isSubmitting ? 'Adding...' : 'Add to Log' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .log-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #7b1fa2;
      margin-bottom: 0;
    }

    .log-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .category-specific {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .category-specific h3 {
      color: #4a148c;
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    button[mat-raised-button] {
      background: linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%);
      color: white;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    @media (max-width: 600px) {
      .log-dialog {
        min-width: 90vw;
        max-width: 90vw;
      }
    }
  `]
})
export class UniversalLogPopupComponent {
  private dialogRef = inject(MatDialogRef<UniversalLogPopupComponent>);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  logForm: FormGroup;
  isSubmitting = false;
  actionLabel = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: LogDialogData) {
    this.actionLabel = this.getActionLabel();
    this.logForm = this.createForm();
  }

  private createForm(): FormGroup {
    const formControls: { [key: string]: FormControl } = {
      date: new FormControl(new Date(), [Validators.required]),
      status: new FormControl('completed', [Validators.required]),
      rating: new FormControl(''),
      notes: new FormControl('')
    };

    // Add category-specific fields
    if (this.data.categoryType === 'games' || this.data.categoryType === 'game') {
      formControls['hoursPlayed'] = new FormControl('');
      formControls['platform'] = new FormControl('');
    } else if (this.data.categoryType === 'books' || this.data.categoryType === 'book') {
      formControls['pagesRead'] = new FormControl('');
      formControls['format'] = new FormControl('physical');
    } else if (this.data.categoryType === 'movies' || this.data.categoryType === 'movie') {
      formControls['watchedWhere'] = new FormControl('');
      formControls['watchedWith'] = new FormControl('');
    }

    return new FormGroup(formControls);
  }

  private getActionLabel(): string {
    switch (this.data.categoryType) {
      case 'games':
      case 'game':
        return 'Played';
      case 'books':
      case 'book':
        return 'Read';
      case 'movies':
      case 'movie':
        return 'Watched';
      default:
        return 'Experienced';
    }
  }

  getCompletedLabel(): string {
    switch (this.data.categoryType) {
      case 'games':
      case 'game':
        return 'Completed';
      case 'books':
      case 'book':
        return 'Finished';
      case 'movies':
      case 'movie':
        return 'Watched';
      default:
        return 'Completed';
    }
  }

  getInProgressLabel(): string {
    switch (this.data.categoryType) {
      case 'games':
      case 'game':
        return 'Playing';
      case 'books':
      case 'book':
        return 'Reading';
      case 'movies':
      case 'movie':
        return 'Watching';
      default:
        return 'In Progress';
    }
  }

  getPlannedLabel(): string {
    switch (this.data.categoryType) {
      case 'games':
      case 'game':
        return 'Want to Play';
      case 'books':
      case 'book':
        return 'Want to Read';
      case 'movies':
      case 'movie':
        return 'Want to Watch';
      default:
        return 'Planned';
    }
  }

  showCategorySpecificFields(): boolean {
    return ['games', 'game', 'books', 'book', 'movies', 'movie'].includes(this.data.categoryType);
  }

  async onSubmit() {
    if (this.logForm.invalid) return;

    this.isSubmitting = true;
    
    try {
      const formValue = this.logForm.value;
      const currentUserId = await this.authService.getUid() as string;
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const logEntry = {
        itemId: this.data.itemId,
        itemTitle: this.data.itemTitle,
        categoryType: this.data.categoryType,
        categoryName: this.data.categoryName,
        userId: currentUserId,
        date: formValue.date,
        status: formValue.status,
        rating: formValue.rating ? parseInt(formValue.rating) : null,
        notes: formValue.notes || '',
        createdAt: new Date(),
        // Category-specific fields
        ...(formValue.hoursPlayed && { hoursPlayed: parseFloat(formValue.hoursPlayed) }),
        ...(formValue.platform && { platform: formValue.platform }),
        ...(formValue.pagesRead && { pagesRead: parseInt(formValue.pagesRead) }),
        ...(formValue.format && { format: formValue.format }),
        ...(formValue.watchedWhere && { watchedWhere: formValue.watchedWhere }),
        ...(formValue.watchedWith && { watchedWith: formValue.watchedWith })
      };

      // TODO: Save to universal log service
      console.log('Log entry to save:', logEntry);
      
      this.snackBar.open(
        `${this.data.itemTitle} added to your log!`, 
        'Close', 
        { duration: 3000 }
      );
      
      this.dialogRef.close(logEntry);
      
    } catch (error) {
      console.error('Error saving log entry:', error);
      this.snackBar.open('Failed to add to log', 'Close', { duration: 3000 });
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}