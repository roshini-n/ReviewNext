// need to link the ratings back to our users to dissalow multiple ratings per user

export interface Rating {
    id: string;
    userId: string;
    gameId: string;
    rating: number;
}