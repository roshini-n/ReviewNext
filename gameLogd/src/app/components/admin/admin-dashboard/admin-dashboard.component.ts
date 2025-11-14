import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AdminAuthService } from '../../../services/admin-auth.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private adminAuthService = inject(AdminAuthService);
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUserSig;
  isAdmin = false;

  ngOnInit(): void {
    this.adminAuthService.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  adminFeatures = [
    {
      title: 'Analytics & Insights',
      description: 'View comprehensive statistics, user metrics, and platform performance data',
      icon: 'analytics',
      route: '/admin/analytics',
      color: 'primary'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, monitor activity, and handle user-related operations',
      icon: 'people',
      route: '/admin/users',
      color: 'accent'
    },
    {
      title: 'Content Management',
      description: 'Manage products, moderate content, and oversee all platform items',
      icon: 'inventory',
      route: '/admin/products',
      color: 'warn'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings, export data, and access maintenance tools',
      icon: 'settings',
      route: '/admin/settings',
      color: 'primary'
    }
  ];
}
