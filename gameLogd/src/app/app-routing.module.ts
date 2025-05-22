import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddBookComponent } from './components/add-book/add-book.component';
// ... other component imports ...

const routes: Routes = [
  { path: 'add-book', component: AddBookComponent },
  // ... other routes ...
  { path: '', redirectTo: '/books', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 