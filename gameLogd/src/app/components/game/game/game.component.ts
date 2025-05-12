import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameFirebaseService } from '../../../services/gameFirebase.service';
import { Game } from '../../../models/game.model';
import { Carousel, CarouselModule } from 'primeng/carousel';


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, Carousel, CarouselModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent implements OnInit {
  games: Game[] = [];
  gameFirebaseService = inject(GameFirebaseService);

  // on init we are calling service to grab all games for us.
  ngOnInit(): void {
    this.games = []
    this.gameFirebaseService.getGames().subscribe(games => {
      this.games = games;
    });
    
  }
}
