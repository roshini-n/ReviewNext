export interface WebSeries {
    id: string;
    title: string;
    description: string;
    network: string;
    releaseDate: string;
    creator: string;
    rating: number;
    imageUrl: string;
    totalRatingScore: number;
    numRatings: number;
    genres: string[];
    seasons: number;
    episodes: number;
    status: string;
    dateAdded: string;
} 