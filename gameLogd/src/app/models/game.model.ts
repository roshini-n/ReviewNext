export interface Game {
    id: string;
    title: string;
    description: string;
    platforms: string[];
    releaseDate: string;
    developer: string;
    publisher: string;
    playersPlayed: number;
    rating: number;
    imageUrl: string;

    //Used to calculate average score
    totalRatingScore: number;
    numRatings: number;
}