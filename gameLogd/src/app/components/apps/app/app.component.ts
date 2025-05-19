import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'primeng/carousel';
import { AppFirebaseService } from '../../../services/appFirebase.service';
import { App } from '../../../models/app.model';

@Component({
  selector: 'app-apps',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CarouselModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  allApps: App[] = [];
  trendingApps: App[] = [];
  topRatedApps: App[] = [];
  popularApps: App[] = [];
  appFirebaseService = inject(AppFirebaseService);

  ngOnInit(): void {
    this.loadApps();
  }

  loadApps(): void {
    this.appFirebaseService.getApps().subscribe((apps: App[]) => {
      this.allApps = apps;
      this.trendingApps = apps;
      this.topRatedApps = apps.filter(app => app.rating >= 3.5);
      this.popularApps = apps;
    });
  }
} 