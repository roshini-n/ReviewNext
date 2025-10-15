import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { AdminService } from '../../services/admin.service';
import { Category } from '../../models/category.model';
import { AddCategoryDialogComponent } from './add-category-dialog/add-category-dialog.component';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    ReactiveFormsModule
  ],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  categories: Category[] = [];
  isLoading = true;
  isAdmin = false;
  displayedColumns = ['icon', 'displayName', 'description', 'route', 'isDefault', 'actions'];

  ngOnInit() {
    this.checkAdminStatus();
    this.loadCategories();
  }

  private checkAdminStatus() {
    this.adminService.isAdmin().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (!isAdmin) {
          this.snackBar.open('Access denied: Admin privileges required', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error checking admin status:', error);
        this.isAdmin = false;
      }
    });
  }

  private loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  openAddCategoryDialog() {
    if (!this.isAdmin) {
      this.snackBar.open('Admin access required', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories(); // Refresh the list
      }
    });
  }

  toggleCategoryStatus(category: Category) {
    if (!this.isAdmin) {
      this.snackBar.open('Admin access required', 'Close', { duration: 3000 });
      return;
    }

    if (category.isDefault) {
      this.snackBar.open('Cannot deactivate default categories', 'Close', { duration: 3000 });
      return;
    }

    this.categoryService.updateCategory(category.id, { isActive: !category.isActive })
      .then(() => {
        this.snackBar.open(`Category ${category.isActive ? 'deactivated' : 'activated'}`, 'Close', { duration: 3000 });
        this.loadCategories();
      })
      .catch(error => {
        console.error('Error updating category:', error);
        this.snackBar.open('Error updating category', 'Close', { duration: 3000 });
      });
  }

  deleteCategory(category: Category) {
    if (!this.isAdmin) {
      this.snackBar.open('Admin access required', 'Close', { duration: 3000 });
      return;
    }

    if (category.isDefault) {
      this.snackBar.open('Cannot delete default categories', 'Close', { duration: 3000 });
      return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete the "${category.displayName}" category? This action cannot be undone.`);
    if (!confirmDelete) return;

    this.categoryService.deleteCategory(category.id)
      .then(() => {
        this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
        this.loadCategories();
      })
      .catch(error => {
        console.error('Error deleting category:', error);
        this.snackBar.open('Error deleting category', 'Close', { duration: 3000 });
      });
  }
}