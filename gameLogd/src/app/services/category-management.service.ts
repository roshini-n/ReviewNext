import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface CategoryDefinition {
  id?: string;
  name: string;
  displayName: string;
  icon: string;
  route: string;
  description: string;
  isActive: boolean;
  createdAt: any;
  createdBy: string;
  sortOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryManagementService {
  private firestore = inject(Firestore);
  private categoriesCollection = collection(this.firestore, 'categories');

  // Get all categories
  getAllCategories(): Observable<CategoryDefinition[]> {
    const categoriesQuery = query(
      this.categoriesCollection,
      orderBy('sortOrder', 'asc')
    );

    return from(getDocs(categoriesQuery)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CategoryDefinition))
      )
    );
  }

  // Get active categories only
  getActiveCategories(): Observable<CategoryDefinition[]> {
    return this.getAllCategories().pipe(
      map(categories => categories.filter(cat => cat.isActive))
    );
  }

  // Add new category (admin only)
  addCategory(category: Omit<CategoryDefinition, 'id' | 'createdAt'>): Observable<string> {
    const newCategory = {
      ...category,
      createdAt: new Date()
    };

    return from(addDoc(this.categoriesCollection, newCategory)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Update category
  updateCategory(categoryId: string, updates: Partial<CategoryDefinition>): Observable<void> {
    const categoryDoc = doc(this.firestore, 'categories', categoryId);
    return from(updateDoc(categoryDoc, updates));
  }

  // Delete category
  deleteCategory(categoryId: string): Observable<void> {
    const categoryDoc = doc(this.firestore, 'categories', categoryId);
    return from(deleteDoc(categoryDoc));
  }

  // Initialize default categories if none exist
  initializeDefaultCategories(adminUserId: string): Observable<void> {
    const defaultCategories: Omit<CategoryDefinition, 'id' | 'createdAt'>[] = [
      {
        name: 'games',
        displayName: 'Games',
        icon: 'sports_esports',
        route: 'games',
        description: 'Video games and gaming content',
        isActive: true,
        createdBy: adminUserId,
        sortOrder: 1
      },
      {
        name: 'books',
        displayName: 'Books',
        icon: 'menu_book',
        route: 'books',
        description: 'Books and literature',
        isActive: true,
        createdBy: adminUserId,
        sortOrder: 2
      },
      {
        name: 'movies',
        displayName: 'Movies',
        icon: 'movie',
        route: 'movies',
        description: 'Movies and cinema',
        isActive: true,
        createdBy: adminUserId,
        sortOrder: 3
      },
      {
        name: 'electronic-gadgets',
        displayName: 'Electronic Gadgets',
        icon: 'devices',
        route: 'electronic-gadgets',
        description: 'Electronic devices and gadgets',
        isActive: true,
        createdBy: adminUserId,
        sortOrder: 4
      },
      {
        name: 'apps',
        displayName: 'Apps',
        icon: 'apps',
        route: 'apps',
        description: 'Mobile and web applications',
        isActive: true,
        createdBy: adminUserId,
        sortOrder: 5
      },
      {
        name: 'web-series',
        displayName: 'Web Series',
        icon: 'live_tv',
        route: 'web-series',
        description: 'Web series and streaming content',
        isActive: true,
        createdBy: adminUserId,
        sortOrder: 6
      },
      {
        name: 'beauty-products',
        displayName: 'Beauty Products',
        icon: 'spa',
        route: 'beauty-products',
        description: 'Beauty and cosmetic products',
        isActive: true,
        createdBy: adminUserId,
        sortOrder: 7
      },
      {
        name: 'documentaries',
        displayName: 'Documentaries',
        icon: 'video_library',
        route: 'documentaries',
        description: 'Documentary films and content',
        isActive: true,
        createdBy: adminUserId,
        sortOrder: 8
      },
      {
        name: 'home-appliances',
        displayName: 'Home Appliances',
        icon: 'home',
        route: 'home-appliances',
        description: 'Home appliances and household items',
        isActive: true,
        createdBy: adminUserId,
        sortOrder: 9
      }
    ];

    // Add all default categories
    const addPromises = defaultCategories.map(category => 
      this.addCategory(category).toPromise()
    );

    return from(Promise.all(addPromises)).pipe(
      map(() => void 0)
    );
  }
}