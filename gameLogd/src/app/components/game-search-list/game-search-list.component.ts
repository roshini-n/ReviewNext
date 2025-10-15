import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-game-search-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule],
  templateUrl: './game-search-list.component.html',
  styleUrls: ['./game-search-list.component.css'],
})
export class GameSearchListComponent {
  @Input() games: Game[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyMessage = 'No games found.';
}
