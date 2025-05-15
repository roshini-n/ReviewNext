import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'primeng/carousel';
import { GameFirebaseService } from '../../../services/gameFirebase.service';
import { Game } from '../../../models/game.model';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CarouselModule
  ],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  allGames: Game[] = [];
  trendingGames: Game[] = [];
  topRatedGames: Game[] = [];
  popularGames: Game[] = [];
  gameFirebaseService = inject(GameFirebaseService);

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.gameFirebaseService.getGames().subscribe((games: Game[]) => {
      this.allGames = games;
      this.trendingGames = games;
      this.topRatedGames = games.filter(game => game.rating >= 3.5);
      this.popularGames = games;
    });
  }
}
