export interface BeautyProduct {
    id: string;
    title: string;
    description: string;
    brand: string;
    releaseDate: string;
    manufacturer: string;
    distributor: string;
    sales: number;
    rating: number;
    imageUrl: string;
    totalRatingScore: number;
    numRatings: number;
    category: string;
    price: number;
    size: string;
    ingredients: string[];
    skinType: string[];
    benefits: string[];
    usage: string;
} 