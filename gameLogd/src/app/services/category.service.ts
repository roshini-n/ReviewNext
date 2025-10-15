import { Injectable, inject } from '@angular/core';
import { Observable, map, of, from, switchMap } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
  docData,
  limit
} from '@angular/fire/firestore';
import { Category, CategoryItem } from '../models/category.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private categoriesCollection = collection(this.firestore, 'categories');
  private categoryItemsCollection = collection(this.firestore, 'categoryItems');

  constructor() {
    this.initializeDefaultCategories();
  }

  // Initialize default categories if they don't exist
  private async initializeDefaultCategories() {
    const defaultCategories: Omit<Category, 'id' | 'createdAt' | 'createdBy'>[] = [
      {
        name: 'games',
        displayName: 'Games',
        description: 'Video games and gaming content',
        icon: 'sports_esports',
        route: 'games',
        isActive: true,
        isDefault: true,
        fields: [
          { id: '1', name: 'developer', displayName: 'Developer', label: 'Developer', type: 'text', required: true },
          { id: '2', name: 'publisher', displayName: 'Publisher', label: 'Publisher', type: 'text', required: false },
          { id: '3', name: 'releaseDate', displayName: 'Release Date', label: 'Release Date', type: 'date', required: true },
          { id: '4', name: 'platforms', displayName: 'Platforms', label: 'Platforms', type: 'array', required: true },
          { id: '5', name: 'genre', displayName: 'Genre', label: 'Genre', type: 'array', required: true }
        ]
      },
      {
        name: 'books',
        displayName: 'Books',
        description: 'Books and literature',
        icon: 'menu_book',
        route: 'books',
        isActive: true,
        isDefault: true,
        fields: [
          { id: '1', name: 'author', displayName: 'Author', label: 'Author', type: 'text', required: true },
          { id: '2', name: 'publisher', displayName: 'Publisher', label: 'Publisher', type: 'text', required: false },
          { id: '3', name: 'publicationDate', displayName: 'Publication Date', label: 'Publication Date', type: 'date', required: true },
          { id: '4', name: 'isbn', displayName: 'ISBN', label: 'ISBN', type: 'text', required: false },
          { id: '5', name: 'pageCount', displayName: 'Page Count', label: 'Page Count', type: 'number', required: false },
          { id: '6', name: 'genres', displayName: 'Genres', label: 'Genres', type: 'array', required: true }
        ]
      },
      {
        name: 'movies',
        displayName: 'Movies',
        description: 'Movies and films',
        icon: 'movie',
        route: 'movies',
        isActive: true,
        isDefault: true,
        fields: [
          { id: '1', name: 'director', displayName: 'Director', label: 'Director', type: 'text', required: true },
          { id: '2', name: 'releaseDate', displayName: 'Release Date', label: 'Release Date', type: 'date', required: true },
          { id: '3', name: 'duration', displayName: 'Duration (minutes)', label: 'Duration (minutes)', type: 'number', required: true },
          { id: '4', name: 'language', displayName: 'Language', label: 'Language', type: 'text', required: true },
          { id: '5', name: 'country', displayName: 'Country', label: 'Country', type: 'text', required: false },
          { id: '6', name: 'genres', displayName: 'Genres', label: 'Genres', type: 'array', required: true }
        ]
      },
      {
        name: 'electronic-gadgets',
        displayName: 'Electronic Gadgets',
        description: 'Electronic devices and gadgets',
        icon: 'devices',
        route: 'electronic-gadgets',
        isActive: true,
        isDefault: true,
        fields: [
          { id: '1', name: 'brand', displayName: 'Brand', label: 'Brand', type: 'text', required: true },
          { id: '2', name: 'model', displayName: 'Model', label: 'Model', type: 'text', required: true },
          { id: '3', name: 'price', displayName: 'Price', label: 'Price', type: 'number', required: false },
          { id: '4', name: 'releaseDate', displayName: 'Release Date', label: 'Release Date', type: 'date', required: false },
          { id: '5', name: 'category', displayName: 'Category', label: 'Category', type: 'text', required: true }
        ]
      }
    ];

    // Check if categories exist, if not create them
    this.getAllCategories().subscribe(categories => {
      if (categories.length === 0) {
        defaultCategories.forEach(category => {
          this.createCategory(category);
        });
      }
    });
  }

  // Get all active categories
  getAllCategories(): Observable<Category[]> {
    const q = query(this.categoriesCollection, where('isActive', '==', true), orderBy('displayName'));
    return collectionData(q, { idField: 'id' }) as Observable<Category[]>;
  }

  // Get category by ID
  getCategoryById(id: string): Observable<Category | null> {
    const docRef = doc(this.firestore, 'categories', id);
    return docData(docRef, { idField: 'id' }) as Observable<Category | null>;
  }

  // Get category by name/route
  getCategoryByName(name: string): Observable<Category | null> {
    const q = query(this.categoriesCollection, where('name', '==', name), where('isActive', '==', true));
    return collectionData(q, { idField: 'id' }).pipe(
      map(categories => categories.length > 0 ? categories[0] as Category : null)
    );
  }

  // Create new category (admin only)
  async createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'createdBy'>): Promise<void> {
    const currentUser = await this.authService.getUid();
    if (!currentUser) {
      throw new Error('User must be logged in to create categories');
    }

    const newCategory: Omit<Category, 'id'> = {
      ...categoryData,
      createdAt: new Date(),
      createdBy: currentUser
    };

    await addDoc(this.categoriesCollection, newCategory);
  }

  // Update category (admin only)
  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const docRef = doc(this.firestore, 'categories', id);
    await updateDoc(docRef, updates);
  }

  // Delete category (admin only) - sets isActive to false
  async deleteCategory(id: string): Promise<void> {
    await this.updateCategory(id, { isActive: false });
  }

  // Get items for a specific category
  getCategoryItems(categoryId: string): Observable<CategoryItem[]> {
    const q = query(
      this.categoryItemsCollection, 
      where('categoryId', '==', categoryId),
      where('isActive', '==', true),
      orderBy('title')
    );
    return collectionData(q, { idField: 'id' }) as Observable<CategoryItem[]>;
  }

  // Get item by ID
  getCategoryItemById(id: string): Observable<CategoryItem | null> {
    const docRef = doc(this.firestore, 'categoryItems', id);
    return docData(docRef, { idField: 'id' }) as Observable<CategoryItem | null>;
  }

  // Create new item in category
  async createCategoryItem(itemData: Omit<CategoryItem, 'id' | 'createdAt' | 'createdBy'>): Promise<void> {
    const currentUser = await this.authService.getUid();
    if (!currentUser) {
      throw new Error('User must be logged in to create items');
    }

    const newItem: Omit<CategoryItem, 'id'> = {
      ...itemData,
      createdAt: new Date(),
      createdBy: currentUser
    };

    await addDoc(this.categoryItemsCollection, newItem);
  }

  // Update category item
  async updateCategoryItem(id: string, updates: Partial<CategoryItem>): Promise<void> {
    const docRef = doc(this.firestore, 'categoryItems', id);
    await updateDoc(docRef, updates);
  }

  // Delete category item
  async deleteCategoryItem(id: string): Promise<void> {
    await this.updateCategoryItem(id, { isActive: false });
  }

  // Enhanced method to get category item with legacy support
  getCategoryItemWithLegacySupport(categoryType: string, itemId: string): Observable<CategoryItem | null> {
    // First try to find in the unified categoryItems collection
    const q = query(
      this.categoryItemsCollection, 
      where('id', '==', itemId),
      where('categoryId', '==', categoryType),
      limit(1)
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(items => {
        if (items.length > 0) {
          return items[0] as CategoryItem;
        }
        return null;
      }),
      switchMap(item => {
        if (item) {
          return of(item);
        }
        // If not found in unified collection, try legacy collections
        return this.getLegacyItem(categoryType, itemId);
      })
    );
  }

  // Helper method to fetch from legacy collections
  private getLegacyItem(categoryType: string, itemId: string): Observable<CategoryItem | null> {
    let collectionName = '';
    
    switch (categoryType) {
      case 'games':
      case 'game':
        collectionName = 'games';
        break;
      case 'books':
      case 'book':
        collectionName = 'books';
        break;
      case 'movies':
      case 'movie':
        collectionName = 'movies';
        break;
      case 'electronic-gadgets':
      case 'electronic-gadget':
        collectionName = 'electronicGadgets';
        break;
      default:
        return of(null);
    }

    const itemDoc = doc(this.firestore, `${collectionName}/${itemId}`);
    return from(getDoc(itemDoc)).pipe(
      map(doc => {
        if (doc.exists()) {
          const data = doc.data();
          // Convert legacy format to CategoryItem format
          return this.convertLegacyToCategoryItem(data, categoryType, doc.id);
        } else {
          return null;
        }
      })
    );
  }

  // Convert legacy item format to CategoryItem format
  private convertLegacyToCategoryItem(legacyData: any, categoryType: string, id: string): CategoryItem {
    const customFields: { [key: string]: any } = {};
    
    // Map common fields based on category type
    switch (categoryType) {
      case 'games':
      case 'game':
        customFields['developer'] = legacyData.developer;
        customFields['publisher'] = legacyData.publisher;
        customFields['releaseDate'] = legacyData.releaseDate;
        customFields['platforms'] = legacyData.platforms;
        customFields['genre'] = legacyData.genre;
        break;
      case 'books':
      case 'book':
        customFields['author'] = legacyData.author;
        customFields['publisher'] = legacyData.publisher;
        customFields['publicationDate'] = legacyData.publicationDate;
        customFields['isbn'] = legacyData.isbn;
        customFields['pageCount'] = legacyData.pageCount;
        customFields['genres'] = legacyData.genres;
        break;
      case 'movies':
      case 'movie':
        customFields['director'] = legacyData.director;
        customFields['releaseDate'] = legacyData.releaseDate;
        customFields['duration'] = legacyData.duration;
        customFields['language'] = legacyData.language;
        customFields['country'] = legacyData.country;
        customFields['genres'] = legacyData.genres;
        break;
      case 'electronic-gadgets':
      case 'electronic-gadget':
        customFields['brand'] = legacyData.brand;
        customFields['model'] = legacyData.model;
        customFields['price'] = legacyData.price;
        customFields['releaseDate'] = legacyData.releaseDate;
        customFields['category'] = legacyData.category;
        break;
    }

    return {
      id,
      categoryId: categoryType,
      title: legacyData.title || legacyData.name || '',
      description: legacyData.description || '',
      imageUrl: legacyData.imageUrl || legacyData.image || '',
      rating: legacyData.rating || 0,
      numRatings: legacyData.numRatings || 0,
      createdAt: legacyData.createdAt || new Date(),
      createdBy: legacyData.createdBy || '',
      customFields,
      isActive: legacyData.isActive !== false
    };
  }
}