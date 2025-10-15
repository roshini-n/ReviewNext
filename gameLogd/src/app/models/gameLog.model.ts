export interface GameLog {
  id?: string; // id for the game log itself
  userId: string; // reference to the user who played the game
  gameId: string; // reference to the game that was played
  dateStarted?: Date;
  dateCompleted?: Date;
  datePosted?: Date; // date when the log was created
  hoursPlayed?: number; // total hours played, calculated from startDate and endDate
  playedBefore?: boolean; // bool from button
  rating?: number;
  review?: string;
  isReplay?: boolean; 
  containsSpoilers?: boolean;
}
