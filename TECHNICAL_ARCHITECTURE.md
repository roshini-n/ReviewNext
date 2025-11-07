# ReviewNext - Technical Architecture Documentation

## 🏗️ Detailed System Architecture

### Overview
ReviewNext is built using a modern, scalable architecture that supports web, PWA, and native mobile applications through a single Angular codebase.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ReviewNext Platform Architecture                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Client Layer                                                              │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │   Web Browser   │   PWA Mobile    │  Android App    │    iOS App      │  │
│  │   (Desktop)     │   (Mobile Web)  │   (Capacitor)   │   (Capacitor)   │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application Layer (Angular 19)                                            │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │   Components    │    Services     │     Guards      │     Models      │  │
│  │   (UI Logic)    │ (Business Logic)│  (Security)     │  (Data Types)   │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Service Integration Layer                                                  │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │   Firebase      │   External APIs │   Capacitor     │   PWA Services  │  │
│  │   Services      │   (TMDB, OMDB)  │   Plugins       │  (ServiceWorker)│  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Backend Infrastructure (Firebase)                                         │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐  │
│  │   Firestore     │  Authentication │  Cloud Storage  │   Hosting       │  │
│  │   (Database)    │    (Auth)       │   (Files)       │   (Web App)     │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🗂️ Data Flow Architecture

### Component Data Flow
```
User Interaction
      ↓
   Component
      ↓
   Service (Business Logic)
      ↓
   Firebase Service
      ↓
   Firestore Database
      ↓
   Observable/Promise Response
      ↓
   Component Updates
      ↓
   UI Re-render
```

### Authentication Flow
```
User Login Request
      ↓
   AuthService
      ↓
   Firebase Auth
      ↓
   JWT Token Generation
      ↓
   User State Update
      ↓
   Route Guard Validation
      ↓
   Component Access Granted
```

## 🧩 Component Architecture

### Core Component Hierarchy
```
AppComponent (Root)
├── NavbarComponent
│   ├── User Authentication Status
│   ├── Navigation Menu
│   └── Search Bar
├── RouterOutlet
│   ├── HomeComponent
│   ├── Category Components
│   │   ├── GameComponent
│   │   ├── BookComponent
│   │   ├── MovieComponent
│   │   ├── WebSeriesComponent
│   │   ├── ElectronicGadgetComponent
│   │   └── BeautyProductComponent
│   ├── Detail Components
│   │   ├── GameDetailsComponent
│   │   ├── BookDetailsComponent
│   │   └── [Other Detail Components]
│   ├── User Management
│   │   ├── LoginComponent
│   │   ├── RegisterComponent
│   │   ├── ProfileComponent
│   │   └── UserDashboardComponent
│   └── Feature Components
│       ├── SearchComponent
│       ├── CreateListComponent
│       ├── MyListsComponent
│       └── Review Components
└── FooterComponent
```

### Service Architecture
```
Core Services
├── AuthService (Authentication Management)
├── UserService (User Profile Management)
├── PwaService (Progressive Web App Features)
├── MobileService (Mobile-specific Features)
└── UserActivityService (Activity Monitoring)

Category Services (Firebase Integration)
├── GameFirebaseService
├── BookFirebaseService
├── MovieFirebaseService
├── WebSeriesFirebaseService
├── ElectronicGadgetFirebaseService
└── BeautyProductFirebaseService

Review & Rating Services
├── ReviewService (Review Management)
├── RatingService (Rating System)
├── ReviewEventService (Review Events)
└── Category-specific Review Services

External API Services
├── TmdbService (Movie Database API)
├── OmdbService (Open Movie Database API)
├── BookCoverService (Book Cover APIs)
└── BeautyProductsApiService (Beauty Product APIs)

Utility Services
├── RoutePersistenceService (Route Management)
└── Various Log Services (Activity Logging)
```

## 🔄 State Management

### Observable Pattern with RxJS
```typescript
// Example: Game Service Observable Pattern
@Injectable({ providedIn: 'root' })
export class GameFirebaseService {
  private gamesSubject = new BehaviorSubject<Game[]>([]);
  public games$ = this.gamesSubject.asObservable();
  
  // Update games and notify all subscribers
  updateGames(games: Game[]) {
    this.gamesSubject.next(games);
  }
}
```

### User State Management
```typescript
// AuthService manages global user state
currentUserSig = signal<UserInterface | null | undefined>(undefined);

// Components subscribe to user state changes
this.authService.user$.subscribe(user => {
  // Handle user state changes
});
```

## 🛡️ Security Architecture

### Firebase Security Rules Structure
```javascript
// Multi-layered security approach
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User data protection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Product collections (open read, controlled write)
    match /{collection}/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Review ownership enforcement
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### Client-side Security
- **Route Guards**: Protect authenticated routes
- **Input Validation**: Sanitize user inputs
- **Type Safety**: TypeScript for compile-time safety
- **HTTPS Enforcement**: Secure data transmission

## 📱 Mobile Architecture (Capacitor)

### Capacitor Integration
```typescript
// Capacitor configuration
const config: CapacitorConfig = {
  appId: 'com.naguru.reviewnext',
  appName: 'ReviewNext',
  webDir: 'dist/game-logd/browser',
  plugins: {
    SplashScreen: { ... },
    StatusBar: { ... },
    Keyboard: { ... }
  }
};
```

### Native Features Integration
```typescript
// Example: Haptic Feedback
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Trigger haptic feedback on user interactions
const hapticsImpactMedium = async () => {
  await Haptics.impact({ style: ImpactStyle.Medium });
};
```

### Platform-specific Handling
```typescript
// Mobile service for platform detection
@Injectable()
export class MobileService {
  isMobile(): boolean {
    return Capacitor.isNativePlatform();
  }
  
  addMobileClass(): void {
    if (this.isMobile()) {
      document.body.classList.add('mobile-platform');
    }
  }
}
```

## 🚀 Progressive Web App (PWA) Architecture

### Service Worker Strategy
```javascript
// Service Worker (sw.js)
const CACHE_NAME = 'reviewnext-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Cache-first strategy for static assets
// Network-first strategy for API calls
```

### PWA Features Implementation
```typescript
@Injectable()
export class PwaService {
  // Install prompt handling
  private deferredPrompt: any = null;
  
  // Background sync
  backgroundSync(tag: string): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register(tag);
      });
    }
  }
  
  // Push notifications
  requestNotificationPermission(): Promise<NotificationPermission> {
    return Notification.requestPermission();
  }
}
```

## 📊 Performance Optimization

### Bundle Optimization
```typescript
// Lazy loading implementation
const routes: Routes = [
  {
    path: 'add_game',
    loadComponent: () => import('./components/add-game/add-game.component')
      .then(m => m.AddGameComponent),
    canActivate: [authGuard]
  }
];
```

### Database Query Optimization
```typescript
// Efficient Firestore queries
getGamesByRating(limit: number = 10): Observable<Game[]> {
  const q = query(
    this.gamesCollection,
    orderBy('rating', 'desc'),
    limit(limit)
  );
  return collectionData(q, { idField: 'id' });
}
```

### Image Optimization
```html
<!-- Responsive images with lazy loading -->
<img [src]="game.imageUrl" 
     [alt]="game.title"
     loading="lazy"
     class="responsive-image">
```

## 🔧 Development Patterns

### Standalone Components (Angular 19)
```typescript
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './game.component.html'
})
export class GameComponent { }
```

### Dependency Injection
```typescript
// Modern Angular injection pattern
export class GameComponent {
  private gameService = inject(GameFirebaseService);
  private authService = inject(AuthService);
  private router = inject(Router);
}
```

### Error Handling Pattern
```typescript
// Consistent error handling across services
catchError(error => {
  console.error('Game service error:', error);
  return throwError(() => new Error('Failed to load games'));
})
```

## 🌐 API Integration Architecture

### External API Services
```typescript
@Injectable()
export class TmdbService {
  private readonly API_KEY = environment.tmdbApiKey;
  private readonly BASE_URL = 'https://api.themoviedb.org/3';
  
  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/search/movie`, {
      params: { api_key: this.API_KEY, query }
    });
  }
}
```

### Data Transformation
```typescript
// Mapping external API data to internal models
private mapToMovieModel(apiData: any): Movie {
  return {
    id: apiData.id.toString(),
    title: apiData.title,
    description: apiData.overview,
    releaseDate: apiData.release_date,
    imageUrl: `https://image.tmdb.org/t/p/w500${apiData.poster_path}`,
    rating: 0,
    totalRatingScore: 0,
    numRatings: 0
  };
}
```

This technical architecture provides a comprehensive overview of how ReviewNext is structured, from the component level down to the database schema. The architecture is designed for scalability, maintainability, and cross-platform compatibility.
