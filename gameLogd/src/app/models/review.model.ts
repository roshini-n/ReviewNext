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
  
  // Movie-related properties (optional)
  movieId?: string;      // reference to the reviewed movie
  movieTitle?: string;   // cache the movie title for display purposes
  
  // Web Series-related properties (optional)
  seriesId?: string;     // reference to the reviewed web series
  seriesTitle?: string;  // cache the series title for display purposes
  
  // Electronic Gadget-related properties (optional)
  gadgetId?: string;     // reference to the reviewed electronic gadget
  gadgetTitle?: string;  // cache the gadget title for display purposes
  
  // Beauty Product-related properties (optional)
  productId?: string;    // reference to the reviewed beauty product
  productTitle?: string; // cache the product title for display purposes
  
  reviewText: string;   // the actual review content
  rating: number;      // optional numerical rating (if combined with rating, we need to decicde on this)
  
  // metadata
  datePosted: Date;     // when the review was first posted
  lastUpdated?: Date;   // when the review was last edited

  // social data
  likes?: number;       // number of likes/upvotes
}