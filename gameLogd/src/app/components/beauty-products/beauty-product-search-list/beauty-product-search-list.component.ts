import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BeautyProduct } from '../../../models/beauty-product.model';

@Component({
  selector: 'app-beauty-product-search-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './beauty-product-search-list.component.html',
  styleUrl: './beauty-product-search-list.component.css'
})
export class BeautyProductSearchListComponent {
  @Input() products: BeautyProduct[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyMessage = 'No beauty products found.';
}


