export interface BookLog {
  id: string;
  userId: string;
  bookId: string;
  startDate: string;
  endDate: string;
  rating: number;
  review: string;
  status: 'reading' | 'completed' | 'dropped' | 'plan_to_read';
}
