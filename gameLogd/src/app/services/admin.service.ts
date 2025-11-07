import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  getCountFromServer
} from '@angular/fire/firestore';
import { Observable, of, map, switchMap } from 'rxjs';
import { isAdminEmail } from '../utils/admin.util';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: any;
  lastLogin?: any;
  totalReviews: number;
  totalLists: number;
}

export interface AdminReview {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl?: string;
  productType: string;
  productId: string;
  productTitle: string;
  reviewText: string;
  rating: number;
  datePosted: any;
  lastUpdated?: any;
  likes?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalReviews: number;
  totalProducts: number;
  totalLists: number;
  newUsersToday: number;
  reviewsToday: number;
}

export interface ProductStats {
  games: number;
  books: number;
  movies: number;
  webSeries: number;
  electronicGadgets: number;
  beautyProducts: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  /** Admin observable check combining Firestore role flags + static email list */
  isAdmin(): Observable<boolean> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of(false);
        const email = user.email || '';
        const staticMatch = isAdminEmail(email);
        const userRef = doc(this.firestore, 'users', user.uid);
        return collectionData(query(collection(this.firestore, 'users'), where('email', '==', email))).pipe(
          map(() => staticMatch), // Simplified: prefer static list for now; extend with roles later
        );
      })
    );
  }

  // ---------------- Dashboard & High-level Stats ----------------
  async getDashboardStats(): Promise<DashboardStats> {
    const [users, reviews, products, lists] = await Promise.all([
      this.getTotalCount('users'),
      this.getTotalCount('reviews'),
      this.getTotalProductsCount(),
      this.getTotalCount('user-lists')
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = Timestamp.fromDate(today);

    const [newUsersToday, reviewsToday] = await Promise.all([
      this.getCountSinceDate('users', 'createdAt', todayTs),
      this.getCountSinceDate('reviews', 'datePosted', todayTs)
    ]);

    return { totalUsers: users, totalReviews: reviews, totalProducts: products, totalLists: lists, newUsersToday, reviewsToday };
  }

  private async getTotalCount(collectionName: string): Promise<number> {
    const ref = collection(this.firestore, collectionName);
    const snap = await getCountFromServer(ref as any);
    return snap.data().count as number;
  }

  private async getTotalProductsCount(): Promise<number> {
    const cols = ['games', 'books', 'movies', 'web-series', 'electronic-gadgets', 'beauty-products'];
    const counts = await Promise.all(cols.map(c => this.getTotalCount(c)));
    return counts.reduce((a, b) => a + b, 0);
  }

  private async getCountSinceDate(collectionName: string, field: string, since: Timestamp): Promise<number> {
    const ref = collection(this.firestore, collectionName);
    const q = query(ref, where(field, '>=', since));
    const snap = await getDocs(q);
    return snap.size;
  }

  // ---------------- User Management ----------------
  getAllUsers(): Observable<AdminUser[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' }).pipe(
      map((users: any[]) => users.map(u => ({
        id: u.id,
        email: u.email || '',
        username: u.username || '',
        avatarUrl: u.avatarUrl || '',
        role: u.role || '',
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        totalReviews: u.totalReviews ?? 0,
        totalLists: u.totalLists ?? 0
      })))
    );
  }

  async deleteUser(userId: string): Promise<void> {
    const batch = writeBatch(this.firestore);
    const userRef = doc(this.firestore, 'users', userId);
    batch.delete(userRef);

    const collectionsToPurge = [
      { name: 'reviews', field: 'userId' },
      { name: 'ratings', field: 'userId' },
      { name: 'user-lists', field: 'userId' }
    ];
    for (const c of collectionsToPurge) {
      const q = query(collection(this.firestore, c.name), where(c.field, '==', userId));
      const snap = await getDocs(q);
      snap.docs.forEach(d => batch.delete(d.ref));
    }
    await batch.commit();
  }

  async getUserDetails(userId: string): Promise<AdminUser | null> {
    const ref = doc(this.firestore, 'users', userId);
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) return null;
    const data = docSnap.data() as any;
    const reviewsQ = query(collection(this.firestore, 'reviews'), where('userId', '==', userId));
    const reviewsSnap = await getDocs(reviewsQ);
    const listsQ = query(collection(this.firestore, 'user-lists'), where('userId', '==', userId));
    const listsSnap = await getDocs(listsQ);
    return {
      id: docSnap.id,
      email: data.email || '',
      username: data.username || '',
      avatarUrl: data.avatarUrl || '',
      role: data.role || '',
      createdAt: data.createdAt,
      lastLogin: data.lastLogin,
      totalReviews: reviewsSnap.size,
      totalLists: listsSnap.size
    };
  }

  // ---------------- Review Management ----------------
  getAllReviews(): Observable<AdminReview[]> {
    const reviewsCollection = collection(this.firestore, 'reviews');
    const q = query(reviewsCollection, orderBy('datePosted', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<AdminReview[]>;
  }

  async deleteReview(reviewId: string): Promise<void> {
    const ref = doc(this.firestore, 'reviews', reviewId);
    await deleteDoc(ref);
  }

  async updateReview(reviewId: string, updates: Partial<AdminReview>): Promise<void> {
    const ref = doc(this.firestore, 'reviews', reviewId);
    await updateDoc(ref, { ...updates, lastUpdated: Timestamp.now() });
  }

  // ---------------- Product Management ----------------
  async getProductStats(): Promise<ProductStats> {
    const [games, books, movies, webSeries, electronicGadgets, beautyProducts] = await Promise.all([
      this.getTotalCount('games'),
      this.getTotalCount('books'),
      this.getTotalCount('movies'),
      this.getTotalCount('web-series'),
      this.getTotalCount('electronic-gadgets'),
      this.getTotalCount('beauty-products')
    ]);
    return { games, books, movies, webSeries, electronicGadgets, beautyProducts };
  }

  getProductsByCategory(category: string): Observable<any[]> {
    const colRef = collection(this.firestore, category);
    return collectionData(colRef, { idField: 'id' }).pipe(
      map((items: any[]) => items
        .map(i => ({ ...i, _k: (i.title || i.name || '').toString().toLowerCase() }))
        .sort((a, b) => a._k.localeCompare(b._k))
        .map(({ _k, ...rest }) => rest))
    );
  }

  async deleteProduct(category: string, productId: string): Promise<void> {
    const batch = writeBatch(this.firestore);
    const productRef = doc(this.firestore, category, productId);
    batch.delete(productRef);

    const reviewsQ = query(collection(this.firestore, 'reviews'), where('productId', '==', productId), where('productType', '==', category));
    const reviewsSnap = await getDocs(reviewsQ);
    reviewsSnap.docs.forEach(d => batch.delete(d.ref));

    const ratingsQ = query(collection(this.firestore, 'ratings'), where('productId', '==', productId), where('productType', '==', category));
    const ratingsSnap = await getDocs(ratingsQ);
    ratingsSnap.docs.forEach(d => batch.delete(d.ref));

    await batch.commit();
  }

  // ---------------- Search Helpers ----------------
  searchUsers(term: string): Observable<AdminUser[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(u =>
        u.username.toLowerCase().includes(term.toLowerCase()) ||
        u.email.toLowerCase().includes(term.toLowerCase())
      ))
    );
  }

  searchReviews(term: string): Observable<AdminReview[]> {
    return this.getAllReviews().pipe(
      map(reviews => reviews.filter(r =>
        r.reviewText.toLowerCase().includes(term.toLowerCase()) ||
        r.productTitle.toLowerCase().includes(term.toLowerCase()) ||
        r.username.toLowerCase().includes(term.toLowerCase())
      ))
    );
  }
}
