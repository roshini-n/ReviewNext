import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CategoryManagementService, CategoryDefinition } from '../../../services/category-management.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-category-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTableModule
  ],
  template: `
    <div class="admin-category-container">
      <h1>Category Management</h1>
      
      <!-- Add New Category Form -->
      <mat-card class="add-category-card">
        <mat-card-header>
          <mat-card-title>Add New Category</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="categoryForm" (ngSubmit)="addCategory()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Category Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g., books">
                <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">
                  Category name is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Display Name</mat-label>
                <input matInput formControlName="displayName" placeholder="e.g., Books">
                <mat-error *ngIf="categoryForm.get('displayName')?.hasError('required')">
                  Display name is required
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Icon (Material Icon)</mat-label>
                <input matInput formControlName="icon" placeholder="e.g., menu_book">
                <mat-error *ngIf="categoryForm.get('icon')?.hasError('required')">
                  Icon is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Route</mat-label>
                <input matInput formControlName="route" placeholder="e.g., books">
                <mat-error *ngIf="categoryForm.get('route')?.hasError('required')">
                  Route is required
                </mat-error>
              </mat-form-field>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" 
                       placeholder="Brief description of the category"></textarea>
            </mat-form-field>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="categoryForm.invalid">
                <mat-icon>add</mat-icon>
                Add Category
              </button>
              <button mat-button type="button" (click)="resetForm()">
                <mat-icon>clear</mat-icon>
                Reset
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
      
      <!-- Categories List -->
      <mat-card class="categories-list-card">
        <mat-card-header>
          <mat-card-title>Existing Categories</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="categories-grid">
            @for (category of categories(); track category.id) {
              <div class="category-item">
                <div class="category-header">
                  <div class="category-info">
                    <mat-icon class="category-icon">{{ category.icon }}</mat-icon>
                    <div>
                      <h3>{{ category.displayName }}</h3>
                      <p class="category-route">Route: /{{ category.route }}</p>
                    </div>
                  </div>
                  
                  <mat-slide-toggle 
                    [checked]="category.isActive"
                    (change)="toggleCategoryStatus(category, $event.checked)">
                    {{ category.isActive ? 'Active' : 'Inactive' }}
                  </mat-slide-toggle>
                </div>
                
                <p class="category-description">{{ category.description }}</p>
                
                <div class="category-actions">
                  <button mat-button color="primary" (click)="editCategory(category)">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button mat-button color="warn" (click)="deleteCategory(category)">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </div>
              </div>
            }
          </div>
          
          @if (categories().length === 0) {
            <div class="empty-state">
              <mat-icon class="empty-icon">category</mat-icon>
              <h2>No Categories Found</h2>
              <p>Add your first category using the form above.</p>
              <button mat-raised-button color="primary" (click)="initializeDefaultCategories()">
                <mat-icon>auto_fix_high</mat-icon>
                Initialize Default Categories
              </button>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-category-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .add-category-card,
    .categories-list-card {
      margin-bottom: 30px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .category-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      background: #fafafa;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .category-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .category-info h3 {
      margin: 0;
      font-size: 1.2em;
    }

    .category-route {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 0.9em;
      font-family: monospace;
    }

    .category-description {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.4;
    }

    .category-actions {
      display: flex;
      gap: 10px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      opacity: 0.3;
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .categories-grid {
        grid-template-columns: 1fr;
      }

      .category-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
    }
  `]
})
export class AdminCategoryManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryManagementService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  categories = signal<CategoryDefinition[]>([]);
  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z-]+$/)]],
      displayName: ['', Validators.required],
      icon: ['', Validators.required],
      route: ['', [Validators.required, Validators.pattern(/^[a-z-]+$/)]],
      description: ['', Validators.required]
    });

    // Auto-generate route from name
    this.categoryForm.get('name')?.valueChanges.subscribe(name => {
      if (name) {
        this.categoryForm.patchValue({ route: name }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  private loadCategories() {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  addCategory() {
    if (this.categoryForm.valid) {
      const currentUser = this.authService.currentUserSig();
      if (!currentUser) {
        this.snackBar.open('You must be logged in to add categories', 'Close', { duration: 3000 });
        return;
      }

      const formValue = this.categoryForm.value;
      const newCategory: Omit<CategoryDefinition, 'id' | 'createdAt'> = {
        ...formValue,
        isActive: true,
        createdBy: currentUser.email || 'admin',
        sortOrder: this.categories().length + 1
      };

      this.categoryService.addCategory(newCategory).subscribe({
        next: () => {
          this.snackBar.open('Category added successfully!', 'Close', { duration: 3000 });
          this.resetForm();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error adding category:', error);
          this.snackBar.open('Error adding category. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  resetForm() {
    this.categoryForm.reset();
  }

  toggleCategoryStatus(category: CategoryDefinition, isActive: boolean) {
    if (category.id) {
      this.categoryService.updateCategory(category.id, { isActive }).subscribe({
        next: () => {
          this.snackBar.open(
            `Category ${isActive ? 'activated' : 'deactivated'} successfully!`, 
            'Close', 
            { duration: 3000 }
          );
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.snackBar.open('Error updating category status.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  editCategory(category: CategoryDefinition) {
    // Populate form with category data for editing
    this.categoryForm.patchValue({
      name: category.name,
      displayName: category.displayName,
      icon: category.icon,
      route: category.route,
      description: category.description
    });

    this.snackBar.open('Category loaded for editing. Modify and submit to update.', 'Close', { duration: 3000 });
  }

  deleteCategory(category: CategoryDefinition) {
    if (confirm(`Are you sure you want to delete the "${category.displayName}" category? This action cannot be undone.`)) {
      if (category.id) {
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.snackBar.open('Category deleted successfully!', 'Close', { duration: 3000 });
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error deleting category:', error);
            this.snackBar.open('Error deleting category. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  initializeDefaultCategories() {
    const currentUser = this.authService.currentUserSig();
    if (!currentUser) {
      this.snackBar.open('You must be logged in to initialize categories', 'Close', { duration: 3000 });
      return;
    }

    this.categoryService.initializeDefaultCategories(currentUser.email || 'admin').subscribe({
      next: () => {
        this.snackBar.open('Default categories initialized successfully!', 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error initializing categories:', error);
        this.snackBar.open('Error initializing categories. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}