import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game/game.component';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { GameDetailsComponent } from './components/game/game-details/game-details.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchComponent } from './components/search/search.component';
import { CreateListComponent } from './components/create-list/create-list.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MylogComponent } from './components/mylog/mylog.component';
import { MyListsComponent } from './components/my-lists/my-lists.component';
import { EditListComponent } from './components/edit-list/edit-list.component';
import { BookComponent } from './components/books/book/book.component';
import { BookDetailsComponent } from './components/books/book-details/book-details.component';
import { MovieComponent } from './components/movie/movie/movie.component';
import { MovieDetailsComponent } from './components/movie/movie-details/movie-details.component';
import { AppComponent } from './components/apps/app/app.component';
import { WebSeriesComponent } from './components/web-series/web-series.component';
import { DocumentaryComponent } from './components/documentaries/documentary.component';
import { BeautyProductComponent } from './components/beauty-products/beauty-product.component';
import { HomeApplianceComponent } from './components/home-appliances/home-appliance.component';
import { ElectronicGadgetComponent } from './components/electronic-gadgets/electronic-gadget.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // default route
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [authGuard] }, // protected dashboard route
  
  // Book routes
  { path: 'books', component: BookComponent },
  { path: 'books/:id', component: BookDetailsComponent },
  { path: 'add_book', loadComponent: () => import('./components/books/add-book/add-book.component').then(m => m.AddBookComponent), canActivate: [authGuard] },
  
  // Game routes
  { path: 'games', component: GameComponent },
  { path: 'games/:id', component: GameDetailsComponent },
  { path: 'add_game', loadComponent: () => import('./components/add-game/add-game.component').then(m => m.AddGameComponent), canActivate: [authGuard] },
  
  // Movie routes
  { path: 'movies', component: MovieComponent },
  { path: 'movies/:id', component: MovieDetailsComponent },
  { path: 'add_movie', loadComponent: () => import('./components/movie/add-movie/add-movie.component').then(m => m.AddMovieComponent), canActivate: [authGuard] },
  
  // Other routes
  { path: 'apps', component: AppComponent },
  { path: 'web-series', component: WebSeriesComponent },
  { path: 'documentaries', component: DocumentaryComponent },
  { path: 'beauty-products', component: BeautyProductComponent },
  { path: 'home-appliances', component: HomeApplianceComponent },
  { path: 'electronic-gadgets', component: ElectronicGadgetComponent },
  { path: 'add_electronic_gadget', loadComponent: () => import('./components/electronic-gadgets/add-electronic-gadget/add-electronic-gadget.component').then(m => m.AddElectronicGadgetComponent), canActivate: [authGuard] },
  { path: 'add_app', loadComponent: () => import('./components/apps/add-app/add-app.component').then(m => m.AddAppComponent), canActivate: [authGuard] },
  { path: 'add_web_series', loadComponent: () => import('./components/web-series/add-web-series/add-web-series.component').then(m => m.AddWebSeriesComponent), canActivate: [authGuard] },
  { path: 'add_documentary', loadComponent: () => import('./components/documentaries/add-documentary/add-documentary.component').then(m => m.AddDocumentaryComponent), canActivate: [authGuard] },
  { path: 'add_beauty_product', loadComponent: () => import('./components/beauty-products/add-beauty-product/add-beauty-product.component').then(m => m.AddBeautyProductComponent), canActivate: [authGuard] },
  { path: 'add_home_appliance', loadComponent: () => import('./components/home-appliances/add-home-appliance/add-home-appliance.component').then(m => m.AddHomeApplianceComponent), canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'create_list', component: CreateListComponent, canActivate: [authGuard] },
  { path: 'my_lists', component: MyListsComponent, canActivate: [authGuard] },
  { path: 'edit_list/:id', component: EditListComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchComponent },
  { path: 'reset_password', component: ResetPasswordComponent },
  { path: 'mylog', component: MylogComponent, canActivate: [authGuard] }
];
