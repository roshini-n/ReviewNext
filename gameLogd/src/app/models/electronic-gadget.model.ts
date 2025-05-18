export interface ElectronicGadget {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  rating: number;
  price: number;
  brand: string;
  category: string;
  specifications: {
    processor?: string;
    ram?: string;
    storage?: string;
    display?: string;
    battery?: string;
    [key: string]: string | undefined;
  };
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