import { Component, inject, OnInit } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { GameListService } from '../../services/gameList.service';
import { GameList } from '../../models/gameList.model';
import { Game } from '../../models/game.model';
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { GeneralDeleteButtonComponent } from '../shared/general-delete-button/general-delete-button.component';

@Component({
  selector: 'app-my-lists',
  imports: [
    SplitterModule,
    MatButtonModule,
    CommonModule,
    MatDividerModule,
    RouterLink,
    GeneralDeleteButtonComponent
  ],
  templateUrl: './my-lists.component.html',
  styleUrl: './my-lists.component.css'
})
export class MyListsComponent implements OnInit {
  gameFirebaseService = inject(GameFirebaseService);
  authService = inject(AuthService);
  gameListService = inject(GameListService);

  lists: GameList[] = [];
  currGames: Game[] = [];
  currDescription: String = '';
  currTitle: String = '';
  currId: string = '';

  //Used to route to create list page
  constructor(private router: Router) {}

  //Flag variable to check if any lists have been clicked
  clickedOnce: boolean = false;

  async ngOnInit(): Promise<void> {
    const userId = this.authService.getUid();
    this.gameListService.getListsByUserId(await userId).subscribe(lists => {
      this.lists = lists;
    });
  }

  getGames(list: GameList): void {
    this.clickedOnce = true;
    this.currDescription = list.description!;
    this.currTitle = list.title;
    this.currId = list.id;
    this.gameFirebaseService.getGamesByIds(list.games).subscribe(games => {
      this.currGames = games;
    });
  }

  deleteList(id: string): void {
    this.gameListService.deleteList(id).subscribe({
      next: async() => {
        window.location.reload();
      },
      error: (error) => {
        console.log("Error deleting list:", error);
      }
    });
  }
}
