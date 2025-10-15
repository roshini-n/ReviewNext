import { Component, inject, signal, model } from '@angular/core';
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

export interface DialogData {
  game: string;
}

//Main list creation component
@Component({
  selector: 'app-create-list',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './create-list.component.html',
  styleUrl: './create-list.component.css'
})
export class CreateListComponent {
  selectedGames: Game[] = [];
  gameFirebaseService = inject(GameFirebaseService);
  authService = inject(AuthService)
  listService = inject(GameListService)
  readonly dialog = inject(MatDialog);
  fb = inject(FormBuilder);
  readonly game = signal('');

  constructor(private router: Router) {};

  listForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['']
  })

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

  removeGame(gameElm: HTMLDivElement): void {
    this.selectedGames.splice(Number(gameElm.getAttribute('data-idx')), 1);
    gameElm.remove();
  }

  async onEnter(): Promise<void> {
    const rawForm = this.listForm.getRawValue();
    const userId = await this.authService.getUid();
    const title = rawForm.title;
    const description = rawForm.description;

    if (title.length < 1) {
      alert("Please enter a title.")
      return;
    }
    
    //Check to make sure user is logged in
    if (!userId) {
      console.error("User ID not found");
      alert("You must be logged in to create a list");
      return;
    }
    
    //Get IDs of selected games
    let games: string[] = [];
    for (const game of this.selectedGames) {
      games.push(game.id);
    }

    this.listService.addList({title, description, games, userId});

    //Redirect to user's list page
    this.router.navigate(["/my_lists"]);

  }
}

//Add game dialog box
@Component({
  selector: 'add-game-dialog',
  templateUrl: 'add-game-dialog.html',
  styleUrl: './create-list.component.css',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatInputModule,
    CommonModule,
  ],
})
export class AddGameDialog {
  gameFirebaseService = inject(GameFirebaseService);
  fb = inject(FormBuilder);
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
