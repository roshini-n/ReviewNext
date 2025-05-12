import { Component, inject, signal, model, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Game } from '../../models/game.model';
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { AuthService } from '../../services/auth.service';
import { GameListService } from '../../services/gameList.service';
import { ActivatedRoute } from '@angular/router';
import { GameList } from '../../models/gameList.model';

export interface DialogData {
  game: string;
}

@Component({
  selector: 'app-edit-list',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './edit-list.component.html',
  styleUrl: './edit-list.component.css'
})
export class EditListComponent {
  gameFirebaseService = inject(GameFirebaseService);
  authService = inject(AuthService)
  listService = inject(GameListService)
  readonly dialog = inject(MatDialog);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);

  readonly game = signal('');

  selectedGames: Game[] = [];
  listId: string | null = null;
  list: GameList | undefined;
  listTitle: string | undefined;
  listDesc: string | undefined;

  constructor(private router: Router) {};

  listForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['']
  })

  async ngOnInit(): Promise<void> {
    //Grab id from route of our url
    this.listId = this.route.snapshot.paramMap.get('id');
    this.listService.getListById(this.listId!).subscribe(list => {
      this.list = list;
      if (this.list && this.list.games.length > 0) {
        this.gameFirebaseService.getGamesByIds(this.list?.games!).subscribe(games => {
          this.selectedGames = games;
        });
      }
      this.listTitle = list?.title;
      this.listDesc = list?.description;
    });


  }

  //Open dialog to add game to list
  openDialog(): void {
    const dialogRef = this.dialog.open(AddGameDialog, 
      {
        data: {game: this.game()},
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.gameFirebaseService.getGameById(result).subscribe(currGame => {
          this.selectedGames.push(currGame!);
        })
      }
    });
  }

  //Remove game from selected games
  removeGame(gameElm: HTMLDivElement): void {
    this.selectedGames.splice(Number(gameElm.getAttribute('data-idx')), 1);
    gameElm.remove();
  }

  async onEnter(): Promise<void> {
    const rawForm = this.listForm.getRawValue();
    const userId = await this.authService.getUid();
    let title = "";
    let description = "";
    if (rawForm.title.length < 1) {
      title = this.listTitle!
    }
    else {
      title = rawForm.title;
    }
    if (rawForm.description.length < 1) {
      description = this.listDesc!;
    }
    else {
      description = rawForm.description;
    }
    const id = this.listId;

    if (title.length < 1) {
      alert("Please enter a title.");
      return;
    }
    
    //Check to make sure user is logged in
    if (!userId) {
      console.error("User ID not found");
      alert("You must be logged in to edit a list");
      return;
    }
    
    //Get IDs of selected games
    let games: string[] = [];
    for (const game of this.selectedGames) {
      games.push(game.id);
    }

    this.listService.updateList(this.listId!, {title, description, games, userId});

    //Redirect to user's list page
    this.router.navigate(["/my_lists"])

  }
}

//Add game dialog box
@Component({
  selector: 'add-game-dialog',
  templateUrl: 'add-game-dialog.html',
  styleUrl: './edit-list.component.css',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatInputModule,
    AsyncPipe,
    CommonModule,
  ],
})
export class AddGameDialog {
  gameFirebaseService = inject(GameFirebaseService);
  fb = inject(FormBuilder);
  //router = inject(Router)
  readonly dialogRef = inject(MatDialogRef<AddGameDialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly game = model(this.data.game);

  form = this.fb.nonNullable.group({
    searchQuery: [''],
  });
  errorMessage: string | null = null;

  searchResults: Game[] = [];
  onEnter(): void {
    const rawForm = this.form.getRawValue();
    this.gameFirebaseService.searchGames(rawForm.searchQuery, 'title').subscribe({
      next: (results) => {
        this.searchResults = results;
        if (this.searchResults.length == 0) {
          alert("No results found")
        }
      
      },
      error: (err) => {
        console.error('Error searching games:', err);
      },
    });
  }

  selectGame(gameElm: HTMLDivElement): void {
    const id = gameElm.getAttribute('data-id');
    this.dialogRef.close(id);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}

