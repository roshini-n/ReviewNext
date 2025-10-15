import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private gameSubject = new Subject<any>();

  // Observable stream
  game$ = this.gameSubject.asObservable();

  // Method to emit new game data
  updateGame(game: any) {
    this.gameSubject.next(game);
  }
}
