import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ElectronicGadgetFirebaseService } from '../../../services/electronicGadgetFirebase.service';
import { ElectronicGadget } from '../../../models/electronic-gadget.model';
import { ElectronicGadgetSearchListComponent } from '../electronic-gadget-search-list/electronic-gadget-search-list.component';

@Component({
  selector: 'app-electronic-gadget-search',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, ElectronicGadgetSearchListComponent],
  templateUrl: './electronic-gadget-search.component.html',
  styleUrl: './electronic-gadget-search.component.css'
})
export class ElectronicGadgetSearchComponent implements OnInit {
  searchQuery: string = '';
  results: ElectronicGadget[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  private route = inject(ActivatedRoute);
  private gadgetService = inject(ElectronicGadgetFirebaseService);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.performSearch();
      } else {
        this.results = [];
      }
    });
  }

  private performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.results = [];
      return;
    }
    this.isLoading = true;
    this.error = null;
    const normalizedQuery = this.searchQuery.replace(/\s+/g, '');
    this.gadgetService.getElectronicGadgets().subscribe({
      next: (items: ElectronicGadget[]) => {
        const exactMatches = items.filter((g) => (g.name || '').replace(/\s+/g, '').includes(normalizedQuery));
        if (exactMatches.length > 0) {
          this.results = exactMatches;
        } else {
          const similarRanked = items
            .map((g) => ({ gadget: g, score: this.getSimilarityScore((g.name || '').toLowerCase(), normalizedQuery.toLowerCase()) }))
            .sort((a, b) => b.score - a.score)
            .map((x) => x.gadget);
          const aboveThreshold = similarRanked.filter((g) => this.getSimilarityScore((g.name || '').toLowerCase(), normalizedQuery.toLowerCase()) > 0.3);
          this.results = aboveThreshold.length > 0 ? aboveThreshold : similarRanked.slice(0, 5);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error searching electronic gadgets:', err);
        this.error = 'Failed to search gadgets. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private getSimilarityScore(name: string, query: string): number {
    let matches = 0;
    const nameSet = new Set(name);
    for (const char of query) {
      if (nameSet.has(char)) matches++;
    }
    return query.length ? matches / query.length : 0;
  }
}


