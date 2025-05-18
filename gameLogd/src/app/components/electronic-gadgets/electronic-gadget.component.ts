import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'primeng/carousel';
import { ElectronicGadgetFirebaseService } from '../../services/electronicGadgetFirebase.service';
import { ElectronicGadget } from '../../models/electronic-gadget.model';

@Component({
  selector: 'app-electronic-gadget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CarouselModule
  ],
  templateUrl: './electronic-gadget.component.html',
  styleUrls: ['./electronic-gadget.component.css']
})
export class ElectronicGadgetComponent implements OnInit {
  allElectronicGadgets: ElectronicGadget[] = [];
  trendingElectronicGadgets: ElectronicGadget[] = [];
  topRatedElectronicGadgets: ElectronicGadget[] = [];
  popularElectronicGadgets: ElectronicGadget[] = [];
  electronicGadgetFirebaseService = inject(ElectronicGadgetFirebaseService);

  ngOnInit(): void {
    this.loadElectronicGadgets();
  }

  loadElectronicGadgets(): void {
    this.electronicGadgetFirebaseService.getElectronicGadgets().subscribe((gadgets: ElectronicGadget[]) => {
      this.allElectronicGadgets = gadgets;
      this.trendingElectronicGadgets = gadgets;
      this.topRatedElectronicGadgets = gadgets.filter(gadget => gadget.rating >= 3.5);
      this.popularElectronicGadgets = gadgets;
    });
  }
} 