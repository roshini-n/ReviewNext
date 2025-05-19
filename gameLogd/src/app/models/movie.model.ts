export interface Movie {
  id: string;
  title: string;
  description: string;
  director: string;
  releaseDate: string;
  genres: string[];
  duration: number;
  rating: number;
  imageUrl: string;
  totalRatingScore: number;
  numRatings: number;
  dateAdded: string;
  platforms?: string[];
  cast?: string[];
  language?: string;
  country?: string;
  budget?: number;
  boxOffice?: number;
} 