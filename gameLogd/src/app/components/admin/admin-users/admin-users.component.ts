import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  displayedColumns: string[] = ['avatar', 'username', 'email', 'bio', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  isLoading = true;
  searchQuery = '';
  
  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter function
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchString = filter.toLowerCase();
      return data.username.toLowerCase().includes(searchString) ||
             data.email.toLowerCase().includes(searchString) ||
             (data.bio || '').toLowerCase().includes(searchString);
    };
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showMessage('Error loading users');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchQuery.trim();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(): void {
    this.searchQuery = '';
    this.applyFilter();
  }

  viewUserDetails(user: User): void {
    // In a real implementation, you might open a detailed view dialog
    // or navigate to a user details page
    console.log('View user details:', user);
    this.showMessage(`Viewing details for ${user.username}`);
  }

  editUser(user: User): void {
    // In a real implementation, you would open an edit dialog
    console.log('Edit user:', user);
    this.showMessage(`Edit functionality for ${user.username} - Feature coming soon`);
  }

  suspendUser(user: User): void {
    // In a real implementation, you would update the user's status
    if (confirm(`Are you sure you want to suspend ${user.username}?`)) {
      console.log('Suspend user:', user);
      this.showMessage(`${user.username} has been suspended`);
    }
  }

  deleteUser(user: User): void {
    // In a real implementation, you would delete the user with proper confirmation
    const confirmMessage = `Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      // Note: In a real app, you should implement proper user deletion
      console.log('Delete user:', user);
      this.showMessage(`${user.username} deletion initiated - Feature requires additional implementation`);
    }
  }

  onImageError(event: any): void {
    if (event.target) {
      event.target.src = 'assets/default-avatar.png';
    }
  }

  exportUsers(): void {
    const csvData = this.convertToCSV(this.dataSource.data);
    this.downloadCSV(csvData, 'users-export.csv');
    this.showMessage('Users exported successfully');
  }

  private convertToCSV(users: User[]): string {
    const headers = ['Username', 'Email', 'Bio'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        `"${user.username}"`,
        `"${user.email}"`,
        `"${(user.bio || '').replace(/"/g, '""')}"`
      ].join(','))
    ];
    return csvContent.join('\n');
  }

  private downloadCSV(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
