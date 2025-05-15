// connect a review to a user and game to allow one reveiw per user per game

export interface Review {
  id: string;           // unique review ID
  userId: string;       // reference to the user who wrote the review
  username?: string;     // cache the username for display purposes
  userAvatarUrl?: string; 

  // Game-related properties (optional)
  gameId?: string;       // reference to the reviewed game
  gameTitle?: string;    
  gameCoverUrl?: string; 
  
  // Book-related properties (optional)
  bookId?: string;       // reference to the reviewed book
  bookTitle?: string;    // cache the book title for display purposes
  
  reviewText: string;   // the actual review content
  rating: number;      // optional numerical rating (if combined with rating, we need to decicde on this)
  
  // metadata
  datePosted: Date;     // when the review was first posted
  lastUpdated?: Date;   // when the review was last edited

  // social data
  likes?: number;       // number of likes/upvotes
}