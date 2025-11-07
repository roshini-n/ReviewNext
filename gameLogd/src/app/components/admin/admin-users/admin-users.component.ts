import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../../../services/admin.service';
import { AdminUserDetailsComponent } from '../admin-user-details/admin-user-details.component';
import { AdminConfirmDialogComponent } from '../admin-confirm-dialog/admin-confirm-dialog.component';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  adminService = inject(AdminService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  firestore = inject(Firestore);

  private readonly adminEmails = [
    'admin@example.com',
    'roshininaguru12@gmail.com',
    'admin@reviewnext.com',
    'super@admin.com'
  ];

  users = signal<AdminUser[]>([]);
  filteredUsers = signal<AdminUser[]>([]);
  loading = signal(true);
  searchTerm = '';

  displayedColumns: string[] = [
    'avatar',
    'username', 
    'email', 
    'role', 
    'createdAt', 
    'totalReviews', 
    'totalLists', 
    'actions'
  ];

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.loading.set(true);

    // Use full collection read to avoid query cache/pagination issues and ensure all users are loaded
    const usersCollection = collection(this.firestore, 'users');
    collectionData(usersCollection, { idField: 'id' }).pipe(
      map((users: any[]) => users.map(u => ({
        ...u,
        totalReviews: u.totalReviews ?? 0,
        totalLists: u.totalLists ?? 0
      }) as AdminUser))
    ).subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredUsers.set(this.users());
      return;
    }

    const filtered = this.users().filter(user =>
      (user.username || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term) ||
      ((user.role || '').toLowerCase().includes(term))
    );
    this.filteredUsers.set(filtered);
  }

  viewUserDetails(user: AdminUser) {
    const dialogRef = this.dialog.open(AdminUserDetailsComponent, {
      width: '800px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadUsers();
      }
    });
  }

  async deleteUser(user: AdminUser) {
    if (this.adminEmails.includes(user.email)) {
      this.snackBar.open('Cannot delete admin user', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(AdminConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete user "${user.username}"? This will also delete all their reviews, ratings, and lists. This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.adminService.deleteUser(user.id);
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      }
    });
  }

  getRoleColor(role: string | undefined): string {
    switch (role) {
      case 'admin': return 'accent';
      case 'moderator': return 'primary';
      default: return '';
    }
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch {
      return new Date(timestamp).toLocaleDateString();
    }
  }

  getAvatarUrl(user: AdminUser): string {
    return user.avatarUrl || 'assets/cat.png';
  }
}
