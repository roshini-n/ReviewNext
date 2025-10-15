import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CarouselModule } from 'primeng/carousel';
import { UnifiedReviewService, UnifiedReview } from '../../../services/unified-review.service';
import { CategoryManagementService, CategoryDefinition } from '../../../services/category-management.service';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { GameFirebaseService } from '../../../services/gameFirebase.service';
import { MovieFirebaseService } from '../../../services/movieFirebase.service';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { ElectronicGadgetFirebaseService } from '../../../services/electronicGadgetFirebase.service';
import { AppFirebaseService } from '../../../services/appFirebase.service';
import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';
import { DocumentaryFirebaseService } from '../../../services/documentaryFirebase.service';
import { BeautyProductFirebaseService } from '../../../services/beautyProductFirebase.service';
import { HomeApplianceFirebaseService } from '../../../services/homeApplianceFirebase.service';

@Component({
  selector: 'app-universal-category',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    CarouselModule
  ],
  template: `
    <div class="category-container">
      @if (loading()) {
        <div class="loading-spinner">
          <mat-spinner></mat-spinner>
          <p>Loading {{ currentCategory()?.displayName || 'content' }}...</p>
        </div>
      } @else {
        <!-- Category Header -->
        <div class="category-header">
          <div class="header-content">
            <mat-icon class="category-icon">{{ currentCategory()?.icon }}</mat-icon>
            <div class="header-text">
              <h1>{{ currentCategory()?.displayName }}</h1>
              <p>{{ currentCategory()?.description }}</p>
            </div>
          </div>
          
          @if (authService.currentUserSig()) {
            <button mat-raised-button color="primary" (click)="openAddItemDialog()">
              <mat-icon>add</mat-icon>
              Add {{ currentCategory()?.displayName }}
            </button>
          }
        </div>

        <!-- Category Stats -->
        <div class="category-stats">
          <mat-chip-set>
            <mat-chip>{{ categoryItems().length }} Items</mat-chip>
            <mat-chip>{{ totalReviews() }} Reviews</mat-chip>
            <mat-chip>{{ averageRating().toFixed(1) }}★ Average</mat-chip>
          </mat-chip-set>
        </div>

        <!-- Items Grid -->
        <div class="items-grid">
          @for (item of categoryItems(); track item.id) {
            <mat-card class="item-card" (click)="navigateToItem(item)">
              <mat-card-header>
                <mat-card-title>{{ item.title }}</mat-card-title>
                <mat-card-subtitle>{{ item.subtitle || item.author || item.developer }}</mat-card-subtitle>
              </mat-card-header>
              
              @if (item.imageUrl) {
                <img mat-card-image [src]="item.imageUrl" [alt]="item.title">
              }
              
              <mat-card-content>
                <p>{{ item.description | slice:0:100 }}{{ item.description?.length > 100 ? '...' : '' }}</p>
                
                <!-- Display different metadata based on category -->
                <div class="item-metadata">
                  @if (item.author) {
                    <small><strong>Author:</strong> {{ item.author }}</small>
                  }
                  @if (item.developer) {
                    <small><strong>Developer:</strong> {{ item.developer }}</small>
                  }
                  @if (item.director) {
                    <small><strong>Director:</strong> {{ item.director }}</small>
                  }
                  @if (item.brand) {
                    <small><strong>Brand:</strong> {{ item.brand }}</small>
                  }
                  @if (item.genre) {
                    <small><strong>Genre:</strong> {{ item.genre }}</small>
                  }
                  @if (item.releaseDate) {
                    <small><strong>Released:</strong> {{ item.releaseDate | date:'mediumDate' }}</small>
                  }
                </div>
                
                <div class="item-stats">
                  <span class="rating">
                    <mat-icon>star</mat-icon>
                    {{ getItemRating(item.id) | number:'1.1-1' }}
                  </span>
                  <span class="review-count">
                    {{ getItemReviewCount(item.id) }} reviews
                  </span>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-button color="primary">View Details</button>
                <button mat-button (click)="addToList(item, $event)">Add to List</button>
                
                @if (isAdmin() && authService.currentUserSig()) {
                  <button mat-icon-button color="warn" (click)="deleteItem(item, $event)">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>

        @if (categoryItems().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">{{ currentCategory()?.icon }}</mat-icon>
            <h2>No {{ currentCategory()?.displayName }} Found</h2>
            <p>Be the first to add {{ currentCategory()?.displayName?.toLowerCase() || 'items' }} to this category!</p>
            
            @if (authService.currentUserSig()) {
              <button mat-raised-button color="primary" (click)="openAddItemDialog()">
                <mat-icon>add</mat-icon>
                Add First {{ currentCategory()?.displayName || 'Item' }}
              </button>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .category-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 20px;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .category-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .header-text h1 {
      margin: 0;
      font-size: 2.5em;
      font-weight: 300;
    }

    .header-text p {
      margin: 5px 0 0 0;
      opacity: 0.9;
    }

    .category-stats {
      margin-bottom: 30px;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .item-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: fit-content;
    }

    .item-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .item-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ff9800;
    }

    .rating mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .item-metadata {
      margin-bottom: 10px;
    }

    .item-metadata small {
      display: block;
      margin-bottom: 4px;
      color: #666;
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

    .empty-state h2 {
      margin: 20px 0 10px 0;
      color: #333;
    }

    @media (max-width: 768px) {
      .category-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .items-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UniversalCategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reviewService = inject(UnifiedReviewService);
  private categoryService = inject(CategoryManagementService);
  public authService = inject(AuthService);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  // Firebase services
  private gameService = inject(GameFirebaseService);
  private movieService = inject(MovieFirebaseService);
  private bookService = inject(BookFirebaseService);
  private electronicGadgetService = inject(ElectronicGadgetFirebaseService);
  private appService = inject(AppFirebaseService);
  private webSeriesService = inject(WebSeriesFirebaseService);
  private documentaryService = inject(DocumentaryFirebaseService);
  private beautyProductService = inject(BeautyProductFirebaseService);
  private homeApplianceService = inject(HomeApplianceFirebaseService);

  // Signals
  loading = signal(true);
  currentCategory = signal<CategoryDefinition | null>(null);
  categoryItems = signal<any[]>([]);
  reviews = signal<UnifiedReview[]>([]);
  isAdmin = signal(false);

  // Computed values
  totalReviews = computed(() => this.reviews().length);
  averageRating = computed(() => {
    const allReviews = this.reviews();
    if (allReviews.length === 0) return 0;
    return allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
  });

  ngOnInit() {
    this.loadCategoryData();
    this.checkAdminStatus();
  }

  private loadCategoryData() {
    this.route.url.subscribe(urlSegments => {
      if (urlSegments.length > 0) {
        const categoryRoute = urlSegments[0].path;
        this.loadCategory(categoryRoute);
      }
    });
  }

  private loadCategory(categoryRoute: string) {
    this.loading.set(true);
    
    // First try to get category from Firestore
    this.categoryService.getActiveCategories().subscribe({
      next: (categories) => {
        const category = categories.find(cat => cat.route === categoryRoute);
        if (category) {
          this.currentCategory.set(category);
          this.loadCategoryItems(category.name);
          this.loadCategoryReviews(category.name);
        } else {
          // Fallback to default category definitions if not found in Firestore
          const defaultCategory = this.getDefaultCategoryDefinition(categoryRoute);
          if (defaultCategory) {
            this.currentCategory.set(defaultCategory);
            this.loadCategoryItems(defaultCategory.name);
            this.loadCategoryReviews(defaultCategory.name);
          } else {
            this.snackBar.open('Category not found', 'Close', { duration: 3000 });
            this.loading.set(false);
          }
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Fallback to default category definitions
        const defaultCategory = this.getDefaultCategoryDefinition(categoryRoute);
        if (defaultCategory) {
          this.currentCategory.set(defaultCategory);
          this.loadCategoryItems(defaultCategory.name);
          this.loadCategoryReviews(defaultCategory.name);
        } else {
          this.snackBar.open('Error loading category', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      }
    });
  }

  private getDefaultCategoryDefinition(route: string): CategoryDefinition | null {
    const defaultCategories: { [key: string]: CategoryDefinition } = {
      'games': {
        name: 'games',
        displayName: 'Games',
        icon: 'sports_esports',
        route: 'games',
        description: 'Video games and gaming content',
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        sortOrder: 1
      },
      'books': {
        name: 'books',
        displayName: 'Books',
        icon: 'menu_book',
        route: 'books',
        description: 'Books and literature',
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        sortOrder: 2
      },
      'movies': {
        name: 'movies',
        displayName: 'Movies',
        icon: 'movie',
        route: 'movies',
        description: 'Movies and cinema',
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        sortOrder: 3
      },
      'electronic-gadgets': {
        name: 'electronic-gadgets',
        displayName: 'Electronic Gadgets',
        icon: 'devices',
        route: 'electronic-gadgets',
        description: 'Electronic devices and gadgets',
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        sortOrder: 4
      },
      'apps': {
        name: 'apps',
        displayName: 'Apps',
        icon: 'apps',
        route: 'apps',
        description: 'Mobile and web applications',
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        sortOrder: 5
      },
      'web-series': {
        name: 'web-series',
        displayName: 'Web Series',
        icon: 'live_tv',
        route: 'web-series',
        description: 'Web series and streaming content',
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        sortOrder: 6
      },
      'beauty-products': {
        name: 'beauty-products',
        displayName: 'Beauty Products',
        icon: 'spa',
        route: 'beauty-products',
        description: 'Beauty and cosmetic products',
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        sortOrder: 7
      },
      'documentaries': {
        name: 'documentaries',
        displayName: 'Documentaries',
        icon: 'video_library',
        route: 'documentaries',
        description: 'Documentary films and content',
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        sortOrder: 8
      },
      'home-appliances': {
        name: 'home-appliances',
        displayName: 'Home Appliances',
        icon: 'home',
        route: 'home-appliances',
        description: 'Home appliances and household items',
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        sortOrder: 9
      }
    };

    return defaultCategories[route] || null;
  }

  private loadCategoryItems(categoryName: string) {
    // Load items from existing services based on category type
    switch (categoryName) {
      case 'games':
        this.loadGames();
        break;
      case 'books':
        this.loadBooks();
        break;
      case 'movies':
        this.loadMovies();
        break;
      case 'electronic-gadgets':
        this.loadElectronicGadgets();
        break;
      case 'apps':
        this.loadApps();
        break;
      case 'web-series':
        this.loadWebSeries();
        break;
      case 'documentaries':
        this.loadDocumentaries();
        break;
      case 'beauty-products':
        this.loadBeautyProducts();
        break;
      case 'home-appliances':
        this.loadHomeAppliances();
        break;
      default:
        // For unknown categories, show empty state
        this.categoryItems.set([]);
        break;
    }
  }

  private loadGames() {
    this.gameService.getGames().subscribe({
      next: (games) => {
        this.categoryItems.set(games);
      },
      error: (error) => {
        console.error('Error loading games:', error);
        this.categoryItems.set([]);
      }
    });
  }

  private loadBooks() {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.categoryItems.set(books);
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.categoryItems.set([]);
      }
    });
  }

  private loadMovies() {
    this.movieService.getMovies().subscribe({
      next: (movies) => {
        this.categoryItems.set(movies);
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.categoryItems.set([]);
      }
    });
  }

  private loadElectronicGadgets() {
    this.electronicGadgetService.getElectronicGadgets().subscribe({
      next: (gadgets) => {
        this.categoryItems.set(gadgets);
      },
      error: (error) => {
        console.error('Error loading electronic gadgets:', error);
        this.categoryItems.set([]);
      }
    });
  }

  private loadApps() {
    this.appService.getApps().subscribe({
      next: (apps) => {
        this.categoryItems.set(apps);
      },
      error: (error) => {
        console.error('Error loading apps:', error);
        this.categoryItems.set([]);
      }
    });
  }

  private loadWebSeries() {
    this.webSeriesService.getWebSeries().subscribe({
      next: (webSeries) => {
        this.categoryItems.set(webSeries);
      },
      error: (error) => {
        console.error('Error loading web series:', error);
        this.categoryItems.set([]);
      }
    });
  }

  private loadDocumentaries() {
    this.documentaryService.getDocumentaries().subscribe({
      next: (documentaries) => {
        this.categoryItems.set(documentaries);
      },
      error: (error) => {
        console.error('Error loading documentaries:', error);
        this.categoryItems.set([]);
      }
    });
  }

  private loadBeautyProducts() {
    this.beautyProductService.getBeautyProducts().subscribe({
      next: (products) => {
        this.categoryItems.set(products);
      },
      error: (error) => {
        console.error('Error loading beauty products:', error);
        this.categoryItems.set([]);
      }
    });
  }

  private loadHomeAppliances() {
    this.homeApplianceService.getHomeAppliances().subscribe({
      next: (appliances) => {
        this.categoryItems.set(appliances);
      },
      error: (error) => {
        console.error('Error loading home appliances:', error);
        this.categoryItems.set([]);
      }
    });
  }

  private loadCategoryReviews(categoryName: string) {
    this.reviewService.getReviewsForCategory(categoryName).subscribe(reviews => {
      this.reviews.set(reviews);
      this.loading.set(false);
    });
  }

  private checkAdminStatus() {
    this.adminService.isAdmin().subscribe(isAdmin => {
      this.isAdmin.set(isAdmin);
    });
  }

  getItemRating(itemId: string): number {
    const itemReviews = this.reviews().filter(r => r.itemId === itemId);
    if (itemReviews.length === 0) return 0;
    return itemReviews.reduce((sum, review) => sum + review.rating, 0) / itemReviews.length;
  }

  getItemReviewCount(itemId: string): number {
    return this.reviews().filter(r => r.itemId === itemId).length;
  }

  navigateToItem(item: any) {
    // Navigate to item details page using the unified details component
    const categoryRoute = this.currentCategory()?.route;
    if (categoryRoute && item.id) {
      this.router.navigate([categoryRoute, item.id]);
    }
  }

  openAddItemDialog() {
    // Navigate to add item page based on current category
    const categoryRoute = this.currentCategory()?.route;
    const addRoutes: { [key: string]: string } = {
      'games': '/add_game',
      'books': '/add_book', 
      'movies': '/add_movie',
      'electronic-gadgets': '/add_electronic_gadget',
      'apps': '/add_app',
      'web-series': '/add_web_series',
      'documentaries': '/add_documentary',
      'beauty-products': '/add_beauty_product',
      'home-appliances': '/add_home_appliance'
    };
    
    const addRoute = categoryRoute ? addRoutes[categoryRoute] : null;
    if (addRoute) {
      this.router.navigate([addRoute]);
    } else {
      this.snackBar.open('Add functionality not available for this category', 'Close', { duration: 3000 });
    }
  }

  addToList(item: any, event: Event) {
    event.stopPropagation();
    this.snackBar.open(`${item.title} added to your list!`, 'Close', { duration: 3000 });
  }

  deleteItem(item: any, event: Event) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      this.snackBar.open(`${item.title} deleted successfully!`, 'Close', { duration: 3000 });
      // Remove from items array
      const currentItems = this.categoryItems();
      this.categoryItems.set(currentItems.filter(i => i.id !== item.id));
    }
  }
}