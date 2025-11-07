import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { AdminService, ProductStats } from '../../../services/admin.service';
import { AdminConfirmDialogComponent } from '../admin-confirm-dialog/admin-confirm-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatSortModule
  ],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent implements OnInit {
  adminService = inject(AdminService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  private router = inject(Router);

  productStats = signal<ProductStats>({
    games: 0,
    books: 0,
    movies: 0,
    webSeries: 0,
    electronicGadgets: 0,
    beautyProducts: 0
  });

  selectedCategory = 'games';
  products = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  loading = signal(false);
  searchTerm = '';

  categories = [
    { value: 'games', label: 'Games', icon: 'sports_esports' },
    { value: 'books', label: 'Books', icon: 'book' },
    { value: 'movies', label: 'Movies', icon: 'movie' },
    { value: 'web-series', label: 'Web Series', icon: 'tv' },
    { value: 'electronic-gadgets', label: 'Electronics', icon: 'devices' },
    { value: 'beauty-products', label: 'Beauty Products', icon: 'face' }
  ];

  displayedColumns: string[] = [
    'image',
    'title', 
    'details', 
    'rating', 
    'reviews',
    'actions'
  ];

  ngOnInit() {
    this.loadProductStats();
    this.loadProductsByCategory();
  }

  private async loadProductStats() {
    try {
      const stats = await this.adminService.getProductStats();
      this.productStats.set(stats);
    } catch (error) {
      console.error('Error loading product stats:', error);
    }
  }

  onCategoryChange() {
    this.loadProductsByCategory();
  }

  private loadProductsByCategory() {
    this.loading.set(true);
    this.adminService.getProductsByCategory(this.selectedCategory).subscribe({
      next: (products) => {
        this.products.set(products);
        this.applySearch();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch() {
    this.applySearch();
  }

  private applySearch() {
    if (!this.searchTerm) {
      this.filteredProducts.set(this.products());
      return;
    }

    const term = this.searchTerm.toLowerCase();
    const filtered = this.products().filter(product => {
      const title = (product.title || product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const author = (product.author || product.developer || product.brand || '').toLowerCase();
      
      return title.includes(term) || description.includes(term) || author.includes(term);
    });
    
    this.filteredProducts.set(filtered);
  }

  async deleteProduct(product: any) {
    const productName = product.title || product.name;
    const dialogRef = this.dialog.open(AdminConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${productName}"? This will also delete all related reviews and ratings. This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.adminService.deleteProduct(this.selectedCategory, product.id);
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
          this.loadProductsByCategory();
          this.loadProductStats();
        } catch (error) {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
        }
      }
    });
  }

  getCategoryIcon(categoryValue: string): string {
    const category = this.categories.find(c => c.value === categoryValue);
    return category?.icon || 'category';
  }

  getCategoryLabel(categoryValue: string): string {
    const category = this.categories.find(c => c.value === categoryValue);
    return category?.label || categoryValue;
  }

  getProductTitle(product: any): string {
    return product.title || product.name || 'Untitled';
  }

  getProductDetails(product: any): string {
    switch (this.selectedCategory) {
      case 'games':
        return `${product.developer || 'Unknown Developer'} • ${product.publisher || 'Unknown Publisher'}`;
      case 'books':
        return `${product.author || 'Unknown Author'} • ${product.publisher || 'Unknown Publisher'}`;
      case 'movies':
        return `${product.director || 'Unknown Director'} • ${product.releaseDate || 'Unknown Date'}`;
      case 'web-series':
        return `${product.creator || 'Unknown Creator'} • ${product.seasons || 0} seasons`;
      case 'electronic-gadgets':
        return `${product.brand || 'Unknown Brand'} • ${product.category || 'Unknown Category'}`;
      case 'beauty-products':
        return `${product.brand || 'Unknown Brand'} • ${product.category || 'Unknown Category'}`;
      default:
        return product.description || 'No details available';
    }
  }

  getProductRating(product: any): string {
    const rating = product.rating || 0;
    const numRatings = product.numRatings || 0;
    return numRatings > 0 ? `${rating.toFixed(1)}/5 (${numRatings})` : 'No ratings';
  }

  getProductImage(product: any): string {
    return product.imageUrl || 'assets/cat.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/cat.png';
    }
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString || 'Unknown';
    }
  }

  getStatsForCategory(categoryValue: string): number {
    const stats = this.productStats();
    switch (categoryValue) {
      case 'games': return stats.games;
      case 'books': return stats.books;
      case 'movies': return stats.movies;
      case 'web-series': return stats.webSeries;
      case 'electronic-gadgets': return stats.electronicGadgets;
      case 'beauty-products': return stats.beautyProducts;
      default: return 0;
    }
  }

  // Navigate to the actual product details page for review moderation in context
  viewProduct(product: any) {
    const id = product?.id;
    if (!id) return;
    switch (this.selectedCategory) {
      case 'games':
        this.router.navigate(['/games', id]);
        break;
      case 'books':
        this.router.navigate(['/books', id]);
        break;
      case 'movies':
        this.router.navigate(['/movies', id]);
        break;
      case 'web-series':
        this.router.navigate(['/web-series', id]);
        break;
      case 'electronic-gadgets':
        this.router.navigate(['/electronic-gadgets', id]);
        break;
      case 'beauty-products':
        this.router.navigate(['/beauty-products', id]);
        break;
      default:
        break;
    }
  }
}
