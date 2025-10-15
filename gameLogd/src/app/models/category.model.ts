export interface Category {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string; // Material icon name
  route: string; // URL route
  isActive: boolean;
  isDefault: boolean; // true for built-in categories (games, books, movies)
  createdAt: Date;
  createdBy: string; // admin user ID
  fields: CategoryField[]; // Custom fields for this category
}

export interface CategoryField {
  id: string;
  name: string;
  displayName: string;
  label: string; // User-friendly label for forms
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'url' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for dropdown/array fields
}

export interface CategoryItem {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  imageUrl: string;
  rating: number;
  numRatings: number;
  createdAt: Date;
  createdBy: string;
  customFields: { [key: string]: any }; // Dynamic fields based on category
  isActive: boolean;
}