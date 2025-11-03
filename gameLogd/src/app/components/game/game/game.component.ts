import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'primeng/carousel';
import { GameFirebaseService } from '../../../services/gameFirebase.service';
import { Game } from '../../../models/game.model';
import { AuthService } from '../../../services/auth.service';

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
  authService = inject(AuthService);
  router = inject(Router);

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.gameFirebaseService.getGames().subscribe({
      next: (games: Game[]) => {
        this.allGames = games;
        this.trendingGames = games;
        this.topRatedGames = games.filter(game => game.rating >= 3.5);
        this.popularGames = games;
      },
      error: (error) => {
        console.error('Error loading games:', error);
      }
    });
  }

  onAddGame(): void {
    this.router.navigate(['/add_game']);
  }
}
