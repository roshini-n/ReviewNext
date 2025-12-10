import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'primeng/carousel';
import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';
import { WebSeries } from '../../../models/web-series.model';
import { AuthService } from '../../../services/auth.service';
import { AddToListButtonComponent } from '../../shared/add-to-list-button/add-to-list-button.component';

@Component({
  selector: 'app-web-series',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CarouselModule,
    AddToListButtonComponent
  ],
  templateUrl: './web-series.component.html',
  styleUrls: ['./web-series.component.css']
})
export class WebSeriesComponent implements OnInit {
  allWebSeries: WebSeries[] = [];
  trendingWebSeries: WebSeries[] = [];
  topRatedWebSeries: WebSeries[] = [];
  popularWebSeries: WebSeries[] = [];
  webSeriesFirebaseService = inject(WebSeriesFirebaseService);
  authService = inject(AuthService);
  
  ngOnInit(): void {
    this.loadWebSeries();
  }

  loadWebSeries(): void {
    this.webSeriesFirebaseService.getWebSeries().subscribe((webSeries: WebSeries[]) => {
      this.allWebSeries = webSeries;
      this.trendingWebSeries = webSeries;
      this.topRatedWebSeries = webSeries.filter(series => series.rating >= 3.5);
      this.popularWebSeries = webSeries;
    });
  }
} 