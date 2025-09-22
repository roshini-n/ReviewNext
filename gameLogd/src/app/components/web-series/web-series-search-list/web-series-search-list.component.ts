import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WebSeries } from '../../../models/web-series.model';

@Component({
  selector: 'app-web-series-search-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './web-series-search-list.component.html',
  styleUrl: './web-series-search-list.component.css'
})
export class WebSeriesSearchListComponent {
  @Input() series: WebSeries[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyMessage = 'No web series found.';
}


