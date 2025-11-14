import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `<div>Admin Reviews Component Works!</div>`,
  styles: []
})
export class AdminReviewsComponent implements OnInit {
  isLoading = true;

  ngOnInit(): void {
    console.log('AdminReviewsComponent initialized');
    this.isLoading = false;
  }

  loadReviews(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  exportReviews(): void {
    console.log('Export reviews clicked');
  }
}
