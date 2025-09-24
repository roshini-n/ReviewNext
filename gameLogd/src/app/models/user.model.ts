import { GameLog } from './gameLog.model';
import { Rating } from './rating.model';

export interface User {
  // Basic User Info
  id: string;                // Firebase Auth UID
  email: string;
  username: string;
  avatarUrl: string;        // profile picture URL
  bio?: string;           
  //createdAt: Date;           
  
  personalLog: string[];  // ref to games logged by user
  reviewIds?: string[];   // ref to reviews 
  ratings: string[];      // ref to game ratings by user
  favorites?: string[];         // ref to favorite game IDs
  currentlyPlaying?: string[];  // ref to games currently being played
  // TODO: social data
}