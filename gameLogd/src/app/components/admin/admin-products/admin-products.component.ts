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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { GameFirebaseService } from '../../../services/gameFirebase.service';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { MovieFirebaseService } from '../../../services/movieFirebase.service';
import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';
import { ElectronicGadgetFirebaseService } from '../../../services/electronicGadgetFirebase.service';
import { BeautyProductFirebaseService } from '../../../services/beautyProductFirebase.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface AdminProduct {
  id: string;
  title: string;
  category: string;
  rating: number;
  imageUrl?: string;
  description?: string;
  dateAdded?: any;
}

@Component({
  selector: 'app-admin-products',
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
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private gameService = inject(GameFirebaseService);
  private bookService = inject(BookFirebaseService);
  private movieService = inject(MovieFirebaseService);
  private webSeriesService = inject(WebSeriesFirebaseService);
  private electronicGadgetService = inject(ElectronicGadgetFirebaseService);
  private beautyProductService = inject(BeautyProductFirebaseService);
  private snackBar = inject(MatSnackBar);
  
  displayedColumns: string[] = ['image', 'title', 'category', 'rating', 'actions'];
  dataSource = new MatTableDataSource<AdminProduct>([]);
  isLoading = true;
  searchQuery = '';
  selectedCategory = 'all';
  
  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'games', label: 'Games' },
    { value: 'books', label: 'Books' },
    { value: 'movies', label: 'Movies' },
    { value: 'webSeries', label: 'Web Series' },
    { value: 'electronicGadgets', label: 'Electronic Gadgets' },
    { value: 'beautyProducts', label: 'Beauty Products' }
  ];

  categoryStats = {
    games: 0,
    books: 0,
    movies: 0,
    webSeries: 0,
    electronicGadgets: 0,
    beautyProducts: 0
  };
  
  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter function
    this.dataSource.filterPredicate = (data: AdminProduct, filter: string) => {
      const filterObject = JSON.parse(filter);
      
      // Text search
      const searchString = filterObject.search.toLowerCase();
      const textMatch = !searchString || 
        data.title.toLowerCase().includes(searchString) ||
        (data.description || '').toLowerCase().includes(searchString);
      
      // Category filter
      const categoryMatch = filterObject.category === 'all' || data.category === filterObject.category;
      
      return textMatch && categoryMatch;
    };
  }

  loadProducts(): void {
    this.isLoading = true;
    this.dataSource.data = []; // Clear existing data
    
    const allProducts: AdminProduct[] = [];
    
    // Load games
    this.gameService.getGames().subscribe({
      next: (games: any[]) => {
        const gameProducts: AdminProduct[] = games.map((game: any) => ({
          id: game.id || '',
          title: game.title,
          category: 'Games',
          rating: game.averageRating || 0,
          imageUrl: game.imageUrl || 'assets/default-product.png',
          description: game.description
        }));
        allProducts.push(...gameProducts);
        this.categoryStats.games = gameProducts.length;
        this.dataSource.data = [...allProducts];
        this.applyFilter();
      },
      error: (error) => console.error('Error loading games:', error)
    });

    // Load books
    this.bookService.getBooks().subscribe({
      next: (books: any[]) => {
        const bookProducts: AdminProduct[] = books.map((book: any) => ({
          id: book.id || '',
          title: book.title,
          category: 'Books',
          rating: book.averageRating || 0,
          imageUrl: book.imageUrl || 'assets/default-product.png',
          description: book.description
        }));
        allProducts.push(...bookProducts);
        this.categoryStats.books = bookProducts.length;
        this.dataSource.data = [...allProducts];
        this.applyFilter();
      },
      error: (error) => console.error('Error loading books:', error)
    });

    // Load movies
    this.movieService.getMovies().subscribe({
      next: (movies: any[]) => {
        const movieProducts: AdminProduct[] = movies.map((movie: any) => ({
          id: movie.id || '',
          title: movie.title,
          category: 'Movies',
          rating: movie.averageRating || 0,
          imageUrl: movie.imageUrl || 'assets/default-product.png',
          description: movie.description
        }));
        allProducts.push(...movieProducts);
        this.categoryStats.movies = movieProducts.length;
        this.dataSource.data = [...allProducts];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.isLoading = false;
      }
    });
  }

  onImageError(event: any): void {
    event.target.src = 'assets/default-product.png';
  }

  applyFilter(): void {
    const filterValue = {
      search: this.searchQuery.trim(),
      category: this.selectedCategory
    };
    
    this.dataSource.filter = JSON.stringify(filterValue);
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.applyFilter();
  }

  viewProduct(product: AdminProduct): void {
    // Navigate to product details page based on category
    const routes = {
      games: '/games',
      books: '/books',
      movies: '/movies',
      webSeries: '/web-series',
      electronicGadgets: '/electronic-gadgets',
      beautyProducts: '/beauty-products'
    };
    
    const route = routes[product.category as keyof typeof routes];
    if (route) {
      window.open(`${route}/${product.id}`, '_blank');
    }
  }

  editProduct(product: AdminProduct): void {
    console.log('Edit product:', product);
    this.showMessage(`Edit functionality for ${product.title} - Feature coming soon`);
  }

  deleteProduct(product: AdminProduct): void {
    const confirmMessage = `Are you sure you want to delete "${product.title}"?`;
    if (confirm(confirmMessage)) {
      // In a real implementation, use the appropriate service to delete
      console.log('Delete product:', product);
      this.showMessage(`${product.title} deletion initiated - Feature requires additional implementation`);
    }
  }

  bulkDelete(): void {
    // In a real implementation, you would handle bulk operations
    this.showMessage('Bulk delete functionality - Feature coming soon');
  }

  exportProducts(): void {
    const csvData = this.convertToCSV(this.dataSource.data);
    this.downloadCSV(csvData, 'products-export.csv');
    this.showMessage('Products exported successfully');
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  getCategoryIcon(category: string): string {
    const icons = {
      games: 'sports_esports',
      books: 'menu_book',
      movies: 'movie',
      webSeries: 'live_tv',
      electronicGadgets: 'devices',
      beautyProducts: 'spa'
    };
    return icons[category as keyof typeof icons] || 'category';
  }

  getCategoryColor(category: string): string {
    const colors = {
      games: 'primary',
      books: 'accent',
      movies: 'warn',
      webSeries: 'primary',
      electronicGadgets: 'accent',
      beautyProducts: 'warn'
    };
    return colors[category as keyof typeof colors] || '';
  }

  private convertToCSV(products: AdminProduct[]): string {
    const headers = ['Title', 'Category', 'Rating', 'Description'];
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        `"${product.title}"`,
        `"${product.category}"`,
        product.rating.toString(),
        `"${(product.description || '').replace(/"/g, '""')}"`
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
