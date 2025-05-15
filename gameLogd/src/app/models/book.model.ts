export interface Book {
    id: string;
    title: string;
    description: string;
    author: string;
    publisher: string;
    publicationDate: string;
    genres: string[];
    pages: number;
    readersRead: number;
    rating: number;
    imageUrl: string;
    dateAdded: string;

    //Used to calculate average score
    totalRatingScore: number;
    numRatings: number;
}