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
import { BookComponent } from './components/books/book/book.component';
import { BookDetailsComponent } from './components/books/book-details/book-details.component';
import { AddBookComponent } from './components/books/add-book/add-book.component';
import { MovieComponent } from './components/movie/movie/movie.component';
import { AddMovieComponent } from './components/movie/add-movie/add-movie.component';
import { AppComponent } from './components/apps/app/app.component';
import { WebSeriesComponent } from './components/web-series/web-series.component';
import { DocumentaryComponent } from './components/documentaries/documentary.component';
import { BeautyProductComponent } from './components/beauty-products/beauty-product.component';
import { HomeApplianceComponent } from './components/home-appliances/home-appliance.component';
import { ElectronicGadgetComponent } from './components/electronic-gadgets/electronic-gadget.component';
import { AddElectronicGadgetComponent } from './components/electronic-gadgets/add-electronic-gadget/add-electronic-gadget.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // default route
  { path: 'games', component: GameComponent },
  { path: 'books', component: BookComponent },
  { path: 'movies', component: MovieComponent },
  { path: 'apps', component: AppComponent },
  { path: 'web-series', component: WebSeriesComponent },
  { path: 'documentaries', component: DocumentaryComponent },
  { path: 'beauty-products', component: BeautyProductComponent },
  { path: 'home-appliances', component: HomeApplianceComponent },
  { path: 'electronic-gadgets', component: ElectronicGadgetComponent },
  { path: 'add_electronic_gadget', component: AddElectronicGadgetComponent },
  { path: 'books/:id', component: BookDetailsComponent },
  { path: 'add_book', component: AddBookComponent },
  { path: 'add_movie', component: AddMovieComponent },
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
  { path: 'mylog', component: MylogComponent }
];
