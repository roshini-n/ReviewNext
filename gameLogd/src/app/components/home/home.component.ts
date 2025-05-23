import { Component} from '@angular/core';
import { RouterLink, Router } from '@angular/router';


@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  searchQuery: string = '';

  constructor(private router: Router) {}

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery }
      });
    }
  }
}
