import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'primeng/carousel';
import { HomeApplianceFirebaseService } from '../../../services/homeApplianceFirebase.service';
import { HomeAppliance } from '../../../models/home-appliance.model';

@Component({
  selector: 'app-home-appliance',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CarouselModule
  ],
  templateUrl: './home-appliance.component.html',
  styleUrls: ['./home-appliance.component.css']
})
export class HomeApplianceComponent implements OnInit {
  allHomeAppliances: HomeAppliance[] = [];
  trendingHomeAppliances: HomeAppliance[] = [];
  topRatedHomeAppliances: HomeAppliance[] = [];
  popularHomeAppliances: HomeAppliance[] = [];
  homeApplianceFirebaseService = inject(HomeApplianceFirebaseService);

  ngOnInit(): void {
    this.loadHomeAppliances();
  }

  loadHomeAppliances(): void {
    this.homeApplianceFirebaseService.getHomeAppliances().subscribe((appliances: HomeAppliance[]) => {
      this.allHomeAppliances = appliances;
      this.trendingHomeAppliances = appliances;
      this.topRatedHomeAppliances = appliances.filter(appliance => appliance.rating >= 3.5);
      this.popularHomeAppliances = appliances;
    });
  }
} 