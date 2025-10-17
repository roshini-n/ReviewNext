export interface ElectronicGadget {
  id?: string;
  name: string; // Changed from title to name to match the form
  description: string;
  imageUrl: string;
  rating: number;
  price: number;
  brand: string;
  category: string;
  model: string;
  color?: string;
  releaseDate?: Date;
  warranty?: string;
  availability?: string;
  specifications: string[]; // Changed to array of strings for easier management
  features: string[];
  reviews: {
    userId: string;
    rating: number;
    comment: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
} 