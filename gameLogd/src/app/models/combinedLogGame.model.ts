export interface CombinedLogGame {
  gamelogId: string;
  gameId: string;
  userId: string;
  review?: string;
  rating: number;
  startDate?: Date;
  endDate?: Date;
  title: string;
  description: string;
  platforms: string[];
  releaseDate: string;
  developer: string;
  publisher: string;
  playersPlayed: number;
  imageUrl: string;
  isReplay?: boolean;
}
