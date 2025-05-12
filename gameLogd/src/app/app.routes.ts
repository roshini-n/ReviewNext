import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game/game.component';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { GameDetailsComponent } from './components/game/game-details/game-details.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AddGameComponent } from './components/add-game/add-game.component';
import { SearchComponent } from './components/search/search.component';
import { CreateListComponent } from './components/create-list/create-list.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MylogComponent } from './components/mylog/mylog.component';
import { MyListsComponent } from './components/my-lists/my-lists.component';
import { EditListComponent } from './components/edit-list/edit-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // default route
  { path: 'games', component: GameComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'create_list', component: CreateListComponent },
  { path: 'my_lists', component: MyListsComponent},
  { path: 'edit_list/:id', component: EditListComponent},
  { path: 'games/:id', component: GameDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'add_game', component: AddGameComponent },
  { path: 'search', component: SearchComponent },
  { path: 'reset_password', component: ResetPasswordComponent },
  { path: 'mylog', component: MylogComponent },
];
