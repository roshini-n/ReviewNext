import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'primeng/carousel';
import { BeautyProductFirebaseService } from '../../../services/beautyProductFirebase.service';
import { BeautyProduct } from '../../../models/beauty-product.model';

@Component({
  selector: 'app-beauty-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CarouselModule
  ],
  templateUrl: './beauty-product.component.html',
  styleUrls: ['./beauty-product.component.css']
})
export class BeautyProductComponent implements OnInit {
  allBeautyProducts: BeautyProduct[] = [];
  trendingBeautyProducts: BeautyProduct[] = [];
  topRatedBeautyProducts: BeautyProduct[] = [];
  popularBeautyProducts: BeautyProduct[] = [];
  beautyProductFirebaseService = inject(BeautyProductFirebaseService);

  ngOnInit(): void {
    this.loadBeautyProducts();
  }

  loadBeautyProducts(): void {
    this.beautyProductFirebaseService.getBeautyProducts().subscribe((products: BeautyProduct[]) => {
      this.allBeautyProducts = products;
      this.trendingBeautyProducts = products;
      this.topRatedBeautyProducts = products.filter(product => product.rating >= 3.5);
      this.popularBeautyProducts = products;
    });
  }
} 